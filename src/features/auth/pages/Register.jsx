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
  ChevronRight,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../../shared/contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    dob: '',
    instrument: '',
    tipo_usuario: '' // Novo campo
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Tipos de usuário com ícones e descrições
  const userTypes = [
    {
      value: 'aluno',
      label: 'Aluno',
      icon: GraduationCap,
      emoji: '🎓',
      description: 'Aprender música, fazer aulas e acompanhar progresso',
      color: 'blue'
    },
    {
      value: 'professor',
      label: 'Professor',
      icon: BookOpen,
      emoji: '👨‍🏫',
      description: 'Ensinar, criar conteúdos e acompanhar alunos',
      color: 'green'
    }
  ];

  const instruments = [
    { value: 'teclado', label: '🎹 Teclado', emoji: '🎹' },
    { value: 'piano', label: '🎹 Piano', emoji: '🎹' },
    { value: 'bateria', label: '🥁 Bateria', emoji: '🥁' },
    { value: 'violao', label: '🎸 Violão', emoji: '🎸' },
    { value: 'guitarra', label: '🎸 Guitarra', emoji: '🎸' },
    { value: 'baixo', label: '🎸 Baixo', emoji: '🎸' },
    { value: 'voz', label: '🎤 Canto / Voz', emoji: '🎤' },
    { value: 'saxofone', label: '🎷 Saxofone', emoji: '🎷' },
    { value: 'clarinete', label: '🎶 Clarinete', emoji: '🎶' },
    { value: 'oboe', label: '🎶 Oboé', emoji: '🎶' },
    { value: 'fagote', label: '🎶 Fagote', emoji: '🎶' },
    { value: 'flauta', label: '🎶 Flauta', emoji: '🎶' },
    { value: 'trompete', label: '🎺 Trompete', emoji: '🎺' },
    { value: 'trombone', label: '🎺 Trombone', emoji: '🎺' },
    { value: 'tuba', label: '🎺 Tuba', emoji: '🎺' }, 
    { value: 'euphonium', label: '🎺 Eufônio', emoji: '🎺' },
    { value: 'violino', label: '🎻 Violino', emoji: '🎻' },
    { value: 'viola', label: '🎻 Viola Clássica', emoji: '🎻' },
    { value: 'violoncelo', label: '🎻 Violoncelo', emoji: '🎻' },
    { value: 'contrabaixo_acustico', label: '🎻 Contrabaixo Acústico', emoji: '🎻' },
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

  const handleUserTypeSelect = (type) => {
    setFormData({
      ...formData,
      tipo_usuario: type
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
    if (!formData.tipo_usuario) return 'Selecione seu tipo de usuário';
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

  // Substitua apenas a função handleSubmit no seu Register.jsx

// Substitua apenas a função handleSubmit no seu Register.jsx

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  
  const validationError = validateStep2();
  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);

  try {
    console.log('🚀 Iniciando cadastro...', {
      email: formData.email,
      fullName: formData.fullName,
      tipo_usuario: formData.tipo_usuario,
      instrument: formData.instrument,
      dob: formData.dob
    });

    await signup(formData.email, formData.password, {
      fullName: formData.fullName,
      dob: formData.dob,
      instrument: formData.instrument,
      tipo_usuario: formData.tipo_usuario
    });

    // ===== NOVA EXPERIÊNCIA DE SUCESSO =====
    
    // Mensagem personalizada baseada no tipo de usuário
    const userType = userTypes.find(type => type.value === formData.tipo_usuario);
    const welcomeMessage = formData.tipo_usuario === 'aluno' 
      ? 'Bem-vindo à sua jornada musical!' 
      : `Bem-vindo à equipe como ${userType?.label}!`;

    // Detectar provedor de email para link direto
    const emailDomain = formData.email.split('@')[1].toLowerCase();
    const emailProviders = {
      'gmail.com': 'https://mail.google.com',
      'hotmail.com': 'https://outlook.live.com',
      'outlook.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'icloud.com': 'https://www.icloud.com/mail',
      'uol.com.br': 'https://email.uol.com.br',
      'bol.com.br': 'https://email.bol.uol.com.br',
      'terra.com.br': 'https://webmail.terra.com.br'
    };

    const emailProviderUrl = emailProviders[emailDomain];

    // Modal de sucesso mais amigável
    const modalContent = `
🎉 ${welcomeMessage}

✅ Sua conta foi criada com sucesso!

📧 IMPORTANTE: Verifique seu email
Enviamos um link de confirmação para:
${formData.email}

🔍 Não encontrou o email?
• Verifique sua caixa de spam/lixo eletrônico
• Aguarde alguns minutos (pode demorar)
• O email vem de noreply@mail.app.supabase.io

${emailProviderUrl ? '🚀 Clique em "Ir para Email" para abrir sua caixa de entrada!' : ''}

---

📱 App em Japonês:
アカウントが作成されました！
メールを確認してアカウントを認証してください。
    `;

    // Mostrar modal customizado
    if (window.confirm(modalContent + '\n\nClique OK para continuar...')) {
      // Se há provedor conhecido, perguntar se quer abrir
      if (emailProviderUrl) {
        const openEmail = window.confirm(
          `🚀 Quer abrir sua caixa de entrada agora?\n\n` +
          `Vamos abrir ${emailDomain} em uma nova aba para você verificar o email.`
        );
        
        if (openEmail) {
          window.open(emailProviderUrl, '_blank');
        }
      }
      
      // Redirecionar para página de aguardo/instrução
      navigate('/verify-email', { 
        state: { 
          email: formData.email,
          userType: formData.tipo_usuario,
          emailProvider: emailProviderUrl 
        } 
      });
    }
    
  } catch (error) {
    console.error('❌ Erro no cadastro:', error);
    
    // ===== TRATAMENTO DE ERRO MELHORADO =====
    
    let errorMessage = 'Erro ao criar conta. Tente novamente.';
    let errorDetails = '';
    
    if (error.message) {
      if (error.message.includes('User already registered') || 
          error.message.includes('já está cadastrado')) {
        errorMessage = '📧 Este email já está cadastrado';
        errorDetails = 'Tente fazer login ou use "Esqueci minha senha" se não lembrar da senha.';
      } else if (error.message.includes('Invalid email')) {
        errorMessage = '📧 Email inválido';
        errorDetails = 'Verifique se digitou o email corretamente.';
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = '🔒 Senha muito fraca';
        errorDetails = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (error.message.includes('Database error') || 
                 error.message.includes('Dados obrigatórios')) {
        errorMessage = '🗃️ Erro nos dados informados';
        errorDetails = 'Verifique se todos os campos estão preenchidos corretamente.';
      } else if (error.message.includes('Network')) {
        errorMessage = '🌐 Erro de conexão';
        errorDetails = 'Verifique sua internet e tente novamente.';
      } else if (error.message.includes('rate limit')) {
        errorMessage = '⏱️ Muitas tentativas';
        errorDetails = 'Aguarde alguns minutos antes de tentar novamente.';
      } else {
        // Mostrar erro específico em desenvolvimento
        errorMessage = '❌ ' + error.message;
        errorDetails = 'Se o problema persistir, contate o suporte.';
      }
    }
    
    setError(`${errorMessage}${errorDetails ? '\n' + errorDetails : ''}`);
    
    // Log detalhado para debug
    if (process.env.NODE_ENV === 'development') {
      console.group('🔍 Debug do Erro de Cadastro');
      console.log('Tipo:', error.constructor.name);
      console.log('Mensagem:', error.message);
      console.log('Stack:', error.stack);
      console.log('Dados enviados:', {
        email: formData.email,
        fullName: formData.fullName,
        tipo_usuario: formData.tipo_usuario,
        instrument: formData.instrument,
        dob: formData.dob
      });
      console.groupEnd();
    }
    
  } finally {
    setLoading(false);
  }
};

  const getColorClasses = (color, selected = false) => {
    const colors = {
      blue: selected 
        ? 'border-blue-500 bg-blue-50 text-blue-700' 
        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50',
      green: selected 
        ? 'border-green-500 bg-green-50 text-green-700' 
        : 'border-gray-200 hover:border-green-300 hover:bg-green-50',
      purple: selected 
        ? 'border-purple-500 bg-purple-50 text-purple-700' 
        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50',
      red: selected 
        ? 'border-red-500 bg-red-50 text-red-700' 
        : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
    };
    return colors[color] || colors.blue;
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
          <p className="text-sm text-red-500 font-medium mt-1">🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."</p>
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

              {/* Error Message */}
              // Substitua apenas a seção do Error Message (linha 466) no seu Register.jsx

{/* Error Message - VERSÃO MELHORADA */}
{error && (
  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
    <div className="flex items-start">
      <span className="mr-2 mt-0.5">⚠️</span>
      <div className="flex-1">
        <div className="whitespace-pre-line">{error}</div>
        {error.includes('já está cadastrado') && (
          <div className="mt-3 pt-3 border-t border-red-200">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Ir para Login →
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)}

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

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Como você quer participar da Nipo School?
                </label>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {userTypes.map((type) => {
                    const IconComponent = type.icon;
                    const isSelected = formData.tipo_usuario === type.value;
                    
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleUserTypeSelect(type.value)}
                        className={`p-5 rounded-xl border-2 transition-all duration-200 text-left ${getColorClasses(type.color, isSelected)}`}
                      >
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">{type.emoji}</span>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-base mb-2">{type.label}</h3>
                        <p className="text-sm opacity-75 leading-relaxed">{type.description}</p>
                      </button>
                    );
                  })}
                </div>
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