// pages/professores/admin/Kanban.jsx
import React from 'react'
import { Calendar, LayoutGrid, Plus, Settings } from 'lucide-react'
import KanbanBoard from '../../../components/kanban/KanbanBoard'

const Kanban = () => {
  return (
    <div className="space-y-6">
      {/* Header da Página - Integrado ao Layout */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>Admin</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Kanban Aulas</span>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <LayoutGrid className="w-7 h-7 text-purple-600" />
            Gestão de Aulas - Kanban
          </h1>
          <p className="text-gray-600 mt-1">
            Organize e acompanhe o status das aulas por módulos
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Nova Aula */}
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Aula</span>
          </button>

          {/* Botão Calendário */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendário</span>
          </button>

          {/* Botão Configurações */}
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Config</span>
          </button>
        </div>
      </div>

      {/* Alertas/Notificações (opcional) */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-5 h-5 text-blue-500 mt-0.5">ℹ️</div>
          <div>
            <h3 className="font-medium text-blue-900">Sistema Kanban Ativo</h3>
            <p className="text-blue-700 text-sm mt-1">
              Arraste os cartões entre as colunas para alterar o status das aulas. 
              Clique em qualquer cartão para ver detalhes completos.
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board Principal */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <KanbanBoard />
      </div>

      {/* Rodapé com Informações */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-6">
            <span>📊 Dashboard atualizado em tempo real</span>
            <span>🔄 Sincronização automática</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
            <button className="text-purple-600 hover:text-purple-700 font-medium">
              Atualizar dados
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Kanban