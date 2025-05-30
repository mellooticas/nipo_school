import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';
import {
  Eye,
  Save,
  X,
  Upload,
  Image,
  Video,
  FileText,
  Tag,
  Settings,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

const FormConteudo = ({ conteudoParaEditar = null, onSalvar, onCancelar }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [preview, setPreview] = useState(false);
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'sacada',
    categoria_id: '', 
    descricao: '',
    conteudo: '',
    url_video: '',
    tags: '',
    nivel: 'iniciante',
    visivel: true,
    destaque: false
  });

  // Estado para uploads
  const [arquivos, setArquivos] = useState({
    arquivo_principal: null,
    imagem_capa: null
  });

  const [errors, setErrors] = useState({});

  // Carregar categorias
  const carregarCategorias = useCallback(async () => {
    try {
      // Verificar se a função existe
      if (typeof professoresService.getCategorias === 'function') {
        const response = await professoresService.getCategorias();
        setCategorias(response.success ? response.data || [] : []);
      } else {
        console.warn('⚠️ getCategorias não encontrada, usando categorias padrão');
        setCategorias([
          { id: 'geral', nome: 'Geral', icone: '📚' },
          { id: 'tecnica', nome: 'Técnica', icone: '🎯' },
          { id: 'teoria', nome: 'Teoria', icone: '📖' },
          { id: 'pratica', nome: 'Prática', icone: '🎹' }
        ]);
      }
    } catch (error) {
      console.error('🚫 Erro ao carregar categorias:', error);
      setCategorias([]);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    carregarCategorias();
    
    if (conteudoParaEditar) {
      setFormData({
        titulo: conteudoParaEditar.titulo || '',
        tipo: conteudoParaEditar.tipo || 'sacada',
        categoria_id: conteudoParaEditar.categoria_id || conteudoParaEditar.categoria || '',
        descricao: conteudoParaEditar.descricao || '',
        conteudo: conteudoParaEditar.conteudo || '',
        url_video: conteudoParaEditar.url_video || '',
        tags: Array.isArray(conteudoParaEditar.tags) ? conteudoParaEditar.tags.join(', ') : '',
        nivel: conteudoParaEditar.nivel || conteudoParaEditar.nivel_dificuldade || 'iniciante',
        visivel: conteudoParaEditar.visivel !== false,
        destaque: Boolean(conteudoParaEditar.destaque)
      });
    }
  }, [conteudoParaEditar, carregarCategorias]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
      setArquivos(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
  };

  const validarFormulario = () => {
    const novosErrors = {};

    if (!formData.titulo.trim()) {
      novosErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      novosErrors.descricao = 'Descrição é obrigatória';
    }

    if (formData.tipo === 'video' && !formData.url_video.trim()) {
      novosErrors.url_video = 'URL do vídeo é obrigatória para conteúdo tipo vídeo';
    }

    if (!formData.conteudo.trim()) {
      novosErrors.conteudo = 'Conteúdo é obrigatório';
    }

    setErrors(novosErrors);
    return Object.keys(novosErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar dados para envio
      const dadosParaEnvio = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        criado_por: user?.id,
        editado_por: user?.id
      };

      let resultado;

      if (conteudoParaEditar) {
        // Editar conteúdo existente
        resultado = await professoresService.updateConteudo(
          conteudoParaEditar.id,
          dadosParaEnvio,
          arquivos
        );
      } else {
        // Criar novo conteúdo
        resultado = await professoresService.createConteudo(dadosParaEnvio, arquivos);
      }

      if (resultado.success) {
        // Resetar formulário
        setFormData({
          titulo: '',
          tipo: 'sacada',
          categoria_id: '',
          descricao: '',
          conteudo: '',
          url_video: '',
          tags: '',
          nivel: 'iniciante',
          visivel: true,
          destaque: false
        });
        setArquivos({
          arquivo_principal: null,
          imagem_capa: null
        });

        if (onSalvar) {
          onSalvar(resultado.data);
        }
      } else {
        setErrors({ geral: resultado.error || 'Erro ao salvar conteúdo' });
      }
    } catch (error) {
      console.error('🚫 Erro ao salvar conteúdo:', error);
      setErrors({ geral: 'Erro ao salvar conteúdo. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  const tiposConteudo = [
    { value: 'sacada', label: '💡 Sacada Pedagógica', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'video', label: '🎥 Vídeo Educativo', color: 'bg-blue-100 text-blue-800' },
    { value: 'devocional', label: '📖 Devocional', color: 'bg-purple-100 text-purple-800' },
    { value: 'material', label: '📄 Material Didático', color: 'bg-red-100 text-red-800' }
  ];

  const niveisConteudo = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
    { value: 'todos', label: 'Todos os Níveis' }
  ];

  if (preview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-red-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-500" />
                Preview do Conteúdo
              </h2>
              <button
                onClick={() => setPreview(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Voltar para Edição
              </button>
            </div>

            {/* Preview do conteúdo */}
            <div className="space-y-6">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  tiposConteudo.find(t => t.value === formData.tipo)?.color
                }`}>
                  {tiposConteudo.find(t => t.value === formData.tipo)?.label}
                </span>
                {formData.destaque && (
                  <span className="ml-3 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                    ⭐ Em Destaque
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900">{formData.titulo || 'Sem título'}</h1>
              <p className="text-lg text-gray-600">{formData.descricao || 'Sem descrição'}</p>
              
              {formData.url_video && (
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Vídeo: {formData.url_video}</p>
                  </div>
                </div>
              )}
              
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Conteúdo:</h3>
                <div className="bg-gray-50 p-6 rounded-lg border whitespace-pre-wrap">
                  {formData.conteudo || 'Nenhum conteúdo inserido ainda.'}
                </div>
              </div>

              {formData.tags && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags:</h3>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-light text-gray-800 flex items-center gap-3">
                <span className="text-3xl">{conteudoParaEditar ? '✏️' : '✨'}</span>
                {conteudoParaEditar ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </button>
                {onCancelar && (
                  <button
                    type="button"
                    onClick={onCancelar}
                    className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancelar</span>
                  </button>
                )}
              </div>
            </div>

            {errors.geral && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errors.geral}
              </div>
            )}

            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-1" />
                  Título *
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.titulo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 5 dicas para melhorar sua aula de teclado"
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.titulo}
                  </p>
                )}
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Conteúdo *
                </label>
                <select
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  {tiposConteudo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.categoria_id ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.icone} {categoria.nome}
                    </option>
                  ))}
                </select>
                {errors.categoria_id && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.categoria_id}
                  </p>
                )}
              </div>

              {/* Nível */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível
                </label>
                <select
                  name="nivel"
                  value={formData.nivel}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                >
                  {niveisConteudo.map(nivel => (
                    <option key={nivel.value} value={nivel.value}>
                      {nivel.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL do Vídeo (se tipo for vídeo) */}
            {formData.tipo === 'video' && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Video className="w-4 h-4 inline mr-1" />
                  URL do Vídeo *
                </label>
                <input
                  type="url"
                  name="url_video"
                  value={formData.url_video}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                    errors.url_video ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="https://youtube.com/watch?v=..."
                />
                {errors.url_video && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.url_video}
                  </p>
                )}
              </div>
            )}

            {/* Descrição */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={3}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                  errors.descricao ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Descreva brevemente o conteúdo..."
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.descricao}
                </p>
              )}
            </div>

            {/* Conteúdo Principal */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conteúdo *
              </label>
              <textarea
                name="conteudo"
                value={formData.conteudo}
                onChange={handleInputChange}
                rows={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                  errors.conteudo ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Digite o conteúdo completo aqui..."
              />
              {errors.conteudo && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.conteudo}
                </p>
              )}
            </div>

            {/* Tags */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Tags
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                placeholder="piano, iniciante, dicas (separadas por vírgula)"
              />
              <p className="mt-1 text-sm text-gray-500">Separe as tags por vírgula</p>
            </div>

            {/* Uploads */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Arquivo Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  Arquivo Principal (PDF, DOC, etc.)
                </label>
                <input
                  type="file"
                  name="arquivo_principal"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>

              {/* Imagem de Capa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 inline mr-1" />
                  Imagem de Capa
                </label>
                <input
                  type="file"
                  name="imagem_capa"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>
            </div>

            {/* Configurações */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="visivel"
                    checked={formData.visivel}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Tornar visível para todos os professores
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="destaque"
                    checked={formData.destaque}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Marcar como destaque
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => setPreview(true)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Visualizar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    {conteudoParaEditar ? <Save className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    {conteudoParaEditar ? 'Atualizar' : 'Criar Conteúdo'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormConteudo;