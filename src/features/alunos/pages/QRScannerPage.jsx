// features/alunos/pages/QRScannerPage.jsx
import React from 'react';
import { QRScanner } from '../components/QRScanner';
import { ArrowLeft } from 'lucide-react';

export const QRScannerPage = () => {
  const handleClose = () => {
    // Implementar navegação conforme seu sistema de rotas
    window.history.back(); // Ou usar seu sistema de navegação
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      
      {/* Header com botão voltar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleClose}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <h1 className="text-lg font-semibold text-gray-800">
              Registrar Presença
            </h1>
            <div className="w-16"></div> {/* Spacer para centralizar título */}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="py-8 px-4">
        <QRScanner onClose={handleClose} />
      </div>

      {/* Footer informativo */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-gray-600 mb-1">
            🎵 Nipo School - Sistema Alpha
          </p>
          <p className="text-xs text-gray-500">
            "Se não for divertido, ninguém aprende"
          </p>
        </div>
      </div>
      
    </div>
  );
};