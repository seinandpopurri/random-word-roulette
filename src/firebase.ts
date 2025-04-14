// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDiyACzgYsAaiKRWsC4PNscB6upRHLAxso",
  authDomain: "random-word-roulette.firebaseapp.com",
  projectId: "random-word-roulette",
  storageBucket: "random-word-roulette.firebasestorage.app",
  messagingSenderId: "965584284370",
  appId: "1:965584284370:web:f3aee06f519662c79d1b0b",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
