// 1. App.jsx - 메인 앱 컴포넌트
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Components
import Header from "./components/Header";
import BattleList from "./components/BattleList";
import BattleDetail from "./components/BattleDetail";
import ContentUpload from "./components/ContentUpload";
import Login from "./components/Login";
import Register from "./components/Register";
import MyPage from "./components/MyPage";
import Callback from "./components/Callback";

// Pages (추가 필요)
import About from "./pages/About";
import CultureMagazine from "./pages/CultureMagazine";
import Entertainment from "./pages/Entertainment";
import NotFound from "./pages/NotFound";

// Firebase
import { auth } from "./firebase/config.js";
import { onAuthStateChanged } from "firebase/auth";

// Hooks
import { useAuth } from "./hooks/useAuth.js";

function App() {
  const [currentPage, setCurrentPage] = useState("/");
  const [selectedBattle, setSelectedBattle] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const { user, loading } = useAuth();

  const handleNavigate = (path) => {
    setCurrentPage(path);
    setSelectedBattle(null);
  };

  const handleBattleClick = (battle) => {
    setSelectedBattle(battle);
    setCurrentPage("/battle-detail");
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      handleNavigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header
          user={user}
          onLogout={handleLogout}
          onCreateBattle={() => setShowUpload(true)}
          currentPage={currentPage}
          onNavigate={handleNavigate}
        />

        <Routes>
          <Route
            path="/"
            element={<BattleList onBattleClick={handleBattleClick} />}
          />
          <Route path="/battle/:id" element={<BattleDetail />} />
          <Route path="/login" element={<Login />} />
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

        {showUpload && (
          <ContentUpload
            onClose={() => setShowUpload(false)}
            onSubmit={(data) => {
              console.log("Battle created:", data);
              setShowUpload(false);
            }}
          />
        )}

        <Toaster position="top-center" />
      </div>
    </Router>
  );
}

export default App;
