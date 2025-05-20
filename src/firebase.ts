// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgbXI2auIcr4PZO4jrcqS_Muvywbqnu0c",
  authDomain: "projet-annuel-d7535.firebaseapp.com",
  projectId: "projet-annuel-d7535",
  storageBucket: "projet-annuel-d7535.firebasestorage.app",
  messagingSenderId: "573270250002",
  appId: "1:573270250002:web:7c33988e54d6f526063ecb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Google authorization
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

export { auth, googleProvider, microsoftProvider };