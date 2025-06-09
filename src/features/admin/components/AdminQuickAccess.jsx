import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useInstruments } from '../../shared/hooks/useInstruments';

import {
  Music,
  Users,
  BookOpen,
  LayoutGrid,
  ArrowRight,
  TrendingUp,
  Activity,
  GraduationCap,
  Award
} from 'lucide-react';

const AdminQuickAccess = () => {
  const navigate = useNavigate();
  const { instrumentos, loading, totalInstrumentos } = useInstruments();

  // Calcular estatísticas rápidas
  const estatisticasRapidas = {
    total_instrumentos: totalInstrumentos,
    total_alunos: instrumentos.reduce((sum, inst) => sum + (inst.estatisticas?.total_alunos || 0), 0),
    total_professores: instrumentos.reduce((sum, inst) => sum + (inst.estatisticas?.total_professores || 0), 0),
    instrumentos_populares: instrumentos
      .sort((a, b) => (b.estatisticas?.total_alunos || 0) - (a.estatisticas?.total_alunos || 0))
      .slice(0, 3)
  };

  return (
    <div className="space-y-8">
      {/* Banner de Acesso aos Instrumentos */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Music className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">🎵 Gestão de Instrumentos</h2>
              <p className="text-blue-100 mb-3">
                Gerencie todos os instrumentos musicais, professores e alunos em um só lugar.
                Visualize estatísticas completas e administre turmas.
              </p>
              <div className="flex items-center gap-4 text-sm text-blue-200">
                <span>✅ {estatisticasRapidas.total_instrumentos} instrumentos</span>
                <span>👥 {estatisticasRapidas.total_alunos} alunos</span>
                <span>👨‍🏫 {estatisticasRapidas.total_professores} professores</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => navigate('/admin/instruments')}
              className="flex items-center gap-3 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all duration-200 font-medium shadow-lg hover:shadow-xl group"
            >
              <Music className="w-5 h-5" />
              <span>Gerenciar Instrumentos</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <div className="text-center text-xs text-blue-200">
              Acesso completo à gestão de instrumentos
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas Rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          onClick={() => navigate('/admin/instruments')}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-blue-500 text-center cursor-pointer hover:shadow-md transition-all duration-200 group"
        >
          <Music className="w-6 h-6 text-blue-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold text-gray-900">{estatisticasRapidas.total_instrumentos}</p>
          <p className="text-xs text-gray-600">Instrumentos</p>
        </div>
        
        <div 
          onClick={() => navigate('/admin/instruments')}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-500 text-center cursor-pointer hover:shadow-md transition-all duration-200 group"
        >
          <Users className="w-6 h-6 text-green-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold text-gray-900">{estatisticasRapidas.total_alunos}</p>
          <p className="text-xs text-gray-600">Alunos Total</p>
        </div>
        
        <div 
          onClick={() => navigate('/admin/instruments')}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-500 text-center cursor-pointer hover:shadow-md transition-all duration-200 group"
        >
          <GraduationCap className="w-6 h-6 text-purple-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold text-gray-900">{estatisticasRapidas.total_professores}</p>
          <p className="text-xs text-gray-600">Professores</p>
        </div>
        
        <div 
          onClick={() => navigate('/admin/kanban')}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-indigo-500 text-center cursor-pointer hover:shadow-md transition-all duration-200 group"
        >
          <LayoutGrid className="w-6 h-6 text-indigo-500 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-2xl font-bold text-gray-900">Kanban</p>
          <p className="text-xs text-gray-600">Aulas</p>
        </div>
      </div>

      {/* Instrumentos Mais Populares */}
      {!loading && estatisticasRapidas.instrumentos_populares.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-500" />
              Instrumentos Mais Populares
            </h3>
            <button
              onClick={() => navigate('/admin/instruments')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estatisticasRapidas.instrumentos_populares.map((instrumento, index) => (
              <div 
                key={instrumento.id}
                onClick={() => navigate(`/admin/instruments/${instrumento.id}`)}
                className="border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    index === 0 ? 'bg-yellow-100' : index === 1 ? 'bg-gray-100' : 'bg-orange-100'
                  }`}>
                    <span className="text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {instrumento.nome}
                    </h4>
                    <p className="text-xs text-gray-500">{instrumento.categoria}</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Alunos:</span>
                  <span className="font-medium text-gray-900">
                    {instrumento.estatisticas?.total_alunos || 0}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Professores:</span>
                  <span className="font-medium text-gray-900">
                    {instrumento.estatisticas?.total_professores || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ações Rápidas */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-gray-500" />
          Ações Rápidas - Sistema de Instrumentos
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => navigate('/admin/instruments')}
            className="p-4 border-2 border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-blue-900">Ver Instrumentos</div>
            <div className="text-sm text-blue-600">Lista completa</div>
          </button>
          
          <button 
            onClick={() => navigate('/admin/instruments')}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Gerenciar Alunos</div>
            <div className="text-sm text-gray-600">Por instrumento</div>
          </button>
          
          <button 
            onClick={() => navigate('/admin/instruments')}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Professores</div>
            <div className="text-sm text-gray-600">Por instrumento</div>
          </button>
          
          <button 
            onClick={() => navigate('/admin/instruments')}
            className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="font-medium text-gray-900">Relatórios</div>
            <div className="text-sm text-gray-600">Estatísticas</div>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuickAccess;