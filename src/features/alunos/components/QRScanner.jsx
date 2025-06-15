// features/alunos/components/QRScanner.jsx - VERSÃO COM SCANNER REAL
import React, { useState, useEffect, useRef } from 'react';
import { Camera, CheckCircle, AlertCircle, RefreshCw, X, Trophy, BookOpen } from 'lucide-react';
import jsQR from 'jsqr';
import { qrCodeService } from '../../admin/services/qrCodeService';
import { useAuth } from '../../../shared/contexts/AuthContext';

export const QRScanner = ({ onClose = null }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [presencaRegistrada, setPresencaRegistrada] = useState(false);
  const [aulaLiberada, setAulaLiberada] = useState(null);

  // Configurar câmera
  const iniciarCamera = async () => {
    try {
      setError('');
      setLoading(true);

      // Verificar se navegador suporta getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador');
      }

      // Solicitar acesso à câmera traseira (preferível para QR Code)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' }, // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setHasCamera(true);
        setIsScanning(true);
        
        // Aguardar o vídeo carregar antes de iniciar detecção
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          iniciarDeteccaoQR();
        };
      }
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      let errorMessage = 'Não foi possível acessar a câmera.';
      
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Permissão de câmera negada. Verifique as configurações do navegador.';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'Nenhuma câmera encontrada no dispositivo.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Câmera não suportada neste navegador.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Parar câmera
  const pararCamera = () => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    setIsScanning(false);
    setHasCamera(false);
  };

  // Detectar QR Code usando jsQR
  const iniciarDeteccaoQR = () => {
    const detectar = () => {
      if (!isScanning || !videoRef.current || !canvasRef.current) {
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR Code detectado:', code.data);
          processarQRCode(code.data);
          return; // Para a detecção após encontrar um código
        }
      }
      
      // Continuar detectando
      animationRef.current = requestAnimationFrame(detectar);
    };
    
    detectar();
  };

  // Processar QR Code escaneado
  const processarQRCode = async (qrCodeData) => {
    if (!qrCodeData || loading) return;

    setLoading(true);
    pararCamera();

    try {
      // Validar QR Code
      const validacao = await qrCodeService.validarQRCode(qrCodeData);
      
      if (!validacao.valido) {
        setError(validacao.motivo);
        setScanResult({ success: false, message: validacao.motivo });
        return;
      }

      // Registrar presença
      await registrarPresenca(validacao.aula, user.id);
      
      // Sucesso
      setScanResult({ 
        success: true, 
        qrCode: qrCodeData,
        aula: validacao.aula 
      });
      setAulaLiberada(validacao.aula);
      setPresencaRegistrada(true);

      // Registrar analytics
      await qrCodeService.registrarAcessoQR(qrCodeData, user.id);

    } catch (err) {
      console.error('Erro ao processar QR Code:', err);
      setError('Erro ao processar QR Code. Tente novamente.');
      setScanResult({ success: false, message: 'Erro interno' });
    } finally {
      setLoading(false);
    }
  };

  // Registrar presença real (implementar com Supabase)
  const registrarPresenca = async (aula, alunoId) => {
    try {
      // TODO: Implementar registro real de presença
      // 1. Buscar matrícula do aluno
      // 2. Registrar na tabela presencas
      // 3. Liberar conteúdo da aula
      
      console.log('Registrando presença:', { aula: aula.numero, aluno: alunoId });
      
      // Simular delay de API por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      throw error;
    }
  };

  // Limpeza ao desmontar componente
  useEffect(() => {
    return () => {
      pararCamera();
    };
  }, []);

  // Resetar scanner
  const resetarScanner = () => {
    setScanResult(null);
    setError('');
    setPresencaRegistrada(false);
    setAulaLiberada(null);
  };

  // Tentar novamente
  const tentarNovamente = () => {
    resetarScanner();
    iniciarCamera();
  };

  // Se presença foi registrada com sucesso
  if (presencaRegistrada && aulaLiberada) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
        {/* Header de sucesso */}
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Presença Registrada! 🎉
          </h2>
          <p className="text-gray-600">
            Bem-vindo à {aulaLiberada.titulo}
          </p>
        </div>

        {/* Detalhes da aula */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Conteúdo Liberado:
          </h3>
          <ul className="space-y-2 text-green-700 text-sm">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              🎬 Sacadas TikTok da semana
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              🎯 Exercícios específicos do instrumento
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              💪 Desafio Alpha da aula
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              🏆 +10 pontos no seu progresso
            </li>
          </ul>
        </div>

        {/* Gamificação */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center text-yellow-700">
            <Trophy className="w-5 h-5 mr-2" />
            <span className="font-semibold">Conquista Desbloqueada!</span>
          </div>
          <p className="text-center text-yellow-600 text-sm mt-1">
            "Sempre Presente" - Participou da aula {aulaLiberada.numero}
          </p>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <button
            onClick={() => alert('Redirecionando para conteúdo da aula...')}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Acessar Conteúdo da Aula
          </button>
          
          <button
            onClick={resetarScanner}
            className="w-full bg-gray-200 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Escanear Outro QR Code
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-600 py-2 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fechar Scanner
            </button>
          )}
        </div>
      </div>
    );
  }

  // Interface principal do scanner
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-center flex-1">
          <Camera className="w-12 h-12 text-blue-500 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">Scanner QR Code</h2>
          <p className="text-gray-600 text-sm">Escaneie para registrar presença</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Estado de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Resultado do scan */}
      {scanResult && !presencaRegistrada && (
        <div className={`border rounded-lg p-4 mb-4 ${
          scanResult.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center">
            {scanResult.success ? (
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            )}
            <span className={`text-sm ${
              scanResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {scanResult.message || (scanResult.success ? 'QR Code válido!' : 'QR Code inválido')}
            </span>
          </div>
        </div>
      )}

      {/* Área do scanner */}
      <div className="mb-6">
        {isScanning ? (
          <div className="relative">
            {/* Vídeo da câmera */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 bg-gray-800 rounded-lg object-cover"
            />
            <canvas
              ref={canvasRef}
              className="hidden"
            />
            
            {/* Overlay de scanning */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400"></div>
                
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                    <RefreshCw className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </div>
            </div>
            
            <p className="text-center text-white text-sm mt-2 bg-black bg-opacity-50 py-1 rounded">
              Aponte para o QR Code exibido no projetor
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {hasCamera ? 'Câmera parada' : 'Clique para iniciar o scanner'}
            </p>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="space-y-3">
        {!isScanning ? (
          <button
            onClick={iniciarCamera}
            disabled={loading}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Iniciando Câmera...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 mr-2" />
                Iniciar Scanner
              </>
            )}
          </button>
        ) : (
          <button
            onClick={pararCamera}
            className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-600 transition-colors flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Parar Scanner
          </button>
        )}

        {(error || (scanResult && !scanResult.success)) && (
          <button
            onClick={tentarNovamente}
            className="w-full bg-yellow-500 text-white py-2 px-6 rounded-lg font-medium hover:bg-yellow-600 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar Novamente
          </button>
        )}
      </div>

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2 text-sm">💡 Como usar:</h3>
        <ol className="list-decimal list-inside space-y-1 text-blue-700 text-xs">
          <li>Posicione o celular na vertical</li>
          <li>Aponte para o QR Code do projetor</li>
          <li>Aguarde a detecção automática</li>
          <li>Presença será registrada automaticamente</li>
        </ol>
        
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-600">
            <strong>Dica:</strong> Certifique-se de que há boa iluminação e o QR Code está bem visível.
          </p>
        </div>
      </div>

      {/* Informações técnicas para debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
          <p>Debug: Camera: {hasCamera ? 'OK' : 'Não'} | Scanning: {isScanning ? 'Sim' : 'Não'}</p>
          {error && <p>Erro: {error}</p>}
        </div>
      )}
    </div>
  );
};