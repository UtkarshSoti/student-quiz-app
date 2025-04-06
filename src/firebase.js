import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDdXiyfxq8DHs6-z_wxA1csUFwHiGN4EuE",
    authDomain: "quiz-scores-ba7ca.firebaseapp.com",
    projectId: "quiz-scores-ba7ca",
    storageBucket: "quiz-scores-ba7ca.firebasestorage.app",
    messagingSenderId: "988727585921",
    appId: "1:988727585921:web:167370db7f8bcf8c74b180"
  };

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };