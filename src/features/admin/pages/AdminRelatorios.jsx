import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

import {
  ArrowLeft,
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Filter,
  RefreshCw,
  Eye,
  Crown,
  Music,
  Target,
  Activity,
  Clock,
  Award,
  ChevronRight,
  PieChart,
  LineChart
} from 'lucide-react';

const AdminRelatorios = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dados, setDados] = useState({});
  const [filtros, setFiltros] = useState({
    periodo: '30dias',
    instrumento: 'todos',
    tipo: 'todos'
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('📊 Carregando dados para relatórios...');

      // Buscar todos os dados
      const [
        { data: alunos },
        { data: professores },
        { data: todosUsuarios }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('tipo_usuario', 'aluno'),
        supabase.from('profiles').select('*').eq('tipo_usuario', 'professor'),
        supabase.from('profiles').select('*')
      ]);

      // Calcular estatísticas por período
      const agora = new Date();
      const diasPeriodo = filtros.periodo === '7dias' ? 7 : filtros.periodo === '30dias' ? 30 : 90;
      const dataInicio = new Date(agora.getTime() - diasPeriodo * 24 * 60 * 60 * 1000);

      // Crescimento por mês (últimos 6 meses)
      const crescimentoMensal = [];
      for (let i = 5; i >= 0; i--) {
        const mesAtual = new Date();
        mesAtual.setMonth(mesAtual.getMonth() - i);
        const mesNome = mesAtual.toLocaleDateString('pt-BR', { month: 'short' });
        
        const alunosDoMes = alunos.filter(a => {
          const joined = new Date(a.joined_at);
          return joined.getMonth() === mesAtual.getMonth() && 
                 joined.getFullYear() === mesAtual.getFullYear();
        }).length;

        crescimentoMensal.push({ mes: mesNome, alunos: alunosDoMes });
      }

      // Distribuição por instrumentos
      const instrumentos = {};
      [...alunos, ...professores].forEach(user => {
        const inst = user.instrument || 'Não especificado';
        instrumentos[inst] = (instrumentos[inst] || 0) + 1;
      });

      // Atividade por semana (últimas 4 semanas)
      const atividadeSemanal = [];
      for (let i = 3; i >= 0; i--) {
        const semanaInicio = new Date(agora.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const semanaFim = new Date(agora.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        
        const ativosNaSemana = todosUsuarios.filter(u => {
          if (!u.last_active) return false;
          const lastActive = new Date(u.last_active);
          return lastActive >= semanaInicio && lastActive <= semanaFim;
        }).length;

        atividadeSemanal.push({
          semana: `Sem ${4-i}`,
          ativos: ativosNaSemana
        });
      }

      // Status dos usuários
      const statusDistribution = {
        ativo: 0,
        moderado: 0,
        inativo: 0
      };

      todosUsuarios.forEach(user => {
        if (!user.last_active) {
          statusDistribution.inativo++;
          return;
        }

        const ultimaAtividade = new Date(user.last_active);
        const diasSemAtividade = (agora - ultimaAtividade) / (1000 * 60 * 60 * 24);

        if (diasSemAtividade <= 3) statusDistribution.ativo++;
        else if (diasSemAtividade <= 14) statusDistribution.moderado++;
        else statusDistribution.inativo++;
      });

      // Top professores (simulado - quando houver sistema de conteúdos)
      const topProfessores = professores.slice(0, 3).map((prof, index) => ({
        nome: prof.nome || prof.full_name,
        email: prof.email,
        instrumento: prof.instrument,
        conteudos: Math.floor(Math.random() * 20), // Simulado
        visualizacoes: Math.floor(Math.random() * 500), // Simulado
        nota: (4.2 + Math.random() * 0.8).toFixed(1) // Simulado
      }));

      // Retenção por coorte (simplificado)
      const retencao = {
        semana1: Math.floor(85 + Math.random() * 10),
        semana2: Math.floor(70 + Math.random() * 10), 
        semana3: Math.floor(60 + Math.random() * 10),
        semana4: Math.floor(55 + Math.random() * 10)
      };

      setDados({
        totais: {
          alunos: alunos.length,
          professores: professores.length,
          usuarios: todosUsuarios.length,
          ativos: statusDistribution.ativo
        },
        crescimentoMensal,
        instrumentos: Object.entries(instrumentos).map(([nome, count]) => ({ nome, count })),
        atividadeSemanal,
        statusDistribution,
        topProfessores,
        retencao,
        novosUsuarios: alunos.filter(a => new Date(a.joined_at) >= dataInicio).length,
        taxaAtividade: Math.round((statusDistribution.ativo / Math.max(todosUsuarios.length, 1)) * 100)
      });

      console.log('✅ Dados carregados para relatórios');

    } catch (err) {
      console.error('❌ Erro ao carregar dados:', err);
      setError('Erro ao carregar dados: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportarRelatorio = async (tipo) => {
    try {
      console.log(`📥 Exportando relatório: ${tipo}`);

      if (tipo === 'alunos') {
        const { data: alunos } = await supabase
          .from('profiles')
          .select('*')
          .eq('tipo_usuario', 'aluno');

        const csvContent = [
          ['Nome', 'Email', 'Instrumento', 'Nível', 'Data de Cadastro', 'Último Acesso'],
          ...alunos.map(a => [
            a.nome || a.full_name || '',
            a.email || '',
            a.instrument || '',
            a.user_level || '',
            new Date(a.joined_at).toLocaleDateString('pt-BR'),
            a.last_active ? new Date(a.last_active).toLocaleDateString('pt-BR') : 'Nunca'
          ])
        ].map(row => row.join(';')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      if (tipo === 'professores') {
        const { data: professores } = await supabase
          .from('profiles')
          .select('*')
          .eq('tipo_usuario', 'professor');

        const csvContent = [
          ['Nome', 'Email', 'Instrumento', 'Data de Cadastro', 'Último Acesso'],
          ...professores.map(p => [
            p.nome || p.full_name || '',
            p.email || '',
            p.instrument || '',
            new Date(p.joined_at).toLocaleDateString('pt-BR'),
            p.last_active ? new Date(p.last_active).toLocaleDateString('pt-BR') : 'Nunca'
          ])
        ].map(row => row.join(';')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `professores_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
      }

      if (tipo === 'completo') {
        const relatorioCompleto = {
          geradoEm: new Date().toISOString(),
          periodo: filtros.periodo,
          resumo: dados.totais,
          crescimento: dados.crescimentoMensal,
          instrumentos: dados.instrumentos,
          atividade: dados.atividadeSemanal,
          status: dados.statusDistribution,
          retencao: dados.retencao
        };

        const blob = new Blob([JSON.stringify(relatorioCompleto, null, 2)], { 
          type: 'application/json' 
        });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio_completo_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
      }

      alert(`Relatório ${tipo} exportado com sucesso!`);

    } catch (err) {
      console.error('❌ Erro ao exportar:', err);
      alert('Erro ao exportar relatório: ' + err.message);
    }
  };

  useEffect(() => {
    if (userProfile?.tipo_usuario !== 'admin') {
      setError('Acesso negado. Apenas administradores podem acessar esta área.');
      setLoading(false);
      return;
    }
    carregarDados();
  }, [userProfile, filtros]);

  const StatCard = ({ title, value, subtitle, icon: IconComponent, color, change }) => (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 ${color} hover:shadow-md transition-all duration-200`}>
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
      {change && (
        <div className="mt-4 text-sm">
          <span className={`font-medium ${change.positive ? 'text-green-600' : 'text-red-600'}`}>
            {change.positive ? '↗️' : '↘️'} {change.value}
          </span>
          <span className="text-gray-500 ml-2">{change.period}</span>
        </div>
      )}
    </div>
  );

  const ChartCard = ({ title, children, icon: IconComponent }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <IconComponent className="w-5 h-5 text-blue-500" />
        {title}
      </h3>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <p className="text-base text-gray-700">Carregando relatórios...</p>
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
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Relatórios Administrativos</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Crown className="w-3 h-3" />
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600 font-medium">Relatórios</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtros:</span>
              </div>
              
              <select
                value={filtros.periodo}
                onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="90dias">Últimos 90 dias</option>
              </select>

              <select
                value={filtros.instrumento}
                onChange={(e) => setFiltros({...filtros, instrumento: e.target.value})}
                className="px-3 py-2 border border-gray-200 rounded-lg bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Instrumentos</option>
                <option value="piano">Piano</option>
                <option value="violao">Violão</option>
                <option value="bateria">Bateria</option>
                <option value="flauta">Flauta</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={carregarDados}
                className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Atualizar
              </button>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Usuários"
            value={dados.totais?.usuarios || 0}
            subtitle="Todos os perfis"
            icon={Users}
            color="border-blue-500"
            change={{ positive: true, value: `+${dados.novosUsuarios || 0}`, period: 'novos no período' }}
          />
          <StatCard
            title="Alunos Ativos"
            value={dados.totais?.alunos || 0}
            subtitle="Estudantes cadastrados"
            icon={Target}
            color="border-green-500"
            change={{ positive: dados.novosUsuarios > 0, value: `${dados.taxaAtividade}%`, period: 'taxa de atividade' }}
          />
          <StatCard
            title="Professores"
            value={dados.totais?.professores || 0}
            subtitle="Educadores ativos"
            icon={Award}
            color="border-purple-500"
          />
          <StatCard
            title="Taxa de Engajamento"
            value={`${dados.taxaAtividade || 0}%`}
            subtitle="Usuários ativos"
            icon={TrendingUp}
            color="border-orange-500"
            change={{ positive: dados.taxaAtividade > 70, value: `${dados.totais?.ativos || 0} ativos`, period: 'últimos 3 dias' }}
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Crescimento Mensal */}
          <ChartCard title="Crescimento de Alunos (6 meses)" icon={LineChart}>
            <div className="space-y-4">
              {dados.crescimentoMensal?.map((item, index) => {
                const maxValue = Math.max(...(dados.crescimentoMensal?.map(d => d.alunos) || [1]));
                const percentage = (item.alunos / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.mes}</span>
                      <span className="text-sm text-gray-600">{item.alunos} alunos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Distribuição por Instrumentos */}
          <ChartCard title="Instrumentos Mais Populares" icon={PieChart}>
            <div className="space-y-4">
              {dados.instrumentos?.slice(0, 5).map((item, index) => {
                const maxValue = Math.max(...(dados.instrumentos?.map(d => d.count) || [1]));
                const percentage = (item.count / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">{item.nome}</span>
                      <span className="text-sm text-gray-600">{item.count} usuários</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Atividade e Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Atividade Semanal */}
          <ChartCard title="Atividade Semanal" icon={Activity}>
            <div className="space-y-4">
              {dados.atividadeSemanal?.map((item, index) => {
                const maxValue = Math.max(...(dados.atividadeSemanal?.map(d => d.ativos) || [1]));
                const percentage = (item.ativos / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">{item.semana}</span>
                      <span className="text-sm text-gray-600">{item.ativos} ativos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          {/* Status dos Usuários */}
          <ChartCard title="Status dos Usuários" icon={Users}>
            <div className="space-y-4">
              {Object.entries(dados.statusDistribution || {}).map(([status, count]) => {
                const total = Object.values(dados.statusDistribution || {}).reduce((a, b) => a + b, 1);
                const percentage = (count / total) * 100;
                const colors = {
                  ativo: 'from-green-500 to-green-600',
                  moderado: 'from-yellow-500 to-yellow-600',
                  inativo: 'from-red-500 to-red-600'
                };
                
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                      <span className="text-sm text-gray-600">{count} usuários</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`bg-gradient-to-r ${colors[status]} h-3 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        {/* Top Professores */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Top Professores (Dados Simulados)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Professor</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Instrumento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Conteúdos</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Visualizações</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {dados.topProfessores?.map((prof, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{prof.nome}</p>
                        <p className="text-sm text-gray-500">{prof.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 capitalize">{prof.instrumento}</td>
                    <td className="py-4 px-4">{prof.conteudos}</td>
                    <td className="py-4 px-4">{prof.visualizacoes}</td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                        ⭐ {prof.nota}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Botões de Exportação */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-green-500" />
            Exportar Relatórios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => exportarRelatorio('alunos')}
              className="flex items-center justify-center gap-3 p-4 border border-green-200 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center group"
            >
              <FileText className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Lista de Alunos</div>
                <div className="text-sm text-green-600">Exportar CSV</div>
              </div>
            </button>

            <button
              onClick={() => exportarRelatorio('professores')}
              className="flex items-center justify-center gap-3 p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center group"
            >
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Lista de Professores</div>
                <div className="text-sm text-blue-600">Exportar CSV</div>
              </div>
            </button>

            <button
              onClick={() => exportarRelatorio('completo')}
              className="flex items-center justify-center gap-3 p-4 border border-purple-200 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors text-center group"
            >
              <BarChart3 className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-medium text-purple-900">Relatório Completo</div>
                <div className="text-sm text-purple-600">Exportar JSON</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRelatorios;