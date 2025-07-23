// src/services/authService.js

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
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

/**
 * Google 계정으로 로그인하거나, 신규 사용자인 경우 자동으로 회원가입을 진행합니다.
 */
export const loginOrRegisterWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      return { success: true, isNewUser: false, userData: userDoc.data() };
    } else {
      const citizenCode = `BS${Date.now().toString(36).toUpperCase()}`;
      const userData = {
        email: user.email,
        username: user.displayName || user.email.split("@")[0],
        profile: {
          name: user.displayName || "",
          citizenCode: citizenCode,
          avatar: user.photoURL || null,
          level: 1,
          points: 100,
          joinedAt: serverTimestamp(),
          birthYear: "",
          gender: "",
          country: "",
        },
        googleId: user.uid,
        stats: { totalVotes: 0, battlesCreated: 0, battlesWon: 0 },
        preferences: { favoriteCategories: [], notifications: true },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(userDocRef, userData);
      return { success: true, isNewUser: true, userData };
    }
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      return { success: false, error: "popup_closed" };
    }
    throw error;
  }
};

/**
 * Spotify 인증 후 받은 프로필 정보로 기존 사용자인지 확인하거나, 신규 가입이 필요한지 판단합니다.
 * @param {object} spotifyProfile - Spotify API로부터 받은 프로필 객체
 */
export const handleSpotifyAuth = async (spotifyProfile) => {
  const userQuery = query(
    collection(db, "users"),
    where("spotifyId", "==", spotifyProfile.id)
  );
  const querySnapshot = await getDocs(userQuery);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    return {
      success: true,
      needsRegistration: false,
      userId: userDoc.id,
      userData: userDoc.data(),
    };
  }

  if (spotifyProfile.email) {
    const emailQuery = query(
      collection(db, "users"),
      where("email", "==", spotifyProfile.email)
    );
    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      const userDoc = emailSnapshot.docs[0];
      await setDoc(
        doc(db, "users", userDoc.id),
        { spotifyId: spotifyProfile.id },
        { merge: true }
      );
      return {
        success: true,
        needsRegistration: false,
        userId: userDoc.id,
        userData: userDoc.data(),
      };
    }
  }
  return { success: false, needsRegistration: true };
};

/**
 * Spotify 프로필과 추가 입력 정보로 신규 회원을 가입시킵니다.
 * @param {object} formData - 회원가입 폼에서 입력받은 데이터
 * @param {object} spotifyProfile - Spotify 프로필 객체
 */
export const registerWithSpotify = async (formData, spotifyProfile) => {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );
  const citizenCode = `BS${Date.now().toString(36).toUpperCase()}`;
  const userData = {
    email: formData.email,
    username: spotifyProfile.display_name || formData.email.split("@")[0],
    profile: {
      name: spotifyProfile.display_name || "",
      country: formData.country,
      birthYear: formData.birthYear,
      gender: formData.gender,
      citizenCode: citizenCode,
      avatar: spotifyProfile.images?.[0]?.url || null,
      level: 1,
      points: 100,
      joinedAt: serverTimestamp(),
    },
    spotifyId: spotifyProfile.id,
    stats: { totalVotes: 0, battlesCreated: 0, battlesWon: 0 },
    preferences: { favoriteCategories: [], notifications: true },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", user.uid), userData);
  await updateProfile(user, {
    displayName: spotifyProfile.display_name || formData.email.split("@")[0],
    photoURL: spotifyProfile.images?.[0]?.url || null,
  });
  return { success: true, user, citizenCode };
};

/**
 * 이메일과 비밀번호 등 폼 데이터로 신규 회원을 가입시킵니다.
 * @param {object} formData - 회원가입 폼에서 입력받은 데이터
 */
export const registerWithEmail = async (formData) => {
  const { user } = await createUserWithEmailAndPassword(
    auth,
    formData.email,
    formData.password
  );
  const citizenCode = `BS${Date.now().toString(36).toUpperCase()}`;
  const userData = {
    email: user.email,
    username: user.email.split("@")[0],
    profile: {
      name: "",
      country: formData.country,
      birthYear: formData.birthYear,
      gender: formData.gender,
      citizenCode: citizenCode,
      avatar: null,
      level: 1,
      points: 100,
      joinedAt: serverTimestamp(),
    },
    stats: { totalVotes: 0, battlesCreated: 0, battlesWon: 0 },
    preferences: { favoriteCategories: [], notifications: true },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(doc(db, "users", user.uid), userData);
  await updateProfile(user, {
    displayName: user.email.split("@")[0],
  });
  return { success: true, user, citizenCode };
};

/**
 * 이메일과 비밀번호로 기존 사용자를 로그인시킵니다.
 * @param {string} email - 사용자 이메일
 * @param {string} password - 사용자 비밀번호
 */
export const loginWithEmail = async (email, password) => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (userDoc.exists()) {
    return {
      success: true,
      user,
      userData: userDoc.data(),
    };
  } else {
    throw new Error("사용자 데이터베이스에서 정보를 찾을 수 없습니다.");
  }
};

/**
 * 사용자를 로그아웃시키고 관련 세션 스토리지를 정리합니다.
 */
export const logout = async () => {
  await signOut(auth);
  sessionStorage.removeItem("spotifyProfile");
  sessionStorage.removeItem("spotifyAccessToken");
  sessionStorage.removeItem("googleProfile");
};
