// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBc4YJRG4OzF25WkfJCamn5v25-oAInFmY",
  authDomain: "sportrent-ba741.firebaseapp.com",
  projectId: "sportrent-ba741",
  storageBucket: "sportrent-ba741.firebasestorage.app",
  messagingSenderId: "433686510391",
  appId: "1:433686510391:web:c58e0968dd5905c080b8b2",
  measurementId: "G-XNVW4FW660"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);