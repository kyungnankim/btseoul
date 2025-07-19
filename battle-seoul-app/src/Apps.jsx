import React, { useState, useEffect } from 'react';
import { Music, User, Mail, Link, ExternalLink, Loader2, LogIn, LogOut } from 'lucide-react';
import './index.css'
const Apps = () => {
    // Spotify 앱 설정
    const CLIENT_ID = '254d6b7f190543e78da436cd3287a60e';
    const REDIRECT_URI = 'http://127.0.0.1:5173/callback';
    const SCOPES = 'user-read-private user-read-email';

    const [accessToken, setAccessToken] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

        const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
        console.log('인증 URL:', authUrl);
        console.log('Redirect URI:', REDIRECT_URI);

        window.location = authUrl;
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
            console.log('프로필 데이터:', profile);

            setUserProfile(profile);

            // 세션에 저장
            sessionStorage.setItem('spotifyProfile', JSON.stringify(profile));
            sessionStorage.setItem('spotifyAccessToken', token);

        } catch (error) {
            console.error('프로필 에러:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // 컴포넌트 마운트 시 실행
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
            console.log('인증 코드 발견:', code);
            // URL 정리
            window.history.replaceState({}, document.title, '/');

            // 토큰 가져오기
            getAccessToken(code).then(token => {
                if (token) {
                    setAccessToken(token);
                    fetchUserProfile(token);
                }
            });
        } else {
            // 저장된 토큰 확인
            const savedToken = sessionStorage.getItem('spotifyAccessToken');
            const savedProfile = sessionStorage.getItem('spotifyProfile');

            if (savedToken && savedProfile) {
                setAccessToken(savedToken);
                setUserProfile(JSON.parse(savedProfile));
            }
        }
    }, []);

    // 로그아웃
    const logout = () => {
        setAccessToken(null);
        setUserProfile(null);
        setError(null);
        sessionStorage.removeItem('verifier');
        sessionStorage.removeItem('spotifyAccessToken');
        sessionStorage.removeItem('spotifyProfile');
    };

    // 프로필 데이터 내보내기
    const exportData = () => {
        const data = {
            profile: userProfile,
            accessToken: accessToken,
            timestamp: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spotify-profile-${userProfile.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-black p-4">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="bg-zinc-900 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Music className="w-8 h-8 text-green-500" />
                            <h1 className="text-2xl font-bold text-white">Spotify Integration</h1>
                        </div>

                        {userProfile && (
                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                            >
                                <LogOut className="w-4 h-4" />
                                로그아웃
                            </button>
                        )}
                    </div>
                </div>

                {/* 에러 표시 */}
                {error && (
                    <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {/* 메인 컨텐츠 */}
                <div className="bg-zinc-900 rounded-lg p-8">
                    {!accessToken ? (
                        // 로그인 화면
                        <div className="text-center py-12">
                            <Music className="w-20 h-20 text-green-500 mx-auto mb-6" />
                            <h2 className="text-xl font-semibold text-white mb-4">
                                Spotify 계정을 연결하세요
                            </h2>
                            <p className="text-gray-400 mb-8">
                                프로필 정보를 가져와서 사용할 수 있습니다
                            </p>
                            <button
                                onClick={loginWithSpotify}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-black font-semibold rounded-full hover:bg-green-400 transition"
                            >
                                <LogIn className="w-5 h-5" />
                                Spotify로 로그인
                            </button>
                        </div>
                    ) : loading ? (
                        // 로딩 화면
                        <div className="text-center py-12">
                            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-400">프로필을 불러오는 중...</p>
                        </div>
                    ) : userProfile ? (
                        // 프로필 화면
                        <div className="space-y-6">
                            {/* 프로필 헤더 */}
                            <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                                {userProfile.images && userProfile.images[0] ? (
                                    <img
                                        src={userProfile.images[0].url}
                                        alt={userProfile.display_name}
                                        className="w-24 h-24 rounded-full"
                                    />
                                ) : (
                                    <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {userProfile.display_name}
                                    </h2>
                                    <p className="text-gray-400">@{userProfile.id}</p>
                                    {userProfile.product && (
                                        <span className="inline-block mt-2 px-3 py-1 bg-green-900 text-green-300 text-sm rounded-full">
                      {userProfile.product.toUpperCase()}
                    </span>
                                    )}
                                </div>
                            </div>

                            {/* 프로필 정보 */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">이메일</span>
                                    </div>
                                    <p className="text-white">{userProfile.email}</p>
                                </div>

                                <div className="bg-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <User className="w-4 h-4" />
                                        <span className="text-sm">팔로워</span>
                                    </div>
                                    <p className="text-white">
                                        {userProfile.followers ? userProfile.followers.total : 0}명
                                    </p>
                                </div>

                                <div className="bg-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <Link className="w-4 h-4" />
                                        <span className="text-sm">국가</span>
                                    </div>
                                    <p className="text-white">{userProfile.country}</p>
                                </div>

                                <div className="bg-zinc-800 rounded-lg p-4">
                                    <div className="flex items-center gap-2 text-gray-400 mb-2">
                                        <ExternalLink className="w-4 h-4" />
                                        <span className="text-sm">Spotify URI</span>
                                    </div>
                                    <p className="text-white text-sm truncate">{userProfile.uri}</p>
                                </div>
                            </div>

                            {/* 액션 버튼 */}
                            <div className="flex flex-wrap gap-3">
                                <a
                                    href={userProfile.external_urls.spotify}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                >
                                    Spotify에서 보기
                                </a>

                                <button
                                    onClick={exportData}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                >
                                    데이터 내보내기
                                </button>
                            </div>

                            {/* API 사용 예시 */}
                            <div className="bg-zinc-800 rounded-lg p-4">
                                <h3 className="text-white font-semibold mb-2">API 사용 예시</h3>
                                <pre className="text-xs text-gray-400 overflow-x-auto">
{`// 세션에서 데이터 가져오기
const profile = JSON.parse(sessionStorage.getItem('spotifyProfile'));
const token = sessionStorage.getItem('spotifyAccessToken');

// 서버로 전송
fetch('/api/spotify-profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(profile)
});`}
                </pre>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default Apps;