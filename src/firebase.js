// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your config
const firebaseConfig = {
  apiKey: "AIzaSyDIOuCcis1tid3QPMv7dfHkwoZ3EZkHANE",
  authDomain: "ratemyjudge-2186f.firebaseapp.com",
  projectId: "ratemyjudge-2186f",
  storageBucket: "ratemyjudge-2186f.firebasestorage.app",
  messagingSenderId: "514471627692",
  appId: "1:514471627692:web:bab3fe430dc02e6fd3c809",
  measurementId: "G-YDFF8YXMGB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };