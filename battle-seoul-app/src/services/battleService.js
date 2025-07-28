import { auth, db } from "../firebase/config"; // 👈 'db'를 config에서 가져오거나
// 또는, 여기서 직접 초기화합니다.
import { getFirestore } from "firebase/firestore";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  runTransaction,
  where,
  limit,
  orderBy,
  updateDoc,
  arrayUnion,
  query,
  serverTimestamp, // ... 기타 함수들
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * 스마트 자동 매칭 실행
 */
export const findAndCreateRandomBattle = async (options = {}) => {
  const { maxMatches = 3 } = options;

  try {
    // contenders 컬렉션이 없는 경우 더미 응답
    try {
      const contendersQuery = query(
        collection(db, "contenders"),
        where("status", "==", "available"),
        limit(maxMatches * 2)
      );

      const contendersSnapshot = await getDocs(contendersQuery);

      // 컬렉션이 비어있거나 존재하지 않는 경우
      if (contendersSnapshot.empty) {
        return {
          success: false,
          reason: "insufficient_contenders",
          message: "매칭할 수 있는 콘텐츠가 부족합니다.",
          matchesCreated: 0,
        };
      }

      const availableContenders = contendersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (availableContenders.length < 2) {
        return {
          success: false,
          reason: "insufficient_contenders",
          message: "매칭할 수 있는 콘텐츠가 부족합니다.",
          matchesCreated: 0,
        };
      }

      let matchesCreated = 0;
      const matchingScores = [];
      const maxPossibleMatches = Math.min(
        maxMatches,
        Math.floor(availableContenders.length / 2)
      );

      // 카테고리별 그룹화
      const categoryGroups = {};
      availableContenders.forEach((contender) => {
        const category = contender.category || "general";
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(contender);
      });

      // 각 카테고리에서 매칭 시도
      for (const [category, contenders] of Object.entries(categoryGroups)) {
        if (contenders.length < 2 || matchesCreated >= maxMatches) continue;

        // 같은 카테고리 내에서 랜덤 매칭
        const shuffled = [...contenders].sort(() => Math.random() - 0.5);

        for (
          let i = 0;
          i < shuffled.length - 1 && matchesCreated < maxMatches;
          i += 2
        ) {
          const contender1 = shuffled[i];
          const contender2 = shuffled[i + 1];

          // 같은 크리에이터의 콘텐츠는 매칭하지 않음
          if (contender1.creatorId === contender2.creatorId) continue;

          try {
            const battleId = await createBattleFromContenders(
              contender1,
              contender2
            );

            // 매칭 점수 계산
            const matchingScore = calculateMatchingScore(
              contender1,
              contender2
            );

            matchingScores.push({
              battleId,
              contender1: contender1.title,
              contender2: contender2.title,
              category,
              score: matchingScore,
            });

            matchesCreated++;
          } catch (error) {
            console.error("배틀 생성 실패:", error);
          }
        }
      }

      if (matchesCreated === 0) {
        return {
          success: false,
          reason: "no_valid_matches",
          message: "현재 매칭 가능한 조합이 없습니다.",
          matchesCreated: 0,
        };
      }

      return {
        success: true,
        matchesCreated,
        matchingScores,
        message: `${matchesCreated}개의 배틀이 생성되었습니다.`,
      };
    } catch (error) {
      // contenders 컬렉션이 존재하지 않는 경우
      console.log("Contenders collection does not exist yet");
      return {
        success: false,
        reason: "insufficient_contenders",
        message: "콘텐츠를 먼저 업로드해주세요.",
        matchesCreated: 0,
      };
    }
  } catch (error) {
    console.error("스마트 매칭 오류:", error);
    return {
      success: false,
      reason: "system_error",
      message: "매칭 시스템 오류가 발생했습니다.",
      error: error.message,
      matchesCreated: 0,
    };
  }
};

/**
 * 강제 매칭 실행 (관리자용)
 */
