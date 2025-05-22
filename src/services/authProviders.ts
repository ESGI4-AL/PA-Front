import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '@/firebase';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const payload = {
    googleId: user.uid,
    email: user.email,
    firstName: user.displayName?.split(' ')[0],
    lastName: user.displayName?.split(' ')[1] || '',
  };

  const response = await axios.post(`${API_URL}/auth/google`, payload);
  return response.data;
};

export const loginWithMicrosoft = async () => {
  const result = await signInWithPopup(auth, microsoftProvider);
  const user = result.user;

  const payload = {
    microsoftId: user.uid,
    email: user.email,
    firstName: user.displayName?.split(' ')[0],
    lastName: user.displayName?.split(' ')[1] || '',
  };

  const response = await axios.post(`${API_URL}/auth/microsoft`, payload);
  return response.data;
};
