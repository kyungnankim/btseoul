// 2. MyPage.jsx - 마이페이지 컴포넌트
import React, { useState, useEffect } from "react";
import {
  User,
  Trophy,
  Heart,
  MessageCircle,
  Settings,
  Award,
  Calendar,
  CreditCard,
  LogOut,
  Camera,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getUserStats, updateProfile } from "../services/userService.js";

const MyPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [stats, setStats] = useState({
    totalVotes: 0,
    battlesCreated: 0,
    battlesWon: 0,
    points: 0,
  });

  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      const userStats = await getUserStats(user.uid);
      setStats(userStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const tabs = [
    { id: "profile", label: "프로필", icon: User },
    { id: "battles", label: "내 배틀", icon: Trophy },
    { id: "votes", label: "투표 내역", icon: Heart },
    { id: "points", label: "포인트", icon: Award },
    { id: "settings", label: "설정", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 프로필 헤더 */}
        <div className="bg-gray-800/50 rounded-2xl p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              <button className="absolute bottom-0 right-0 bg-pink-500 p-2 rounded-full hover:bg-pink-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>

            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user?.displayName || "사용자"}
              </h1>
              <p className="text-gray-400 mb-4">{user?.email}</p>

              <div className="flex gap-6">
                <div>
                  <p className="text-2xl font-bold text-pink-500">
                    {stats.totalVotes}
                  </p>
                  <p className="text-sm text-gray-400">총 투표</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-500">
                    {stats.battlesCreated}
                  </p>
                  <p className="text-sm text-gray-400">생성한 배틀</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-500">
                    {stats.points}
                  </p>
                  <p className="text-sm text-gray-400">포인트</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-gray-700/50 px-4 py-2 rounded-lg mb-2">
                <p className="text-xs text-gray-400">시민권 번호</p>
                <p className="font-mono">BS2024XXXX</p>
              </div>
              <button className="text-sm text-gray-400 hover:text-white transition-colors">
                시민증 다운로드
              </button>
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* 탭 콘텐츠 */}
        <div className="bg-gray-800/50 rounded-xl p-6">
          {activeTab === "profile" && <ProfileTab user={user} />}
          {activeTab === "battles" && <BattlesTab userId={user?.uid} />}
          {activeTab === "votes" && <VotesTab userId={user?.uid} />}
          {activeTab === "points" && <PointsTab points={stats.points} />}
          {activeTab === "settings" && <SettingsTab />}
        </div>
      </div>
    </div>
  );
};

// 탭 컴포넌트들...
const ProfileTab = ({ user }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">프로필 정보</h3>
    {/* 프로필 수정 폼 */}
  </div>
);

const BattlesTab = ({ userId }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">내가 만든 배틀</h3>
    {/* 배틀 리스트 */}
  </div>
);

const VotesTab = ({ userId }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">투표 내역</h3>
    {/* 투표 리스트 */}
  </div>
);

const PointsTab = ({ points }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">포인트 내역</h3>
    <div className="text-center py-8">
      <p className="text-5xl font-bold text-yellow-500 mb-2">{points}</p>
      <p className="text-gray-400">보유 포인트</p>
    </div>
    {/* 포인트 히스토리 */}
  </div>
);

const SettingsTab = () => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-4">설정</h3>
    {/* 설정 옵션들 */}
  </div>
);

export default MyPage;