export const executeForceMatching = async (maxMatches = 5) => {
  try {
    const result = await findAndCreateRandomBattle({ maxMatches });

    return {
      ...result,
      forcedMatching: true,
    };
  } catch (error) {
    console.error("강제 매칭 오류:", error);
    return {
      success: false,
      error: error.message,
      matchesCreated: 0,
    };
  }
};

/**
 * 매칭 시스템 통계 조회
 */
export const getMatchingStatistics = async () => {
  try {
    // 기본 통계 반환 (contenders 컬렉션이 없어도 동작)
    const stats = {
      totalAvailableContenders: 0,
      totalActiveBattles: 0,
      categoryDistribution: {
        music: 0,
        fashion: 0,
        food: 0,
      },
      cooldownRemaining: 0,
      lastMatchingTime: new Date(),
      systemHealth: "active",
    };

    try {
      // 사용 가능한 콘텐츠 수 조회
      const contendersQuery = query(
        collection(db, "contenders"),
        where("status", "==", "available")
      );
      const contendersSnapshot = await getDocs(contendersQuery);
      stats.totalAvailableContenders = contendersSnapshot.size;

      // 카테고리별 분포 계산
      contendersSnapshot.docs.forEach((doc) => {
        const category = doc.data().category || "general";
        if (stats.categoryDistribution[category] !== undefined) {
          stats.categoryDistribution[category]++;
        }
      });
    } catch (error) {
      console.log("Contenders collection query error:", error);
    }

    try {
      // 진행 중인 배틀 수 조회
      const activeBattlesQuery = query(
        collection(db, "battles"),
        where("status", "==", "ongoing")
      );
      const activeBattlesSnapshot = await getDocs(activeBattlesQuery);
      stats.totalActiveBattles = activeBattlesSnapshot.size;
    } catch (error) {
      console.log("Battles collection query error:", error);
    }

    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("매칭 통계 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalAvailableContenders: 0,
        totalActiveBattles: 0,
        categoryDistribution: {
          music: 0,
          fashion: 0,
          food: 0,
        },
        cooldownRemaining: 0,
        systemHealth: "error",
      },
    };
  }
};

/**
 * 매칭 점수 계산 헬퍼 함수
 */
const calculateMatchingScore = (contender1, contender2) => {
  let score = 0;

  // 같은 카테고리 보너스
  if (contender1.category === contender2.category) {
    score += 50;
  }

  // 인기도 차이 고려 (너무 차이나지 않는 것이 좋음)
  const popularityDiff = Math.abs(
    (contender1.likeCount || 0) - (contender2.likeCount || 0)
  );
  score += Math.max(0, 30 - popularityDiff / 10);

  // 최근 생성된 콘텐츠 보너스
  const now = Date.now();
  const age1 = now - (contender1.createdAt?.toDate?.()?.getTime() || now);
  const age2 = now - (contender2.createdAt?.toDate?.()?.getTime() || now);
  const avgAge = (age1 + age2) / 2;
  const dayInMs = 24 * 60 * 60 * 1000;

  if (avgAge < 7 * dayInMs) {
    score += 20;
  }

  // 랜덤 요소 추가
  score += Math.random() * 10;

  return Math.round(score);
};

/**
 * createBattleFromContenders 함수 (이미 있는 경우 건너뛰기)
 */
