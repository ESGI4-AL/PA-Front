import React, { useState } from 'react';
import { LoginCredentials } from '../../../domains/user/models/userModels';
import { useLoginFormValidation } from '../hooks/useFormValidation';

interface LoginFormProperties {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  error?: string;
}

const LoginForm: React.FC<LoginFormProperties> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    emailError,
    setEmailTouched,
    passwordError,
    setPasswordTouched,
  } = useLoginFormValidation(email, password);

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
    setEmailTouched(true);
    setPasswordTouched(true);

    if (emailError || passwordError) {
      return;
    }

    await onSubmit({ email, password, rememberMe });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
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
            emailError ? "border-2 border-red-500" : ""
          }`}
          placeholder="Email"
          style={{ transition: "all .15s ease" }}
          value={email}
          onChange={handleEmailChange}
          onBlur={() => setEmailTouched(true)}
          required
          autoComplete="off"
        />
        {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
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
        {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>}
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
  );
};

export default LoginForm;
