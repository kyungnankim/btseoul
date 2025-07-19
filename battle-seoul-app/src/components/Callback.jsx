// src/components/Callback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const CLIENT_ID = '254d6b7f190543e78da436cd3287a60e';
        const REDIRECT_URI = 'http://127.0.0.1:5173/callback';

        const getAccessToken = async (code) => {
            const verifier = sessionStorage.getItem('verifier');

            const params = new URLSearchParams();
            params.append('client_id', CLIENT_ID);
            params.append('grant_type', 'authorization_code');
            params.append('code', code);
            params.append('redirect_uri', REDIRECT_URI);
            params.append('code_verifier', verifier);

            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params,
            });

            const data = await response.json();
            return data.access_token;
        };

        const fetchProfile = async (token) => {
            const response = await fetch('https://api.spotify.com/v1/me', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return await response.json();
        };

        const run = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            if (!code) return;

            const token = await getAccessToken(code);
            if (!token) return;

            const profile = await fetchProfile(token);

            // 저장 후 register로 이동
            sessionStorage.setItem('spotifyAccessToken', token);
            sessionStorage.setItem('spotifyProfile', JSON.stringify(profile));

            navigate('/register');
        };

        run();
    }, [navigate]);

    return (
        <div className="text-white text-center py-20">
            Spotify 로그인 처리 중...
        </div>
    );
};

export default Callback;
