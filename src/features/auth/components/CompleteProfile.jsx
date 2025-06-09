import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';

const CompleteProfile = () => {
  const { user, userProfile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    full_name: '',
    dob: '',
    instrument: '',
    user_level: 'beginner',
    theme_preference: 'light',
    notification_enabled: true,
    sound_enabled: true
  });

  const [formState, setFormState] = useState({
    isSubmitting: false,
    error: null,
    currentStep: 1,
    totalSteps: 3
  });

  // Instrumentos disponíveis
  const instrumentos = [
    { id: 'violao', name: 'Violão', emoji: '🎸' },
    { id: 'piano', name: 'Piano', emoji: '🎹' },
    { id: 'bateria', name: 'Bateria', emoji: '🥁' },
    { id: 'baixo', name: 'Baixo', emoji: '🎸' },
    { id: 'flauta', name: 'Flauta', emoji: '🪈' },
    { id: 'saxofone', name: 'Saxofone', emoji: '🎷' },
    { id: 'violino', name: 'Violino', emoji: '🎻' },
    { id: 'canto', name: 'Canto', emoji: '🎤' },
    { id: 'outro', name: 'Outro', emoji: '🎵' }
  ];

  // Carregar dados existentes do perfil
  useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        dob: userProfile.dob || '',
        instrument: userProfile.instrument || '',
        user_level: userProfile.user_level || 'beginner',
        theme_preference: userProfile.theme_preference || 'light',
        notification_enabled: userProfile.notification_enabled ?? true,
        sound_enabled: userProfile.sound_enabled ?? true
      });
    }
  }, [userProfile]);

  // Redirecionar se já logado e perfil completo
  useEffect(() => {
    if (user && userProfile && isProfileComplete(userProfile)) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, userProfile, navigate]);

  // Verificar se perfil está completo
  const isProfileComplete = (profile) => {
    return profile?.full_name && 
           profile?.dob && 
           profile?.instrument && 
           profile?.user_level;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro
    if (formState.error) {
      setFormState(prev => ({ ...prev, error: null }));
    }
  };

  // Handle instrument selection
  const handleInstrumentSelect = (instrumentId) => {
    setFormData(prev => ({
      ...prev,
      instrument: instrumentId
    }));
  };

  // Próximo passo
  const nextStep = () => {
    // Validar passo atual
    if (formState.currentStep === 1) {
      if (!formData.full_name.trim()) {
        setFormState(prev => ({
          ...prev,
          error: 'Por favor, informe seu nome completo'
        }));
        return;
      }
      if (!formData.dob) {
        setFormState(prev => ({
          ...prev,
          error: 'Por favor, informe sua data de nascimento'
        }));
        return;
      }
    }

    if (formState.currentStep === 2) {
      if (!formData.instrument) {
        setFormState(prev => ({
          ...prev,
          error: 'Por favor, selecione um instrumento'
        }));
        return;
      }
    }

    setFormState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
      error: null
    }));
  };

  // Passo anterior
  const prevStep = () => {
    setFormState(prev => ({
      ...prev,
      currentStep: prev.currentStep - 1,
      error: null
    }));
  };

  // Submeter formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setFormState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null
    }));

    try {
      console.log('👤 Atualizando perfil...', formData);
      
      await updateProfile(formData);
      
      console.log('✅ Perfil atualizado com sucesso!');
      
      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      setFormState(prev => ({
        ...prev,
        error: 'Erro ao salvar perfil. Tente novamente.',
        isSubmitting: false
      }));
    }
  };

  // Pular para mais tarde
  const skipForNow = () => {
    navigate('/dashboard', { replace: true });
  };

  // Render passo 1: Informações básicas
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Vamos nos conhecer melhor! 👋
        </h2>
        <p className="text-gray-600">
          Conte-nos um pouco sobre você
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-2">
            Nome completo *
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            required
            value={formData.full_name}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Seu nome completo"
          />
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
            Data de nascimento *
          </label>
          <input
            id="dob"
            name="dob"
            type="date"
            required
            value={formData.dob}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Próximo →
        </button>
      </div>
    </div>
  );

  // Render passo 2: Instrumento
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Qual instrumento você toca? 🎵
        </h2>
        <p className="text-gray-600">
          Escolha seu instrumento principal
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {instrumentos.map((instrumento) => (
          <button
            key={instrumento.id}
            type="button"
            onClick={() => handleInstrumentSelect(instrumento.id)}
            className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
              formData.instrument === instrumento.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-3xl mb-2">{instrumento.emoji}</div>
            <div className="text-sm font-medium">{instrumento.name}</div>
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Anterior
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Próximo →
        </button>
      </div>
    </div>
  );

  // Render passo 3: Preferências
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Últimos ajustes! ⚙️
        </h2>
        <p className="text-gray-600">
          Configure suas preferências
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="user_level" className="block text-sm font-medium text-gray-700 mb-2">
            Nível de experiência
          </label>
          <select
            id="user_level"
            name="user_level"
            value={formData.user_level}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="beginner">🌱 Iniciante</option>
            <option value="intermediate">📈 Intermediário</option>
            <option value="advanced">🎓 Avançado</option>
          </select>
        </div>

        <div>
          <label htmlFor="theme_preference" className="block text-sm font-medium text-gray-700 mb-2">
            Tema preferido
          </label>
          <select
            id="theme_preference"
            name="theme_preference"
            value={formData.theme_preference}
            onChange={handleInputChange}
            className="w-full px-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">☀️ Claro</option>
            <option value="dark">🌙 Escuro</option>
          </select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            <input
              id="notification_enabled"
              name="notification_enabled"
              type="checkbox"
              checked={formData.notification_enabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="notification_enabled" className="ml-3 block text-sm text-gray-700">
              🔔 Receber notificações
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="sound_enabled"
              name="sound_enabled"
              type="checkbox"
              checked={formData.sound_enabled}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="sound_enabled" className="ml-3 block text-sm text-gray-700">
              🔊 Habilitar sons
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={prevStep}
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
        >
          ← Anterior
        </button>
        <button
          type="submit"
          disabled={formState.isSubmitting}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {formState.isSubmitting ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Salvando...
            </div>
          ) : (
            '✅ Finalizar'
          )}
        </button>
      </div>
    </div>
  );

  // Render progress bar
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Passo {formState.currentStep} de {formState.totalSteps}</span>
        <span>{Math.round((formState.currentStep / formState.totalSteps) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(formState.currentStep / formState.totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl w-full mx-auto p-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Progress Bar */}
          {renderProgressBar()}

          {/* Error Alert */}
          {formState.error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <span className="mr-2">⚠️</span>
              <span className="text-sm">{formState.error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {formState.currentStep === 1 && renderStep1()}
            {formState.currentStep === 2 && renderStep2()}
            {formState.currentStep === 3 && renderStep3()}
          </form>

          {/* Skip Option */}
          <div className="mt-8 text-center border-t pt-6">
            <button
              type="button"
              onClick={skipForNow}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Pular por enquanto
            </button>
          </div>
        </div>

        {/* Debug info em desenvolvimento */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs">
            <h4 className="font-bold mb-2">🐛 Debug Info:</h4>
            <div className="space-y-1">
              <div>User: {user ? user.email : 'None'}</div>
              <div>Profile Complete: {userProfile ? isProfileComplete(userProfile) ? 'Yes' : 'No' : 'None'}</div>
              <div>Current Step: {formState.currentStep}</div>
              <div>Form Data: {JSON.stringify(formData, null, 2)}</div>
            </div>
          </div>
        )}
      </div> 
    </div>
  );
};

export default CompleteProfile;