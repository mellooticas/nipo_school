// features/admin/components/AdminQRManager.jsx
import React, { useState, useEffect } from 'react';
import { QrCode, Calendar, CheckCircle, AlertCircle, Monitor, RefreshCw, Eye } from 'lucide-react';
import { useQRCode } from '../hooks/useQRCode';

export const AdminQRManager = () => {
  const { 
    aulas, 
    loading, 
    error, 
    gerarQRCode, 
    getProximasAulas, 
    getAulasSemQR 
  } = useQRCode();
  
  const [loadingQR, setLoadingQR] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Filtros e visualizações
  const [filtro, setFiltro] = useState('todas'); // 'todas', 'proximas', 'sem_qr'
  const [aulasExibidas, setAulasExibidas] = useState([]);

  useEffect(() => {
    switch (filtro) {
      case 'proximas':
        setAulasExibidas(getProximasAulas());
        break;
      case 'sem_qr':
        setAulasExibidas(getAulasSemQR());
        break;
      default:
        setAulasExibidas(aulas);
    }
  }, [filtro, aulas]);

  const handleGerarQR = async (aula) => {
    setLoadingQR(aula.id);
    setSuccessMessage('');
    
    try {
      await gerarQRCode(aula.numero);
      setSuccessMessage(`QR Code gerado para ${aula.titulo}!`);
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao gerar QR:', error);
    } finally {
      setLoadingQR(null);
    }
  };

  const abrirProjetor = (aula) => {
    const url = `/admin/qr-display/${aula.id}`;
    window.open(url, '_blank', 'fullscreen=yes,scrollbars=no,toolbar=no');
  };

  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const obterStatusAula = (aula) => {
    const hoje = new Date().toISOString().split('T')[0];
    const dataAula = aula.data_programada;
    
    if (dataAula < hoje) return { texto: 'Passada', cor: 'gray' };
    if (dataAula === hoje) return { texto: 'Hoje', cor: 'green' };
    
    const diasRestantes = Math.ceil((new Date(dataAula) - new Date(hoje)) / (1000 * 60 * 60 * 24));
    if (diasRestantes <= 7) return { texto: `${diasRestantes}d`, cor: 'yellow' };
    
    return { texto: 'Futura', cor: 'blue' };
  };

  if (loading && aulas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-gray-600">Carregando aulas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">Erro ao carregar aulas: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <QrCode className="w-6 h-6 mr-2" />
              Gerenciamento de QR Codes
            </h2>
            <p className="text-gray-600">Sistema Alpha School - Presença + Liberação de Conteúdo</p>
          </div>
          
          {/* Estatísticas rápidas */}
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{aulas.length}</div>
              <div className="text-sm text-gray-500">Total Aulas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {aulas.filter(a => a.qr_code).length}
              </div>
              <div className="text-sm text-gray-500">Com QR Code</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {getAulasSemQR().length}
              </div>
              <div className="text-sm text-gray-500">Sem QR Code</div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'todas' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({aulas.length})
          </button>
          <button
            onClick={() => setFiltro('proximas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'proximas' 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Próximas ({getProximasAulas().length})
          </button>
          <button
            onClick={() => setFiltro('sem_qr')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filtro === 'sem_qr' 
                ? 'bg-yellow-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Sem QR ({getAulasSemQR().length})
          </button>
        </div>
      </div>

      {/* Mensagem de sucesso */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Lista de aulas */}
      <div className="space-y-4">
        {aulasExibidas.map((aula) => {
          const status = obterStatusAula(aula);
          
          return (
            <div key={aula.id} className="bg-white rounded-lg shadow-md border hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    {/* Cabeçalho da aula */}
                    <div className="flex items-center gap-3 mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        Aula {aula.numero}
                      </span>
                      <h3 className="text-lg font-semibold text-gray-800">{aula.titulo}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        status.cor === 'green' ? 'bg-green-100 text-green-800' :
                        status.cor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        status.cor === 'gray' ? 'bg-gray-100 text-gray-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {status.texto}
                      </span>
                    </div>

                    {/* Detalhes da aula */}
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{formatarData(aula.data_programada)}</span>
                      </div>
                      <p className="text-gray-600 text-sm">{aula.objetivo_didatico}</p>
                    </div>

                    {/* Status do QR Code */}
                    <div className="mt-4">
                      {aula.qr_code ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-green-800 font-medium">QR Code Ativo</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                Código: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{aula.qr_code}</code>
                              </p>
                              {aula.qr_gerado_em && (
                                <p className="text-xs text-gray-500">
                                  Gerado: {new Date(aula.qr_gerado_em).toLocaleString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                          <div className="flex items-center">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                            <span className="text-yellow-800">QR Code não gerado</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => handleGerarQR(aula)}
                      disabled={loadingQR === aula.id}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {loadingQR === aula.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Gerando...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-4 h-4" />
                          {aula.qr_code ? 'Regenerar' : 'Gerar QR'}
                        </>
                      )}
                    </button>
                    
                    {aula.qr_code && (
                      <>
                        <button
                          onClick={() => abrirProjetor(aula)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          Projetor
                        </button>
                        <button
                          onClick={() => alert('Preview do QR Code (implementar modal)')}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          Preview
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado vazio */}
      {aulasExibidas.length === 0 && (
        <div className="text-center py-12">
          <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhuma aula encontrada
          </h3>
          <p className="text-gray-500">
            {filtro === 'sem_qr' 
              ? 'Todas as aulas já possuem QR Code gerado!'
              : 'Ajuste os filtros para ver as aulas disponíveis.'
            }
          </p>
        </div>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-800 mb-3">📋 Como usar o Sistema QR Code:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Para Administradores:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>Gere QR Code para a aula desejada</li>
              <li>Use "Projetor" para exibir em tela cheia</li>
              <li>Monitore presenças em tempo real</li>
              <li>Regenere QR se necessário (por segurança)</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">Para Alunos:</h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>Abra o app Nipo School no celular</li>
              <li>Escaneie o QR Code exibido na sala</li>
              <li>Presença registrada automaticamente</li>
              <li>Conteúdo da aula liberado no app</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};