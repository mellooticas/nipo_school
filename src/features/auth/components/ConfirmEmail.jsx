import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, LogIn } from 'lucide-react';

const ConfirmEmail = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    navigate('/login'); 
  }; 

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">鳥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nipo School</h1>
          <p className="text-gray-600">Confirmação de e-mail realizada</p>
          <p className="text-sm text-red-500 font-medium mt-1">Agora você pode acessar sua conta</p>
        </div>

        {/* Success Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-100 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Tudo certo!</h2>
          <p className="text-gray-600 mb-6">Seu e-mail foi confirmado com sucesso. Clique no botão abaixo para fazer login.</p>

          <button
            onClick={handleGoToLogin}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Fazer Login
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Nipo School App &copy; 2025
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Versão Beta • ADNIPO Suzano
          </p>
        </footer>
      </div>

      {/* Floating Musical Notes */}
      <div className="fixed top-20 left-10 text-red-200 text-3xl animate-bounce opacity-20 pointer-events-none">
        🎵
      </div>
      <div className="fixed bottom-20 right-10 text-red-200 text-2xl animate-bounce opacity-20 pointer-events-none" style={{ animationDelay: '1s' }}>
        🎶
      </div>
      <div className="fixed top-1/2 right-4 text-red-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{ animationDelay: '2s' }}>
        🎼
      </div>
    </div>
  );
};

export default ConfirmEmail;
