// src/components/Callback.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { handleSpotifyAuth } from "../services/authService";

const Callback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("처리 중...");

  useEffect(() => {
    const processSpotifyCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) throw new Error("인증 코드가 없습니다.");

        setStatus("Spotify 토큰 인증 중...");
        // 실제 서비스에서는 이 URL을 백엔드 엔드포인트로 변경해야 합니다.
        const tokenResponse = await fetch(
          "YOUR_BACKEND_ENDPOINT_FOR_SPOTIFY_TOKEN",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          }
        );
        const tokenData = await tokenResponse.json();
        if (!tokenData.access_token)
          throw new Error("액세스 토큰 발급에 실패했습니다.");

        setStatus("Spotify 프로필 정보 가져오는 중...");
        const profileResponse = await fetch("https://api.spotify.com/v1/me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const spotifyProfile = await profileResponse.json();

        sessionStorage.setItem("spotifyAccessToken", tokenData.access_token);
        sessionStorage.setItem(
          "spotifyProfile",
          JSON.stringify(spotifyProfile)
        );

        setStatus("사용자 정보 확인 중...");
        const result = await handleSpotifyAuth(spotifyProfile);

        if (result.needsRegistration) {
          toast.success("추가 정보를 입력하여 회원가입을 완료해주세요.");
          navigate("/register");
        } else if (result.success) {
          toast.success("로그인 되었습니다!");
          navigate("/");
        } else {
          throw new Error("사용자 인증에 실패했습니다.");
        }
      } catch (error) {
        console.error("Spotify callback error:", error);
        toast.error("Spotify 로그인 처리 중 오류가 발생했습니다.");
        navigate("/login");
      }
    };

    processSpotifyCallback();
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
