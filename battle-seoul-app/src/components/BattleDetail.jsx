import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Heart,
  Share2,
  Flag,
  Trophy,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Send,
  MoreVertical,
  Star,
} from "lucide-react";

const BattleDetail = ({
  battle,
  onBack,
  currentUser = { id: 1, name: "사용자" },
}) => {
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedSide, setSelectedSide] = useState(null);
  const [localBattle, setLocalBattle] = useState(battle);
  const [comment, setComment] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [liked, setLiked] = useState(false);

  // 실시간 업데이트 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setLocalBattle((prev) => ({
          ...prev,
          views: prev.views + Math.floor(Math.random() * 5) + 1,
        }));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleVote = (side) => {
    if (hasVoted) return;

    setSelectedSide(side);
    setHasVoted(true);

    setLocalBattle((prev) => ({
      ...prev,
      [side === "left" ? "leftVotes" : "rightVotes"]:
        prev[side === "left" ? "leftVotes" : "rightVotes"] + 1,
    }));

    // 포인트 획득 애니메이션
    const pointsEarned = 10;
    // 실제 구현시 포인트 저장 로직
  };

  const handleComment = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      author: currentUser.name,
      text: comment,
      time: "방금",
      likes: 0,
      replies: [],
    };

    setLocalBattle((prev) => ({
      ...prev,
      comments: prev.comments + 1,
      commentList: [...(prev.commentList || []), newComment],
    }));

    setComment("");
  };

  const handleLike = () => {
    setLiked(!liked);
    setLocalBattle((prev) => ({
      ...prev,
      likes: liked ? prev.likes - 1 : prev.likes + 1,
    }));
  };

  const getWinningPercentage = () => {
    const total = localBattle.leftVotes + localBattle.rightVotes;
    if (total === 0) return { left: 50, right: 50 };
    return {
      left: Math.round((localBattle.leftVotes / total) * 100),
      right: Math.round((localBattle.rightVotes / total) * 100),
    };
  };

  const percentage = getWinningPercentage();
  const totalVotes = localBattle.leftVotes + localBattle.rightVotes;
  const isWinnerDecided = localBattle.status === "ended";
  const winner = percentage.left > percentage.right ? "left" : "right";

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>목록으로</span>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`p-2 rounded-lg transition-colors ${
                liked
                  ? "bg-pink-500/20 text-pink-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
            </button>
            <button
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="p-2 text-gray-400 hover:text-white transition-colors relative"
            >
              <Share2 className="w-5 h-5" />

              {showShareMenu && (
                <div className="absolute right-0 top-full mt-2 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 w-48">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors">
                    링크 복사
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors">
                    Twitter 공유
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors">
                    Facebook 공유
                  </button>
                </div>
              )}
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Flag className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 배틀 정보 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                localBattle.category === "Music"
                  ? "bg-pink-500/20 text-pink-400 border-pink-500/30"
                  : localBattle.category === "Fashion"
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                  : "bg-orange-500/20 text-orange-400 border-orange-500/30"
              }`}
            >
              {localBattle.category}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(localBattle.createdAt).toLocaleDateString()}
            </span>
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {localBattle.views?.toLocaleString() || 0} views
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-2">{localBattle.title}</h1>
          <p className="text-gray-400">by {localBattle.author}</p>
        </div>

        {/* VS 섹션 */}
        <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* 왼쪽 콘텐츠 */}
            <div className="space-y-4">
              <div
                onClick={() => handleVote("left")}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  selectedSide === "left"
                    ? "ring-4 ring-pink-500"
                    : !hasVoted
                    ? "hover:scale-[1.02]"
                    : ""
                } ${hasVoted && selectedSide !== "left" ? "opacity-50" : ""}`}
              >
                <img
                  src={localBattle.leftImage || "/images/default.jpg"}
                  alt={localBattle.leftTitle}
                  className="w-full h-64 object-cover"
                />
                {isWinnerDecided && winner === "left" && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Winner
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {localBattle.leftTitle}
                </h3>
                {hasVoted && (
                  <>
                    <div className="text-3xl font-bold text-pink-500 mb-2">
                      {percentage.left}%
                    </div>
                    <p className="text-gray-400">
                      {localBattle.leftVotes.toLocaleString()} 표
                    </p>
                  </>
                )}
              </div>

              {!hasVoted && (
                <button
                  onClick={() => handleVote("left")}
                  className="w-full py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all"
                >
                  투표하기
                </button>
              )}
            </div>

            {/* 오른쪽 콘텐츠 */}
            <div className="space-y-4">
              <div
                onClick={() => handleVote("right")}
                className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${
                  selectedSide === "right"
                    ? "ring-4 ring-blue-500"
                    : !hasVoted
                    ? "hover:scale-[1.02]"
                    : ""
                } ${hasVoted && selectedSide !== "right" ? "opacity-50" : ""}`}
              >
                <img
                  src={localBattle.rightImage}
                  alt={localBattle.rightTitle}
                  className="w-full h-64 object-cover"
                />
                {isWinnerDecided && winner === "right" && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Trophy className="w-4 h-4" />
                    Winner
                  </div>
                )}
              </div>

              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">
                  {localBattle.rightTitle}
                </h3>
                {hasVoted && (
                  <>
                    <div className="text-3xl font-bold text-blue-500 mb-2">
                      {percentage.right}%
                    </div>
                    <p className="text-gray-400">
                      {localBattle.rightVotes.toLocaleString()} 표
                    </p>
                  </>
                )}
              </div>

              {!hasVoted && (
                <button
                  onClick={() => handleVote("right")}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                >
                  투표하기
                </button>
              )}
            </div>
          </div>

          {/* 투표 진행 바 */}
          {hasVoted && (
            <div className="space-y-3">
              <div className="h-8 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div
                    className="bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-1000 flex items-center justify-center text-white font-medium text-sm"
                    style={{ width: `${percentage.left}%` }}
                  >
                    {percentage.left > 10 && `${percentage.left}%`}
                  </div>
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 flex items-center justify-center text-white font-medium text-sm"
                    style={{ width: `${percentage.right}%` }}
                  >
                    {percentage.right > 10 && `${percentage.right}%`}
                  </div>
                </div>
              </div>
              <div className="text-center text-gray-400">
                총 {totalVotes.toLocaleString()}명이 투표했습니다
              </div>
            </div>
          )}
        </div>

        {/* 배틀 설명 */}
        {localBattle.description && (
          <div className="bg-gray-800/30 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-3">배틀 소개</h3>
            <p className="text-gray-300 leading-relaxed">
              {localBattle.description}
            </p>
          </div>
        )}

        {/* 통계 */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{totalVotes}</p>
            <p className="text-gray-400 text-sm">총 투표</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <Heart className="w-6 h-6 text-pink-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{localBattle.likes}</p>
            <p className="text-gray-400 text-sm">좋아요</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <MessageCircle className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">{localBattle.comments}</p>
            <p className="text-gray-400 text-sm">댓글</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-4 text-center">
            <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">+{localBattle.points || 10}</p>
            <p className="text-gray-400 text-sm">포인트</p>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="bg-gray-800/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            댓글 {localBattle.commentList?.length || 0}
          </h3>

          {/* 댓글 입력 */}
          <div className="flex gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex-shrink-0" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleComment()}
                placeholder="댓글을 입력하세요..."
                className="flex-1 px-4 py-2 bg-gray-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 댓글 리스트 */}
          <div className="space-y-4">
            {(localBattle.commentList || []).map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex-shrink-0" />
                <div className="flex-1">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{comment.author}</span>
                      <span className="text-gray-500 text-sm">
                        {comment.time}
                      </span>
                    </div>
                    <p className="text-gray-300">{comment.text}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <button className="flex items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors text-sm">
                        <ThumbsUp className="w-4 h-4" />
                        {comment.likes || 0}
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors text-sm">
                        답글
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleDetail;
