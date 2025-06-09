import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { professoresService } from '../services/professoresService';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Eye,
  Calendar,
  User,
  BarChart3,
  Tag,
  PlayCircle,
  FileText,
  ExternalLink
} from 'lucide-react';

const ConteudoDetalhes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [conteudo, setConteudo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const carregarConteudo = useCallback(async () => {
    try {
      setLoading(true);
      const response = await professoresService.getConteudoById(id);
      
      if (response.success) {
        setConteudo(response.data);
      } else {
        setError(response.error || 'Conteúdo não encontrado');
      }
    } catch (err) {
      setError('Erro ao carregar conteúdo');
      console.error('🚫 Erro ao carregar conteúdo:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    carregarConteudo();
  }, [carregarConteudo]);

  const podeEditar = () => {
    if (!user || !conteudo) return false;
    
    // Admin/pastor podem editar tudo
    if (['admin', 'pastor'].includes(user.nivel_acesso)) return true;
    
    // Professor pode editar apenas seus próprios conteúdos
    if (user.nivel_acesso === 'professor' && conteudo.criado_por === user.id) return true;
    
    return false;
  };

  const handleDelete = async () => {
    try {
      const result = await professoresService.deleteConteudo(id);
      if (result.success) {
        navigate('/professores/conteudos');
      } else {
        setError('Erro ao deletar conteúdo');
      }
    } catch (err) {
      setError('Erro ao deletar conteúdo');
      console.error('🚫 Erro ao deletar:', err);
    }
  };

  const handleDownload = async (url) => {
    try {
      // Verificar se a função existe antes de chamar
      if (typeof professoresService.incrementarDownload === 'function') {
        await professoresService.incrementarDownload(id);
      }
      
      // Abrir arquivo em nova aba
      window.open(url, '_blank');
    } catch (err) {
      console.error('🚫 Erro no download:', err);
    }
  };

  const formatarData = (data) => {
    if (!data) return 'Data não disponível';
    
    try {
      return new Date(data).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const tiposConfig = {
    sacada: {
      icon: '💡',
      label: 'Sacada Pedagógica',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      gradient: 'from-yellow-50 to-yellow-100'
    },
    video: {
      icon: '🎥',
      label: 'Vídeo Educativo',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      gradient: 'from-blue-50 to-blue-100'
    },
    devocional: {
      icon: '📖',
      label: 'Devocional',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      gradient: 'from-purple-50 to-purple-100'
    },
    material: {
      icon: '📄',
      label: 'Material Didático',
      color: 'bg-red-100 text-red-800 border-red-200',
      gradient: 'from-red-50 to-red-100'
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white text-2xl">📖</span>
          </div>
          <p className="text-base text-gray-700">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error || !conteudo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Conteúdo não encontrado'}
          </h2>
          <p className="text-base text-gray-700 mb-6">
            O conteúdo que você está procurando não existe ou foi removido.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <Link
              to="/professores/conteudos"
              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Ver Todos os Conteúdos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const config = tiposConfig[conteudo.tipo] || tiposConfig.sacada;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header com navegação */}
      <div className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-red-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              <nav className="text-sm text-gray-500">
                <Link to="/professores" className="hover:text-red-600 transition-colors">Professores</Link>
                <span className="mx-2">/</span>
                <Link to="/professores/conteudos" className="hover:text-red-600 transition-colors">Conteúdos</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Visualizar</span>
              </nav>
            </div>

            {podeEditar() && (
              <div className="flex gap-2">
                <Link
                  to={`/professores/editar/${conteudo.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Link>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Deletar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <article className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-red-100">
          {/* Header do Artigo */}
          <div className={`bg-gradient-to-r ${config.gradient} p-6 sm:p-8 border-l-4 border-l-red-500`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{config.icon}</span>
                <div>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  {conteudo.destaque && (
                    <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                      ⭐ Em Destaque
                    </span>
                  )}
                  {!conteudo.visivel && (
                    <span className="ml-3 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      👁️ Oculto
                    </span>
                  )}
                </div>
              </div>
              
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{conteudo.visualizacoes || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{conteudo.downloads || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {conteudo.titulo || 'Sem título'}
            </h1>

            {conteudo.descricao && (
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {conteudo.descricao}
              </p>
            )}

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Por: <strong>{conteudo.autor_nome || 'Professor Anônimo'}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatarData(conteudo.criado_em)}</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Nível: <strong>{conteudo.nivel || conteudo.nivel_dificuldade || 'Não especificado'}</strong></span>
              </div>
              {conteudo.categoria_nome && (
                <div className="flex items-center gap-2">
                  <span>{conteudo.categoria_icone || '📚'}</span>
                  <span>{conteudo.categoria_nome}</span>
                </div>
              )}
            </div>
          </div>

          {/* Corpo do Conteúdo */}
          <div className="p-6 sm:p-8">
            {/* Vídeo (se houver) */}
            {conteudo.url_video && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-blue-500" />
                  Vídeo Educativo
                </h3>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {conteudo.url_video.includes('youtube.com') || conteudo.url_video.includes('youtu.be') ? (
                    <iframe
                      src={conteudo.url_video.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full"
                      frameBorder="0"
                      allowFullScreen
                      title={conteudo.titulo}
                    />
                  ) : (
                    <video
                      src={conteudo.url_video}
                      controls
                      className="w-full h-full"
                      title={conteudo.titulo}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Imagem de Capa (se houver) */}
            {(conteudo.imagem_capa || conteudo.thumbnail_url) && (
              <div className="mb-8">
                <img
                  src={conteudo.imagem_capa || conteudo.thumbnail_url}
                  alt={conteudo.titulo}
                  className="w-full max-w-2xl mx-auto rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Conteúdo Principal */}
            {conteudo.conteudo && (
              <div className="prose max-w-none mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-500" />
                  Conteúdo
                </h3>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 p-6 rounded-lg border">
                  {conteudo.conteudo}
                </div>
              </div>
            )}

            {/* Arquivo para Download */}
            {conteudo.url_arquivo && (
              <div className="mb-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5 text-green-600" />
                  Material para Download
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📄</span>
                    <div>
                      <p className="font-medium text-gray-900">Material didático disponível</p>
                      <p className="text-sm text-gray-600">Clique para baixar o arquivo complementar</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(conteudo.url_arquivo)}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar Material
                  </button>
                </div>
              </div>
            )}

            {/* Tags */}
            {Array.isArray(conteudo.tags) && conteudo.tags.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-gray-500" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {conteudo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Informações Adicionais */}
            <div className="pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                <div>
                  <p><strong>Criado em:</strong> {formatarData(conteudo.criado_em)}</p>
                  {conteudo.atualizado_em && conteudo.atualizado_em !== conteudo.criado_em && (
                    <p><strong>Atualizado em:</strong> {formatarData(conteudo.atualizado_em || conteudo.editado_em)}</p>
                  )}
                  {conteudo.duracao_minutos && (
                    <p><strong>Duração:</strong> {conteudo.duracao_minutos} minutos</p>
                  )}
                </div>
                <div className="md:text-right">
                  <p><strong>Visualizações:</strong> {conteudo.visualizacoes || 0}</p>
                  <p><strong>Downloads:</strong> {conteudo.downloads || 0}</p>
                  {conteudo.destaque && (
                    <p className="text-amber-600"><strong>⭐ Conteúdo em Destaque</strong></p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Navegação Relacionada */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-4">
            <Link
              to="/professores/conteudos"
              className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Ver Todos os Conteúdos
            </Link>
            <Link
              to="/professores/minha-area"
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Minha Área
            </Link>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação para Deletar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-500" />
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja deletar o conteúdo "<strong>{conteudo.titulo}</strong>"? 
              Esta ação não pode ser desfeita e todos os arquivos relacionados serão removidos.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Deletar Definitivamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConteudoDetalhes;