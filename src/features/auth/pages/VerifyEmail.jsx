// src/features/auth/pages/VerifyEmail.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Mail, 
  CheckCircle, 
  RefreshCw, 
  ExternalLink, 
  ArrowLeft,
  Clock,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [resending, setResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  // Dados vindos do registro
  const { email, userType, emailProvider } = location.state || {};

  // Se não tem dados, redirecionar
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // Timer para reenvio
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  // Detectar informações do email
  const emailDomain = email?.split('@')[1]?.toLowerCase() || '';
  const isGmail = emailDomain === 'gmail.com';
  const isOutlook = ['hotmail.com', 'outlook.com'].includes(emailDomain);
  const isYahoo = emailDomain === 'yahoo.com';
  const isBrazilian = ['uol.com.br', 'bol.com.br', 'terra.com.br'].includes(emailDomain);

  const getEmailIcon = () => {
    if (isGmail) return '📧';
    if (isOutlook) return '📨';
    if (isYahoo) return '📮';
    if (isBrazilian) return '📫';
    return '✉️';
  };

  const getEmailProviderName = () => {
    if (isGmail) return 'Gmail';
    if (isOutlook) return 'Outlook/Hotmail';
    if (isYahoo) return 'Yahoo Mail';
    if (emailDomain === 'uol.com.br') return 'UOL';
    if (emailDomain === 'bol.com.br') return 'BOL';
    if (emailDomain === 'terra.com.br') return 'Terra';
    return 'seu provedor de email';
  };

  const handleResendEmail = async () => {
    if (timeLeft > 0 || resending) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        alert('❌ Erro ao reenviar email: ' + error.message);
      } else {
        alert('✅ Email reenviado com sucesso! Verifique sua caixa de entrada.');
        setResendCount(prev => prev + 1);
        setTimeLeft(60); // 1 minuto de espera
      }
    } catch (error) {
      console.error('Erro ao reenviar:', error);
      alert('❌ Erro ao reenviar email. Tente novamente.');
    } finally {
      setResending(false);
    }
  };

  const openEmailProvider = () => {
    if (emailProvider) {
      window.open(emailProvider, '_blank');
    }
  };

  if (!email) {
    return null; // Vai redirecionar
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verifique seu Email</h1>
          <p className="text-gray-600">Quase lá! Só falta confirmar seu email</p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-blue-100">
          
          {/* Status de Sucesso */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800 mb-1">Conta criada com sucesso!</h3>
                <p className="text-sm text-green-700">
                  {userType === 'aluno' ? 'Bem-vindo à sua jornada musical!' : 
                   userType === 'professor' ? 'Bem-vindo à equipe de professores!' : 
                   'Bem-vindo à Nipo School!'}
                </p>
              </div>
            </div>
          </div>

          {/* Email Info */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">{getEmailIcon()}</div>
            <p className="text-gray-700 mb-2">Enviamos um email de confirmação para:</p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="font-semibold text-gray-800">{email}</p>
              <p className="text-sm text-gray-600">{getEmailProviderName()}</p>
            </div>
          </div>

          {/* Instruções */}
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">1</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Abra seu email</strong> e procure por uma mensagem de 
                <span className="font-mono text-xs bg-gray-100 px-1 rounded"> noreply@mail.app.supabase.io</span>
              </p>
            </div>

            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">2</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Clique no link</strong> "Confirmar email" dentro da mensagem
              </p>
            </div>

            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-bold text-blue-600">3</span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>Volte aqui</strong> e faça login com suas credenciais
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="space-y-3">
            
            {/* Abrir Email */}
            {emailProvider && (
              <button
                onClick={openEmailProvider}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium flex items-center justify-center"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Abrir {getEmailProviderName()}
              </button>
            )}

            {/* Reenviar Email */}
            <button
              onClick={handleResendEmail}
              disabled={resending || timeLeft > 0}
              className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {resending ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : timeLeft > 0 ? (
                <>
                  <Clock className="w-5 h-5 mr-2" />
                  Aguarde {timeLeft}s para reenviar
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  {resendCount > 0 ? 'Reenviar novamente' : 'Reenviar email'}
                </>
              )}
            </button>

            {/* Ir para Login */}
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-green-100 text-green-700 py-3 px-4 rounded-xl hover:bg-green-200 transition-colors font-medium flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Já confirmei - Fazer Login
            </button>
          </div>

          {/* Ajuda */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-amber-800 mb-1">Não encontrou o email?</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Verifique sua caixa de <strong>spam/lixo eletrônico</strong></li>
                  <li>• Aguarde alguns minutos (pode demorar até 10 min)</li>
                  <li>• Certifique-se que digitou o email correto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mobile Tip */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Smartphone className="w-4 h-4 text-blue-500 mr-2" />
              <p className="text-xs text-blue-700">
                <strong>Dica:</strong> No celular, o email pode ir para "Promoções" ou "Social"
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/register')}
            className="text-gray-500 hover:text-gray-700 transition-colors text-sm flex items-center justify-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar ao cadastro
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;