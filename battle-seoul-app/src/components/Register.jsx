import React, { useState, useEffect } from "react";
import {
  Mail,
  Users,
  Calendar,
  User,
  Lock,
  Check,
  X,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import toast from "react-hot-toast";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    birthYear: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null);

  // Spotify 프로필 로드
  useEffect(() => {
    const savedProfile = sessionStorage.getItem("spotifyProfile");

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setSpotifyProfile(profile);

        // 프로필에서 정보 자동 입력
        setFormData((prev) => ({
          ...prev,
          email: profile.email || prev.email,
          country: profile.country || prev.country,
        }));
      } catch (err) {
        console.error("프로필 파싱 오류:", err);
      }
    }
  }, []);

  const validatePassword = (password) => {
    const minLength = 9;
    const maxLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (password.length < minLength || password.length > maxLength) {
      setPasswordError(`비밀번호는 ${minLength}~${maxLength}자여야 합니다.`);
      setIsPasswordValid(false);
      return false;
    }

    if (!hasUpperCase) {
      setPasswordError("영문 대문자를 포함해야 합니다.");
      setIsPasswordValid(false);
      return false;
    }

    if (!hasNumber) {
      setPasswordError("숫자를 포함해야 합니다.");
      setIsPasswordValid(false);
      return false;
    }

    if (!hasSpecialChar) {
      setPasswordError("특수문자를 포함해야 합니다.");
      setIsPasswordValid(false);
      return false;
    }

    setPasswordError("");
    setIsPasswordValid(true);
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error("비밀번호가 유효하지 않습니다.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);

    try {
      // Spotify 프로필이 있으면 연동하여 회원가입
      const result = await AuthService.registerWithSpotify(
        formData,
        spotifyProfile || {}
      );

      if (result.success) {
        toast.success(`회원가입 완료! 시민권 번호: ${result.citizenCode}`);

        // 세션 정리
        sessionStorage.removeItem("spotifyProfile");
        sessionStorage.removeItem("spotifyAccessToken");

        // 메인 페이지로 이동
        navigate("/");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error.code === "auth/email-already-in-use"
          ? "이미 사용 중인 이메일입니다."
          : "회원가입 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
        {spotifyProfile && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6">
            <p className="text-green-200 flex items-center gap-2">
              <Music className="w-5 h-5" />
              Spotify 계정 연결됨:{" "}
              {spotifyProfile.display_name || spotifyProfile.email}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">
            회원가입 정보 입력
          </h2>

          {/* 폼 필드들 (기존과 동일) */}
          {/* ... */}

          <button
            type="submit"
            disabled={
              loading ||
              !isPasswordValid ||
              formData.password !== formData.confirmPassword
            }
            className="w-full py-3 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                처리 중...
              </>
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