export const createBattleFromContenders = async (contenderA, contenderB) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("로그인이 필요합니다.");

  if (contenderA.category !== contenderB.category) {
    throw new Error("같은 카테고리의 콘텐츠끼리만 배틀할 수 있습니다.");
  }

  if (contenderA.creatorId === contenderB.creatorId) {
    throw new Error("같은 크리에이터의 콘텐츠끼리는 배틀할 수 없습니다.");
  }

  return await runTransaction(db, async (transaction) => {
    const contenderRefA = doc(db, "contenders", contenderA.id);
    const contenderRefB = doc(db, "contenders", contenderB.id);

    const contenderDocA = await transaction.get(contenderRefA);
    const contenderDocB = await transaction.get(contenderRefB);

    if (
      !contenderDocA.exists() ||
      contenderDocA.data().status !== "available" ||
      !contenderDocB.exists() ||
      contenderDocB.data().status !== "available"
    ) {
      throw new Error("선택된 콘텐츠 중 하나가 이미 사용 중입니다.");
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 7 * 24 * 60 * 60 * 1000);

    const battleData = {
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName || currentUser.email.split("@")[0],
      title: `${contenderA.title} vs ${contenderB.title}`,
      category: contenderA.category,

      itemA: {
        title: contenderA.title,
        imageUrl: contenderA.imageUrl,
        votes: 0,
        contenderId: contenderA.id,
        creatorId: contenderA.creatorId,
        creatorName: contenderA.creatorName,
      },
      itemB: {
        title: contenderB.title,
        imageUrl: contenderB.imageUrl,
        votes: 0,
        contenderId: contenderB.id,
        creatorId: contenderB.creatorId,
        creatorName: contenderB.creatorName,
      },

      status: "ongoing",
      createdAt: serverTimestamp(),
      endsAt: endTime,
      totalVotes: 0,
      participants: [],

      // 매칭 관련 메타데이터
      matchingMethod: "smart_algorithm",
      matchingScore: calculateMatchingScore(contenderA, contenderB),

      // 소셜 및 상호작용
      likeCount: 0,
      likedBy: [],
      shareCount: 0,
      commentCount: 0,
      viewCount: 0,
      uniqueViewers: [],

      // 메트릭
      metrics: {
        engagementRate: 0,
        commentRate: 0,
        shareRate: 0,
      },

      updatedAt: serverTimestamp(),
      lastVoteAt: null,
      lastCommentAt: null,
      lastViewAt: null,
    };

    const battleRef = doc(collection(db, "battles"));

    transaction.set(battleRef, battleData);
    transaction.update(contenderRefA, {
      status: "in_battle",
      lastBattleId: battleRef.id,
      battleCount: (contenderDocA.data().battleCount || 0) + 1,
    });
    transaction.update(contenderRefB, {
      status: "in_battle",
      lastBattleId: battleRef.id,
      battleCount: (contenderDocB.data().battleCount || 0) + 1,
    });

    return battleRef.id;
  });
};
// battleService.js에 추가할 voteOnBattle 함수

/**
 * 특정 배틀에 투표합니다
 */
export const voteOnBattle = async (battleId, choice) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("투표하려면 로그인이 필요합니다.");
  }

  const battleRef = doc(db, "battles", battleId);

  try {
    return await runTransaction(db, async (transaction) => {
      const battleDoc = await transaction.get(battleRef);

      if (!battleDoc.exists()) {
        throw new Error("배틀 정보를 찾을 수 없습니다.");
      }

      const battleData = battleDoc.data();

      // 배틀 상태 확인
      if (battleData.status !== "ongoing") {
        throw new Error("이미 종료된 배틀입니다.");
      }

      // 이미 투표했는지 확인
      if (battleData.participants?.includes(currentUser.uid)) {
        throw new Error("이미 이 배틀에 투표했습니다.");
      }

      // 투표 업데이트
      const newVoteCount = (battleData[choice]?.votes || 0) + 1;
      const newTotalVotes = (battleData.totalVotes || 0) + 1;

      // 일별 투표 추이 추적
      const today = new Date().toISOString().split("T")[0];
      const dailyVotes = battleData.dailyVotes || {};

      if (!dailyVotes[today]) {
        dailyVotes[today] = { itemA: 0, itemB: 0, total: 0 };
      }
      dailyVotes[today][choice] += 1;
      dailyVotes[today].total += 1;

      // 실시간 승부 상황 계산
      const itemAVotes =
        choice === "itemA" ? newVoteCount : battleData.itemA?.votes || 0;
      const itemBVotes =
        choice === "itemB" ? newVoteCount : battleData.itemB?.votes || 0;

      let currentWinner = "tie";
      let winPercentage = 50;
      let margin = 0;

      if (itemAVotes > itemBVotes) {
        currentWinner = "itemA";
        winPercentage = Math.round((itemAVotes / newTotalVotes) * 100);
        margin = itemAVotes - itemBVotes;
      } else if (itemBVotes > itemAVotes) {
        currentWinner = "itemB";
        winPercentage = Math.round((itemBVotes / newTotalVotes) * 100);
        margin = itemBVotes - itemAVotes;
      }

      // 참여율 계산
      const engagementRate =
        newTotalVotes / Math.max(battleData.viewCount || 1, 1);

      const updateData = {
        [`${choice}.votes`]: newVoteCount,
        totalVotes: newTotalVotes,
        participants: arrayUnion(currentUser.uid),
        lastVoteAt: serverTimestamp(),
        updatedAt: serverTimestamp(),

        // 향상된 추적 데이터
        dailyVotes: dailyVotes,
        currentLeader: {
          winner: currentWinner,
          percentage: winPercentage,
          margin: margin,
          lastUpdated: serverTimestamp(),
        },
        metrics: {
          ...battleData.metrics,
          engagementRate: Math.round(engagementRate * 1000) / 1000,
        },
      };

      transaction.update(battleRef, updateData);

      return {
        success: true,
        newVoteCount,
        newTotalVotes,
        currentLeader: {
          winner: currentWinner,
          percentage: winPercentage,
          margin: margin,
        },
      };
    });
  } catch (error) {
    console.error("투표 처리 중 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
// battleService.js에 추가할 누락된 함수들

/**
 * 트렌딩 배틀 가져오기
 */
export const getTrendingBattles = async (limitCount = 8) => {
  try {
    const q = query(
      collection(db, "battles"),
      where("status", "==", "ongoing"),
      orderBy("totalVotes", "desc"),
      orderBy("viewCount", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const battles = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      const battleData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        endDate: docSnapshot.data().endsAt?.toDate() || new Date(),
        lastActivityAt:
          docSnapshot.data().lastVoteAt?.toDate() ||
          docSnapshot.data().createdAt?.toDate() ||
          new Date(),
      };

      // HOT 배틀 여부 판단 (최근 1시간 내 투표수가 많은 경우)
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      battleData.isHot =
        battleData.lastActivityAt > oneHourAgo && battleData.totalVotes > 50;

      battles.push(battleData);
    });

    return {
      success: true,
      battles,
    };
  } catch (error) {
    console.error("트렌딩 배틀 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      battles: [],
    };
  }
};

/**
 * 관련 배틀 가져오기 (같은 카테고리 또는 유사한 배틀)
 */
export const getRelatedBattles = async (
  currentBattleId,
  category,
  limitCount = 8
) => {
  try {
    const q = query(
      collection(db, "battles"),
      where("category", "==", category),
      orderBy("totalVotes", "desc"),
      limit(limitCount + 1) // 현재 배틀 제외를 위해 +1
    );

    const querySnapshot = await getDocs(q);
    const battles = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      // 현재 배틀 제외
      if (docSnapshot.id === currentBattleId) return;

      const battleData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        endDate: docSnapshot.data().endsAt?.toDate() || new Date(),
        lastActivityAt:
          docSnapshot.data().lastVoteAt?.toDate() ||
          docSnapshot.data().createdAt?.toDate() ||
          new Date(),
      };

      battles.push(battleData);
    });

    // 정확히 limitCount 개수만 반환
    const limitedBattles = battles.slice(0, limitCount);

    return {
      success: true,
      battles: limitedBattles,
    };
  } catch (error) {
    console.error("관련 배틀 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      battles: [],
    };
  }
};

/**
 * 인기 배틀 가져오기 (전체 기간)
 */
export const getPopularBattles = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, "battles"),
      orderBy("totalVotes", "desc"),
      orderBy("viewCount", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const battles = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      const battleData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        endDate: docSnapshot.data().endsAt?.toDate() || new Date(),
      };

      battles.push(battleData);
    });

    return {
      success: true,
      battles,
    };
  } catch (error) {
    console.error("인기 배틀 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      battles: [],
    };
  }
};

/**
 * 배틀 검색
 */
