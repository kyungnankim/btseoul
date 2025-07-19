import React, { useState, useEffect } from 'react';
import { Music, User, Mail, Lock, Calendar, Users, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';

const Appss = () => {
    // Spotify 앱 설정
    const CLIENT_ID = '254d6b7f190543e78da436cd3287a60e';
    const REDIRECT_URI = 'http://127.0.0.1:5173/callback';
    const SCOPES = 'user-read-private user-read-email';

    const [accessToken, setAccessToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 폼 데이터
    const [formData, setFormData] = useState({
        email: '',
        country: '',
        birthYear: '',
        gender: '',
        password: '',
        confirmPassword: ''
    });

    // 비밀번호 표시 상태
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // 유효성 검사 상태
    const [passwordError, setPasswordError] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(false);

    // PKCE 코드 생성
    const generateCodeVerifier = (length) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    // PKCE 챌린지 생성
    const generateCodeChallenge = async (codeVerifier) => {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };

    // Spotify 로그인
    const loginWithSpotify = async () => {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        sessionStorage.setItem('verifier', verifier);

        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('response_type', 'code');
        params.append('redirect_uri', REDIRECT_URI);
        params.append('scope', SCOPES);
        params.append('code_challenge_method', 'S256');
        params.append('code_challenge', challenge);

        window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    };

    // Access Token 가져오기
    const getAccessToken = async (code) => {
        const verifier = sessionStorage.getItem('verifier');

        const params = new URLSearchParams();
        params.append('client_id', CLIENT_ID);
        params.append('grant_type', 'authorization_code');
        params.append('code', code);
        params.append('redirect_uri', REDIRECT_URI);
        params.append('code_verifier', verifier);

        try {
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error_description || '토큰 획득 실패');
            }

            return data.access_token;
        } catch (error) {
            console.error('토큰 에러:', error);
            setError(error.message);
            return null;
        }
    };

    // 사용자 프로필 가져오기
    const fetchUserProfile = async (token) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`프로필 요청 실패: ${response.status}`);
            }

            const profile = await response.json();
            setUserProfile(profile);

            // 폼 데이터 자동 설정
            setFormData(prev => ({
                ...prev,
                email: profile.email || '',
                country: profile.country || ''
            }));

            sessionStorage.setItem('spotifyProfile', JSON.stringify(profile));
            sessionStorage.setItem('spotifyAccessToken', token);

        } catch (error) {
            console.error('프로필 에러:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 비밀번호 유효성 검사
    const validatePassword = (password) => {
        const minLength = 9;
        const maxLength = 12;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        if (password.length < minLength || password.length > maxLength) {
            setPasswordError(`비밀번호는 ${minLength}~${maxLength}자여야 합니다.`);
            setIsPasswordValid(false);
            return false;
        }

        if (!hasUpperCase) {
            setPasswordError('영문 대문자를 포함해야 합니다.');
            setIsPasswordValid(false);
            return false;
        }

        if (!hasNumber) {
            setPasswordError('숫자를 포함해야 합니다.');
            setIsPasswordValid(false);
            return false;
        }

        if (!hasSpecialChar) {
            setPasswordError('특수문자를 포함해야 합니다.');
            setIsPasswordValid(false);
            return false;
        }

        setPasswordError('');
        setIsPasswordValid(true);
        return true;
    };

    // 폼 입력 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            validatePassword(value);
        }
    };

    // 폼 제출
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!isPasswordValid) {
            alert('비밀번호가 유효하지 않습니다.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 데이터 저장 또는 API 전송
        const finalData = {
            email: formData.email,
            country: formData.country,
            birthYear: formData.birthYear,
            gender: formData.gender,
            password: formData.password,
            spotifyId: userProfile?.id,
            createdAt: new Date().toISOString()
        };

        console.log('제출 데이터:', finalData);
        alert('회원가입이 완료되었습니다!');

        // 여기에 API 호출 또는 데이터 저장 로직 추가
    };

    // 컴포넌트 마운트 시 실행
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            window.history.replaceState({}, document.title, '/');

            getAccessToken(code).then(token => {
                if (token) {
                    setAccessToken(token);
                    fetchUserProfile(token);
                }
            });
        } else {
            const savedToken = sessionStorage.getItem('spotifyAccessToken');
            const savedProfile = sessionStorage.getItem('spotifyProfile');

            if (savedToken && savedProfile) {
                setAccessToken(savedToken);
                const profile = JSON.parse(savedProfile);
                setUserProfile(profile);
                setFormData(prev => ({
                    ...prev,
                    email: profile.email || '',
                    country: profile.country || ''
                }));
            }
        }
    }, []);

    // 로그아웃
    const logout = () => {
        setAccessToken(null);
        setUserProfile(null);
        setError(null);
        setFormData({
            email: '',
            country: '',
            birthYear: '',
            gender: '',
            password: '',
            confirmPassword: ''
        });
        sessionStorage.clear();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Music className="w-8 h-8 text-green-500" />
                            <h1 className="text-2xl font-bold text-white">Battle Seoul - Spotify Integration</h1>
                        </div>

                        {userProfile && (
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                로그아웃
                            </button>
                        )}
                    </div>
                </div>

                {/* 에러 표시 */}
                {error && (
                    <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-200 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </p>
                    </div>
                )}

                {/* 메인 컨텐츠 */}
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700">
                    {!accessToken ? (
                        // 로그인 화면
                        <div className="text-center py-12">
                            <Music className="w-20 h-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Spotify 계정으로 시작하기
                            </h2>
                            <p className="text-gray-400 mb-8">
                                Spotify 계정을 연결하여 회원가입을 진행하세요
                            </p>
                            <button
                                onClick={loginWithSpotify}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-semibold rounded-full hover:bg-green-400 transition-all transform hover:scale-105"
                            >
                                Spotify로 시작하기
                            </button>
                        </div>
                    ) : loading ? (
                        // 로딩 화면
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                            <p className="text-gray-400 mt-4">프로필을 불러오는 중...</p>
                        </div>
                    ) : userProfile ? (
                        // 회원가입 폼
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-6">회원가입 정보 입력</h2>

                            {/* 이메일 (읽기 전용) */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                                    <Mail className="w-4 h-4" />
                                    이메일
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600 cursor-not-allowed"
                                />
                            </div>

                            {/* 국가 (읽기 전용) */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                                    <Users className="w-4 h-4" />
                                    국가
                                </label>
                                <input
                                    type="text"
                                    value={formData.country}
                                    readOnly
                                    className="w-full px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg border border-gray-600 cursor-not-allowed"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* 생년 */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                                        <Calendar className="w-4 h-4" />
                                        생년
                                    </label>
                                    <select
                                        name="birthYear"
                                        value={formData.birthYear}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                                    >
                                        <option value="">선택하세요</option>
                                        {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                            <option key={year} value={year}>{year}년</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 성별 */}
                                <div>
                                    <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                                        <User className="w-4 h-4" />
                                        성별
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
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
                                    <Lock className="w-4 h-4" />
                                    비밀번호
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="영문 대문자, 숫자, 특수문자 포함 9~12자"
                                        className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.password && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {isPasswordValid ? (
                                            <Check className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <X className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-sm ${isPasswordValid ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordError || '비밀번호가 안전합니다'}
                    </span>
                                    </div>
                                )}
                            </div>

                            {/* 비밀번호 확인 */}
                            <div>
                                <label className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-2">
                                    <Lock className="w-4 h-4" />
                                    비밀번호 확인
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="비밀번호를 다시 입력하세요"
                                        className="w-full px-4 py-3 pr-12 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {formData.confirmPassword && (
                                    <div className="mt-2 flex items-center gap-2">
                                        {formData.password === formData.confirmPassword ? (
                                            <>
                                                <Check className="w-4 h-4 text-green-500" />
                                                <span className="text-sm text-green-500">비밀번호가 일치합니다</span>
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4 text-red-500" />
                                                <span className="text-sm text-red-500">비밀번호가 일치하지 않습니다</span>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* 제출 버튼 */}
                            <button
                                type="submit"
                                className="w-full py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={!isPasswordValid || formData.password !== formData.confirmPassword || !formData.birthYear || !formData.gender}
                            >
                                회원가입 완료
                            </button>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Appss;