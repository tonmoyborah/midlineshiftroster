import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { ArrowLeft } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </button>
      </div>
      
      <LoginForm />
    </div>
  );
};

