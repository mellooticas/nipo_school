// features/admin/pages/AulaDetail.jsx - VERSÃO VISUAL MELHORADA
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Edit, Calendar, Users, BookOpen, Settings, CheckCircle, Clock, 
  Target, FileText, AlertCircle, Camera, Crown, ChevronRight, Play, 
  Star, Award, Zap, Eye, Download, Share2
} from 'lucide-react'
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
        
        const { data: aulaBasica, error: errorView } = await supabase
          .from('view_aulas_admin')
          .select('*')
          .eq('id', id)
          .single()

        if (errorView) throw errorView

        const { data: aulaDetalhes, error: errorDetalhes } = await supabase
          .from('aulas')
          .select('detalhes_aula')
          .eq('id', id)
          .single()

        if (errorDetalhes) throw errorDetalhes

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

  const getDetailData = (field) => {
    return aula?.detalhes_aula?.[field] || null
  }

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
            </div>
            <p className="text-slate-600 font-medium">Carregando dados da aula...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Erro ao carregar aula</h3>
                <p className="text-slate-600 mb-6">{error || 'Aula não encontrada'}</p>
                <button 
                  onClick={() => navigate('/admin/kanban')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar ao Kanban
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Extrair dados do JSONB
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

  const getStatusConfig = (status) => {
    const configs = {
      'Concluída': { bg: 'bg-emerald-500', text: 'text-white', icon: '✓', glow: 'shadow-emerald-500/25' },
      'Em Preparação': { bg: 'bg-blue-500', text: 'text-white', icon: '⏳', glow: 'shadow-blue-500/25' },
      'Revisão': { bg: 'bg-amber-500', text: 'text-white', icon: '🔄', glow: 'shadow-amber-500/25' },
      'Cancelada': { bg: 'bg-red-500', text: 'text-white', icon: '✕', glow: 'shadow-red-500/25' },
      'A Fazer': { bg: 'bg-slate-500', text: 'text-white', icon: '📋', glow: 'shadow-slate-500/25' }
    }
    return configs[status] || configs['A Fazer']
  }

  const statusConfig = getStatusConfig(aula.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Flutuante */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Painel Administrativo</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span>Kanban</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600 font-medium">Aula {aula.numero}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin/kanban')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar</span>
              </button>
              
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200 font-medium">
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section da Aula */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Informações Principais */}
            <div className="lg:col-span-2">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      Aula {aula.numero}
                    </span>
                    <div className={`px-4 py-2 ${statusConfig.bg} ${statusConfig.text} rounded-full text-sm font-semibold shadow-lg ${statusConfig.glow} flex items-center gap-2`}>
                      <span>{statusConfig.icon}</span>
                      {aula.status}
                    </div>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                    {aula.titulo}
                  </h1>
                  
                  {/* Meta informações */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">
                        {new Date(aula.data_programada).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    {(aula.modulo_nome || moduloDetalhes) && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <BookOpen className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium truncate">
                          {aula.modulo_nome || moduloDetalhes}
                        </span>
                      </div>
                    )}
                    
                    {(aula.responsavel_nome || responsavelDetalhes) && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium truncate">
                          {aula.responsavel_nome || responsavelDetalhes}
                        </span>
                      </div>
                    )}
                    
                    {atividades.length > 0 && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium">
                          {formatDuration(atividades)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{atividades.length}</div>
                      <div className="text-sm text-slate-600">Atividades</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <FileText className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{materiais.length}</div>
                      <div className="text-sm text-slate-600">Materiais</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
                  <span className="text-sm text-slate-500">75%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Modernos */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-2">
          <nav className="flex space-x-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Target, color: 'blue' },
              { id: 'atividades', label: 'Atividades', icon: Play, count: atividades.length, color: 'purple' },
              { id: 'checklist', label: 'Checklist', icon: CheckCircle, count: checklist.length, color: 'green' },
              { id: 'materiais', label: 'Materiais', icon: FileText, count: materiais.length, color: 'orange' },
              { id: 'desafio', label: 'Desafio Alpha', icon: Zap, color: 'yellow' },
              { id: 'registros', label: 'Registros', icon: Camera, count: registros.length, color: 'indigo' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? `bg-${tab.color}-500 text-white shadow-lg shadow-${tab.color}-500/25`
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === tab.id ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Objetivo Didático */}
            {aula.objetivo_didatico && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Objetivo Didático</h2>
                </div>
                <p className="text-slate-700 leading-relaxed text-lg">{aula.objetivo_didatico}</p>
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">🏷️</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Tags da Aula</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium shadow-lg shadow-purple-500/25"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resumo das Atividades */}
            {aula.resumo_atividades && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">📋</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">Resumo das Atividades</h2>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-line">{aula.resumo_atividades}</p>
              </div>
            )}

            {/* Informações Técnicas */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">ℹ️</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Informações Técnicas</h2>
              </div>
              <div className="space-y-4">
                {aula.nivel && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Nível de Dificuldade</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      aula.nivel === 'Iniciante' ? 'bg-green-100 text-green-800' :
                      aula.nivel === 'Intermediário' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {aula.nivel === 'Iniciante' ? '🟢' : aula.nivel === 'Intermediário' ? '🟡' : '🔴'} {aula.nivel}
                    </span>
                  </div>
                )}
                
                {aula.formato && (
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-medium text-slate-700">Formato da Aula</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      aula.formato === 'Presencial' ? 'bg-blue-100 text-blue-800' :
                      aula.formato === 'Online' ? 'bg-purple-100 text-purple-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {aula.formato === 'Presencial' ? '🏫' : aula.formato === 'Online' ? '💻' : '🔄'} {aula.formato}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <span className="font-medium text-slate-700">Data de Criação</span>
                  <span className="text-slate-900 font-medium">
                    {new Date(aula.criado_em).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Atividades Tab */}
        {activeTab === 'atividades' && (
          <div className="space-y-6">
            {atividades.length > 0 ? (
              atividades.map((atividade, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8 hover:shadow-xl transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-bold text-sm">
                          {atividade.tempo}
                        </span>
                        <h3 className="text-xl font-bold text-slate-900">{atividade.titulo}</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-lg">{atividade.descricao}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhuma atividade cadastrada</h3>
                <p className="text-slate-600">As atividades detalhadas aparecerão aqui quando forem adicionadas.</p>
              </div>
            )}
          </div>
        )}

        {/* Checklist Tab */}
        {activeTab === 'checklist' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Checklist de Preparação</h2>
            </div>
            
            {checklist.length > 0 ? (
              <div className="space-y-4">
                {checklist.map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100 hover:bg-green-100 transition-colors">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum item no checklist</h3>
                <p className="text-slate-600">Os itens de preparação aparecerão aqui quando forem adicionados.</p>
              </div>
            )}
          </div>
        )}

        {/* Materiais Tab */}
        {activeTab === 'materiais' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Materiais Necessários</h2>
            </div>
            
            {materiais.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materiais.map((material, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors group">
                    <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-slate-800 font-medium flex-1">{material}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-4 h-4 text-orange-600 hover:text-orange-800" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum material cadastrado</h3>
                <p className="text-slate-600">Os materiais necessários aparecerão aqui quando forem adicionados.</p>
              </div>
            )}
          </div>
        )}

        {/* Desafio Alpha Tab */}
        {activeTab === 'desafio' && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
               <h2 className="text-2xl font-bold text-slate-900">Desafio Alpha</h2>
               <p className="text-slate-600">Atividade especial para engajamento dos alunos</p>
             </div>
           </div>
           
           {desafioAlpha ? (
             <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-8">
               <div className="flex items-start gap-4 mb-6">
                 <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                   <span className="text-xl">🚀</span>
                 </div>
                 <div className="flex-1">
                   <h3 className="text-lg font-bold text-slate-900 mb-3">Descrição do Desafio</h3>
                   <p className="text-slate-700 leading-relaxed text-lg mb-6">{desafioAlpha}</p>
                 </div>
               </div>
               
               <div className="bg-white/70 rounded-xl p-6 border border-orange-100">
                 <div className="flex items-center gap-3 mb-3">
                   <span className="text-2xl">💡</span>
                   <h4 className="font-bold text-slate-900">Objetivo do Desafio</h4>
                 </div>
                 <p className="text-slate-700">
                   Atividade para o aluno realizar durante a semana, promovendo a prática, 
                   o engajamento e a aplicação real dos conhecimentos adquiridos em aula.
                 </p>
               </div>
             </div>
           ) : (
             <div className="text-center py-12">
               <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Zap className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum desafio cadastrado</h3>
               <p className="text-slate-600">O Desafio Alpha aparecerá aqui quando for criado.</p>
             </div>
           )}
         </div>
       )}

       {/* Registros Tab */}
       {activeTab === 'registros' && (
         <div className="space-y-8">
           {/* Avaliação */}
           {avaliacao.length > 0 && (
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <Star className="w-6 h-6 text-white" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900">Critérios de Avaliação</h2>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {avaliacao.map((criterio, index) => (
                   <div key={index} className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                     <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Target className="w-4 h-4 text-white" />
                     </div>
                     <span className="text-slate-800 font-medium">{criterio}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Observações */}
           {observacoes.length > 0 && (
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <AlertCircle className="w-6 h-6 text-white" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900">Observações Pedagógicas</h2>
               </div>
               <div className="space-y-4">
                 {observacoes.map((obs, index) => (
                   <div key={index} className="flex items-start gap-4 p-6 bg-yellow-50 rounded-xl border border-yellow-100">
                     <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                       <AlertCircle className="w-4 h-4 text-white" />
                     </div>
                     <span className="text-slate-800 leading-relaxed">{obs}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Registros */}
           {registros.length > 0 && (
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-8">
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <Camera className="w-6 h-6 text-white" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900">Registros da Aula</h2>
               </div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {registros.map((registro, index) => (
                   <div key={index} className="flex items-start gap-4 p-6 bg-blue-50 rounded-xl border border-blue-100">
                     <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                       <Camera className="w-5 h-5 text-white" />
                     </div>
                     <div className="flex-1">
                       <span className="text-slate-800 leading-relaxed">{registro}</span>
                       <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
                         <Clock className="w-3 h-3" />
                         <span>Registrado em {new Date().toLocaleDateString('pt-BR')}</span>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Empty State para Registros */}
           {avaliacao.length === 0 && observacoes.length === 0 && registros.length === 0 && (
             <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center">
               <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Camera className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum registro encontrado</h3>
               <p className="text-slate-600">Avaliações, observações e registros aparecerão aqui quando forem adicionados.</p>
             </div>
           )}
         </div>
       )}
     </div>

     {/* Ações Administrativas - Footer Flutuante */}
     <div className="sticky bottom-6 max-w-7xl mx-auto px-6">
       <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl shadow-slate-900/10 p-6">
         <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
               <Settings className="w-5 h-5 text-white" />
             </div>
             <h2 className="text-lg font-bold text-slate-900">Ações Administrativas</h2>
           </div>
         </div>
         
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
           <button 
             onClick={() => navigate(`/admin/aulas/editar/${id}`)}
             className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-2xl border border-blue-200 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
           >
             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
               <Edit className="w-6 h-6 text-white" />
             </div>
             <div className="text-center">
               <div className="font-bold text-slate-900 mb-1">Editar Aula</div>
               <div className="text-sm text-slate-600">Alterar informações</div>
             </div>
           </button>
           
           <button 
             onClick={() => navigate(`/admin/aulas/material/${id}`)}
             className="group p-6 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-2xl border border-green-200 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20"
           >
             <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
               <FileText className="w-6 h-6 text-white" />
             </div>
             <div className="text-center">
               <div className="font-bold text-slate-900 mb-1">Materiais</div>
               <div className="text-sm text-slate-600">Gerenciar arquivos</div>
             </div>
           </button>
           
           <button 
             onClick={() => navigate(`/admin/aulas/presenca/${id}`)}
             className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-2xl border border-purple-200 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20"
           >
             <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
               <Users className="w-6 h-6 text-white" />
             </div>
             <div className="text-center">
               <div className="font-bold text-slate-900 mb-1">Presença</div>
               <div className="text-sm text-slate-600">Controle de presença</div>
             </div>
           </button>
           
           <button 
             onClick={() => navigate(`/admin/aulas/avaliacoes/${id}`)}
             className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-2xl border border-orange-200 transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
           >
             <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
               <Star className="w-6 h-6 text-white" />
             </div>
             <div className="text-center">
               <div className="font-bold text-slate-900 mb-1">Avaliações</div>
               <div className="text-sm text-slate-600">Feedback dos alunos</div>
             </div>
           </button>
         </div>
       </div>
     </div>

     {/* Espaçamento para o footer flutuante */}
     <div className="h-32"></div>
   </div>
 )
}

export default AulaDetail