export const searchBattles = async (
  searchTerm,
  category = null,
  limitCount = 20
) => {
  try {
    let q;

    if (category) {
      q = query(
        collection(db, "battles"),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "battles"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const battles = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      const battleData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        endDate: docSnapshot.data().endsAt?.toDate() || new Date(),
      };

      // 클라이언트 사이드에서 텍스트 검색 (Firebase의 제한 때문)
      const searchableText = `${battleData.title} ${
        battleData.description || ""
      } ${battleData.itemA.title} ${battleData.itemB.title}`.toLowerCase();

      if (searchableText.includes(searchTerm.toLowerCase())) {
        battles.push(battleData);
      }
    });

    return {
      success: true,
      battles,
    };
  } catch (error) {
    console.error("배틀 검색 오류:", error);
    return {
      success: false,
      error: error.message,
      battles: [],
    };
  }
};

/**
 * 사용자별 배틀 목록 가져오기
 */
export const getUserBattles = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, "battles"),
      where("creatorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const battles = [];

    querySnapshot.docs.forEach((docSnapshot) => {
      const battleData = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        endDate: docSnapshot.data().endsAt?.toDate() || new Date(),
      };

      battles.push(battleData);
    });

    return {
      success: true,
      battles,
    };
  } catch (error) {
    console.error("사용자 배틀 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      battles: [],
    };
  }
};
// battleService.js에 추가할 getBattleDetail 함수

/**
 * 배틀 상세 정보 조회 (조회수 증가 포함)
 */
export const getBattleDetail = async (battleId, userId = null) => {
  try {
    const battleRef = doc(db, "battles", battleId);

    // 배틀 데이터 조회
    const battleDoc = await getDoc(battleRef);

    if (!battleDoc.exists()) {
      return {
        success: false,
        message: "배틀을 찾을 수 없습니다.",
        battle: null,
      };
    }

    const battleData = battleDoc.data();

    // 조회수 증가 및 사용자 추적 (비동기)
    setTimeout(async () => {
      try {
        await runTransaction(db, async (transaction) => {
          const currentBattleDoc = await transaction.get(battleRef);
          if (!currentBattleDoc.exists()) return;

          const currentData = currentBattleDoc.data();
          const updateData = {
            viewCount: (currentData.viewCount || 0) + 1,
            lastViewAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };

          // 사용자별 조회 추적
          if (userId) {
            const uniqueViewers = currentData.uniqueViewers || [];
            if (!uniqueViewers.includes(userId)) {
              updateData.uniqueViewers = arrayUnion(userId);
            }
          }

          transaction.update(battleRef, updateData);
        });
      } catch (error) {
        console.error("조회수 업데이트 실패:", error);
      }
    }, 100);

    // 날짜 변환 및 데이터 정리
    const processedBattle = {
      id: battleDoc.id,
      ...battleData,
      createdAt: battleData.createdAt?.toDate() || new Date(),
      endDate: battleData.endsAt?.toDate() || new Date(),
      lastVoteAt: battleData.lastVoteAt?.toDate() || null,
      lastCommentAt: battleData.lastCommentAt?.toDate() || null,
      lastViewAt: battleData.lastViewAt?.toDate() || null,

      // 안전한 데이터 접근
      itemA: {
        title: battleData.itemA?.title || "",
        imageUrl: battleData.itemA?.imageUrl || "",
        votes: battleData.itemA?.votes || 0,
        contenderId: battleData.itemA?.contenderId || null,
        creatorId: battleData.itemA?.creatorId || null,
        creatorName: battleData.itemA?.creatorName || "Unknown",
      },
      itemB: {
        title: battleData.itemB?.title || "",
        imageUrl: battleData.itemB?.imageUrl || "",
        votes: battleData.itemB?.votes || 0,
        contenderId: battleData.itemB?.contenderId || null,
        creatorId: battleData.itemB?.creatorId || null,
        creatorName: battleData.itemB?.creatorName || "Unknown",
      },

      // 기본값 설정
      totalVotes: battleData.totalVotes || 0,
      participants: battleData.participants || [],
      viewCount: battleData.viewCount || 0,
      likeCount: battleData.likeCount || 0,
      commentCount: battleData.commentCount || 0,
      shareCount: battleData.shareCount || 0,
      uniqueViewers: battleData.uniqueViewers || [],
      likedBy: battleData.likedBy || [],

      // 실시간 상태 정보 추가
      liveStatus: calculateLiveStatus(battleData),
      trendingScore: calculateTrendingScore(battleData),
    };

    return {
      success: true,
      battle: processedBattle,
    };
  } catch (error) {
    console.error("배틀 조회 실패:", error);
    return {
      success: false,
      error: error.message,
      battle: null,
    };
  }
};

