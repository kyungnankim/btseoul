import React from 'react';
import { Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = ({ onSpotifyLogin }) => {
    return (
        <div className="text-center py-12">
            <Music className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-4">로그인</h2>
            <p className="text-gray-400 mb-4">Spotify 계정을 연결해 시작하세요</p>

            <button
                onClick={onSpotifyLogin}
                className="mb-4 w-full max-w-sm mx-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-green-500 text-black font-semibold rounded-full hover:bg-green-400 transition-all transform hover:scale-105"
            >
                Spotify로 로그인
            </button>

            <button
                className="mb-4 w-full max-w-sm mx-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-gray-100 text-black font-semibold rounded-full hover:bg-gray-200"
            >
                🍎 Apple로 로그인
            </button>

            <button
                className="w-full max-w-sm mx-auto inline-flex justify-center items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-full hover:bg-gray-200"
            >
                🟦 Google로 로그인
            </button>

            <p className="text-gray-400 mt-6">
                계정이 없으신가요?{' '}
                <Link to="/register" className="text-green-400 underline hover:text-green-300">
                    회원가입
                </Link>
            </p>
        </div>
    );
};

export default Login;
