import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  Timestamp,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyD_2iiZsTcdUZB6i7zG_5ZLYu-K6IP6u8A",
  authDomain: "subminder-a485f.firebaseapp.com",
  projectId: "subminder-a485f",
  storageBucket: "subminder-a485f.firebasestorage.app",
  messagingSenderId: "665141089622",
  appId: "1:665141089622:web:673132da5bc67d1a6b32f7",
};

export const VAPID_KEY =
  "BG96bWwqe20xCCDC1YLlSqGh6K9FkWIhqk8YUnLwYWpoNtYt92qK2vZUEbHPgZRnO1YpoxFpWBhpZjorjtROSGU";

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export const googleProvider = new GoogleAuthProvider();

export {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  Timestamp,
  setDoc,
  serverTimestamp,
};