/**
 * 실시간 승부 상황 계산
 */
const calculateLiveStatus = (battleData) => {
  const itemAVotes = battleData.itemA?.votes || 0;
  const itemBVotes = battleData.itemB?.votes || 0;
  const total = itemAVotes + itemBVotes;

  if (total === 0) {
    return {
      status: "waiting",
      message: "첫 투표를 기다리고 있습니다",
      percentage: { itemA: 50, itemB: 50 },
    };
  }

  const percentageA = Math.round((itemAVotes / total) * 100);
  const percentageB = 100 - percentageA;
  const margin = Math.abs(itemAVotes - itemBVotes);

  let status = "competitive";
  let message = "치열한 접전 중";

  if (margin > total * 0.2) {
    status = "dominant";
    message = `${itemAVotes > itemBVotes ? "A" : "B"}가 앞서고 있습니다`;
  } else if (margin > total * 0.1) {
    status = "leading";
    message = `${itemAVotes > itemBVotes ? "A" : "B"}가 우세합니다`;
  }

  return {
    status,
    message,
    percentage: { itemA: percentageA, itemB: percentageB },
    margin,
  };
};

/**
 * 트렌딩 점수 계산
 */
const calculateTrendingScore = (battleData) => {
  const now = Date.now();
  const createdAt = battleData.createdAt?.toDate?.()?.getTime() || now;
  const ageInHours = (now - createdAt) / (1000 * 60 * 60);

  const votes = battleData.totalVotes || 0;
  const views = battleData.viewCount || 0;
  const comments = battleData.commentCount || 0;
  const engagement = battleData.metrics?.engagementRate || 0;

  const timeWeight = Math.max(0, 1 - ageInHours / 168); // 7일
  const baseScore = votes * 2 + views * 0.5 + comments * 3 + engagement * 100;

  return Math.round(baseScore * timeWeight * 100) / 100;
};

/**
 * 사용자가 투표한 배틀인지 확인
 */
export const checkUserVoted = async (battleId, userId) => {
  try {
    const battleRef = doc(db, "battles", battleId);
    const battleDoc = await getDoc(battleRef);

    if (!battleDoc.exists()) {
      return {
        success: false,
        hasVoted: false,
        selectedSide: null,
      };
    }

    const battleData = battleDoc.data();
    const participants = battleData.participants || [];
    const hasVoted = participants.includes(userId);

    // TODO: 어느 쪽에 투표했는지는 별도 로직 필요
    // 현재는 단순히 투표 여부만 확인

    return {
      success: true,
      hasVoted,
      selectedSide: null, // 추후 구현 필요
    };
  } catch (error) {
    console.error("투표 확인 오류:", error);
    return {
      success: false,
      hasVoted: false,
      selectedSide: null,
    };
  }
};
// battleService.js에 추가할 uploadContender 함수

/**
 * 이미지를 Cloudinary에 업로드하고 다운로드 URL을 반환하는 헬퍼 함수
 */
const uploadImage = async (imageFile) => {
  if (!imageFile) return null;

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      }/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return null;
  }
};

/**
 * 단일 '대결 후보(contender)' 콘텐츠를 업로드합니다.
 */

/**
 * 단일 '대결 후보(contender)' 콘텐츠를 업로드합니다.
 * 이제 이미지, YouTube, Instagram 콘텐츠를 모두 지원합니다.
 */
export const uploadContender = async (formData, imageFile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("로그인이 필요합니다.");
  }

  try {
    let imageUrl = null;

    // 콘텐츠 타입에 따른 이미지 처리
    if (formData.contentType === "image" && imageFile) {
      // 일반 이미지 업로드
      imageUrl = await uploadImage(imageFile);
      if (!imageUrl) {
        throw new Error("이미지 업로드에 실패했습니다.");
      }
    } else if (formData.contentType === "youtube" && formData.youtubeId) {
      // YouTube 썸네일 사용 또는 default.png
      imageUrl = "/images/popo.png"; // 기본 이미지 사용
    } else if (formData.contentType === "instagram" && formData.instagramUrl) {
      // Instagram은 default.png 사용
      imageUrl = "/images/popo.png";
    } else {
      throw new Error("콘텐츠 정보가 올바르지 않습니다.");
    }

    // contender 데이터 준비
    const contenderData = {
      creatorId: currentUser.uid,
      creatorName: currentUser.displayName || currentUser.email.split("@")[0],
      title: formData.title,
      description: formData.description || "",
      imageUrl: imageUrl,
      category: formData.category,
      status: "available",
      createdAt: serverTimestamp(),

      // 콘텐츠 타입별 정보
      contentType: formData.contentType || "image",

      // YouTube 관련 정보
      ...(formData.contentType === "youtube" && {
        youtubeUrl: formData.youtubeUrl,
        youtubeId: formData.youtubeId,
        thumbnailUrl: `https://img.youtube.com/vi/${formData.youtubeId}/maxresdefault.jpg`,
      }),

      // Instagram 관련 정보
      ...(formData.contentType === "instagram" && {
        instagramUrl: formData.instagramUrl,
      }),

      // 향상된 메타데이터
      likeCount: 0,
      viewCount: 0,
      tags: formData.tags || [],
      battleCount: 0,

      // 추가 정보
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    // Firestore에 저장
    const docRef = await addDoc(collection(db, "contenders"), contenderData);

    // 업로드 후 자동 매칭 트리거 (백그라운드)
    setTimeout(() => {
      findAndCreateRandomBattle({ maxMatches: 2 })
        .then((result) => {
          if (result.success) {
            console.log(
              `새 콘텐츠 업로드로 ${result.matchesCreated}개의 배틀이 생성되었습니다.`
            );
          }
        })
        .catch((error) => {
          console.error("Auto-matching after upload failed:", error);
        });
    }, 2000);

    return {
      success: true,
      contenderId: docRef.id,
      imageUrl: imageUrl,
      contentType: formData.contentType,
    };
  } catch (error) {
    console.error("Contender upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 사용자의 contender 목록 가져오기
 */
export const getUserContenders = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, "contenders"),
      where("creatorId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const contenders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    }));

    return {
      success: true,
      contenders,
    };
  } catch (error) {
    console.error("사용자 contender 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      contenders: [],
    };
  }
};

/**
 * 모든 사용 가능한 contender 목록 가져오기
 */
export const getAvailableContenders = async (
  category = null,
  limitCount = 50
) => {
  try {
    let q;

    if (category) {
      q = query(
        collection(db, "contenders"),
        where("status", "==", "available"),
        where("category", "==", category),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, "contenders"),
        where("status", "==", "available"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }

    const querySnapshot = await getDocs(q);
    const contenders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));

    return {
      success: true,
      contenders,
    };
  } catch (error) {
    console.error("Contender 목록 조회 오류:", error);
    return {
      success: false,
      error: error.message,
      contenders: [],
    };
  }
};

/**
 * Contender 삭제
 */
export const deleteContender = async (contenderId, userId) => {
  try {
    const contenderRef = doc(db, "contenders", contenderId);
    const contenderDoc = await getDoc(contenderRef);

    if (!contenderDoc.exists()) {
      throw new Error("콘텐츠를 찾을 수 없습니다.");
    }

    const contenderData = contenderDoc.data();

    // 작성자 확인
    if (contenderData.creatorId !== userId) {
      throw new Error("삭제 권한이 없습니다.");
    }

    // 배틀 중인 경우 삭제 불가
    if (contenderData.status === "in_battle") {
      throw new Error("배틀 진행 중인 콘텐츠는 삭제할 수 없습니다.");
    }

    // 삭제 처리
    await updateDoc(contenderRef, {
      status: "deleted",
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("Contender 삭제 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
