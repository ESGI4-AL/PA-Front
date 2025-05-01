export const translateErrorMessage = (errorMessage: string): string => {
  const errorTranslations: Record<string, string> = {
    'Invalid email or password': 'Email ou mot de passe invalide',
    'User not found': 'Utilisateur non trouvé',
    'Password does not match': 'Le mot de passe ne correspond pas',
    'Failed to login. Check your credentials.': 'Échec de connexion. Vérifiez vos identifiants.',
    'Email already in use': 'Cet email est déjà utilisé',
    'Password must be at least 12 characters long': 'Le mot de passe doit contenir au moins 12 caractères',
    'Passwords do not match': 'Les mots de passe ne correspondent pas',
    'Failed to register': 'Échec de l\'inscription',
    'Invalid email format': 'Format d\'email invalide'
  };

  return errorTranslations[errorMessage] || errorMessage;
};
