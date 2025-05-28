import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { 
  Plus, 
  Eye, 
  Download, 
  TrendingUp, 
  BookOpen,
  Video,
  Lightbulb,
  Heart,
  FileText,
  Calendar,
  Activity,
  Grid,
  BarChart3,
  User,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../shared/lib/supabase/supabaseClient';

const ProfessoresDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalConteudos: 0,
    totalVisualizacoes: 0,
    totalDownloads: 0,
    conteudosPorTipo: {
      video: 0,
      sacada: 0,
      devocional: 0,
      material: 0
    }
  });
  const [recentConteudos, setRecentConteudos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas
  useEffect(() => {
    if (userProfile?.id) {
      loadDashboardData();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar estatísticas do professor logado
      const { data: conteudos, error } = await supabase
        .from('professores_conteudos')
        .select('*')
        .eq('criado_por', userProfile.id)
        .eq('ativo', true);

      if (error) throw error;

      // Calcular estatísticas
      const totalConteudos = conteudos.length;
      const totalVisualizacoes = conteudos.reduce((sum, item) => sum + (item.visualizacoes || 0), 0);
      const totalDownloads = conteudos.reduce((sum, item) => sum + (item.downloads || 0), 0);

      const conteudosPorTipo = {
        video: conteudos.filter(c => c.tipo === 'video').length,
        sacada: conteudos.filter(c => c.tipo === 'sacada').length,
        devocional: conteudos.filter(c => c.tipo === 'devocional').length,
        material: conteudos.filter(c => c.tipo === 'material').length
      };

      setStats({
        totalConteudos,
        totalVisualizacoes,
        totalDownloads,
        conteudosPorTipo
      });

      // Últimos conteúdos (limitado a 5)
      const recentContent = conteudos
        .sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em))
        .slice(0, 5);
      
      setRecentConteudos(recentContent);

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Componente de Card de Estatística
  const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Componente de Card de Conteúdo
  const ConteudoCard = ({ conteudo }) => {
    const getTypeIcon = (tipo) => {
      switch (tipo) {
        case 'video': return <Video className="w-4 h-4" />;
        case 'sacada': return <Lightbulb className="w-4 h-4" />;
        case 'devocional': return <Heart className="w-4 h-4" />;
        case 'material': return <FileText className="w-4 h-4" />;
        default: return <BookOpen className="w-4 h-4" />;
      }
    };

    const getTypeColor = (tipo) => {
      switch (tipo) {
        case 'video': return 'bg-blue-100 text-blue-800';
        case 'sacada': return 'bg-yellow-100 text-yellow-800';
        case 'devocional': return 'bg-purple-100 text-purple-800';
        case 'material': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{conteudo.titulo}</h3>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ml-2 ${getTypeColor(conteudo.tipo)}`}>
            {getTypeIcon(conteudo.tipo)}
            <span className="ml-1 capitalize">{conteudo.tipo}</span>
          </span>
        </div>
        
        {conteudo.descricao && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{conteudo.descricao}</p>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              <span>{conteudo.visualizacoes || 0}</span>
            </div>
            <div className="flex items-center">
              <Download className="w-4 h-4 mr-1" />
              <span>{conteudo.downloads || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(conteudo.criado_em).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link to="/dashboard" className="hover:text-gray-700 transition-colors">
          Dashboard Principal
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">Área dos Professores</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bem-vindo, {userProfile?.full_name || 'Professor'}! 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus conteúdos e acompanhe o engajamento dos alunos
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/professores/novo"
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Criar Conteúdo
          </Link>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Conteúdos"
          value={stats.totalConteudos}
          icon={BookOpen}
          color="bg-blue-500"
          trend="+12% este mês"
        />
        <StatsCard
          title="Visualizações"
          value={stats.totalVisualizacoes.toLocaleString()}
          icon={Eye}
          color="bg-green-500"
          trend="+8% esta semana"
        />
        <StatsCard
          title="Downloads"
          value={stats.totalDownloads.toLocaleString()}
          icon={Download}
          color="bg-purple-500"
          trend="+15% este mês"
        />
        <StatsCard
          title="Engajamento"
          value="94%"
          icon={Activity}
          color="bg-orange-500"
          trend="+5% esta semana"
        />
      </div>

      {/* Conteúdos por Tipo e Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Tipos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Conteúdos por Tipo</h3>
            <div className="space-y-4">
              {[
                { tipo: 'video', label: 'Vídeos', count: stats.conteudosPorTipo.video, color: 'bg-blue-500', icon: Video },
                { tipo: 'sacada', label: 'Sacadas', count: stats.conteudosPorTipo.sacada, color: 'bg-yellow-500', icon: Lightbulb },
                { tipo: 'devocional', label: 'Devocionais', count: stats.conteudosPorTipo.devocional, color: 'bg-purple-500', icon: Heart },
                { tipo: 'material', label: 'Materiais', count: stats.conteudosPorTipo.material, color: 'bg-red-500', icon: FileText }
              ].map((item) => {
                const IconComponent = item.icon;
                const percentage = stats.totalConteudos > 0 ? (item.count / stats.totalConteudos) * 100 : 0;
                
                return (
                  <div key={item.tipo} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 ${item.color} rounded-lg flex items-center justify-center mr-3`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{item.label}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-gray-900">{item.count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 ${item.color} rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conteúdos Recentes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Conteúdos Recentes</h3>
              <Link
                to="/professores/minha-area"
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>

            {recentConteudos.length > 0 ? (
              <div className="space-y-3">
                {recentConteudos.map((conteudo) => (
                  <ConteudoCard key={conteudo.id} conteudo={conteudo} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum conteúdo ainda</h4>
                <p className="text-gray-500 mb-4">
                  Comece criando seu primeiro conteúdo para compartilhar conhecimento!
                </p>
                <Link
                  to="/professores/novo"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Conteúdo
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions Rápidas */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/professores/novo"
            className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Criar Conteúdo</p>
              <p className="text-sm text-gray-500">Nova sacada ou material</p>
            </div>
          </Link>

          <Link
            to="/professores/conteudos"
            className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <Grid className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Ver Conteúdos</p>
              <p className="text-sm text-gray-500">Explorar biblioteca</p>
            </div>
          </Link>

          <Link
            to="/professores/estatisticas"
            className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Estatísticas</p>
              <p className="text-sm text-gray-500">Ver métricas</p>
            </div>
          </Link>

          <Link
            to="/professores/minha-area"
            className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors group"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Minha Área</p>
              <p className="text-sm text-gray-500">Meus conteúdos</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Dicas e Lembretes */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6">
        <div className="flex items-start">
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Dica do Dia</h3>
            <p className="text-gray-700 mb-3">
              Para aumentar o engajamento dos seus conteúdos, adicione tags relevantes e use títulos 
              descritivos que despertem curiosidade nos alunos.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>📚 {stats.totalConteudos} conteúdos criados</span>
              <span>👀 {stats.totalVisualizacoes} visualizações totais</span>
              <span>⬇️ {stats.totalDownloads} downloads</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresDashboard;