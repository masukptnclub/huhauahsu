import React from 'react';
import { AuthForm } from '../../components/auth/AuthForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-primary-50 to-secondary-50">
      <div className="w-full max-w-md">
        <AuthForm initialMode="register" />
      </div>
    </div>
  );
};

export default RegisterPage;