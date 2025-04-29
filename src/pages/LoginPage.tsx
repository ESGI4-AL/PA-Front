import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/images/logo.svg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // traduction des messages d'erreur du backend
  const translateErrorMessage = (errorMessage: string): string => {
    const errorTranslations: Record<string, string> = {
      'Invalid email or password': 'Email ou mot de passe invalide',
      'User not found': 'Utilisateur non trouvé',
      'Password does not match': 'Le mot de passe ne correspond pas',
      'Failed to login. Check your credentials.': 'Échec de connexion. Vérifiez vos identifiants.',
    };

    return errorTranslations[errorMessage] || errorMessage;
  };

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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setEmailTouched(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setEmailTouched(true);
    setPasswordTouched(true);

    if (!email) {
      setEmailError('Email est requis');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Format d\'email invalide');
      return;
    }

    if (!password) {
      setPasswordError('Mot de passe est requis');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Échec de connexion. Vérifiez vos identifiants.');
      }

      // on stock le token dans localStorage
      if (data.data && data.data.token) {
        localStorage.setItem('authToken', data.data.token);

        localStorage.setItem('user', JSON.stringify(data.data.user));

        if (data.data.user.role === 'teacher') {
          navigate('/teacher');
        } else if (data.data.user.role === 'student') {
          navigate('/student');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Échec de connexion. Vérifiez vos identifiants.';
      setError(translateErrorMessage(errorMessage));
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
                      Connexion à votre compte
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
                        className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
                          emailError && emailTouched ? "border-2 border-red-500" : ""
                        }`}
                        placeholder="Email"
                        style={{ transition: "all .15s ease" }}
                        value={email}
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
                          className="border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full"
                          placeholder="Mot de passe"
                          style={{ transition: "all .15s ease" }}
                          value={password}
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
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          id="rememberMe"
                          type="checkbox"
                          className="form-checkbox border-0 rounded text-gray-800 ml-1 w-5 h-5"
                          style={{ transition: "all .15s ease" }}
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="ml-2 text-sm font-semibold text-gray-700">
                          Se souvenir de moi
                        </span>
                      </label>
                    </div>

                    <div className="text-center mt-6">
                      <button
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white active:bg-gray-700 text-lg font-bold uppercase px-5 py-3 rounded-full shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-2/3 mx-auto"
                        type="submit"
                        style={{ transition: "all .15s ease" }}
                      >
                        Se connecter
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="flex flex-wrap mt-6">
                <div className="w-1/2">
                  <Link
                    to="/forgot-password"
                    className="text-white text-base hover:text-gray-300"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="w-1/2 text-right">
                  <Link to="/register/teacher" className="text-white text-base hover:text-gray-300">
                    Enseignant ? Créer un compte
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

export default LoginPage;
