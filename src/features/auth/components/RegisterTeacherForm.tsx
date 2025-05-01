import React, { useState } from 'react';
import { RegisterTeacherData } from '../../../domains/user/models/userModels';
import { useRegisterFormValidation } from '../hooks/useFormValidation';

interface RegisterTeacherFormProperties {
  onSubmit: (data: RegisterTeacherData) => Promise<void>;
  error?: string;
  isLoading?: boolean;
}

const RegisterTeacherForm: React.FC<RegisterTeacherFormProperties> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<RegisterTeacherData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
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
    touchAllFields,
    hasErrors,
  } = useRegisterFormValidation(formData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    switch (name) {
      case 'firstName':
        setFirstNameTouched(true);
        break;
      case 'lastName':
        setLastNameTouched(true);
        break;
      case 'email':
        setEmailTouched(true);
        break;
      case 'password':
        setPasswordTouched(true);
        break;
      case 'confirmPassword':
        setConfirmPasswordTouched(true);
        break;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    touchAllFields();

    if (hasErrors()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
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
              firstNameError ? "border-2 border-red-500" : ""
            }`}
            placeholder="Prénom"
            style={{ transition: "all .15s ease" }}
            value={formData.firstName}
            onChange={handleInputChange}
            onBlur={() => setFirstNameTouched(true)}
            required
            autoComplete="off"
          />
          {firstNameError && <p className="text-red-500 text-xs mt-1">{firstNameError}</p>}
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
              lastNameError ? "border-2 border-red-500" : ""
            }`}
            placeholder="Nom"
            style={{ transition: "all .15s ease" }}
            value={formData.lastName}
            onChange={handleInputChange}
            onBlur={() => setLastNameTouched(true)}
            required
            autoComplete="off"
          />
          {lastNameError && <p className="text-red-500 text-xs mt-1">{lastNameError}</p>}
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
            emailError ? "border-2 border-red-500" : ""
          }`}
          placeholder="Email"
          style={{ transition: "all .15s ease" }}
          value={formData.email}
          onChange={handleInputChange}
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
            name="password"
            className={`border-0 px-3 py-3 placeholder-gray-400 text-gray-700 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ${
              passwordError ? "border-2 border-red-500" : ""
            }`}
            placeholder="Mot de passe"
            style={{ transition: "all .15s ease" }}
            value={formData.password}
            onChange={handleInputChange}
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
              confirmPasswordError ? "border-2 border-red-500" : ""
            }`}
            placeholder="Confirmer le mot de passe"
            style={{ transition: "all .15s ease" }}
            value={formData.confirmPassword}
            onChange={handleInputChange}
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
        {confirmPasswordError && <p className="text-red-500 text-xs mt-1">{confirmPasswordError}</p>}
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
  );
};

export default RegisterTeacherForm;
