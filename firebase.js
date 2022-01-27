import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDk-dhWabAIaznlRfsFAFhlfEkqYiRzCHg",
  authDomain: "miichat-1.firebaseapp.com",
  projectId: "miichat-1",
  storageBucket: "miichat-1.appspot.com",
  messagingSenderId: "898034117102",
  appId: "1:898034117102:web:1467532ed3a122d6a506ff",
  measurementId: "G-2V82G10H4K",
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider(auth);

export { db, auth, provider };
