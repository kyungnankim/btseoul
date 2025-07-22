import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 컴포넌트 임포트
import Login from "./components/Login";
import Register from "./components/Register";
import Callback from "./components/Callback";
import Header from "./components/Header";
import BattleList from "./components/BattleList";
import BattleDetail from "./components/BattleDetail";
import ContentUpload from "./components/ContentUpload";

const Apps = () => {
  const [user, setUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  // 로그인 상태 확인 (개발용으로 임시 사용자 설정)
  useEffect(() => {
    // 개발 중에는 자동 로그인 처리
    const mockUser = {
      id: 1,
      name: "테스트 사용자",
      email: "test@example.com",
      points: 2850,
      level: 3,
    };
    setUser(mockUser);
    sessionStorage.setItem("user", JSON.stringify(mockUser));
  }, []);

  // Spotify 로그인 함수
  const loginWithSpotify = async () => {
    const CLIENT_ID = "254d6b7f190543e78da436cd3287a60e";
    const REDIRECT_URI = "http://127.0.0.1:5173/callback";
    const SCOPES = "user-read-private user-read-email";

    const generateCodeVerifier = (length) => {
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length })
        .map(() => possible.charAt(Math.floor(Math.random() * possible.length)))
        .join("");
    };

    const generateCodeChallenge = async (verifier) => {
      const data = new TextEncoder().encode(verifier);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem("verifier", verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  // 로그아웃
  const handleLogout = () => {
    sessionStorage.clear();
    setUser(null);
    window.location.href = "/login";
  };

  // 배틀 생성
  const handleBattleCreate = (battleData) => {
    console.log("새 배틀 생성:", battleData);
    setShowUpload(false);
    // 실제 구현시 API 호출 후 목록 새로고침
  };

  // 페이지 네비게이션 (React Router 대신 사용)
  const handleNavigate = (path) => {
    window.location.href = path;
  };

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          {/* 메인 페이지 - Battle List */}
          <Route
            path="/"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/"
                    onNavigate={handleNavigate}
                  />
                )}
                <BattleList
                  onBattleClick={(battle) => {
                    // 배틀 상세 페이지로 이동
                    sessionStorage.setItem(
                      "selectedBattle",
                      JSON.stringify(battle)
                    );
                    window.location.href = `/battle/${battle.id}`;
                  }}
                />
                {showUpload && user && (
                  <ContentUpload
                    onClose={() => setShowUpload(false)}
                    onSubmit={handleBattleCreate}
                  />
                )}
              </>
            }
          />

          {/* 배틀 상세 페이지 */}
          <Route
            path="/battle/:id"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/battle"
                    onNavigate={handleNavigate}
                  />
                )}
                <BattleDetail
                  battle={JSON.parse(
                    sessionStorage.getItem("selectedBattle") || "{}"
                  )}
                  currentUser={user}
                  onBack={() => (window.location.href = "/")}
                />
                {showUpload && user && (
                  <ContentUpload
                    onClose={() => setShowUpload(false)}
                    onSubmit={handleBattleCreate}
                  />
                )}
              </>
            }
          />

          {/* 로그인/회원가입 */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" />
              ) : (
                <Login onSpotifyLogin={loginWithSpotify} />
              )
            }
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />
          <Route path="/callback" element={<Callback />} />

          {/* About 페이지들 */}
          <Route
            path="/about"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/about"
                    onNavigate={handleNavigate}
                  />
                )}
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    About Battle Seoul
                  </h1>
                  <p className="text-gray-400">
                    Battle Seoul은 트렌드 시뮬레이션을 통해 서울의 문화를
                    만들어갑니다.
                  </p>
                </div>
              </>
            }
          />

          {/* Culture Magazine */}
          <Route
            path="/magazine/hot"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/magazine/hot"
                    onNavigate={handleNavigate}
                  />
                )}
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Hot Magazine
                  </h1>
                  <p className="text-gray-400">
                    가장 핫한 배틀들을 확인하세요.
                  </p>
                </div>
              </>
            }
          />

          {/* Entertainment */}
          <Route
            path="/entertainment/artist"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/entertainment/artist"
                    onNavigate={handleNavigate}
                  />
                )}
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold text-white mb-4">Artist</h1>
                  <p className="text-gray-400">
                    Battle Seoul의 아티스트들을 만나보세요.
                  </p>
                </div>
              </>
            }
          />

          {/* 마이페이지 */}
          <Route
            path="/mypage"
            element={
              <>
                {user && (
                  <Header
                    user={user}
                    onLogout={handleLogout}
                    onCreateBattle={() => setShowUpload(true)}
                    currentPage="/mypage"
                    onNavigate={handleNavigate}
                  />
                )}
                <div className="max-w-7xl mx-auto px-4 py-8">
                  <h1 className="text-4xl font-bold text-white mb-4">
                    마이페이지
                  </h1>
                  <div className="bg-gray-800 rounded-xl p-6">
                    <p className="text-gray-300">이름: {user?.name}</p>
                    <p className="text-gray-300">포인트: {user?.points}</p>
                    <p className="text-gray-300">레벨: {user?.level}</p>
                  </div>
                </div>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default Apps;
/*
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Callback from "./components/Callback";
const App = () => {
  // Spotify 로그인 함수
  const loginWithSpotify = async () => {
    const CLIENT_ID = "254d6b7f190543e78da436cd3287a60e";
    const REDIRECT_URI = "http://127.0.0.1:5173/callback"; // ✅ callback.jsx에서 code 처리

    //const REDIRECT_URI = 'http://127.0.0.1:5173/register'; // 로그인 후 회원가입 페이지로 이동
    const SCOPES = "user-read-private user-read-email";

    const generateCodeVerifier = (length) => {
      const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      return Array.from({ length })
        .map(() => possible.charAt(Math.floor(Math.random() * possible.length)))
        .join("");
    };

    const generateCodeChallenge = async (verifier) => {
      const data = new TextEncoder().encode(verifier);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);
    sessionStorage.setItem("verifier", verifier);

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      response_type: "code",
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      code_challenge_method: "S256",
      code_challenge: challenge,
    });

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
        <Routes>
          <Route
            path="/"
            element={<Login onSpotifyLogin={loginWithSpotify} />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<Callback />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

*/
