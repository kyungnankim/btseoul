// 3. 개선된 Callback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../services/authService";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const Callback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("처리 중...");

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
      const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

      try {
        // URL에서 code 파라미터 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("인증 코드가 없습니다.");
        }

        setStatus("Spotify 토큰 받아오는 중...");

        // Access Token 받기
        const verifier = sessionStorage.getItem("verifier");
        const params = new URLSearchParams();
        params.append("client_id", CLIENT_ID);
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", REDIRECT_URI);
        params.append("code_verifier", verifier);

        const tokenResponse = await fetch(
          "https://accounts.spotify.com/api/token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
          }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenData.access_token) {
          throw new Error("액세스 토큰을 받지 못했습니다.");
        }

        setStatus("Spotify 프로필 가져오는 중...");

        // Spotify 프로필 가져오기
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        const spotifyProfile = await profileResponse.json();

        // 세션에 저장
        sessionStorage.setItem("spotifyAccessToken", tokenData.access_token);
        sessionStorage.setItem(
          "spotifyProfile",
          JSON.stringify(spotifyProfile)
        );

        setStatus("Firebase에서 사용자 확인 중...");

        // Firebase에서 사용자 확인
        const loginResult = await AuthService.loginWithSpotify(spotifyProfile);

        if (loginResult.needsRegistration) {
          // 회원가입이 필요한 경우
          toast.info("회원가입이 필요합니다.");
          navigate("/register");
        } else if (loginResult.success) {
          // 로그인 성공
          toast.success("로그인 성공!");
          navigate("/");
        }
      } catch (error) {
        console.error("Spotify callback error:", error);
        toast.error("로그인 처리 중 오류가 발생했습니다.");
        navigate("/login");
      }
    };

    handleSpotifyCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">{status}</p>
      </div>
    </div>
  );
};

export default Callback;
