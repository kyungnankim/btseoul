// 1. services/authService.js - 인증 서비스
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  updateProfile,
  signOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";

export class AuthService {
  // Spotify 프로필로 사용자 확인
  static async checkSpotifyUser(spotifyProfile) {
    try {
      // Spotify ID로 사용자 검색
      const q = query(
        collection(db, "users"),
        where("spotifyId", "==", spotifyProfile.id)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // 사용자가 이미 존재하면 첫 번째 문서 반환
        const userDoc = querySnapshot.docs[0];
        return {
          exists: true,
          userId: userDoc.id,
          userData: userDoc.data(),
        };
      }

      // 이메일로도 검색
      if (spotifyProfile.email) {
        const emailQuery = query(
          collection(db, "users"),
          where("email", "==", spotifyProfile.email)
        );
        const emailSnapshot = await getDocs(emailQuery);

        if (!emailSnapshot.empty) {
          const userDoc = emailSnapshot.docs[0];
          // Spotify ID 연결
          await setDoc(
            doc(db, "users", userDoc.id),
            {
              spotifyId: spotifyProfile.id,
            },
            { merge: true }
          );

          return {
            exists: true,
            userId: userDoc.id,
            userData: userDoc.data(),
          };
        }
      }

      return { exists: false };
    } catch (error) {
      console.error("Error checking Spotify user:", error);
      throw error;
    }
  }

  // 회원가입 처리
  static async registerWithSpotify(formData, spotifyProfile) {
    try {
      // 이메일과 비밀번호로 Firebase Auth 계정 생성
      const { user } = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 시민권 코드 생성
      const citizenCode = `BS${Date.now().toString(36).toUpperCase()}`;

      // Firestore에 사용자 정보 저장
      const userData = {
        // 기본 정보
        email: formData.email,
        username: spotifyProfile.display_name || formData.email.split("@")[0],

        // 프로필 정보
        profile: {
          name: spotifyProfile.display_name || "",
          country: formData.country,
          birthYear: formData.birthYear,
          gender: formData.gender,
          citizenCode: citizenCode,
          avatar: spotifyProfile.images?.[0]?.url || null,
          level: 1,
          points: 100, // 가입 보너스
          joinedAt: serverTimestamp(),
        },

        // 소셜 로그인 정보
        spotifyId: spotifyProfile.id,
        spotifyProfile: {
          id: spotifyProfile.id,
          email: spotifyProfile.email,
          displayName: spotifyProfile.display_name,
          country: spotifyProfile.country,
          product: spotifyProfile.product,
          images: spotifyProfile.images,
        },

        // 통계 정보
        stats: {
          totalVotes: 0,
          battlesCreated: 0,
          battlesWon: 0,
        },

        // 설정
        preferences: {
          favoriteCategories: [],
          notifications: true,
        },

        // 타임스탬프
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Firestore에 저장
      await setDoc(doc(db, "users", user.uid), userData);

      // Firebase Auth 프로필 업데이트
      await updateProfile(user, {
        displayName:
          spotifyProfile.display_name || formData.email.split("@")[0],
        photoURL: spotifyProfile.images?.[0]?.url || null,
      });

      return {
        success: true,
        user,
        citizenCode,
      };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  // 로그인 처리
  static async loginWithSpotify(spotifyProfile) {
    try {
      const userCheck = await this.checkSpotifyUser(spotifyProfile);

      if (!userCheck.exists) {
        // 사용자가 없으면 회원가입 필요
        return {
          success: false,
          needsRegistration: true,
          spotifyProfile,
        };
      }

      // 사용자가 있으면 로그인 처리
      // 여기서는 이메일과 저장된 비밀번호로 로그인하거나
      // Custom Token을 사용할 수 있습니다

      // 임시 방법: 이메일로 로그인 링크 전송
      // 실제로는 서버에서 Custom Token을 생성하는 것이 좋습니다

      return {
        success: true,
        userId: userCheck.userId,
        userData: userCheck.userData,
        message: "로그인 링크가 이메일로 전송되었습니다.",
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  // 일반 이메일 로그인
  static async loginWithEmail(email, password) {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Firestore에서 추가 사용자 정보 가져오기
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        return {
          success: true,
          user,
          userData: userDoc.data(),
        };
      }

      throw new Error("사용자 정보를 찾을 수 없습니다.");
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  }

  // 로그아웃
  static async logout() {
    try {
      await signOut(auth);
      // 세션 스토리지 클리어
      sessionStorage.removeItem("spotifyProfile");
      sessionStorage.removeItem("spotifyAccessToken");
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }
}
