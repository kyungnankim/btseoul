// src/services/commentService.js - 댓글 관련 서비스

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  increment,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// 댓글 컬렉션 이름
const COMMENTS_COLLECTION = "comments";
const COMMENT_LIKES_COLLECTION = "commentLikes";
const COMMENT_REPORTS_COLLECTION = "commentReports";

/**
 * 배틀의 댓글 목록 가져오기
 */
export const getComments = async (battleId, sortBy = "latest") => {
  try {
    let q;
    const commentsRef = collection(db, COMMENTS_COLLECTION);

    switch (sortBy) {
      case "popular":
        q = query(
          commentsRef,
          where("battleId", "==", battleId),
          where("parentId", "==", null), // 대댓글 제외
          orderBy("likes", "desc"),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        break;
      case "oldest":
        q = query(
          commentsRef,
          where("battleId", "==", battleId),
          where("parentId", "==", null),
          orderBy("createdAt", "asc"),
          limit(50)
        );
        break;
      default: // latest
        q = query(
          commentsRef,
          where("battleId", "==", battleId),
          where("parentId", "==", null),
          orderBy("createdAt", "desc"),
          limit(50)
        );
    }

    const querySnapshot = await getDocs(q);
    const comments = [];

    for (const docSnapshot of querySnapshot.docs) {
      const comment = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        createdAt: docSnapshot.data().createdAt?.toDate() || new Date(),
        updatedAt: docSnapshot.data().updatedAt?.toDate() || new Date(),
      };

      // 답글 가져오기
      const repliesQuery = query(
        commentsRef,
        where("parentId", "==", comment.id),
        orderBy("createdAt", "asc"),
        limit(20)
      );

      const repliesSnapshot = await getDocs(repliesQuery);
      comment.replies = repliesSnapshot.docs.map((replyDoc) => ({
        id: replyDoc.id,
        ...replyDoc.data(),
        createdAt: replyDoc.data().createdAt?.toDate() || new Date(),
      }));

      comments.push(comment);
    }

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("댓글 조회 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 추가
 */
export const addComment = async (battleId, commentData) => {
  try {
    const commentDoc = {
      battleId,
      content: commentData.content,
      userId: commentData.userId,
      userName: commentData.userName,
      userAvatar: commentData.userAvatar,
      parentId: commentData.parentId || null,
      likes: 0,
      likedBy: [],
      replies: [],
      isDeleted: false,
      isReported: false,
      reportCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, COMMENTS_COLLECTION),
      commentDoc
    );

    // 배틀의 댓글 수 증가
    const battleRef = doc(db, "battles", battleId);
    await updateDoc(battleRef, {
      commentsCount: increment(1),
      lastCommentAt: serverTimestamp(),
    });

    // 답글인 경우 부모 댓글의 답글 수 증가
    if (commentData.parentId) {
      const parentCommentRef = doc(
        db,
        COMMENTS_COLLECTION,
        commentData.parentId
      );
      await updateDoc(parentCommentRef, {
        repliesCount: increment(1),
      });
    }

    return {
      success: true,
      commentId: docRef.id,
    };
  } catch (error) {
    console.error("댓글 추가 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 좋아요/좋아요 취소
 */
export const likeComment = async (commentId, userId) => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const commentData = commentDoc.data();
    const likedBy = commentData.likedBy || [];
    const isCurrentlyLiked = likedBy.includes(userId);

    if (isCurrentlyLiked) {
      // 좋아요 취소
      await updateDoc(commentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        isLiked: false,
      };
    } else {
      // 좋아요 추가
      await updateDoc(commentRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp(),
      });

      return {
        success: true,
        isLiked: true,
      };
    }
  } catch (error) {
    console.error("댓글 좋아요 처리 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 수정
 */
export const updateComment = async (commentId, userId, newContent) => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const commentData = commentDoc.data();

    // 작성자 확인
    if (commentData.userId !== userId) {
      throw new Error("댓글을 수정할 권한이 없습니다.");
    }

    await updateDoc(commentRef, {
      content: newContent,
      isEdited: true,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("댓글 수정 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 삭제
 */
export const deleteComment = async (commentId, userId) => {
  try {
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      throw new Error("댓글을 찾을 수 없습니다.");
    }

    const commentData = commentDoc.data();

    // 작성자 확인 (관리자 권한도 나중에 추가 가능)
    if (commentData.userId !== userId) {
      throw new Error("댓글을 삭제할 권한이 없습니다.");
    }

    // 실제 삭제 대신 삭제 표시 (답글이 있는 경우를 위해)
    await updateDoc(commentRef, {
      isDeleted: true,
      content: "[삭제된 댓글입니다]",
      deletedAt: serverTimestamp(),
    });

    // 배틀의 댓글 수 감소
    const battleRef = doc(db, "battles", commentData.battleId);
    await updateDoc(battleRef, {
      commentsCount: increment(-1),
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 신고
 */
export const reportComment = async (
  commentId,
  userId,
  reason = "inappropriate"
) => {
  try {
    // 이미 신고했는지 확인
    const reportsQuery = query(
      collection(db, COMMENT_REPORTS_COLLECTION),
      where("commentId", "==", commentId),
      where("reporterId", "==", userId)
    );

    const existingReports = await getDocs(reportsQuery);

    if (!existingReports.empty) {
      throw new Error("이미 신고한 댓글입니다.");
    }

    // 신고 기록 추가
    await addDoc(collection(db, COMMENT_REPORTS_COLLECTION), {
      commentId,
      reporterId: userId,
      reason,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    // 댓글의 신고 수 증가
    const commentRef = doc(db, COMMENTS_COLLECTION, commentId);
    await updateDoc(commentRef, {
      reportCount: increment(1),
      isReported: true,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("댓글 신고 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 사용자의 댓글 목록 가져오기
 */
export const getUserComments = async (userId, limitCount = 20) => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("userId", "==", userId),
      where("isDeleted", "==", false),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));

    return {
      success: true,
      comments,
    };
  } catch (error) {
    console.error("사용자 댓글 조회 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * 댓글 통계 가져오기
 */
export const getCommentStats = async (battleId) => {
  try {
    const q = query(
      collection(db, COMMENTS_COLLECTION),
      where("battleId", "==", battleId),
      where("isDeleted", "==", false)
    );

    const querySnapshot = await getDocs(q);
    const totalComments = querySnapshot.size;

    let totalLikes = 0;
    let uniqueCommenters = new Set();

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalLikes += data.likes || 0;
      uniqueCommenters.add(data.userId);
    });

    return {
      success: true,
      stats: {
        totalComments,
        totalLikes,
        uniqueCommenters: uniqueCommenters.size,
      },
    };
  } catch (error) {
    console.error("댓글 통계 조회 오류:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
