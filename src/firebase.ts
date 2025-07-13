import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDgbXI2auIcr4PZO4jrcqS_Muvywbqnu0c",
  authDomain: "projet-annuel-d7535.firebaseapp.com",
  projectId: "projet-annuel-d7535",
  storageBucket: "projet-annuel-d7535.firebasestorage.app",
  messagingSenderId: "573270250002",
  appId: "1:573270250002:web:7c33988e54d6f526063ecb"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

export const microsoftProvider = new OAuthProvider('microsoft.com');

export default app;
