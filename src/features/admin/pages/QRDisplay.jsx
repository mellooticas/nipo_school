// features/admin/pages/QRDisplay.jsx - VERSÃO COM QR CODE REAL
import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { qrCodeService } from '../services/qrCodeService';
import { RefreshCw, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export const QRDisplay = () => {
  // Pegar aulaId da URL (adapte conforme seu sistema de rotas)
  const aulaId = window.location.pathname.split('/').pop();
  const canvasRef = useRef(null);
  const [aula, setAula] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [tempo, setTempo] = useState(new Date());
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setTempo(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Monitorar conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Gerar QR Code real
  const gerarQRCodeReal = async (qrCodeData) => {
    try {
      if (!canvasRef.current) return;

      // Gerar QR Code no canvas
      await QRCode.toCanvas(canvasRef.current, qrCodeData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      // Também gerar URL para fallback
      const url = await QRCode.toDataURL(qrCodeData, {
        width: 400,
        margin: 2
      });
      setQrCodeUrl(url);

    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError('Erro ao gerar QR Code visual');
    }
  };

  // Buscar dados da aula
  const buscarAula = async () => {
    try {
      setLoading(true);
      setError('');
      
      const aulaData = await qrCodeService.buscarAulaPorId(aulaId);
      
      if (!aulaData.qr_code) {
        throw new Error('Esta aula não possui QR Code gerado');
      }
      
      setAula(aulaData);
      
      // Gerar QR Code visual
      await gerarQRCodeReal(aulaData.qr_code);
      
    } catch (err) {
      setError(err.message);
      console.error('Erro ao buscar aula:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar aula ao montar
  useEffect(() => {
    if (aulaId) {
      buscarAula();
    }
  }, [aulaId]);

  // Recarregar dados periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOnline && aulaId) {
        buscarAula();
      }
    }, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [aulaId, isOnline]);

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatarHora = (data) => {
    return data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Estado de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
        <div className="text-center text-white">
          <RefreshCw className="w-16 h-16 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Carregando QR Code...</h2>
          <p className="text-blue-200">Preparando exibição para projetor</p>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error || !aula) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-600 to-pink-700 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Erro ao Carregar QR Code</h2>
          <p className="text-red-200 mb-6">
            {error || 'Aula não encontrada ou QR Code não gerado'}
          </p>
          <button
            onClick={buscarAula}
            className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Tela principal - Layout otimizado para projetor
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-8 text-white">
      {/* Header com informações da escola */}
      <div className="flex justify-between items-start mb-8">
        {/* Logo e nome da escola */}
        <div>
          <h1 className="text-4xl font-bold mb-2">🎵 Nipo School</h1>
          <p className="text-blue-200 text-lg">Sistema Alpha School - Presença Digital</p>
        </div>
        
        {/* Status e hora */}
        <div className="text-right">
          <div className="flex items-center justify-end gap-2 mb-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className="text-sm">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold">
            {formatarHora(tempo)}
          </div>
          <div className="text-blue-200 text-sm">
            {tempo.toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Informações da aula */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white bg-opacity-20 backdrop-blur-lg rounded-2xl p-6 mb-6">
          <div className="text-3xl font-bold mb-2">
            Aula {aula.numero}: {aula.titulo}
          </div>
          <div className="text-xl text-blue-200 mb-3">
            📅 {formatarData(aula.data_programada)}
          </div>
          <div className="text-lg text-blue-100">
            {aula.objetivo_didatico}
          </div>
        </div>
      </div>

      {/* QR Code central - REAL */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="bg-white p-8 rounded-3xl shadow-2xl">
            {/* Canvas para QR Code real */}
            <canvas
              ref={canvasRef}
              className="block mx-auto rounded-xl"
              style={{ maxWidth: '400px', height: 'auto' }}
            />
            
            {/* Fallback se canvas falhar */}
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="hidden max-w-sm mx-auto rounded-xl"
                onError={() => {
                  // Mostrar imagem se canvas não funcionar
                  document.querySelector('canvas').style.display = 'none';
                  document.querySelector('img').style.display = 'block';
                }}
              />
            )}
          </div>
          
          {/* Animação de pulse */}
          <div className="absolute inset-0 rounded-3xl border-4 border-white opacity-30 animate-ping"></div>
          
          {/* Código abaixo do QR */}
          <div className="text-center mt-6">
            <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
              <code className="text-white font-mono text-lg">{aula.qr_code}</code>
            </div>
          </div>
        </div>
      </div>

      {/* Instruções para os alunos */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-3xl font-bold text-center mb-6">
          📱 Como registrar presença
        </h3>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 mb-3">
              <div className="text-4xl mb-3">1️⃣</div>
              <h4 className="font-semibold mb-2">Abrir App</h4>
              <p className="text-sm text-blue-200">
                Abra o app Nipo School no seu celular
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 mb-3">
              <div className="text-4xl mb-3">2️⃣</div>
              <h4 className="font-semibold mb-2">Escanear</h4>
              <p className="text-sm text-blue-200">
                Use o scanner para ler o QR Code
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 mb-3">
              <div className="text-4xl mb-3">3️⃣</div>
              <h4 className="font-semibold mb-2">Confirmar</h4>
              <p className="text-sm text-blue-200">
                Presença registrada automaticamente
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 mb-3">
              <div className="text-4xl mb-3">4️⃣</div>
              <h4 className="font-semibold mb-2">Estudar</h4>
              <p className="text-sm text-blue-200">
                Conteúdo da aula liberado no app
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer com informações adicionais */}
      <div className="fixed bottom-0 left-0 right-0 p-6">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
            <span>QR Code Ativo</span>
          </div>
          
          <div className="text-center">
            <p className="text-blue-200">
              Gerado em: {new Date(aula.qr_gerado_em).toLocaleString('pt-BR')}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-blue-200">
              "Se não for divertido, ninguém aprende"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};