import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { professoresService } from '../../services/professoresService';

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

  // Carregar dados iniciais
  useEffect(() => {
    carregarCategorias();
    
    if (conteudoParaEditar) {
      setFormData({
        ...conteudoParaEditar,
        tags: conteudoParaEditar.tags?.join(', ') || ''
      });
    }
  }, [conteudoParaEditar]);

  const carregarCategorias = async () => {
    try {
      const response = await professoresService.getCategorias();
      setCategorias(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

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

    if (!formData.categoria_id) {
      novosErrors.categoria_id = 'Categoria é obrigatória';
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
        criado_por: user.id
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
      }
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
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
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Preview do Conteúdo</h2>
            <button
              onClick={() => setPreview(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              ← Voltar para Edição
            </button>
          </div>

          {/* Preview do conteúdo */}
          <div className="space-y-4">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                tiposConteudo.find(t => t.value === formData.tipo)?.color
              }`}>
                {tiposConteudo.find(t => t.value === formData.tipo)?.label}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900">{formData.titulo}</h1>
            <p className="text-gray-600">{formData.descricao}</p>
            
            {formData.url_video && (
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">🎥 Vídeo: {formData.url_video}</p>
              </div>
            )}
            
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: formData.conteudo.replace(/\n/g, '<br>') }} />
            </div>

            {formData.tags && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.split(',').map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {conteudoParaEditar ? 'Editar Conteúdo' : 'Criar Novo Conteúdo'}
            </h2>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreview(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                👁️ Preview
              </button>
              {onCancelar && (
                <button
                  type="button"
                  onClick={onCancelar}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          {errors.geral && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {errors.geral}
            </div>
          )}

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Título */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.titulo ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: 5 dicas para melhorar sua aula de teclado"
              />
              {errors.titulo && <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                Categoria *
              </label>
              <select
                name="categoria_id"
                value={formData.categoria_id}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.categoria_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.icone} {categoria.nome}
                  </option>
                ))}
              </select>
              {errors.categoria_id && <p className="mt-1 text-sm text-red-600">{errors.categoria_id}</p>}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                URL do Vídeo *
              </label>
              <input
                type="url"
                name="url_video"
                value={formData.url_video}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                  errors.url_video ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://youtube.com/watch?v=..."
              />
              {errors.url_video && <p className="mt-1 text-sm text-red-600">{errors.url_video}</p>}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.descricao ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descreva brevemente o conteúdo..."
            />
            {errors.descricao && <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>}
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
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                errors.conteudo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o conteúdo completo aqui..."
            />
            {errors.conteudo && <p className="mt-1 text-sm text-red-600">{errors.conteudo}</p>}
          </div>

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="piano, iniciante, dicas (separadas por vírgula)"
            />
            <p className="mt-1 text-sm text-gray-500">Separe as tags por vírgula</p>
          </div>

          {/* Uploads */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Arquivo Principal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo Principal (PDF, DOC, etc.)
              </label>
              <input
                type="file"
                name="arquivo_principal"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Imagem de Capa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem de Capa
              </label>
              <input
                type="file"
                name="imagem_capa"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Configurações */}
          <div className="mt-6 space-y-4">
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

        {/* Botões de Ação */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setPreview(true)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              👁️ Visualizar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : (
                conteudoParaEditar ? '💾 Atualizar' : '✨ Criar Conteúdo'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormConteudo;