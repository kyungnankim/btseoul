// src/components/Login.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Music } from "lucide-react";

// authService에서 이메일 로그인 함수를 import 합니다.
import { loginWithEmail } from "../services/authService";

const Login = ({ onSpotifyLogin, onGoogleLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 이메일/비밀번호 로그인 버튼 클릭 시 실행되는 함수
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("이메일과 비밀번호를 모두 입력해주세요.");
    }
    setLoading(true);
    try {
      // authService의 loginWithEmail 함수 호출
      await loginWithEmail(email, password);
      toast.success("로그인 되었습니다!");
      navigate("/"); // 로그인 성공 시 메인 페이지로 이동
    } catch (error) {
      console.error("Email login error:", error);
      // Firebase 에러 코드에 따라 사용자에게 친화적인 메시지 표시
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
      ) {
        toast.error("이메일 또는 비밀번호가 잘못되었습니다.");
      } else {
        toast.error("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white">
          <span className="text-pink-500">Battle</span> Seoul
        </h1>
        <p className="text-gray-400 mt-2">
          VS. 포맷으로 만나는 서울의 라이프스타일
        </p>
      </div>

      <div className="w-full max-w-sm p-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
        {/* 이메일 로그인 폼 */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <div>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-pink-500 text-white font-bold rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "이메일로 로그인"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-gray-600" />
          <span className="mx-4 text-gray-500 text-sm">또는</span>
          <hr className="flex-grow border-gray-600" />
        </div>

        {/* 소셜 로그인 버튼 */}
        <div className="space-y-4">
          <button
            onClick={onSpotifyLogin}
            className="w-full inline-flex justify-center items-center gap-3 px-6 py-3 bg-[#1DB954] text-white font-bold rounded-lg hover:bg-[#1ED760] transition-colors"
          >
            <Music className="w-5 h-5" />
            Spotify로 계속하기
          </button>

          <button
            onClick={onGoogleLogin}
            className="w-full inline-flex justify-center items-center gap-3 px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors"
          >
            {/* public 폴더에 로고 파일이 있어야 합니다 */}
            <img src="/google-logo.svg" alt="Google" className="w-5 h-5" />
            Google로 계속하기
          </button>
        </div>

        {/* 회원가입 페이지 링크 */}
        <p className="text-gray-400 text-sm mt-8">
          계정이 없으신가요?{" "}
          <Link
            to="/register"
            className="font-bold text-pink-400 hover:underline"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
