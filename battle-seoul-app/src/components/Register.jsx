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
} from "lucide-react";

const Register = () => {
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
  const [error, setError] = useState(null);
  const [socialLoginFields, setSocialLoginFields] = useState({
    email: false,
    country: false,
  });

  // 소셜 로그인 체크 및 프로필 자동 입력
  useEffect(() => {
    const savedProfile = sessionStorage.getItem("spotifyProfile");
    const googleProfile = sessionStorage.getItem("googleProfile");
    const appleProfile = sessionStorage.getItem("appleProfile");

    let fieldsFromSocial = {
      email: false,
      country: false,
    };

    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        if (profile.email) {
          setFormData((prev) => ({ ...prev, email: profile.email }));
          fieldsFromSocial.email = true;
        }
        if (profile.country) {
          setFormData((prev) => ({ ...prev, country: profile.country }));
          fieldsFromSocial.country = true;
        }
      } catch (err) {
        console.error("프로필 파싱 오류:", err);
        setError("Spotify 프로필 정보를 불러올 수 없습니다.");
      }
    } else if (googleProfile) {
      try {
        const profile = JSON.parse(googleProfile);
        if (profile.email) {
          setFormData((prev) => ({ ...prev, email: profile.email }));
          fieldsFromSocial.email = true;
        }
        // Google은 보통 country 정보를 제공하지 않음
        if (profile.country) {
          setFormData((prev) => ({ ...prev, country: profile.country }));
          fieldsFromSocial.country = true;
        }
      } catch (err) {
        console.error("Google 프로필 파싱 오류:", err);
      }
    } else if (appleProfile) {
      try {
        const profile = JSON.parse(appleProfile);
        if (profile.email) {
          setFormData((prev) => ({ ...prev, email: profile.email }));
          fieldsFromSocial.email = true;
        }
        // Apple도 보통 country 정보를 제공하지 않음
        if (profile.country) {
          setFormData((prev) => ({ ...prev, country: profile.country }));
          fieldsFromSocial.country = true;
        }
      } catch (err) {
        console.error("Apple 프로필 파싱 오류:", err);
      }
    }

    setSocialLoginFields(fieldsFromSocial);
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isPasswordValid) {
      alert("비밀번호가 유효하지 않습니다.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    const spotifyProfile = JSON.parse(
      sessionStorage.getItem("spotifyProfile") || "{}"
    );
    const googleProfile = JSON.parse(
      sessionStorage.getItem("googleProfile") || "{}"
    );
    const appleProfile = JSON.parse(
      sessionStorage.getItem("appleProfile") || "{}"
    );

    const finalData = {
      ...formData,
      spotifyId: spotifyProfile.id || null,
      googleId: googleProfile.id || null,
      appleId: appleProfile.id || null,
      socialLoginProvider: spotifyProfile.id
        ? "spotify"
        : googleProfile.id
        ? "google"
        : appleProfile.id
        ? "apple"
        : null,
      createdAt: new Date().toISOString(),
    };

    console.log("제출 데이터:", finalData);
    alert("회원가입이 완료되었습니다!");
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
      {error && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> {error}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-white mb-6">
          회원가입 정보 입력
        </h2>

        {/* 이메일 */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
            <Mail className="w-4 h-4" /> 이메일
            {socialLoginFields.email && (
              <span className="text-xs text-green-400">(소셜 로그인 정보)</span>
            )}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={socialLoginFields.email ? undefined : handleInputChange}
            readOnly={socialLoginFields.email}
            required
            placeholder={socialLoginFields.email ? "" : "이메일을 입력하세요"}
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              socialLoginFields.email
                ? "bg-gray-700/50 text-gray-300 border-gray-600 cursor-not-allowed"
                : "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:outline-none"
            }`}
          />
        </div>

        {/* 국가 */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
            <Users className="w-4 h-4" /> 국가
            {socialLoginFields.country && (
              <span className="text-xs text-green-400">(소셜 로그인 정보)</span>
            )}
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={socialLoginFields.country ? undefined : handleInputChange}
            readOnly={socialLoginFields.country}
            required
            placeholder={
              socialLoginFields.country ? "" : "국가를 입력하세요 (예: KR, US)"
            }
            className={`w-full px-4 py-3 rounded-lg border transition-colors ${
              socialLoginFields.country
                ? "bg-gray-700/50 text-gray-300 border-gray-600 cursor-not-allowed"
                : "bg-gray-700 text-white border-gray-600 focus:border-green-500 focus:outline-none"
            }`}
          />
        </div>

        {/* 생년/성별 */}
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
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            >
              <option value="">선택하세요</option>
              {Array.from(
                { length: 100 },
                (_, i) => new Date().getFullYear() - i
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
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            >
              <option value="">선택하세요</option>
              <option value="male">남성</option>
              <option value="female">여성</option>
              <option value="other">기타</option>
            </select>
          </div>
        </div>

        {/* 비밀번호 */}
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
              className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
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
            <div className="mt-2 flex items-center gap-2">
              {isPasswordValid ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm ${
                  isPasswordValid ? "text-green-500" : "text-red-500"
                }`}
              >
                {passwordError || "비밀번호가 안전합니다"}
              </span>
            </div>
          )}
        </div>

        {/* 비밀번호 확인 */}
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
              className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
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
          {formData.confirmPassword && (
            <div className="mt-2 flex items-center gap-2">
              {formData.password === formData.confirmPassword ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500">
                    비밀번호가 일치합니다
                  </span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-500">
                    비밀번호가 일치하지 않습니다
                  </span>
                </>
              )}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-all disabled:opacity-50 disabled:hover:bg-green-500"
          disabled={
            !isPasswordValid ||
            formData.password !== formData.confirmPassword ||
            !formData.birthYear ||
            !formData.gender
          }
        >
          회원가입 완료
        </button>
      </form>
    </div>
  );
};

export default Register;
