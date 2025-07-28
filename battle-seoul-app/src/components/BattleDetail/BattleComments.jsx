// src/components/BattleDetail/BattleComments.jsx - 배틀 댓글 (수정 완료)

import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Send,
  Heart,
  Reply,
  MoreVertical,
  Flag,
  Trash2,
  Clock,
  Loader2,
} from "lucide-react";
import {
  getComments,
  addComment,
  likeComment,
  deleteComment,
  reportComment,
} from "../../services/commentService";
import toast from "react-hot-toast";

const BattleComments = ({ battle, user, onBattleUpdate, onNavigate }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState("latest");
  const [showDropdown, setShowDropdown] = useState(null);

  useEffect(() => {
    loadComments();
  }, [battle.id, sortBy]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const result = await getComments(battle.id, sortBy);
      if (result.success) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error("댓글 로드 오류:", error);
      toast.error("댓글을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("댓글을 작성하려면 로그인이 필요합니다.");
      onNavigate("/login");
      return;
    }
    if (!newComment.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    const tempId = Date.now();
    const tempComment = {
      id: tempId,
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      userId: user.uid,
      userName: user.displayName || user.email.split("@")[0],
      userAvatar: user.photoURL || "/images/default.jpg",
      replies: [],
    };

    setComments((prev) => [tempComment, ...prev]);
    setNewComment("");
    setReplyTo(null);

    try {
      const result = await addComment(battle.id, {
        content: tempComment.content,
        parentId: replyTo?.id || null,
      });

      if (result.success && result.comment) {
        toast.success("댓글이 작성되었습니다!");
        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? result.comment : c))
        );
        onBattleUpdate({
          ...battle,
          commentCount: (battle.commentCount || 0) + 1,
        });
      } else {
        throw new Error(
          result.error || "서버에서 댓글을 추가하는데 실패했습니다."
        );
      }
    } catch (error) {
      console.error("댓글 작성 오류:", error);
      toast.error("댓글 작성에 실패했습니다.");
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) {
      toast.error("좋아요를 누르려면 로그인이 필요합니다.");
      return;
    }

    const originalComments = [...comments];
    const commentIndex = comments.findIndex((c) => c.id === commentId);
    if (commentIndex === -1) return;

    const comment = comments[commentIndex];
    const isLiked = !comment.isLiked;
    const newLikes = isLiked ? comment.likes + 1 : comment.likes - 1;

    const updatedComments = [...comments];
    updatedComments[commentIndex] = { ...comment, isLiked, likes: newLikes };
    setComments(updatedComments);

    try {
      await likeComment(commentId, user.uid);
    } catch (error) {
      console.error("좋아요 처리 오류:", error);
      toast.error("좋아요 처리에 실패했습니다.");
      setComments(originalComments);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    const originalComments = [...comments];
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));

    try {
      const result = await deleteComment(commentId, user.uid);
      if (result.success) {
        toast.success("댓글이 삭제되었습니다.");
        onBattleUpdate({
          ...battle,
          commentCount: Math.max(0, (battle.commentCount || 1) - 1),
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      toast.error("댓글 삭제에 실패했습니다.");
      setComments(originalComments);
    }
    setShowDropdown(null);
  };

  const handleReportComment = async (commentId) => {
    try {
      await reportComment(commentId, user.uid);
      toast.success("신고가 접수되었습니다.");
    } catch (error) {
      console.error("신고 처리 오류:", error);
      toast.error("신고 처리에 실패했습니다.");
    }
    setShowDropdown(null);
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const commentDate = new Date(date);
    const diffInMinutes = Math.floor((now - commentDate) / (1000 * 60));

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}일 전`;
    return commentDate.toLocaleDateString("ko-KR");
  };

  const getBadgeForUser = (comment) => {
    if (comment.userId === battle.creatorId) {
      return { text: "작성자", color: "bg-purple-500" };
    }
    return null;
  };

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="w-6 h-6 text-blue-400" />
          <h2 className="text-2xl font-bold">
            댓글 <span className="text-blue-400">({comments.length})</span>
          </h2>
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      <form onSubmit={handleSubmitComment} className="mb-8">
        {replyTo && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-blue-400">
                  {replyTo.userName}님에게 답글 작성 중
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-1 truncate">
              {replyTo.content}
            </p>
          </div>
        )}
        <div className="flex gap-3">
          <img
            src={user?.photoURL || "/images/default.jpg"}
            alt="내 프로필"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                replyTo ? "답글을 작성해주세요..." : "댓글을 작성해주세요..."
              }
              className="w-full bg-gray-700 text-white p-3 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxLength={500}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-400">
                {newComment.length}/500
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors w-32"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {replyTo ? "답글 작성" : "댓글 작성"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-gray-400 mt-2">댓글을 불러오는 중...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">첫 댓글을 작성해보세요!</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-700/30 rounded-xl p-4">
              <div className="flex gap-3">
                <img
                  src={comment.userAvatar || "/images/default.jpg"}
                  alt={comment.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">
                      {comment.userName}
                    </span>
                    {getBadgeForUser(comment) && (
                      <span
                        className={`${
                          getBadgeForUser(comment).color
                        } text-white text-xs px-2 py-1 rounded-full`}
                      >
                        {getBadgeForUser(comment).text}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(comment.createdAt)}
                    </div>
                    <div className="ml-auto relative">
                      <button
                        onClick={() =>
                          setShowDropdown(
                            showDropdown === comment.id ? null : comment.id
                          )
                        }
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showDropdown === comment.id && (
                        <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 min-w-32">
                          {user && comment.userId === user.uid ? (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-gray-700 rounded-t-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                              삭제
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReportComment(comment.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-yellow-400 hover:bg-gray-700 rounded-lg"
                            >
                              <Flag className="w-4 h-4" />
                              신고
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1 text-sm transition-colors ${
                        comment.isLiked
                          ? "text-red-400"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          comment.isLiked ? "fill-current" : ""
                        }`}
                      />
                      {comment.likes || 0}
                    </button>
                    <button
                      onClick={() =>
                        setReplyTo({
                          id: comment.id,
                          userName: comment.userName,
                          content: comment.content,
                        })
                      }
                      className="flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      <Reply className="w-4 h-4" />
                      답글
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BattleComments;
