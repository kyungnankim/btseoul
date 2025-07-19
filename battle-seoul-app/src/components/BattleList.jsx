import React, { useState, useEffect } from "react";
import {
  Heart,
  MessageCircle,
  Trophy,
  TrendingUp,
  Clock,
  Filter,
  RefreshCw,
} from "lucide-react";

const BattleList = ({ onBattleClick }) => {
  const [battles, setBattles] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("hot"); // hot, new, top

  // 더미 데이터 생성
  const generateBattles = () => {
    const categories = ["Music", "Fashion", "Food"];
    const battleTitles = [
      {
        left: "Gorillaz - Tomorrow Comes Today",
        right: "Cyberpunk - I Really Want to Stay",
      },
      { left: "Supreme 2024 Collection", right: "Off-White Season" },
      { left: "강남 최고 라멘집", right: "홍대 인기 라멘" },
      { left: "NewJeans - Ditto", right: "IVE - After Like" },
      { left: "빈티지 스트릿 룩", right: "미니멀 모던 스타일" },
      { left: "수제 버거", right: "프랜차이즈 버거" },
    ];

    return Array.from({ length: 12 }, (_, i) => {
      const battle = battleTitles[i % battleTitles.length];
      const totalVotes = Math.floor(Math.random() * 500) + 50;
      const leftVotes = Math.floor(Math.random() * totalVotes);

      return {
        id: i + 1,
        category: categories[i % 3],
        title: `${battle.left} vs ${battle.right}`,
        leftTitle: battle.left,
        rightTitle: battle.right,
        leftImage: `https://picsum.photos/seed/left${i}/400/300`,
        rightImage: `https://picsum.photos/seed/right${i}/400/300`,
        leftVotes: leftVotes,
        rightVotes: totalVotes - leftVotes,
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 50),
        views: Math.floor(Math.random() * 1000) + 100,
        createdAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ),
        author: `배틀러${Math.floor(Math.random() * 100)}`,
        status: Math.random() > 0.7 ? "ended" : "active",
        points: Math.floor(Math.random() * 30) + 10,
      };
    });
  };

  useEffect(() => {
    setBattles(generateBattles());
  }, []);

  // 필터링 및 정렬
  const filteredBattles = battles
    .filter(
      (battle) => filter === "all" || battle.category.toLowerCase() === filter
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "hot":
          return (
            b.views +
            b.likes * 2 +
            b.comments * 3 -
            (a.views + a.likes * 2 + a.comments * 3)
          );
        case "new":
          return b.createdAt - a.createdAt;
        case "top":
          return b.leftVotes + b.rightVotes - (a.leftVotes + a.rightVotes);
        default:
          return 0;
      }
    });

  const handleRefresh = () => {
    setBattles(generateBattles());
  };

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "music":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      case "fashion":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "food":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getWinningPercentage = (leftVotes, rightVotes) => {
    const total = leftVotes + rightVotes;
    if (total === 0) return { left: 50, right: 50 };
    return {
      left: Math.round((leftVotes / total) * 100),
      right: Math.round((rightVotes / total) * 100),
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            지금 <span className="text-pink-500">서울</span>, 어떤 배틀 중?
          </h1>
          <p className="text-gray-400">
            음식, 패션, 음악까지 VS. 포맷으로 만나는 서울의 라이프스타일
          </p>
        </div>

        {/* 필터 & 정렬 */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex gap-2">
            {["all", "music", "fashion", "food"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === cat
                    ? "bg-pink-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                {cat === "all"
                  ? "전체"
                  : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            {[
              { value: "hot", label: "Hot", icon: TrendingUp },
              { value: "new", label: "New", icon: Clock },
              { value: "top", label: "Top", icon: Trophy },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSortBy(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  sortBy === value
                    ? "bg-gray-700 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}

            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition-colors"
              title="새로고침"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 배틀 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBattles.map((battle) => {
            const percentage = getWinningPercentage(
              battle.leftVotes,
              battle.rightVotes
            );

            return (
              <div
                key={battle.id}
                onClick={() => onBattleClick(battle)}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-pink-500/50 transition-all cursor-pointer group"
              >
                {/* 이미지 섹션 */}
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 grid grid-cols-2">
                    <img
                      src={battle.leftImage}
                      alt={battle.leftTitle}
                      className="w-full h-full object-cover"
                    />
                    <img
                      src={battle.rightImage}
                      alt={battle.rightTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* VS 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-gray-900/90 backdrop-blur-sm text-white font-bold text-xl px-3 py-1 rounded-lg border border-pink-500/50">
                      VS
                    </div>
                  </div>

                  {/* 카테고리 태그 */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(
                        battle.category
                      )}`}
                    >
                      {battle.category}
                    </span>
                  </div>

                  {/* 상태 표시 */}
                  {battle.status === "ended" && (
                    <div className="absolute top-3 right-3 bg-gray-900/80 text-gray-400 px-2 py-1 rounded text-xs">
                      종료됨
                    </div>
                  )}

                  {/* 투표 결과 미리보기 */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex justify-between text-white text-sm font-medium mb-1">
                      <span>{percentage.left}%</span>
                      <span>{percentage.right}%</span>
                    </div>
                    <div className="h-1 bg-gray-700/50 rounded-full overflow-hidden">
                      <div className="h-full flex">
                        <div
                          className="bg-pink-500 transition-all"
                          style={{ width: `${percentage.left}%` }}
                        />
                        <div
                          className="bg-blue-500 transition-all"
                          style={{ width: `${percentage.right}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 콘텐츠 섹션 */}
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 group-hover:text-pink-400 transition-colors line-clamp-2">
                    {battle.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3 text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {battle.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {battle.comments}
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />+
                        {battle.points}
                      </span>
                    </div>

                    <span className="text-gray-500 text-xs">
                      {battle.author}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 로딩 더미 */}
        {filteredBattles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">배틀이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleList;
