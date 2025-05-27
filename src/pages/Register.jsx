import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Calendar,
  Music,
  UserPlus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../shared/contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dob: '',
    instrument: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // Multi-step form
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const instruments = [
  { value: 'teclado', label: '🎹 Teclado', emoji: '🎹' },
  { value: 'piano', label: '🎹 Piano', emoji: '🎹' },
  { value: 'bateria', label: '🥁 Bateria', emoji: '🥁' },
  { value: 'violao', label: '🎸 Violão', emoji: '🎸' },
  { value: 'guitarra', label: '🎸 Guitarra', emoji: '🎸' },
  { value: 'baixo', label: '🎸 Baixo', emoji: '🎸' },
  { value: 'voz', label: '🎤 Canto / Voz', emoji: '🎤' },

  // Sopros separados
  { value: 'saxofone', label: '🎷 Saxofone', emoji: '🎷' },
  { value: 'clarinete', label: '🎶 Clarinete', emoji: '🎶' },
  { value: 'oboe', label: '🎶 Oboé', emoji: '🎶' },
  { value: 'fagote', label: '🎶 Fagote', emoji: '🎶' },
  { value: 'flauta', label: '🎶 Flauta', emoji: '🎶' },

  // Metais separados
  { value: 'trompete', label: '🎺 Trompete', emoji: '🎺' },
  { value: 'trombone', label: '🎺 Trombone', emoji: '🎺' },
  { value: 'tuba', label: '🎺 Tuba', emoji: '🎺' },
  { value: 'euphonium', label: '🎺 Eufônio', emoji: '🎺' },

  // Cordas clássicas
  { value: 'violino', label: '🎻 Violino', emoji: '🎻' },
  { value: 'viola', label: '🎻 Viola Clássica', emoji: '🎻' },
  { value: 'violoncelo', label: '🎻 Violoncelo', emoji: '🎻' },
  { value: 'contrabaixo_acustico', label: '🎻 Contrabaixo Acústico', emoji: '🎻' },

  // Outros
  { value: 'percussao', label: '🥁 Percussão Erudita', emoji: '🥁' },
  { value: 'teoria', label: '📘 Teoria Musical', emoji: '📘' },
  { value: 'outro', label: '🎵 Outro', emoji: '🎵' }
];


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.email) return 'Email é obrigatório';
    if (!formData.email.includes('@')) return 'Email inválido';
    if (!formData.password) return 'Senha é obrigatória';
    if (formData.password.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) return 'Senhas não coincidem';
    return null;
  };

  const validateStep2 = () => {
    if (!formData.fullName) return 'Nome completo é obrigatório';
    if (formData.fullName.length < 3) return 'Nome deve ter pelo menos 3 caracteres';
    if (!formData.dob) return 'Data de nascimento é obrigatória';
    if (!formData.instrument) return 'Selecione seu instrumento principal';
    return null;
  };

  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const error = validateStep2();
    if (error) {
      setError(error);
      return;
    }

    setLoading(true);

    try {
      await signup(formData.email, formData.password, {
        fullName: formData.fullName,
        dob: formData.dob,
        instrument: formData.instrument
      });

      // Redirecionar para votação do logo
      navigate('/vote');
    } catch (error) {
      console.error('Erro no cadastro:', error);
      setError(
        error.message.includes('User already registered')
          ? 'Este email já está cadastrado. Tente fazer login.'
          : 'Erro ao criar conta. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-white text-3xl font-bold">鳥</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Junte-se à Nipo School</h1>
          <p className="text-gray-600">Crie sua conta e comece sua jornada musical</p>
          <p className="text-sm text-red-500 font-medium mt-1">Um som por vez. Uma geração por vez.</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= 1 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-8 h-1 transition-colors ${
              step >= 2 ? 'bg-red-500' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
              step >= 2 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-red-100">
          
          {/* Step 1: Credenciais */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); handleNextStep(); }} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Suas Credenciais</h2>
                <p className="text-sm text-gray-600">Defina seu email e senha</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium flex items-center justify-center"
              >
                Próximo
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </form>
          )}

          {/* Step 2: Perfil */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Seu Perfil Musical</h2>
                <p className="text-sm text-gray-600">Conte-nos mais sobre você</p>
              </div>

              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="João da Silva"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Nascimento
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="dob"
                    name="dob"
                    type="date"
                    required
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              {/* Instrument */}
              <div>
                <label htmlFor="instrument" className="block text-sm font-medium text-gray-700 mb-2">
                  Instrumento Principal
                </label>
                <div className="relative">
                  <Music className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    id="instrument"
                    name="instrument"
                    required
                    value={formData.instrument}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none bg-white"
                  >
                    <option value="">Selecione seu instrumento</option>
                    {instruments.map((instrument) => (
                      <option key={instrument.value} value={instrument.value}>
                        {instrument.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Criando...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 mr-2" />
                      Criar Conta
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500">ou</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Faça login aqui
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8">
          <p className="text-gray-500 text-sm mb-2">
            Ao se cadastrar, você concorda com nossos termos de uso
          </p>
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
      <div className="fixed top-1/2 right-4 text-red-200 text-xl animate-bounce opacity-20 pointer-events-none" style={{animationDelay: '2s'}}>
        🎼
      </div>
    </div>
  );
};

export default Register;