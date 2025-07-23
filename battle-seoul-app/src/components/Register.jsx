// src/components/Register.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  Loader2,
} from "lucide-react";
import {
  registerWithSpotify,
  registerWithEmail,
} from "../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isSocialRegister, setIsSocialRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    country: "",
    birthYear: "",
    gender: "",
    password: "",
    confirmPassword: "",
  });

  const [spotifyProfile, setSpotifyProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  useEffect(() => {
    const savedProfile = sessionStorage.getItem("spotifyProfile");
    if (savedProfile) {
      setIsSocialRegister(true);
      const profile = JSON.parse(savedProfile);
      setSpotifyProfile(profile);
      setFormData((prev) => ({
        ...prev,
        email: profile.email || "",
        country: profile.country || "",
      }));
    }
  }, []);

  const validatePassword = (password) => {
    const minLength = 9,
      maxLength = 12;
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
    if (!isPasswordValid || formData.password !== formData.confirmPassword) {
      toast.error("비밀번호를 확인해주세요.");
      return;
    }
    setLoading(true);

    try {
      let result;
      if (isSocialRegister) {
        if (!spotifyProfile) throw new Error("Spotify 프로필 정보가 없습니다.");
        result = await registerWithSpotify(formData, spotifyProfile);
      } else {
        result = await registerWithEmail(formData);
      }

      if (result.success) {
        toast.success(`회원가입 완료! Battle Seoul에 오신 것을 환영합니다.`);
        if (isSocialRegister) {
          sessionStorage.removeItem("spotifyProfile");
          sessionStorage.removeItem("spotifyAccessToken");
        }
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
        {isSocialRegister && spotifyProfile && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4 mb-6 text-center">
            <p className="text-green-200">
              Spotify 계정{" "}
              <span className="font-bold">
                {spotifyProfile.display_name || spotifyProfile.email}
              </span>
              으로 가입합니다.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">회원가입</h2>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Mail className="w-4 h-4" /> 이메일
              {isSocialRegister && (
                <span className="text-xs text-green-400">
                  (소셜 로그인 정보)
                </span>
              )}
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              readOnly={isSocialRegister}
              required
              placeholder={isSocialRegister ? "" : "이메일을 입력하세요"}
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isSocialRegister
                  ? "bg-gray-700/50 text-gray-300 border-gray-600 cursor-not-allowed"
                  : "bg-gray-700 text-white border-gray-600 focus:border-pink-500 focus:outline-none"
              }`}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Users className="w-4 h-4" /> 국가
            </label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              placeholder="국가를 입력하세요 (예: KR, US)"
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <Calendar className="w-4 h-4" /> 생년
              </label>
              <select
                name="birthYear"
                value={formData.birthYear}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
              >
                <option value="">선택하세요</option>
                {Array.from(
                  { length: 80 },
                  (_, i) => new Date().getFullYear() - 14 - i
                ).map((year) => (
                  <option key={year} value={year}>
                    {year}년
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                <User className="w-4 h-4" /> 성별
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
              >
                <option value="">선택하세요</option>
                <option value="male">남성</option>
                <option value="female">여성</option>
                <option value="other">기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Lock className="w-4 h-4" /> 비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                placeholder="영문 대문자, 숫자, 특수문자 포함 9~12자"
                className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.password && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                {isPasswordValid ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <X className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={
                    isPasswordValid ? "text-green-500" : "text-red-500"
                  }
                >
                  {passwordError || "비밀번호가 안전합니다."}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
              <Lock className="w-4 h-4" /> 비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-pink-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {formData.confirmPassword && formData.password && (
              <div className="mt-2 flex items-center gap-2 text-sm">
                {formData.password === formData.confirmPassword ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">
                      비밀번호가 일치합니다.
                    </span>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-500" />
                    <span className="text-red-500">
                      비밀번호가 일치하지 않습니다.
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

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
                <Loader2 className="w-5 h-5 animate-spin" /> 처리 중...
              </>
            ) : (
              "가입 완료"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
