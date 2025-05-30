import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { adminService } from '../../services/adminService';
import {
  BarChart3,
  Users,
  BookOpen,
  TrendingUp,
  RefreshCw,
  Shield,
  Settings,
  Download,
  FileText,
  UserCheck,
  Eye,
  Crown,
  Activity,
  Calendar,
  Award
} from 'lucide-react';

const ProfessoresAdminPanel = () => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para estatísticas
  const [estatisticasGerais, setEstatisticasGerais] = useState({});
  const [estatisticasAlunos, setEstatisticasAlunos] = useState({});
  const [estatisticasProfessores, setEstatisticasProfessores] = useState({});
  const [estatisticasConteudos, setEstatisticasConteudos] = useState({});
  const [ultimosAlunos, setUltimosAlunos] = useState([]);
  const [alunosAtivos, setAlunosAtivos] = useState([]);
  
  // Estados de filtros
  const [periodoFiltro, setPeriodoFiltro] = useState('30dias');
  const [visualizacaoAtiva, setVisualizacaoAtiva] = useState('geral');

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      // Verificar se o adminService existe e tem as funções necessárias
      if (!adminService || typeof adminService.getEstatisticasGerais !== 'function') {
        console.warn('⚠️ adminService não encontrado, usando dados mock');
        setEstatisticasGerais({
          total_alunos: 45,
          total_professores: 8,
          total_conteudos: 127,
          acessos_mes: 892
        });
        setEstatisticasAlunos({
          ativos: 32,
          novos: 12,
          retencao: 78,
          por_instrumento: {
            piano: 18,
            violao: 12,
            bateria: 8,
            baixo: 4,
            voz: 3
          },
          por_nivel: {
            iniciante: 25,
            intermediario: 15,
            avancado: 5
          }
        });
        setEstatisticasProfessores({
          total: 8,
          conteudos_criados: 23,
          media_visualizacoes: 156,
          ativos: 7,
          top_professores: [
            { nome: 'Prof. João Silva', conteudos: 15, visualizacoes: 234 },
            { nome: 'Prof. Maria Santos', conteudos: 12, visualizacoes: 198 },
            { nome: 'Prof. Carlos Lima', conteudos: 8, visualizacoes: 167 }
          ]
        });
        setEstatisticasConteudos({
          total: 127,
          visualizacoes: 3456,
          downloads: 892,
          media_visualizacoes: 27,
          por_tipo: {
            sacada: 45,
            video: 32,
            material: 28,
            devocional: 22
          }
        });
        setUltimosAlunos([
          { nome: 'Ana Costa', instrumento: 'Piano', nivel: 'Iniciante', created_at: new Date(), ativo: true },
          { nome: 'Pedro Silva', instrumento: 'Violão', nivel: 'Intermediário', created_at: new Date(), ativo: true },
          { nome: 'Julia Santos', instrumento: 'Bateria', nivel: 'Iniciante', created_at: new Date(), ativo: false }
        ]);
        setLoading(false);
        return;
      }

      const [
        gerais,
        alunos,
        professores,
        conteudos,
        ultimos,
        ativos
      ] = await Promise.all([
        adminService.getEstatisticasGerais().catch(() => ({ data: {} })),
        adminService.getEstatisticasAlunos(periodoFiltro).catch(() => ({ data: {} })),
        adminService.getEstatisticasProfessores().catch(() => ({ data: {} })),
        adminService.getEstatisticasConteudos().catch(() => ({ data: {} })),
        adminService.getUltimosAlunos(10).catch(() => ({ data: [] })),
        adminService.getAlunosAtivos(20).catch(() => ({ data: [] }))
      ]);

      setEstatisticasGerais(gerais.data || {});
      setEstatisticasAlunos(alunos.data || {});
      setEstatisticasProfessores(professores.data || {});
      setEstatisticasConteudos(conteudos.data || {});
      setUltimosAlunos(ultimos.data || []);
      setAlunosAtivos(ativos.data || []);
      
    } catch (err) {
      setError('Erro ao carregar dados administrativos');
      console.error('🚫 Erro ao carregar dados admin:', err);
    } finally {
      setLoading(false);
    }
  }, [periodoFiltro]);

  useEffect(() => {
    // Verificar se é admin 
    if (userProfile?.tipo_usuario !== 'admin' && user?.nivel_acesso !== 'admin') {
      setError('Acesso negado. Apenas administradores podem acessar esta área.');
      setLoading(false);
      return;
    }
    
    carregarDados();
  }, [userProfile, user, carregarDados]);

  const StatCard = ({ title, value, subtitle, icon: IconComponent, color, trend }) => (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 ${color} hover:shadow-md transition-all duration-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          {typeof IconComponent === 'string' ? (
            <span className="text-2xl">{IconComponent}</span>
          ) : (
            <IconComponent className="w-6 h-6 text-white" />
          )}
        </div>
      </div>
      {trend && (
        <div className="mt-4 text-sm">
          <span className={`font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↗️' : '↘️'} {trend.value}
          </span>
          <span className="text-gray-500 ml-2">{trend.period}</span>
        </div>
      )}
    </div>
  );

  const ProgressBar = ({ label, value, max, color, showPercentage = true }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className="text-sm text-gray-600">
            {showPercentage ? `${Math.round(percentage)}%` : value}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <p className="text-base text-gray-700">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-base text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header Administrativo */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light mb-2 flex items-center gap-3">
                <Shield className="w-8 h-8" />
                Painel Administrativo - Nipo School
              </h1>
              <p className="text-purple-100">
                Controle completo da escola - Alunos, Professores e Conteúdos
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Seletor de Período */}
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="px-4 py-2 bg-white/20 text-white rounded-xl border border-white/30 focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="7dias" className="text-gray-900">Últimos 7 dias</option>
                <option value="30dias" className="text-gray-900">Últimos 30 dias</option>
                <option value="90dias" className="text-gray-900">Últimos 90 dias</option>
                <option value="todos" className="text-gray-900">Todo período</option>
              </select>

              <button
                onClick={carregarDados}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação por Abas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-red-100">
            {[
              { id: 'geral', label: 'Visão Geral', icon: BarChart3 },
              { id: 'alunos', label: 'Alunos', icon: Users },
              { id: 'professores', label: 'Professores', icon: UserCheck },
              { id: 'conteudos', label: 'Conteúdos', icon: BookOpen },
              { id: 'instrumentos', label: 'Instrumentos', icon: Activity }
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setVisualizacaoAtiva(aba.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  visualizacaoAtiva === aba.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <aba.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{aba.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo por Aba */}
        {visualizacaoAtiva === 'geral' && (
          <>
            {/* Cards de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total de Alunos"
                value={estatisticasGerais.total_alunos || 0}
                subtitle="Usuários cadastrados"
                icon={Users}
                color="border-blue-500"
                trend={{ positive: true, value: '+12%', period: 'este mês' }}
              />
              <StatCard
                title="Professores Ativos"
                value={estatisticasGerais.total_professores || 0}
                subtitle="Educadores da plataforma"
                icon={UserCheck}
                color="border-green-500"
              />
              <StatCard
                title="Conteúdos Publicados"
                value={estatisticasGerais.total_conteudos || 0}
                subtitle="Aulas disponíveis"
                icon={BookOpen}
                color="border-yellow-500"
              />
              <StatCard
                title="Acessos Este Mês"
                value={estatisticasGerais.acessos_mes || 0}
                subtitle="Logins realizados"
                icon={TrendingUp}
                color="border-purple-500"
                trend={{ positive: true, value: '+8%', period: 'vs. mês anterior' }}
              />
            </div>

            {/* Gráficos de Atividade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribuição por Instrumento */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />
                  Alunos por Instrumento
                </h3>
                <div className="space-y-4">
                  {estatisticasAlunos.por_instrumento && Object.entries(estatisticasAlunos.por_instrumento).map(([instrumento, count]) => (
                    <ProgressBar
                      key={instrumento}
                      label={`${instrumento.charAt(0).toUpperCase() + instrumento.slice(1)}`}
                      value={count}
                      max={Math.max(...Object.values(estatisticasAlunos.por_instrumento))}
                      color="bg-gradient-to-r from-blue-500 to-blue-600"
                      showPercentage={false}
                    />
                  ))}
                </div>
              </div>

              {/* Distribuição por Nível */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-500" />
                  Alunos por Nível
                </h3>
                <div className="space-y-4">
                  {estatisticasAlunos.por_nivel && Object.entries(estatisticasAlunos.por_nivel).map(([nivel, count]) => (
                    <ProgressBar
                      key={nivel}
                      label={`${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`}
                      value={count}
                      max={Math.max(...Object.values(estatisticasAlunos.por_nivel))}
                      color="bg-gradient-to-r from-green-500 to-green-600"
                      showPercentage={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {visualizacaoAtiva === 'alunos' && (
          <>
            {/* Estatísticas de Alunos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Alunos Ativos"
                value={estatisticasAlunos.ativos || 0}
                subtitle="Últimos 30 dias"
                icon="✅"
                color="border-green-500"
              />
              <StatCard
                title="Novos Alunos"
                value={estatisticasAlunos.novos || 0}
                subtitle="Este mês"
                icon="🆕"
                color="border-blue-500"
              />
              <StatCard
                title="Taxa de Retenção"
                value={`${estatisticasAlunos.retencao || 0}%`}
                subtitle="Alunos que voltaram"
                icon="🔄"
                color="border-purple-500"
              />
            </div>

            {/* Lista de Últimos Alunos */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-8 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Últimos Alunos Cadastrados
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th> 
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Instrumento</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nível</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Cadastro</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimosAlunos.map((aluno, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {aluno.nome?.charAt(0) || '?'}
                              </span>
                            </div>
                            <span className="font-medium">{aluno.nome || 'Nome não informado'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {aluno.instrumento || 'Não informado'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {aluno.nivel || 'Iniciante'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {aluno.created_at ? new Date(aluno.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            aluno.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {aluno.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {visualizacaoAtiva === 'professores' && (
          <>
            {/* Estatísticas de Professores */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Professores"
                value={estatisticasProfessores.total || 0}
                icon={UserCheck}
                color="border-green-500"
              />
              <StatCard
                title="Conteúdos Criados"
                value={estatisticasProfessores.conteudos_criados || 0}
                subtitle="Este mês"
                icon={FileText}
                color="border-blue-500"
              />
              <StatCard
                title="Média de Visualizações"
                value={estatisticasProfessores.media_visualizacoes || 0}
                subtitle="Por conteúdo"
                icon={Eye}
                color="border-purple-500"
              />
              <StatCard
                title="Professores Ativos"
                value={estatisticasProfessores.ativos || 0}
                subtitle="Últimos 30 dias"
                icon="✅"
                color="border-yellow-500"
              />
            </div>

            {/* Top Professores */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Top Professores por Engajamento
              </h3>
              <div className="space-y-4">
                {estatisticasProfessores.top_professores && estatisticasProfessores.top_professores.map((professor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-500 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-yellow-600 to-yellow-700' :
                        'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{professor.nome}</h4>
                        <p className="text-sm text-gray-600">{professor.conteudos} conteúdos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-gray-900">{professor.visualizacoes}</div>
                      <div className="text-sm text-gray-600">visualizações</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {visualizacaoAtiva === 'conteudos' && (
          <>
            {/* Estatísticas de Conteúdos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Conteúdos"
                value={estatisticasConteudos.total || 0}
                icon={BookOpen}
                color="border-blue-500"
              />
              <StatCard
                title="Visualizações Totais"
                value={estatisticasConteudos.visualizacoes || 0}
                icon={Eye}
                color="border-green-500"
              />
              <StatCard
                title="Downloads"
                value={estatisticasConteudos.downloads || 0}
                icon={Download}
                color="border-purple-500"
              />
              <StatCard
                title="Média por Conteúdo"
                value={`${estatisticasConteudos.media_visualizacoes || 0}`}
                subtitle="visualizações"
                icon={BarChart3}
                color="border-yellow-500"
              />
            </div>

            {/* Conteúdos por Tipo */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-red-500" />
                Distribuição de Conteúdos por Tipo
              </h3>
              <div className="space-y-4">
                {estatisticasConteudos.por_tipo && Object.entries(estatisticasConteudos.por_tipo).map(([tipo, count]) => (
                  <ProgressBar
                    key={tipo}
                    label={`${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`}
                    value={count}
                    max={Math.max(...Object.values(estatisticasConteudos.por_tipo))}
                    color="bg-gradient-to-r from-red-500 to-red-600"
                    showPercentage={false}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {visualizacaoAtiva === 'instrumentos' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Popularidade por Instrumento */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Instrumentos Mais Populares
              </h3>
              <div className="space-y-4">
                {estatisticasAlunos.por_instrumento && Object.entries(estatisticasAlunos.por_instrumento)
                  .sort(([,a], [,b]) => b - a)
                  .map(([instrumento, count], index) => (
                    <div key={instrumento} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {instrumento === 'piano' ? '🎹' :
                           instrumento === 'violao' ? '🎸' :
                           instrumento === 'bateria' ? '🥁' :
                           instrumento === 'baixo' ? '🎸' :
                           instrumento === 'voz' ? '🎤' : '🎵'}
                        </span>
                        <span className="font-medium capitalize">{instrumento}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{count}</div>
                        <div className="text-sm text-gray-600">alunos</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Progressão por Nível */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Progressão dos Alunos
              </h3>
              <div className="space-y-6">
                {estatisticasAlunos.por_nivel && Object.entries(estatisticasAlunos.por_nivel).map(([nivel, count]) => (
                  <div key={nivel}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{nivel}</span>
                      <span className="text-lg font-bold">{count} alunos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          nivel === 'iniciante' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          nivel === 'intermediario' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${(count / Math.max(...Object.values(estatisticasAlunos.por_nivel))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Ações Administrativas */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Ações Administrativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">Relatório Completo</div>
              <div className="text-sm text-gray-600">Exportar dados</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">Gerenciar Alunos</div>
              <div className="text-sm text-gray-600">Lista completa</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">Moderar Conteúdos</div>
              <div className="text-sm text-gray-600">Aprovar/Rejeitar</div>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-center group">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div className="font-medium text-gray-900">Configurações</div>
              <div className="text-sm text-gray-600">Sistema</div>
            </button>
          </div>
        </div>

        {/* Resumo de Atividade Recente */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resumo de Atividade Recente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Últimas 24h:
                  </h4>
                  <ul className="space-y-1">
                    <li>• {estatisticasAlunos.novos || 0} novos alunos cadastrados</li>
                    <li>• {estatisticasProfessores.conteudos_criados || 0} conteúdos publicados</li>
                    <li>• {estatisticasConteudos.visualizacoes || 0} visualizações totais</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" />
                    Destaques:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Piano é o instrumento mais popular</li>
                    <li>• {Math.round((estatisticasAlunos.retencao || 0))}% de taxa de retenção</li>
                    <li>• {estatisticasProfessores.ativos || 0} professores ativos</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    Tendências:
                  </h4>
                  <ul className="space-y-1">
                    <li>• Crescimento de 12% em alunos</li>
                    <li>• Aumento de 8% nos acessos</li>
                    <li>• Engajamento em alta</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresAdminPanel;