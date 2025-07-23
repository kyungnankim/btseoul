// src/services/userService.js
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Firestore에서 사용자의 통계 정보를 가져옵니다.
 * @param {string} userId - 사용자 UID
 * @returns {Promise<object>} - 사용자 통계 객체
 */
export const getUserStats = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (userDoc.exists()) {
    const userData = userDoc.data();
    // MyPage에서 사용하는 통계 정보만 반환
    return {
      totalVotes: userData.stats?.totalVotes || 0,
      battlesCreated: userData.stats?.battlesCreated || 0,
      battlesWon: userData.stats?.battlesWon || 0,
      points: userData.profile?.points || 0,
    };
  } else {
    console.warn("No such user document!");
    return { totalVotes: 0, battlesCreated: 0, battlesWon: 0, points: 0 };
  }
};

/**
 * 사용자의 프로필 정보를 업데이트합니다.
 * @param {string} userId - 사용자 UID
 * @param {object} dataToUpdate - 업데이트할 데이터
 * @returns {Promise<void>}
 */
export const updateProfile = async (userId, dataToUpdate) => {
  if (!userId) {
    throw new Error("User ID is required.");
  }
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...dataToUpdate,
    updatedAt: serverTimestamp(), // 업데이트 시간 기록
  });
};
