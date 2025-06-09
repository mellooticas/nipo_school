// pages/professores/admin/AulaDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Calendar, Users, BookOpen, Settings, CheckCircle, Clock, Target, FileText, AlertCircle, Camera } from 'lucide-react'
import { supabase } from '../../../shared/lib/supabase/supabaseClient'

const AulaDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [aula, setAula] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const fetchAula = async () => {
      try {
        setLoading(true)
        
        // Buscar dados da view (informações básicas + joins)
        const { data: aulaBasica, error: errorView } = await supabase
          .from('view_aulas_admin')
          .select('*')
          .eq('id', id)
          .single()

        if (errorView) throw errorView

        // Buscar dados JSONB da tabela original
        const { data: aulaDetalhes, error: errorDetalhes } = await supabase
          .from('aulas')
          .select('detalhes_aula')
          .eq('id', id)
          .single()

        if (errorDetalhes) throw errorDetalhes

        // Combinar os dados
        const aulaCompleta = {
          ...aulaBasica,
          detalhes_aula: aulaDetalhes.detalhes_aula
        }

        setAula(aulaCompleta)
      } catch (err) {
        setError(err.message)
        console.error('Erro ao buscar aula:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAula()
  }, [id])

  // Função para extrair dados do JSONB de forma segura
  const getDetailData = (field) => {
    return aula?.detalhes_aula?.[field] || null
  }

  // Função para formatar duração das atividades
  const formatDuration = (atividades) => {
    if (!Array.isArray(atividades)) return '0 min'
    const total = atividades.reduce((acc, ativ) => {
      const tempo = parseInt(ativ.tempo?.replace(/\D/g, '') || 0)
      return acc + tempo
    }, 0)
    return `${total} min`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error || !aula) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Admin</span>
          <span>/</span>
          <span>Kanban</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">Erro</span>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-red-800 font-medium text-lg">Erro ao carregar aula</h3>
          <p className="text-red-700 mt-2">{error || 'Aula não encontrada'}</p>
          <button 
            onClick={() => navigate('/professores/admin/kanban')}
            className="mt-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Kanban
          </button>
        </div>
      </div>
    )
  }

  // Extrair dados do JSONB
  const detalhes = aula.detalhes_aula || {}
  const atividades = getDetailData('resumo_atividades') || []
  const materiais = getDetailData('materiais') || []
  const checklist = getDetailData('checklist') || []
  const tags = getDetailData('tags') || []
  const avaliacao = getDetailData('avaliacao') || []
  const observacoes = getDetailData('observacoes') || []
  const registros = getDetailData('registros') || []
  const desafioAlpha = getDetailData('desafio_alpha')
  const moduloDetalhes = getDetailData('modulo')
  const responsavelDetalhes = getDetailData('responsavel')

  return (
    <div className="space-y-6">
      {/* Header com Breadcrumb e Navegação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Admin</span>
            <span>/</span>
            <button 
              onClick={() => navigate('/professores/admin/kanban')}
              className="text-purple-600 hover:text-purple-700"
            >
              Kanban
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Aula {aula.numero}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-purple-600" />
            Aula {aula.numero}: {aula.titulo}
          </h1>
          
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(aula.data_programada).toLocaleDateString('pt-BR')}
            </span>
            {(aula.modulo_nome || moduloDetalhes) && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {aula.modulo_nome || moduloDetalhes || 'Sem módulo definido'}
              </span>
            )}
            {(aula.responsavel_nome || responsavelDetalhes) && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {aula.responsavel_nome || responsavelDetalhes || 'Sem responsável'}
              </span>
            )}
            {atividades.length > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatDuration(atividades)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            aula.status === 'Concluída' ? 'bg-green-100 text-green-800' :
            aula.status === 'Em Preparação' ? 'bg-blue-100 text-blue-800' :
            aula.status === 'Revisão' ? 'bg-yellow-100 text-yellow-800' :
            aula.status === 'Cancelada' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {aula.status}
          </span>
          
          <button 
            onClick={() => navigate('/professores/admin/kanban')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Kanban
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Visão Geral', icon: Target },
            { id: 'atividades', label: 'Atividades', icon: Clock, count: atividades.length },
            { id: 'checklist', label: 'Checklist', icon: CheckCircle, count: checklist.length },
            { id: 'materiais', label: 'Materiais', icon: FileText, count: materiais.length },
            { id: 'desafio', label: 'Desafio Alpha', icon: AlertCircle },
            { id: 'registros', label: 'Registros', icon: Camera, count: registros.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-0.5 text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Objetivo Didático */}
            {aula.objetivo_didatico && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    🎯
                  </span>
                  Objetivo Didático
                </h2>
                <p className="text-gray-700 leading-relaxed">{aula.objetivo_didatico}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    🏷️
                  </span>
                  Tags da Aula
                </h2>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo das Atividades (versão compacta) */}
            {aula.resumo_atividades && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    📋
                  </span>
                  Resumo das Atividades
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aula.resumo_atividades}</p>
              </div>
            )}

            {/* Informações Técnicas */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  ℹ️
                </span>
                Informações Técnicas
              </h2>
              <div className="space-y-3 text-sm">
                {aula.nivel && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Nível de Dificuldade:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aula.nivel === 'Iniciante' ? 'bg-green-100 text-green-800' :
                      aula.nivel === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                      aula.nivel === 'Avançado' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {aula.nivel === 'Iniciante' ? '🟢' : aula.nivel === 'Intermediário' ? '🟡' : '🔴'} {aula.nivel}
                    </span>
                  </div>
                )}
                {aula.formato && (
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">Formato da Aula:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      aula.formato === 'Presencial' ? 'bg-blue-100 text-blue-800' :
                      aula.formato === 'Online' ? 'bg-purple-100 text-purple-800' :
                      aula.formato === 'Híbrido' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {aula.formato === 'Presencial' ? '🏫' : aula.formato === 'Online' ? '💻' : '🔄'} {aula.formato}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Data de Criação:</span>
                  <span className="text-gray-900">
                    {new Date(aula.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Atividades Tab */}
        {activeTab === 'atividades' && (
          <div className="space-y-4">
            {atividades.length > 0 ? (
              atividades.map((atividade, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          {atividade.tempo}
                        </span>
                        <h3 className="font-semibold text-gray-900">{atividade.titulo}</h3>
                      </div>
                      <p className="text-gray-700">{atividade.descricao}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma atividade detalhada cadastrada</p>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Checklist de Preparação</h2>
            {checklist.length > 0 ? (
              <div className="space-y-3">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum item no checklist</p>
              </div>
            )}
          </div>
        )}

        {/* Materiais Tab */}
        {activeTab === 'materiais' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Materiais Necessários</h2>
            {materiais.length > 0 ? (
              <div className="space-y-3">
                {materiais.map((material, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="text-gray-700">{material}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum material cadastrado</p>
              </div>
            )}
          </div>
        )}

        {/* Desafio Alpha Tab */}
        {activeTab === 'desafio' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                🚀
              </span>
              Desafio Alpha
            </h2>
            {desafioAlpha ? (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">{desafioAlpha}</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p className="font-medium">💡 Objetivo:</p>
                  <p>Atividade para o aluno realizar durante a semana, promovendo a prática e engajamento.</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum desafio cadastrado</p>
              </div>
            )}
          </div>
        )}

        {/* Registros Tab */}
        {activeTab === 'registros' && (
          <div className="space-y-6">
            {/* Avaliação */}
            {avaliacao.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Critérios de Avaliação</h2>
                <div className="space-y-3">
                  {avaliacao.map((criterio, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <Target className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{criterio}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Observações */}
            {observacoes.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Observações Pedagógicas</h2>
                <div className="space-y-3">
                  {observacoes.map((obs, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                      <span className="text-gray-700">{obs}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registros */}
            {registros.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Registros da Aula</h2>
                <div className="space-y-3">
                  {registros.map((registro, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Camera className="w-5 h-5 text-blue-500 mt-0.5" />
                      <span className="text-gray-700">{registro}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Ações Administrativas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          Ações Administrativas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Editar Aula</div>
            <div className="text-sm text-gray-600">Alterar informações</div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Materiais</div>
            <div className="text-sm text-gray-600">Gerenciar arquivos</div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Responsáveis</div>
            <div className="text-sm text-gray-600">Professores</div>
          </button>
          
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Cronograma</div>
            <div className="text-sm text-gray-600">Datas e horários</div>
          </button>
        </div>
      </div>
    </div>
  )
}
 
export default AulaDetail