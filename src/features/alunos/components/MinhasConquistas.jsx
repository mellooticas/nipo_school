import React, { useState, useEffect } from 'react';
import { Trophy, Star, Award, Target, Clock, Zap } from 'lucide-react';
import { supabase } from '../../shared/lib/supabase/supabaseClient';
import { useAuth } from '../../shared/contexts/AuthContext';

const MinhasConquistas = () => {
  const { user } = useAuth();
  const [conquistas, setConquistas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchConquistas();
    }
  }, [user?.id]);

  const fetchConquistas = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          earned_at,
          achievements!inner(
            id,
            name,
            description,
            category,
            points,
            icon
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setConquistas(data || []);
    } catch (error) {
      console.error('Erro ao buscar conquistas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'progress': Trophy,
      'streak': Zap,
      'time': Clock,
      'skill': Star,
      'special': Award
    };
    return icons[category] || Target;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'progress': 'from-blue-500 to-blue-600',
      'streak': 'from-orange-500 to-red-500',
      'time': 'from-green-500 to-emerald-500',
      'skill': 'from-purple-500 to-pink-500',
      'special': 'from-yellow-500 to-orange-500'
    };
    return colors[category] || 'from-gray-500 to-gray-600';
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-yellow-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-yellow-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
          Minhas Conquistas
        </h2>
        <div className="bg-yellow-50 px-3 py-1 rounded-full">
          <span className="text-yellow-700 font-bold text-sm">{conquistas.length}</span>
        </div>
      </div>

      {conquistas.length === 0 ? (
        <div className="text-center py-8">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma conquista ainda.</p>
          <p className="text-sm text-gray-500 mt-2">Continue praticando para desbloquear!</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {conquistas.map((conquista, index) => {
            const IconComponent = getCategoryIcon(conquista.achievements.category);
            const colorClass = getCategoryColor(conquista.achievements.category);
            
            return (
              <div
                key={index}
                className="flex items-center space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {conquista.achievements.name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {conquista.achievements.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-yellow-600 font-medium">
                      +{conquista.achievements.points} pontos
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(conquista.earned_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MinhasConquistas;