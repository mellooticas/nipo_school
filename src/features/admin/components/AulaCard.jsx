// components/kanban/AulaCard.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'

const AulaCard = ({ aula }) => {
  const navigate = useNavigate()

  const formatarData = (data) => {
    if (!data) return 'Data não definida'
    return new Date(data).toLocaleDateString('pt-BR')
  }

  const getStatusColor = (status) => {
    const colors = {
      'A Fazer': 'bg-gray-100 text-gray-800 border-gray-300',
      'Em Preparação': 'bg-blue-100 text-blue-800 border-blue-300',
      'Concluída': 'bg-green-100 text-green-800 border-green-300',
      'Revisão': 'bg-yellow-100 text-yellow-800 border-yellow-300', 
      'Cancelada': 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getNivelIcon = (nivel) => {
    const icons = {
      'Iniciante': '🟢',
      'Intermediário': '🟡', 
      'Avançado': '🔴'
    }
    return icons[nivel] || '⚪'
  }

  const getFormatoIcon = (formato) => {
    const icons = {
      'Presencial': '🏫',
      'Online': '💻',
      'Híbrido': '🔄'
    }
    return icons[formato] || '📍'
  }

  const handleCardClick = () => {
    // ✅ ROTA CORRIGIDA - Agora vai para área administrativa correta
    navigate(`/admin/aulas/${aula.id}`)
  }

  return (
    <div 
      className={`p-4 bg-white rounded-lg shadow-sm border-l-4 hover:shadow-md transition-shadow cursor-pointer ${getStatusColor(aula.status)}`}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">
          Aula {aula.numero}: {aula.titulo}
        </h3>
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">
            #{aula.numero}
          </span>
          {aula.nivel && (
            <span className="text-xs" title={`Nível: ${aula.nivel}`}>
              {getNivelIcon(aula.nivel)}
            </span>
          )}
        </div>
      </div>
      
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium">📅</span>
            <span className="ml-1">{formatarData(aula.data_programada)}</span>
          </div>
          {aula.formato && (
            <span className="text-xs" title={`Formato: ${aula.formato}`}>
              {getFormatoIcon(aula.formato)}
            </span>
          )}
        </div>
        
        {aula.nome_modulo && (
          <div className="flex items-center">
            <span className="font-medium">📚</span>
            <span className="ml-1 truncate">{aula.nome_modulo}</span>
          </div>
        )}
        
        {aula.responsavel && (
          <div className="flex items-center">
            <span className="font-medium">👤</span>
            <span className="ml-1 truncate">{aula.responsavel}</span>
          </div>
        )}
      </div>
      
      {aula.objetivo_didatico && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed">
            🎯 {aula.objetivo_didatico}
          </p>
        </div>
      )}

      {/* Indicadores de conteúdo disponível */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          {aula.desafio_alpha && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded" title="Tem Desafio Alpha">
              🚀
            </span>
          )}
          {aula.resumo_atividades && (
            <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded" title="Tem Atividades">
              📋
            </span>
          )}
        </div>
        
        <div className="text-xs text-gray-400 hover:text-gray-600">
          Clique para detalhes →
        </div>
      </div>
    </div>
  )
}
 
export default AulaCard