

// pages/professores/admin/AulaDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Calendar, Users, BookOpen, Settings } from 'lucide-react'
import { supabase } from '../../../../shared/lib/supabase/supabaseClient'

const AulaDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [aula, setAula] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAula = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('view_aulas_admin')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setAula(data)
      } catch (err) {
        setError(err.message)
        console.error('Erro ao buscar aula:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAula()
  }, [id])

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
            {aula.nome_modulo && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {aula.nome_modulo}
              </span>
            )}
            {aula.responsavel && (
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {aula.responsavel}
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

      {/* Content Grid - Informações da Aula */}
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

        {/* Resumo das Atividades */}
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

        {/* Desafio Alpha */}
        {aula.desafio_alpha && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                🚀
              </span>
              Desafio Alpha
            </h2>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aula.desafio_alpha}</p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Atividade para o aluno realizar durante a semana
            </p>
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
            <div className="flex justify-between">
              <span className="font-medium text-gray-600">Última Atualização:</span>
              <span className="text-gray-900">
                {new Date(aula.atualizado_em || aula.criado_em).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações Administrativas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-500" />
          Ações Administrativas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ações Principais */}
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