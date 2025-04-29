import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.svg';

const RegisterTeacherPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * On accepte les lettres, les espaces et les tirets (pour les noms composés)
   * On vérifie si la chaîne est vide après avoir enlevé tous les espaces
   * On vérifie qu'il y a au moins une lettre
   */
  const validateName = (name: string): boolean => {
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

  // Traduction des messages d'erreur du backend
  const translateErrorMessage = (errorMessage: string): string => {
    const errorTranslations: Record<string, string> = {
      'Email already in use': 'Cet email est déjà utilisé',
      'Password must be at least 8 characters long': 'Le mot de passe doit contenir au moins 8 caractères',
      'Passwords do not match': 'Les mots de passe ne correspondent pas',
      'Failed to register': 'Échec de l\'inscription',
      'Invalid email format': 'Format d\'email invalide'
    };

    return errorTranslations[errorMessage] || errorMessage;
  };

  // Validation des champs avec useEffect
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
      } else if (formData.password.length < 8) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
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

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      firstName: e.target.value
    }));
    setFirstNameTouched(true);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      lastName: e.target.value
    }));
    setLastNameTouched(true);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      email: e.target.value
    }));
    setEmailTouched(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      password: e.target.value
    }));
    setPasswordTouched(true);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      confirmPassword: e.target.value
    }));
    setConfirmPasswordTouched(true);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setFirstNameTouched(true);
    setLastNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    // on vérifie les erreurs de validation
    if (!formData.firstName) {
      setFirstNameError('Ce champ est requis');
      return;
    }

    if (!validateName(formData.firstName)) {
      setFirstNameError('Le prénom doit contenir au moins une lettre et ne peut contenir que des lettres, espaces ou tirets');
      return;
    }

    if (!formData.lastName) {
      setLastNameError('Ce champ est requis');
      return;
    }

    if (!validateName(formData.lastName)) {
      setLastNameError('Le nom doit contenir au moins une lettre et ne peut contenir que des lettres, espaces ou tirets');
      return;
    }

    if (!formData.email) {
      setEmailError('Ce champ est requis');
      return;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Format d\'email invalide');
      return;
    }

    if (!formData.password) {
      setPasswordError('Ce champ est requis');
      return;
    }

    if (formData.password.length < 8) {
      setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (!formData.confirmPassword) {
      setConfirmPasswordError('Ce champ est requis');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setConfirmPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register/teacher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: 'teacher'
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Une erreur est survenue lors de l\'inscription');
      }

      // on stock le token dans localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      }

      navigate('/teacher');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'inscription';
      setError(translateErrorMessage(errorMessage));
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="leading-normal tracking-normal text-white gradient min-h-screen" style={{ fontFamily: "'Source Sans Pro', sans-serif" }}>
      {/* Navbar simple avec redirection page d'accueil */}
      <nav className="fixed w-full z-30 top-0 text-white">
        <div className="w-full container mx-auto flex flex-wrap items-center justify-between mt-0 py-2">
          <div className="pl-4 flex items-center">
            <Link to="/" className="toggleColour text-white no-underline hover:no-underline font-bold text-2xl lg:text-4xl">
              <img src={logo} alt="Kōdō Logo" className="h-12 inline mr-2" />
              <span className='mt-4'>Kōdō</span>
            </Link>
          </div>
        </div>
        <hr className="border-b border-gray-100 opacity-25 my-0 py-0" />
      </nav>

      <div className="pt-24 pb-12 flex items-center justify-center min-h-screen">
        <div className="container mx-auto px-4">
          <div className="flex content-center items-center justify-center">
            <div className="w-full lg:w-5/12 px-6">
              <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-white border-0">
                <div className="rounded-t mb-0 px-6 py-6">
                  <div className="text-center mb-4">
                    <h6 className="text-gray-600 text-xl font-bold">
                      Créer un compte Enseignant
                    </h6>
                  </div>
                  <div className="flex justify-center">
                    <img src={logo} alt="Kōdō Logo" className="h-26" />
                  </div>
                  {error && showError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                </div>
                <div className="flex-auto px-6 lg:px-12 py-12 pt-0">
                  <form onSubmit={handleSubmit} autoComplete="off">
                    <div className="flex flex-wrap -mx-3">
                      <div className="w-full lg:w-1/2 px-3 mb-3">
                        <label
                          className="block uppercase text-gray-700 text-sm font-bold mb-3"
                          htmlFor="firstName"
                        >
                          Prénom
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                            firstNameError && firstNameTouched ? "border-2 border-red-500" : ""
                          }`}
                          placeholder="Prénom"
                          style={{ transition: "all .15s ease" }}
                          value={formData.firstName}
                          onChange={handleFirstNameChange}
                          onBlur={() => setFirstNameTouched(true)}
                          required
                          autoComplete="off"
                        />
                        {firstNameError && firstNameTouched && (
                          <p className="text-red-500 text-xs mt-1">{firstNameError}</p>
                        )}
                      </div>
                      <div className="w-full lg:w-1/2 px-3 mb-3">
                        <label
                          className="block uppercase text-gray-700 text-sm font-bold mb-3"
                          htmlFor="lastName"
                        >
                          Nom
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                            lastNameError && lastNameTouched ? "border-2 border-red-500" : ""
                          }`}
                          placeholder="Nom"
                          style={{ transition: "all .15s ease" }}
                          value={formData.lastName}
                          onChange={handleLastNameChange}
                          onBlur={() => setLastNameTouched(true)}
                          required
                          autoComplete="off"
                        />
                        {lastNameError && lastNameTouched && (
                          <p className="text-red-500 text-xs mt-1">{lastNameError}</p>
                        )}
                      </div>
                    </div>

                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-700 text-sm font-bold mb-3"
                        htmlFor="email"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                          emailError && emailTouched ? "border-2 border-red-500" : ""
                        }`}
                        placeholder="Email"
                        style={{ transition: "all .15s ease" }}
                        value={formData.email}
                        onChange={handleEmailChange}
                        onBlur={() => setEmailTouched(true)}
                        required
                        autoComplete="off"
                      />
                      {emailError && emailTouched && (
                        <p className="text-red-500 text-xs mt-1">{emailError}</p>
                      )}
                    </div>

                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-gray-700 text-sm font-bold mb-3"
                        htmlFor="password"
                      >
                        Mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="password"
                          name="password"
                          className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                            passwordError && passwordTouched ? "border-2 border-red-500" : ""
                          }`}
                          placeholder="Mot de passe"
                          style={{ transition: "all .15s ease" }}
                          value={formData.password}
                          onChange={handlePasswordChange}
                          onBlur={() => setPasswordTouched(true)}
                          required
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {passwordError && passwordTouched && (
                        <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                      )}
                    </div>

                    <div className="relative w-full mb-5">
                      <label
                        className="block uppercase text-gray-700 text-sm font-bold mb-3"
                        htmlFor="confirmPassword"
                      >
                        Confirmer le mot de passe
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          id="confirmPassword"
                          name="confirmPassword"
                          className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                            confirmPasswordError && confirmPasswordTouched ? "border-2 border-red-500" : ""
                          }`}
                          placeholder="Confirmer le mot de passe"
                          style={{ transition: "all .15s ease" }}
                          value={formData.confirmPassword}
                          onChange={handleConfirmPasswordChange}
                          onBlur={() => setConfirmPasswordTouched(true)}
                          required
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {confirmPasswordError && confirmPasswordTouched && (
                        <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>
                      )}
                    </div>

                    <div className="text-center mt-6">
                      <button
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white active:bg-gray-700 text-lg font-bold uppercase px-5 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-2/3 mx-auto"
                        type="submit"
                        style={{ transition: "all .15s ease" }}
                        disabled={isLoading}
                      >
                        {isLoading ? 'Création en cours...' : 'Créer mon compte'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex flex-wrap mt-6">
                <div className="w-full text-center">
                  <Link to="/login" className="text-white text-base hover:text-gray-300">
                    Vous avez déjà un compte ? Connectez-vous
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterTeacherPage;
