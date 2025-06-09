// components/kanban/KanbanBoard.jsx
import React, { useState } from 'react'
import { useAulas } from '../hooks/useAulas'
import AulaCard from './AulaCard'

const KanbanColumn = ({ status, aulas, cor }) => {
  const aulasFiltradas = aulas.filter(aula => aula.status === status) 

  return (
    <div className="flex-1 min-w-80 bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800 flex items-center"> 
          <span className={`w-3 h-3 rounded-full ${cor} mr-2`}></span>
          {status}
        </h2>
        <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-1 rounded-full">
          {aulasFiltradas.length}
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {aulasFiltradas.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-8">
            Nenhuma aula neste status
          </div>
        ) : (
          aulasFiltradas.map(aula => (
            <AulaCard key={aula.id} aula={aula} />
          ))
        )}
      </div>
    </div>
  )
}

const KanbanBoard = () => {
  const { aulas, loading, error, fetchAulas } = useAulas()
  const [filtroModulo, setFiltroModulo] = useState('')
  const [filtroNivel, setFiltroNivel] = useState('')
  const [filtroFormato, setFiltroFormato] = useState('')
  const [filtroResponsavel, setFiltroResponsavel] = useState('')

  const statusColunas = [
    { nome: 'A Fazer', cor: 'bg-gray-400' },
    { nome: 'Em Preparação', cor: 'bg-blue-400' },
    { nome: 'Concluída', cor: 'bg-green-400' },
    { nome: 'Revisão', cor: 'bg-yellow-400' },
    { nome: 'Cancelada', cor: 'bg-red-400' }
  ]

  // Aplicar todos os filtros
  const aulasFiltradas = aulas.filter(aula => {
    if (filtroModulo && !aula.nome_modulo?.toLowerCase().includes(filtroModulo.toLowerCase())) {
      return false
    }
    if (filtroNivel && aula.nivel !== filtroNivel) {
      return false
    }
    if (filtroFormato && aula.formato !== filtroFormato) {
      return false
    }
    if (filtroResponsavel && !aula.responsavel?.toLowerCase().includes(filtroResponsavel.toLowerCase())) {
      return false
    }
    return true
  })

  // Obter opções únicas para os filtros
  const modulosUnicos = [...new Set(aulas.map(aula => aula.nome_modulo).filter(Boolean))]
  const niveisUnicos = [...new Set(aulas.map(aula => aula.nivel).filter(Boolean))]
  const formatosUnicos = [...new Set(aulas.map(aula => aula.formato).filter(Boolean))]
  const responsaveisUnicos = [...new Set(aulas.map(aula => aula.responsavel).filter(Boolean))]

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setFiltroModulo('')
    setFiltroNivel('')
    setFiltroFormato('')
    setFiltroResponsavel('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-400">⚠️</div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Erro ao carregar aulas</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <button 
          onClick={fetchAulas}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Kanban - Gestão de Aulas
          </h1>
          <button 
            onClick={fetchAulas}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            🔄 Atualizar
          </button>
        </div>

        {/* Filtros Expandidos */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Módulo:</label>
              <select 
                value={filtroModulo}
                onChange={(e) => setFiltroModulo(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {modulosUnicos.map(modulo => (
                  <option key={modulo} value={modulo}>{modulo}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Nível:</label>
              <select 
                value={filtroNivel}
                onChange={(e) => setFiltroNivel(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {niveisUnicos.map(nivel => (
                  <option key={nivel} value={nivel}>{nivel}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Formato:</label>
              <select 
                value={filtroFormato}
                onChange={(e) => setFiltroFormato(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {formatosUnicos.map(formato => (
                  <option key={formato} value={formato}>{formato}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Responsável:</label>
              <select 
                value={filtroResponsavel}
                onChange={(e) => setFiltroResponsavel(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {responsaveisUnicos.map(responsavel => (
                  <option key={responsavel} value={responsavel}>{responsavel}</option>
                ))}
              </select>
            </div>

            {/* Botão para limpar filtros */}
            {(filtroModulo || filtroNivel || filtroFormato || filtroResponsavel) && (
              <button
                onClick={limparFiltros}
                className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded hover:bg-gray-200 transition-colors"
              >
                🗑️ Limpar Filtros
              </button>
            )}
          </div>
          
          {/* Estatísticas dos filtros */}
          <div className="flex flex-wrap gap-4 items-center mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            <div>
              <span className="font-medium">Total:</span> {aulasFiltradas.length} aulas
            </div>
            <div>
              <span className="font-medium">Concluídas:</span> {aulasFiltradas.filter(a => a.status === 'Concluída').length}
            </div>
            <div>
              <span className="font-medium">Em Preparação:</span> {aulasFiltradas.filter(a => a.status === 'Em Preparação').length}
            </div>
            <div>
              <span className="font-medium">A Fazer:</span> {aulasFiltradas.filter(a => a.status === 'A Fazer').length}
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-6 overflow-x-auto pb-4">
        {statusColunas.map(({ nome, cor }) => (
          <KanbanColumn 
            key={nome}
            status={nome}
            aulas={aulasFiltradas}
            cor={cor}
          />
        ))}
      </div>
    </div>
  )
}

export default KanbanBoard