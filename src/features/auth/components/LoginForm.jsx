import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const { user, login, loading: authLoading } = useAuth();
  
  // States do formulário
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirecionamento automático se já logado
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email.trim(), password.trim());
      // Redirecionamento será feito pelo AuthContext
    } catch (error) {
      console.error('Erro no login:', error);
      setError(
        error.message.includes('Email not confirmed')
          ? 'Por favor, confirme seu e-mail antes de fazer login.'
          : error.message.includes('Invalid login credentials')
            ? 'Email ou senha incorretos'
            : 'Erro ao fazer login. Tente novamente.'
      );
    } finally {
      setLoading(false); 
    }
  };

  // Função para preencher credenciais de teste
  const fillTestCredentials = () => {
    setEmail('teste@niposchool.com');
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header do Nipo School */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">鳥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nipo School</h1>
          <p className="text-gray-600">Faça login para continuar seus estudos</p>
          <p className="text-sm text-red-500 font-medium mt-1">
            🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center">
                <span className="mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-red-600 hover:text-red-500">
                  Esqueceu a senha?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || authLoading}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Entrar
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Ainda não tem conta?{' '}
              <Link
                to="/register"
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-blue-800 text-sm font-medium mb-2">🧪 Versão Beta - Credenciais de Teste:</p>
          <div className="text-blue-700 text-xs space-y-1 mb-3">
            <p><strong>Email:</strong> teste@niposchool.com</p>
            <p><strong>Senha:</strong> 123456</p>
          </div>
          <button
            type="button"
            onClick={fillTestCredentials}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            🔧 Usar Credenciais de Teste
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
      <div className="fixed bottom-20 right-10 text-red-200 text-2xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '1s'}}>
        🎶
      </div>
      <div className="fixed top-1/2 left-4 text-red-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '2s'}}>
        🎼
      </div>
    </div>
  );
};

export default LoginForm;