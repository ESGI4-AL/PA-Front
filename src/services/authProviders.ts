import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, microsoftProvider } from '@/firebase';
import axios from 'axios';

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const payload = {
    googleId: user.uid,
    email: user.email,
    firstName: user.displayName?.split(' ')[0],
    lastName: user.displayName?.split(' ')[1] || '',
  };

  const response = await axios.post('/api/auth/google', payload);
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

  const response = await axios.post('/api/auth/microsoft', payload);
  return response.data;
};
