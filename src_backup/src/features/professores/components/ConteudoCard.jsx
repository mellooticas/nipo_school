import React, { useState } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';

const ConteudoCard = ({ 
  conteudo, 
  onEditar, 
  onDeletar, 
  onVisualizarCompleto, 
  showActions = true,
  variant = 'default' // 'default', 'compact', 'featured'
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Verificar se o usuário pode editar este conteúdo
  const podeEditar = () => {
    if (!user) return false;
    
    // Admin/pastor podem editar tudo
    if (['admin', 'pastor'].includes(user.nivel_acesso)) return true;
    
    // Professor pode editar apenas seus próprios conteúdos
    if (user.nivel_acesso === 'professor' && conteudo.criado_por === user.id) return true;
    
    return false;
  };

  // Configurações visuais por tipo de conteúdo
  const tiposConfig = {
    sacada: {
      icon: '💡',
      label: 'Sacada Pedagógica',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gradient: 'from-yellow-50 to-yellow-100',
      accent: 'border-l-yellow-500'
    },
    video: {
      icon: '🎥',
      label: 'Vídeo Educativo',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      gradient: 'from-blue-50 to-blue-100',
      accent: 'border-l-blue-500'
    },
    devocional: {
      icon: '📖',
      label: 'Devocional',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-50 to-purple-100',
      accent: 'border-l-purple-500'
    },
    material: {
      icon: '📄',
      label: 'Material Didático',
      color: 'bg-red-100 text-red-800 border-red-200',
      gradient: 'from-red-50 to-red-100',
      accent: 'border-l-red-500'
    }
  };

  const config = tiposConfig[conteudo.tipo] || tiposConfig.sacada;

  // Função para formatar data
  const formatarData = (data) => {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Função para extrair preview do conteúdo
  const getPreview = (texto, limite = 120) => {
    if (!texto) return '';
    return texto.length > limite ? texto.substring(0, limite) + '...' : texto;
  };

  // Função para deletar conteúdo
  const handleDelete = async () => {
    if (!podeEditar()) return;
    
    setLoading(true);
    try {
      const result = await professoresService.deleteConteudo(conteudo.id);
      if (result.success) {
        onDeletar && onDeletar(conteudo.id);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Erro ao deletar:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para toggle visibilidade
  const toggleVisibilidade = async () => {
    if (!podeEditar()) return;
    
    setLoading(true);
    try {
      await professoresService.updateConteudo(conteudo.id, {
        visivel: !conteudo.visivel
      });
      // Recarregar dados ou usar callback
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
    } finally {
      setLoading(false);
    }
  };

  // Renderização para variant compact
  if (variant === 'compact') {
    return (
      <div className={`bg-white rounded-lg border-l-4 ${config.accent} shadow-sm hover:shadow-md transition-shadow p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{config.icon}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
              </span>
              {conteudo.destaque && (
                <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  ⭐ Destaque
                </span>
              )}
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {conteudo.titulo}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {getPreview(conteudo.descricao, 80)}
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>📅 {formatarData(conteudo.criado_em)}</span>
              <span>👁️ {conteudo.visualizacoes || 0}</span>
            </div>
          </div>
          {showActions && podeEditar() && (
            <div className="flex gap-1 ml-2">
              <button
                onClick={() => onEditar && onEditar(conteudo)}
                className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Renderização para variant featured
  if (variant === 'featured') {
    return (
      <div className={`bg-gradient-to-br ${config.gradient} rounded-xl shadow-lg hover:shadow-xl transition-all p-6 border`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
            <span className="text-lg">{config.icon}</span>
            {config.label}
          </div>
          {conteudo.destaque && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
              ⭐ Destaque
            </div>
          )}
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
          {conteudo.titulo}
        </h2>
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {conteudo.descricao}
        </p>

        {/* Preview do conteúdo */}
        {conteudo.url_video && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>🎥</span>
              <span>Vídeo disponível</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {conteudo.tags && conteudo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {conteudo.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-white/70 text-gray-700 rounded text-xs">
                #{tag}
              </span>
            ))}
            {conteudo.tags.length > 3 && (
              <span className="px-2 py-1 bg-white/70 text-gray-500 rounded text-xs">
                +{conteudo.tags.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/30">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>📅 {formatarData(conteudo.criado_em)}</span>
            <span>👁️ {conteudo.visualizacoes || 0}</span>
            <span>📊 Nível {conteudo.nivel}</span>
          </div>
          
          <button
            onClick={() => onVisualizarCompleto && onVisualizarCompleto(conteudo)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Ver Completo →
          </button>
        </div>
      </div>
    );
  }

  // Renderização padrão (default)
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
      {/* Header do Card */}
      <div className={`bg-gradient-to-r ${config.gradient} p-4 border-l-4 ${config.accent}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
              {conteudo.destaque && (
                <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                  ⭐ Destaque
                </span>
              )}
              {!conteudo.visivel && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                  👁️ Oculto
                </span>
              )}
            </div>
          </div>

          {/* Menu de Ações */}
          {showActions && podeEditar() && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onEditar && onEditar(conteudo)}
                className="p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
                title="Editar conteúdo"
              >
                ✏️
              </button>
              <button
                onClick={toggleVisibilidade}
                disabled={loading}
                className="p-2 bg-white/80 hover:bg-white rounded-lg transition-colors"
                title={conteudo.visivel ? 'Ocultar' : 'Tornar visível'}
              >
                {conteudo.visivel ? '👁️' : '🙈'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 bg-white/80 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                title="Deletar conteúdo"
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
          {conteudo.titulo}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {conteudo.descricao}
        </p>

        {/* Preview do conteúdo principal */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 line-clamp-2">
            {getPreview(conteudo.conteudo)}
          </p>
        </div>

        {/* Mídia (se houver) */}
        {conteudo.url_video && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>🎥</span>
              <span>Vídeo educativo disponível</span>
            </div>
          </div>
        )}

        {conteudo.url_arquivo && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <span>📎</span>
              <span>Material para download</span>
            </div>
          </div>
        )}

        {/* Tags */}
        {conteudo.tags && conteudo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {conteudo.tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Metadados */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <span>📅 {formatarData(conteudo.criado_em)}</span>
            <span>👁️ {conteudo.visualizacoes || 0} visualizações</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
              📊 {conteudo.nivel}
            </span>
          </div>
          
          <button
            onClick={() => onVisualizarCompleto && onVisualizarCompleto(conteudo)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Ver Mais →
          </button>
        </div>

        {/* Autor */}
        {conteudo.autor_nome && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>👤</span>
              <span>Por: {conteudo.autor_nome}</span>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Deletar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar o conteúdo "<strong>{conteudo.titulo}</strong>"? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Deletando...' : 'Deletar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConteudoCard;