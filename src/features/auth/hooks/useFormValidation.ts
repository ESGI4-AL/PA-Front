import { useState, useEffect } from 'react';
import { validateEmail, validateName } from '../../../utils/authValidators';

export const useLoginFormValidation = (email: string, password: string) => {
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    if (emailTouched) {
      if (!email) {
        setEmailError('Ce champ est requis');
      } else if (!validateEmail(email)) {
        setEmailError('Format d\'email invalide');
      } else {
        setEmailError('');
      }
    }
  }, [email, emailTouched]);

  useEffect(() => {
    if (passwordTouched) {
      if (!password) {
        setPasswordError('Ce champ est requis');
      } else {
        setPasswordError('');
      }
    }
  }, [password, passwordTouched]);

  return {
    emailError,
    setEmailTouched,
    passwordError,
    setPasswordTouched,
    hasErrors: () => !!(emailError || passwordError)
  };
};

export const useRegisterFormValidation = (formData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const [firstNameError, setFirstNameError] = useState('');
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameError, setLastNameError] = useState('');
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  useEffect(() => {
    if (firstNameTouched) {
      if (!formData.firstName) {
        setFirstNameError('Ce champ est requis');
      } else if (!validateName(formData.firstName)) {
        setFirstNameError('Le prénom doit contenir au moins une lettre.\nLe prénom ne peut contenir que des lettres, espaces ou tirets');
      } else {
        setFirstNameError('');
      }
    }
  }, [formData.firstName, firstNameTouched]);

  useEffect(() => {
    if (lastNameTouched) {
      if (!formData.lastName) {
        setLastNameError('Ce champ est requis');
      } else if (!validateName(formData.lastName)) {
        setLastNameError('Le nom doit contenir au moins une lettre.\nLe nom ne peut contenir que des lettres, espaces ou tirets');
      } else {
        setLastNameError('');
      }
    }
  }, [formData.lastName, lastNameTouched]);

  useEffect(() => {
    if (emailTouched) {
      if (!formData.email) {
        setEmailError('Ce champ est requis');
      } else if (!validateEmail(formData.email)) {
        setEmailError('Format d\'email invalide');
      } else {
        setEmailError('');
      }
    }
  }, [formData.email, emailTouched]);

  useEffect(() => {
    if (passwordTouched) {
      if (!formData.password) {
        setPasswordError('Ce champ est requis');
      } else if (formData.password.length < 12) {
        setPasswordError('Le mot de passe doit contenir au moins 12 caractères');
      } else {
        setPasswordError('');
      }
    }
  }, [formData.password, passwordTouched]);

  useEffect(() => {
    if (confirmPasswordTouched) {
      if (!formData.confirmPassword) {
        setConfirmPasswordError('Ce champ est requis');
      } else if (formData.confirmPassword !== formData.password) {
        setConfirmPasswordError('Les mots de passe ne correspondent pas');
      } else {
        setConfirmPasswordError('');
      }
    }
  }, [formData.confirmPassword, formData.password, confirmPasswordTouched]);

  return {
    firstNameError,
    setFirstNameTouched,
    lastNameError,
    setLastNameTouched,
    emailError,
    setEmailTouched,
    passwordError,
    setPasswordTouched,
    confirmPasswordError,
    setConfirmPasswordTouched,
    touchAllFields: () => {
      setFirstNameTouched(true);
      setLastNameTouched(true);
      setEmailTouched(true);
      setPasswordTouched(true);
      setConfirmPasswordTouched(true);
    },
    hasErrors: () => !!(firstNameError || lastNameError || emailError || passwordError || confirmPasswordError)
  };
};
