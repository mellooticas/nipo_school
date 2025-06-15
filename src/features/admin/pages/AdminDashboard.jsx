import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

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
  Award,
  LayoutGrid,
  ArrowRight,
  Music,
  GraduationCap,
  Bell,
  Clock,
  Target,
  Zap,
  Globe,
  Database,
  ChevronRight,
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  QrCode,
  LogOut  // 🚀 ADICIONADO PARA LOGOUT
} from 'lucide-react';

const AdminDashboard = () => {
  // 🚀 ADICIONADO LOGOUT AO useAuth
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para dados reais
  const [dadosReais, setDadosReais] = useState({
    alunos: [],
    professores: [],
    estatisticas: {},
    atividade: []
  });
  
  // Estados de interface
  const [periodoFiltro, setPeriodoFiltro] = useState('30dias');
  const [visualizacaoAtiva, setVisualizacaoAtiva] = useState('geral');
  const [refreshing, setRefreshing] = useState(false);

  // 🚀 FUNÇÃO DE LOGOUT ADICIONADA
  const handleLogout = async () => {
    if (window.confirm('Tem certeza que deseja sair da conta de administrador?')) {
      try {
        await logout();
        navigate('/login', { replace: true });
      } catch (err) {
        console.error('Erro ao fazer logout:', err);
        alert('Erro ao sair da conta: ' + err.message);
      }
    }
  };

  // ✅ VERSÃO CORRIGIDA - Usando apenas a tabela profiles
  const carregarDadosReais = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Carregando dados reais do dashboard...');

      // Buscar todos os dados da tabela profiles (que já tem tudo organizado)
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('last_active', { ascending: false });

      if (profilesError) {
        console.error('Erro ao buscar profiles:', profilesError);
        throw new Error(`Erro ao carregar usuários: ${profilesError.message}`);
      }

      console.log('📊 Dados brutos recebidos:', {
        total_profiles: allProfiles?.length || 0,
        tipos: allProfiles?.reduce((acc, p) => {
          acc[p.tipo_usuario || 'sem_tipo'] = (acc[p.tipo_usuario || 'sem_tipo'] || 0) + 1;
          return acc;
        }, {})
      });

      // Filtrar e processar alunos
      const alunosRaw = allProfiles.filter(p => p.tipo_usuario === 'aluno');
      const alunosProcessados = alunosRaw.map(aluno => ({
        id: aluno.id,
        nome: aluno.nome || aluno.full_name || aluno.email?.split('@')[0] || 'Sem nome',
        email: aluno.email || 'Sem email',
        instrumento: aluno.instrument || 'Não especificado',
        nivel: aluno.user_level || 'beginner',
        joined_at: aluno.joined_at,
        last_active: aluno.last_active,
        total_points: aluno.total_points || 0,
        lessons_completed: aluno.lessons_completed || 0,
        modules_completed: aluno.modules_completed || 0,
        current_streak: aluno.current_streak || 0,
        status: calcularStatus(aluno.last_active),
        tipo: 'aluno'
      }));

      // Filtrar e processar professores
      const professoresRaw = allProfiles.filter(p => p.tipo_usuario === 'professor');
      const professoresProcessados = professoresRaw.map(prof => ({
        id: prof.id,
        nome: prof.nome || prof.full_name || prof.email?.split('@')[0] || 'Sem nome',
        email: prof.email || 'Sem email',
        instrumento: prof.instrument || 'Não especificado',
        nivel: prof.user_level || 'advanced',
        joined_at: prof.joined_at,
        last_active: prof.last_active,
        total_points: prof.total_points || 0,
        status: calcularStatus(prof.last_active),
        tipo: 'professor'
      }));

      // Filtrar admins
      const adminsRaw = allProfiles.filter(p => p.tipo_usuario === 'admin');

      // Calcular estatísticas
      const agora = new Date();
      const ultimoMes = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ultimaSemana = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const alunosNovos = alunosProcessados.filter(a => 
        a.joined_at && new Date(a.joined_at) >= ultimoMes
      ).length;
      
      const alunosAtivos = alunosProcessados.filter(a => a.status === 'ativo').length;
      const professoresAtivos = professoresProcessados.filter(p => p.status === 'ativo').length;
      
      // Distribuição por instrumentos
      const instrumentos = {};
      [...alunosProcessados, ...professoresProcessados].forEach(user => {
        const inst = (user.instrumento || 'outros').toLowerCase().trim();
        instrumentos[inst] = (instrumentos[inst] || 0) + 1;
      });

      // Distribuição por níveis (só alunos)
      const niveis = {};
      alunosProcessados.forEach(aluno => {
        const nivel = aluno.nivel || 'beginner';
        niveis[nivel] = (niveis[nivel] || 0) + 1;
      });

      // Atividade recente - todos os usuários
      const atividadeRecente = allProfiles
        .filter(u => u.last_active && u.tipo_usuario) // Só usuários com atividade e tipo
        .sort((a, b) => new Date(b.last_active) - new Date(a.last_active))
        .slice(0, 10)
        .map(u => ({
          nome: u.nome || u.full_name || u.email?.split('@')[0] || 'Usuário',
          tipo: u.tipo_usuario,
          last_active: u.last_active,
          action: 'login'
        }));

      const estatisticas = {
        total_alunos: alunosProcessados.length,
        total_professores: professoresProcessados.length,
        total_admins: adminsRaw.length,
        alunos_novos: alunosNovos,
        alunos_ativos: alunosAtivos,
        professores_ativos: professoresAtivos,
        total_usuarios: allProfiles.length,
        instrumentos_populares: Object.entries(instrumentos)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        distribuicao_niveis: niveis,
        taxa_atividade: Math.round((alunosAtivos / Math.max(alunosProcessados.length, 1)) * 100),
        crescimento_mensal: alunosNovos,
        // Novas métricas
        pontos_total: alunosProcessados.reduce((sum, a) => sum + a.total_points, 0),
        aulas_completadas: alunosProcessados.reduce((sum, a) => sum + a.lessons_completed, 0),
        streak_medio: Math.round(
          alunosProcessados.reduce((sum, a) => sum + a.current_streak, 0) / Math.max(alunosProcessados.length, 1)
        )
      };

      setDadosReais({
        alunos: alunosProcessados,
        professores: professoresProcessados,
        admins: adminsRaw,
        estatisticas,
        atividade: atividadeRecente
      });

      console.log('✅ Dados processados com sucesso:', {
        alunos: alunosProcessados.length,
        professores: professoresProcessados.length,
        admins: adminsRaw.length,
        estatisticas: {
          total: estatisticas.total_usuarios,
          ativos: estatisticas.alunos_ativos + estatisticas.professores_ativos,
          instrumentos: estatisticas.instrumentos_populares.length
        }
      });

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calcularStatus = (lastActive) => {
    if (!lastActive) return 'inativo';
    
    const agora = new Date();
    const ultimaAtividade = new Date(lastActive);
    const diasSemAcesso = (agora - ultimaAtividade) / (1000 * 60 * 60 * 24);
    
    if (diasSemAcesso <= 3) return 'ativo';
    if (diasSemAcesso <= 14) return 'moderado';
    return 'inativo';
  };

  const refreshData = async () => {
    setRefreshing(true);
    await carregarDadosReais();
    setRefreshing(false);
  };

  useEffect(() => {
    if (userProfile?.tipo_usuario !== 'admin') {
      setError('Acesso negado. Apenas administradores podem acessar esta área.');
      setLoading(false);
      return;
    }
    
    carregarDadosReais();
  }, [userProfile, carregarDadosReais]);

  // Componentes auxiliares
  const StatCard = ({ title, value, subtitle, icon: IconComponent, color, trend, onClick }) => (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 ${color} hover:shadow-lg transition-all duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
          <IconComponent className="w-6 h-6 text-white" />
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

  const ActionButton = ({ title, description, icon: IconComponent, color, onClick, featured = false }) => (
    <button 
      onClick={onClick}
      className={`p-4 ${featured ? 'border-2' : 'border'} ${color} rounded-xl hover:shadow-md transition-all duration-200 text-center group w-full`}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${featured ? 'from-blue-500 to-purple-600' : 'from-gray-500 to-gray-600'} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <div className={`font-medium ${featured ? 'text-blue-900' : 'text-gray-900'}`}>{title}</div>
      <div className={`text-sm ${featured ? 'text-blue-600' : 'text-gray-600'}`}>{description}</div>
    </button>
  );

  const QuickStatsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total de Alunos"
        value={dadosReais.estatisticas.total_alunos || 0}
        subtitle="Estudantes cadastrados"
        icon={GraduationCap}
        color="border-blue-500"
        trend={{ positive: true, value: `+${dadosReais.estatisticas.alunos_novos || 0}`, period: 'este mês' }}
        onClick={() => navigate('/admin/alunos')}
      />
      <StatCard
        title="Professores Ativos"
        value={dadosReais.estatisticas.total_professores || 0}
        subtitle="Educadores da plataforma"
        icon={UserCheck}
        color="border-green-500"
        onClick={() => navigate('/admin/professores')}
      />
      <StatCard
        title="Taxa de Atividade"
        value={`${dadosReais.estatisticas.taxa_atividade || 0}%`}
        subtitle="Alunos ativos recentemente"
        icon={Activity}
        color="border-purple-500"
        trend={{ positive: dadosReais.estatisticas.taxa_atividade > 70, value: `${dadosReais.estatisticas.alunos_ativos} ativos`, period: 'últimos 3 dias' }}
      />
      <StatCard
        title="Instrumentos"
        value={dadosReais.estatisticas.instrumentos_populares?.length || 0}
        subtitle="Diferentes categorias"
        icon={Music}
        color="border-orange-500"
        onClick={() => navigate('/admin/instruments')}
      />
    </div>
  );

  const MainNavigationGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      <ActionButton
        title="Gestão de Alunos"
        description={`${dadosReais.estatisticas.total_alunos} alunos`}
        icon={GraduationCap}
        color="border-2 border-green-200 bg-green-50 hover:bg-green-100"
        onClick={() => navigate('/admin/alunos')}
        featured={true}
      />
      <ActionButton
        title="Gestão de Professores"
        description={`${dadosReais.estatisticas.total_professores} professores`}
        icon={UserCheck}
        color="border-2 border-blue-200 bg-blue-50 hover:bg-blue-100"
        onClick={() => navigate('/admin/professores')}
        featured={true}
      />
      
      {/* 🚀 QR CODES */}
      <ActionButton
        title="QR Codes"
        description="Sistema de presença"
        icon={QrCode}
        color="border-2 border-purple-200 bg-purple-50 hover:bg-purple-100"
        onClick={() => navigate('/admin/qr-manager')}
        featured={true}
      />
      
      <ActionButton
        title="Kanban de Aulas"
        description="Gestão visual"
        icon={LayoutGrid}
        color="border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
        onClick={() => navigate('/admin/kanban')}
        featured={true}
      />
      <ActionButton
        title="Instrumentos"
        description="Sistema completo"
        icon={Music}
        color="border-2 border-orange-200 bg-orange-50 hover:bg-orange-100"
        onClick={() => navigate('/admin/instruments')}
        featured={true}
      />
    </div>
  );

  const RecentActivityPanel = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Atividade Recente
        </h3>
        <button 
          onClick={refreshData}
          disabled={refreshing}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {dadosReais.atividade.map((atividade, index) => (
          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              atividade.tipo === 'admin' ? 'bg-red-500 text-white' :
              atividade.tipo === 'professor' ? 'bg-blue-500 text-white' :
              'bg-green-500 text-white'
            }`}>
              {atividade.nome.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{atividade.nome}</p>
              <p className="text-xs text-gray-500 capitalize">
                {atividade.tipo} • {new Date(atividade.last_active).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-xs text-gray-400">
              {new Date(atividade.last_active).toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PopularInstrumentsPanel = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-500" />
        Instrumentos Mais Populares
      </h3>
      
      <div className="space-y-4">
        {dadosReais.estatisticas.instrumentos_populares?.map(([instrumento, count], index) => {
          const maxCount = dadosReais.estatisticas.instrumentos_populares[0]?.[1] || 1;
          const percentage = (count / maxCount) * 100;
          
          return (
            <div key={instrumento} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 capitalize">{instrumento}</span>
                <span className="text-sm text-gray-600">{count} usuários</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

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
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-base text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors"
            >
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* 🚀 Header Administrativo com LOGOUT */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light mb-2 flex items-center gap-3">
                <Crown className="w-8 h-8" />
                Dashboard Administrativo
              </h1>
              <p className="text-purple-100 mb-2">
                Gestão completa da Nipo School - {dadosReais.estatisticas.total_usuarios} usuários
              </p>
              <div className="flex items-center gap-4 text-sm text-purple-200">
                <span>👑 {userProfile?.full_name || userProfile?.nome || 'Administrador'}</span>
                <span>•</span>
                <span>📧 {userProfile?.email}</span>
                <span>•</span>
                <span>📊 {dadosReais.estatisticas.alunos_ativos} ativos hoje</span>
                <span>•</span>
                <span>🎯 {dadosReais.estatisticas.crescimento_mensal} novos este mês</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="px-4 py-2 bg-white/20 text-white rounded-xl border border-white/30 focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
              >
                <option value="7dias" className="text-gray-900">Últimos 7 dias</option>
                <option value="30dias" className="text-gray-900">Últimos 30 dias</option>
                <option value="90dias" className="text-gray-900">Últimos 90 dias</option>
              </select>

              <button
                onClick={refreshData}
                disabled={refreshing}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              {/* 🚀 BOTÃO DE LOGOUT */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/80 hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2 border border-red-400"
                title="Sair da conta de administrador"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas Principais */}
        <QuickStatsGrid />

        {/* Navegação Principal */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Áreas Principais
          </h2>
          <MainNavigationGrid />
        </div>

        {/* Seção de Dados em Tempo Real */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <RecentActivityPanel />
          <PopularInstrumentsPanel />
        </div>

        {/* Ações Secundárias */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-500" />
            Ações Administrativas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionButton
              title="Relatórios"
              description="Exportar dados"
              icon={FileText}
              color="border border-gray-200 hover:bg-gray-50"
              onClick={() => navigate('/admin/relatorios')}
            />
            <ActionButton
              title="Configurações"
              description="Sistema"
              icon={Settings}
              color="border border-gray-200 hover:bg-gray-50"
              onClick={() => navigate('/admin/configuracoes')}
            />
            <ActionButton
              title="Backup"
              description="Segurança"
              icon={Database}
              color="border border-gray-200 hover:bg-gray-50"
              onClick={() => alert('Função em desenvolvimento')}
            />
            <ActionButton
              title="Logs" 
              description="Auditoria"
              icon={Activity}
              color="border border-gray-200 hover:bg-gray-50"
              onClick={() => navigate('/admin/logs')}
            />
          </div>
        </div>

        {/* Resumo Final */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Resumo Executivo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Hoje:
                  </h4>
                  <ul className="space-y-1">
                    <li>• {dadosReais.estatisticas.alunos_ativos} alunos ativos</li>
                    <li>• {dadosReais.estatisticas.professores_ativos} professores online</li>
                    <li>• {dadosReais.atividade.length} ações registradas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <Award className="w-4 h-4 text-green-500" />
                    Destaques:
                  </h4>
                  <ul className="space-y-1">
                    <li>• {dadosReais.estatisticas.instrumentos_populares?.[0]?.[0] || 'N/A'} é o mais popular</li>
                    <li>• {dadosReais.estatisticas.taxa_atividade}% de taxa de atividade</li>
                    <li>• Sistema funcionando normalmente</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    Crescimento:
                  </h4>
                  <ul className="space-y-1">
                    <li>• +{dadosReais.estatisticas.crescimento_mensal} alunos este mês</li>
                    <li>• Tendência positiva</li>
                    <li>• Engajamento crescente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
            <p className="text-gray-600 mb-2 flex items-center justify-center gap-2">
              <Crown className="w-4 h-4" />
              Dashboard Administrativo - Nipo School
            </p>
            <p className="text-sm text-gray-500">
              Sistema de gestão completo • Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-400">
              <span>🔄 Dados em tempo real</span>
              <span>📊 {dadosReais.estatisticas.total_usuarios} usuários totais</span>
              <span>⚡ Performance otimizada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;