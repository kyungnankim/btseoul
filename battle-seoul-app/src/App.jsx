// src/App.jsx

import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

import Header from "./components/Header";
import BattleList from "./components/BattleList";
import BattleDetail from "./components/BattleDetail";
import ContentUpload from "./components/ContentUpload";
import Login from "./components/Login";
import Register from "./components/Register";
import MyPage from "./components/MyPage";
import Callback from "./components/Callback";
import About from "./pages/About";
import CultureMagazine from "./pages/CultureMagazine";
import Entertainment from "./pages/Entertainment";
import NotFound from "./pages/NotFound";

import { logout, loginOrRegisterWithGoogle } from "./services/authService";
import { useAuth } from "./hooks/useAuth";

function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [showUpload, setShowUpload] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("로그아웃 되었습니다.");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await loginOrRegisterWithGoogle();
      if (result.success) {
        toast.success(
          result.isNewUser
            ? "환영합니다! 회원가입이 완료되었습니다."
            : "로그인 되었습니다."
        );
        navigate("/");
      }
    } catch (error) {
      console.error("Google login process failed:", error);
      toast.error("Google 로그인 중 오류가 발생했습니다.");
    }
  };

  const handleSpotifyLogin = () => {
    // Spotify PKCE 인증 흐름 시작
    // 실제 구현시에는 verifier, challenge 생성 로직이 필요합니다.
    console.log("Spotify login initiated");
    toast("Spotify 로그인 기능은 현재 개발 중입니다.");
    // window.location.href = `YOUR_SPOTIFY_AUTH_URL`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header
        user={user}
        onLogout={handleLogout}
        onCreateBattle={() => setShowUpload(true)}
        onNavigate={navigate}
      />

      <Routes>
        <Route path="/" element={<BattleList />} />
        <Route path="/battle/:id" element={<BattleDetail />} />
        <Route
          path="/login"
          element={
            <Login
              onGoogleLogin={handleGoogleLogin}
              onSpotifyLogin={handleSpotifyLogin}
            />
          }
        />
        <Route path="/register" element={<Register />} />
        <Route path="/callback" element={<Callback />} />
        <Route
          path="/mypage"
          element={user ? <MyPage /> : <Navigate to="/login" />}
        />
        <Route path="/about/*" element={<About />} />
        <Route path="/magazine/*" element={<CultureMagazine />} />
        <Route path="/entertainment/*" element={<Entertainment />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {showUpload && <ContentUpload onClose={() => setShowUpload(false)} />}

      <Toaster position="top-center" />
    </div>
  );
}

export default App;
