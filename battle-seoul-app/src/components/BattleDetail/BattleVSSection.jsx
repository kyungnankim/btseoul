// src/components/BattleDetail/BattleVSSection.jsx - VS 투표 섹션 (YouTube 재생 수정)

import React, { useState } from "react";
import { Trophy, ThumbsUp, PlayCircle, Youtube } from "lucide-react";
import { voteOnBattle } from "../../services/battleService";
import MediaPlayerModal from "../MediaPlayerModal";
import toast from "react-hot-toast";

const BattleVSSection = ({
  battle,
  user,
  hasVoted,
  selectedSide,
  onVote,
  onBattleUpdate,
  onNavigate,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  const handleVote = async (choice) => {
    if (!user) {
      toast.error("투표하려면 로그인이 필요합니다.");
      onNavigate("/login");
      return;
    }

    if (hasVoted) {
      toast.error("이미 투표하셨습니다.");
      return;
    }

    try {
      const newBattle = { ...battle };
      newBattle[choice].votes += 1;
      newBattle.totalVotes += 1;
      newBattle.participants = [...(newBattle.participants || []), user.uid];

      const itemAVotes = newBattle.itemA.votes;
      const itemBVotes = newBattle.itemB.votes;
      const total = newBattle.totalVotes;

      newBattle.currentLeader = {
        winner:
          itemAVotes > itemBVotes
            ? "itemA"
            : itemBVotes > itemAVotes
            ? "itemB"
            : "tie",
        percentage:
          total > 0
            ? Math.round((Math.max(itemAVotes, itemBVotes) / total) * 100)
            : 50,
        margin: Math.abs(itemAVotes - itemBVotes),
        lastUpdated: new Date(),
      };

      onBattleUpdate(newBattle);
      onVote(true, choice);

      const result = await voteOnBattle(battle.id, choice);

      if (result.success) {
        toast.success("투표가 완료되었습니다! (+10 포인트)");
      } else {
        throw new Error(result.error || "투표 처리 실패");
      }
    } catch (error) {
      console.error("투표 오류:", error);
      toast.error("투표 중 오류가 발생했습니다.");
      onBattleUpdate(battle);
      onVote(false, null);
    }
  };

  const handleItemImageClick = (item, choice) => {
    // YouTube 콘텐츠인 경우 모달로 재생
    if (item.contentType === "youtube") {
      setSelectedContent({
        contentType: "youtube",
        title: item.title,
        description: item.description,
        youtubeId: item.youtubeId,
        youtubeUrl: item.youtubeUrl,
        creatorName: item.creatorName,
        imageUrl: item.imageUrl,
      });
      setShowMediaModal(true);
      return;
    }

    // Instagram 콘텐츠인 경우 모달로 표시
    if (item.contentType === "instagram") {
      setSelectedContent({
        contentType: "instagram",
        title: item.title,
        description: item.description,
        instagramUrl: item.instagramUrl,
        creatorName: item.creatorName,
        imageUrl: item.imageUrl,
      });
      setShowMediaModal(true);
      return;
    }

    // 일반 이미지이고 아직 투표하지 않은 경우 투표 처리
    if (!hasVoted && battle.status !== "ended") {
      handleVote(choice);
    }
  };

  const handleVoteButtonClick = (choice) => {
    if (!hasVoted && battle.status !== "ended") {
      handleVote(choice);
    }
  };

  const getWinningPercentage = () => {
    const total = (battle.itemA.votes || 0) + (battle.itemB.votes || 0);
    if (total === 0) return { left: 50, right: 50 };
    return {
      left: Math.round(((battle.itemA.votes || 0) / total) * 100),
      right: Math.round(((battle.itemB.votes || 0) / total) * 100),
    };
  };

  const percentage = getWinningPercentage();
  const totalVotes = (battle.itemA.votes || 0) + (battle.itemB.votes || 0);
  const isEnded = battle.status === "ended";

  const renderContentItem = (item, choice, isLeft = true) => {
    const isSelected = selectedSide === choice;
    const isWinner = isEnded && battle.finalResult?.winner === choice;
    const percentageValue = isLeft ? percentage.left : percentage.right;
    const gradientColor = isLeft ? "pink" : "blue";

    return (
      <div className="space-y-4">
        <div
          onClick={() => handleItemImageClick(item, choice)}
          className={`group relative rounded-xl overflow-hidden transition-all cursor-pointer
            ${
              isSelected
                ? `ring-4 ring-${gradientColor}-500`
                : "hover:scale-[1.02]"
            }
            ${hasVoted && !isSelected ? "opacity-70" : ""}
          `}
        >
          {/* 이미지 또는 썸네일 */}
          <img
            src={item.imageUrl || item.thumbnailUrl || "/images/popo.png"}
            alt={item.title}
            className="w-full h-64 object-cover"
            loading="lazy"
          />

          {/* YouTube 콘텐츠 오버레이 */}
          {item.contentType === "youtube" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-white/90 mx-auto mb-2" />
                <div className="flex items-center gap-1 text-white/80 text-sm">
                  <Youtube className="w-4 h-4" />
                  <span>YouTube 재생</span>
                </div>
              </div>
            </div>
          )}

          {/* Instagram 콘텐츠 오버레이 */}
          {item.contentType === "instagram" && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 text-white/90 mx-auto mb-2" />
                <span className="text-white/80 text-sm">Instagram 보기</span>
              </div>
            </div>
          )}

          {/* 승자 배지 */}
          {isWinner && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <Trophy className="w-4 h-4" />
              Winner
            </div>
          )}

          {/* 내 선택 배지 */}
          {hasVoted && isSelected && (
            <div
              className={`absolute top-4 left-4 bg-${gradientColor}-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1`}
            >
              <ThumbsUp className="w-4 h-4" />내 선택
            </div>
          )}
        </div>

        {/* 콘텐츠 정보 */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-gray-400 mb-2">by {item.creatorName}</p>

          {/* 콘텐츠 타입 표시 */}
          {item.contentType === "youtube" && (
            <div className="flex items-center justify-center gap-1 mb-2 text-red-400">
              <Youtube className="w-4 h-4" />
              <span className="text-xs">YouTube</span>
            </div>
          )}

          {hasVoted && (
            <>
              <div
                className={`text-3xl font-bold text-${gradientColor}-500 mb-2`}
              >
                {percentageValue}%
              </div>
              <p className="text-gray-400">
                {(item.votes || 0).toLocaleString()} 표
              </p>
            </>
          )}
        </div>

        {/* 투표 버튼 */}
        {!hasVoted && !isEnded && (
          <button
            onClick={() => handleVoteButtonClick(choice)}
            className={`w-full py-3 bg-gradient-to-r from-${gradientColor}-500 to-${gradientColor}-600 text-white font-semibold rounded-lg hover:from-${gradientColor}-600 hover:to-${gradientColor}-700 transition-all transform hover:scale-105`}
          >
            이 항목에 투표
          </button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 미디어 재생 모달 */}
      <MediaPlayerModal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        contentData={selectedContent}
      />

      <div className="bg-gray-800/50 rounded-2xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* 왼쪽 콘텐츠 (itemA) */}
          {renderContentItem(battle.itemA, "itemA", true)}

          {/* 오른쪽 콘텐츠 (itemB) */}
          {renderContentItem(battle.itemB, "itemB", false)}
        </div>

        {/* VS 표시 */}
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white px-8 py-3 rounded-full font-bold text-2xl shadow-lg">
            VS
          </div>
        </div>

        {/* 투표 결과 바 */}
        {hasVoted && (
          <div className="bg-gray-700 rounded-full h-6 mb-4 overflow-hidden">
            <div className="h-full flex">
              <div
                className="bg-gradient-to-r from-pink-500 to-pink-600 transition-all duration-500 ease-out flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${percentage.left}%` }}
              >
                {percentage.left > 15 && `${percentage.left}%`}
              </div>
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out flex items-center justify-center text-white text-sm font-semibold"
                style={{ width: `${percentage.right}%` }}
              >
                {percentage.right > 15 && `${percentage.right}%`}
              </div>
            </div>
          </div>
        )}

        {/* 총 투표수 */}
        <div className="text-center text-gray-400">
          <p className="text-lg">
            총{" "}
            <span className="font-semibold text-white">
              {totalVotes.toLocaleString()}
            </span>
            명이 투표했습니다
          </p>
        </div>

        {/* 배틀 종료 결과 */}
        {isEnded && battle.finalResult && (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-yellow-500 font-semibold">배틀 종료</span>
            </div>
            <p className="text-gray-300">
              {battle.finalResult.winner === "itemA"
                ? battle.itemA.title
                : battle.finalResult.winner === "itemB"
                ? battle.itemB.title
                : "무승부"}
              {battle.finalResult.winner !== "tie" && "이(가) 승리했습니다!"}
              {battle.finalResult.winner === "tie" &&
                "무승부로 종료되었습니다!"}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              최종 점수: {battle.itemA.votes}표 vs {battle.itemB.votes}표
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default BattleVSSection;
