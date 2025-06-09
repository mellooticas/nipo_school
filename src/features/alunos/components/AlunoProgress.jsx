import React from 'react';
import { Flame, Star, BookOpen, Trophy, TrendingUp, Target } from 'lucide-react';

const AlunoProgress = ({ userProfile, moduleStats, achievementStats, progressStats, isLoading }) => {
  
  // Calcular nível baseado em pontos
  const calculateLevel = (points) => {
    if (points < 100) return { level: 1, next: 100, progress: points };
    if (points < 300) return { level: 2, next: 300, progress: points - 100 };
    if (points < 600) return { level: 3, next: 600, progress: points - 300 };
    if (points < 1000) return { level: 4, next: 1000, progress: points - 600 };
    return { level: 5, next: null, progress: points };
  };

  const levelInfo = calculateLevel(userProfile?.total_points || 0);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
          Seu Progresso
        </h2>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="text-blue-700 font-bold text-sm">Nível {levelInfo.level}</span>
        </div>
      </div>

      {/* Progress Circle Detalhado */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-200 rounded-full flex items-center justify-center relative bg-white shadow-md">
            <div className="text-center">
              <span className="text-2xl font-bold text-blue-600 block">
                {isLoading ? '...' : `${moduleStats.averageProgress}%`}
              </span>
              <p className="text-xs text-gray-500 font-medium">MÓDULOS</p>
            </div>
          </div>
          <div 
            className="absolute inset-0 w-24 h-24 border-4 border-blue-500 rounded-full"
            style={{
              background: `conic-gradient(from 0deg, #3b82f6 ${(moduleStats.averageProgress || 0) * 3.6}deg, transparent 0deg)`
            }}
          ></div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center space-x-3">
            <Star className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : (userProfile?.total_points || 0)}
              </p>
              <p className="text-xs text-amber-700 font-medium">Total de Pontos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center space-x-3">
            <Flame className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : (userProfile?.current_streak || 0)}
              </p>
              <p className="text-xs text-red-700 font-medium">Dias Consecutivos</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : progressStats.completedLessons}
              </p>
              <p className="text-xs text-blue-700 font-medium">Aulas Concluídas</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl border border-emerald-200">
          <div className="flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? '...' : achievementStats.earned}
              </p>
              <p className="text-xs text-emerald-700 font-medium">Conquistas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Nível */}
      {levelInfo.next && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Próximo Nível ({levelInfo.level + 1})</span>
            <span className="font-medium">
              {levelInfo.progress} / {levelInfo.next - (levelInfo.level === 1 ? 0 : levelInfo.level === 2 ? 100 : levelInfo.level === 3 ? 300 : 600)} pontos
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(levelInfo.progress / (levelInfo.next - (levelInfo.level === 1 ? 0 : levelInfo.level === 2 ? 100 : levelInfo.level === 3 ? 300 : 600))) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Metas da Semana */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2" />
          Metas da Semana
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">Praticar 5 dias</span>
            <span className="text-sm font-bold text-purple-900">
              {userProfile?.current_streak || 0}/5
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">Completar 3 aulas</span>
            <span className="text-sm font-bold text-purple-900">
              {Math.min(progressStats.completedLessons || 0, 3)}/3
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-purple-700">Ganhar 100 pontos</span>
            <span className="text-sm font-bold text-purple-900">
              {Math.min(userProfile?.total_points || 0, 100)}/100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlunoProgress;