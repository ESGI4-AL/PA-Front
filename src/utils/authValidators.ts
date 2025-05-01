export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;

  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return false;
  }

  const hasAtLeastOneLetter = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(name);
  if (!hasAtLeastOneLetter) {
    return false;
  }

  return nameRegex.test(name);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 12;
};

export const validatePasswordMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword;
};
