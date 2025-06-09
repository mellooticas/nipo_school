import React from 'react';
import { 
  Star, 
  Flame, 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Target,
  Award,
  Zap,
  Calendar,
  Clock
} from 'lucide-react';

const AlunoStats = ({ userProfile, moduleStats, achievementStats, progressStats, isLoading }) => {
  
  // Calcular estatísticas derivadas
  const totalPontos = userProfile?.total_points || 0;
  const sequenciaAtual = userProfile?.current_streak || 0;
  const aulasCompletas = progressStats?.completedLessons || 0;
  const conquistasTotal = achievementStats?.earned || 0;

  // Calcular nível baseado em pontos
  const calculateLevel = (points) => {
    if (points < 100) return { level: 1, next: 100, progress: points, percentage: (points / 100) * 100 };
    if (points < 300) return { level: 2, next: 300, progress: points - 100, percentage: ((points - 100) / 200) * 100 };
    if (points < 600) return { level: 3, next: 600, progress: points - 300, percentage: ((points - 300) / 300) * 100 };
    if (points < 1000) return { level: 4, next: 1000, progress: points - 600, percentage: ((points - 600) / 400) * 100 };
    return { level: 5, next: null, progress: points, percentage: 100 };
  };

  const levelInfo = calculateLevel(totalPontos);

  // Calcular progresso geral (média ponderada)
  const progressoGeral = Math.round(
    (moduleStats?.averageProgress || 0) * 0.4 + // 40% peso para módulos
    (Math.min(sequenciaAtual * 10, 100)) * 0.3 + // 30% peso para sequência (máx 10 dias = 100%)
    (Math.min(aulasCompletas * 5, 100)) * 0.3 // 30% peso para aulas (máx 20 aulas = 100%)
  );

  // Definir cor baseada no progresso
  const getProgressColor = (progress) => {
    if (progress >= 80) return 'from-green-500 to-emerald-600';
    if (progress >= 60) return 'from-blue-500 to-indigo-600';
    if (progress >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-pink-600';
  };

  const progressColor = getProgressColor(progressoGeral);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Card Principal de Progresso */}
      <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            Progresso Geral
          </h2>
          <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-blue-700 font-bold text-sm">Nível {levelInfo.level}</span>
          </div>
        </div>

        {/* Círculo de Progresso Grande */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 border-8 border-gray-200 rounded-full flex items-center justify-center relative bg-white shadow-lg">
              <div className="text-center">
                <span className="text-3xl font-bold text-gray-800 block">
                  {isLoading ? '...' : `${progressoGeral}%`}
                </span>
                <p className="text-xs text-gray-500 font-medium">PROGRESSO</p>
              </div>
            </div>
            {/* Círculo de progresso animado */}
            <svg className="absolute inset-0 w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className={`text-transparent`}
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={`bg-gradient-to-r ${progressColor}`}
                style={{
                  strokeDasharray: `${2 * Math.PI * 56}`,
                  strokeDashoffset: `${2 * Math.PI * 56 * (1 - progressoGeral / 100)}`,
                  stroke: progressoGeral >= 80 ? '#10b981' : progressoGeral >= 60 ? '#3b82f6' : progressoGeral >= 40 ? '#f59e0b' : '#ef4444'
                }}
              />
            </svg>
          </div>
        </div>

        {/* Barra de Nível */}
        {levelInfo.next && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Próximo Nível ({levelInfo.level + 1})</span>
              <span className="font-medium">
                {levelInfo.progress} / {levelInfo.next - (levelInfo.level === 1 ? 0 : levelInfo.level === 2 ? 100 : levelInfo.level === 3 ? 300 : 600)} pontos
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-1000"
                style={{ width: `${levelInfo.percentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {isLoading ? '...' : `${moduleStats?.averageProgress || 0}%`}
                </p>
                <p className="text-xs text-blue-700 font-medium">Módulos</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center space-x-3">
              <Target className="w-6 h-6 text-purple-500" />
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {isLoading ? '...' : aulasCompletas}
                </p>
                <p className="text-xs text-purple-700 font-medium">Aulas Feitas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card de Estatísticas Rápidas */}
      <div className="space-y-4">
        
        {/* Pontos */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-amber-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : totalPontos.toLocaleString()}
              </p>
              <p className="text-sm text-amber-700 font-medium">Total de Pontos</p>
            </div>
          </div>
        </div>

        {/* Sequência */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-red-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : sequenciaAtual}
              </p>
              <p className="text-sm text-red-700 font-medium">Dias Seguidos</p>
            </div>
          </div>
        </div>

        {/* Conquistas */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-emerald-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : conquistasTotal}
              </p>
              <p className="text-sm text-emerald-700 font-medium">Conquistas</p>
            </div>
          </div>
        </div>

        {/* Meta da Semana */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-purple-900 flex items-center">
              <Zap className="w-4 h-4 mr-2" />
              Meta Semanal
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">Praticar 5 dias</span>
              <span className="text-sm font-bold text-purple-900">
                {Math.min(sequenciaAtual, 5)}/5
              </span>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((sequenciaAtual / 5) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlunoStats;