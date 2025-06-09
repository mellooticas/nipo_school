// features/admin/pages/AdminAlunos.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, ChevronRight, ArrowLeft, Users, Search, Filter, 
  Eye, Edit, Trash2, Plus, UserCheck, BookOpen, Calendar,
  Star, Activity, Mail, Phone, MapPin, Award, TrendingUp,
  Download, RefreshCw, Settings, AlertTriangle, GraduationCap,
  Music, Clock, BarChart3
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const AdminAlunos = () => {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterInstrument, setFilterInstrument] = useState('todos');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedAlunos, setSelectedAlunos] = useState([]);
  const [stats, setStats] = useState({});

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando alunos na tabela profiles...');

      // ✅ BUSCAR APENAS OS ALUNOS DA TABELA PROFILES
      const { data: alunosData, error: alunoError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'aluno')
        .order('joined_at', { ascending: false });

      if (alunoError) {
        console.error('❌ Erro ao buscar alunos:', alunoError);
        throw alunoError;
      }

      console.log('👨‍🎓 Alunos encontrados:', alunosData?.length || 0);
      console.log('📋 Dados dos alunos:', alunosData);

      // ✅ BUSCAR POSSÍVEIS DADOS COMPLEMENTARES (progresso, notas, etc.)
      let progressoAlunos = [];
      try {
        const { data: progressoData, error: progError } = await supabase
          .from('aluno_progresso')
          .select('*');

        if (!progError && progressoData) {
          progressoAlunos = progressoData;
          console.log('📈 Dados de progresso encontrados:', progressoAlunos.length);
        }
      } catch (err) {
        console.log('ℹ️ Tabela de progresso não encontrada (normal)');
      }

      // ✅ PROCESSAR OS 10 ALUNOS REAIS
      const processedData = alunosData.map(profile => {
        // Buscar dados de progresso se existirem
        const progresso = progressoAlunos.find(p => p.aluno_id === profile.id) || {};
        
        // Nome: usar 'nome' primeiro, depois 'full_name'
        let nomeExibicao = profile.nome || profile.full_name || profile.email?.split('@')[0] || 'Aluno';

        // Status baseado na atividade
        let status = 'inativo';
        if (profile.last_active) {
          const ultimoAcesso = new Date(profile.last_active);
          const agora = new Date();
          const diasSemAcesso = (agora - ultimoAcesso) / (1000 * 60 * 60 * 24);
          
          if (diasSemAcesso <= 7) status = 'ativo';
          else if (diasSemAcesso <= 30) status = 'moderado';
          else status = 'inativo';
        }

        // Calcular tempo como aluno
        const tempoComoAluno = profile.joined_at ? 
          Math.floor((new Date() - new Date(profile.joined_at)) / (1000 * 60 * 60 * 24)) : 0;

        const alunoProcessado = {
          id: profile.id,
          nome: nomeExibicao,
          email: profile.email || 'Email não informado',
          avatar: profile.avatar_url || null,
          instrumento: profile.instrument || 'Não especificado',
          nivel: profile.user_level || 'beginner',
          status: status,
          ativo: true, // Todos os que estão como aluno são ativos por padrão
          telefone: profile.phone || 'Não informado',
          endereco: profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Não informado',
          bio: profile.bio || 'Não informado',
          pontos: profile.total_points || 0,
          ultimo_acesso: profile.last_active || null,
          membro_desde: profile.joined_at,
          tempo_como_aluno: tempoComoAluno,
          profile_completo: !!(profile.nome && profile.instrument && profile.bio),
          
          // Dados de progresso (simulados por enquanto)
          aulas_assistidas: progresso.aulas_assistidas || 0,
          exercicios_completados: progresso.exercicios_completados || 0,
          tempo_pratica: progresso.tempo_pratica_minutos || 0,
          nivel_progresso: progresso.nivel_atual || 'Iniciante',
          proxima_aula: progresso.proxima_aula || null,
          professor_preferido: progresso.professor_preferido || null,
          
          // Estatísticas calculadas
          media_semanal: progresso.media_horas_semana || 0,
          streak_dias: progresso.streak_dias || 0,
          conquistas: progresso.conquistas || 0
        };

        console.log(`✅ Aluno processado: ${alunoProcessado.nome} (${alunoProcessado.email})`);
        return alunoProcessado;
      });

      console.log('🎯 Total processados:', processedData.length);

      setAlunos(processedData);

      // ✅ CALCULAR ESTATÍSTICAS BASEADAS NOS DADOS REAIS
      const totalAlunos = processedData.length;
      const alunosAtivos = processedData.filter(a => a.status === 'ativo').length;
      const alunosModerados = processedData.filter(a => a.status === 'moderado').length;
      const alunosInativos = processedData.filter(a => a.status === 'inativo').length;
      
      // Estatísticas por instrumento
      const instrumentos = [...new Set(processedData.map(a => a.instrumento))];
      const estatisticasInstrumentos = instrumentos.map(inst => ({
        instrumento: inst,
        quantidade: processedData.filter(a => a.instrumento === inst).length
      }));

      // Estatísticas de progresso
      const totalAulasAssistidas = processedData.reduce((sum, a) => sum + a.aulas_assistidas, 0);
      const totalExercicios = processedData.reduce((sum, a) => sum + a.exercicios_completados, 0);
      const totalTempoPratica = processedData.reduce((sum, a) => sum + a.tempo_pratica, 0);

      const statsCalculadas = {
        total: totalAlunos,
        ativos: alunosAtivos,
        moderados: alunosModerados,
        inativos: alunosInativos,
        instrumentos: estatisticasInstrumentos,
        total_aulas: totalAulasAssistidas,
        total_exercicios: totalExercicios,
        total_tempo_pratica: Math.round(totalTempoPratica / 60), // Converter para horas
        media_tempo_pratica: totalAlunos > 0 ? Math.round(totalTempoPratica / totalAlunos) : 0,
        instrumento_mais_popular: estatisticasInstrumentos.length > 0 ? 
          estatisticasInstrumentos.reduce((a, b) => a.quantidade > b.quantidade ? a : b).instrumento : 'N/A'
      };

      setStats(statsCalculadas);

      console.log('📊 Estatísticas:', statsCalculadas);
      console.log('✅ Busca de alunos finalizada com sucesso!');

    } catch (err) {
      console.error('❌ Erro ao buscar alunos:', err);
      setError('Erro ao carregar lista de alunos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  // Filtrar e ordenar alunos
  const alunosFiltrados = alunos
    .filter(aluno => {
      const matchSearch = aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         aluno.instrumento.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === 'todos' || aluno.status === filterStatus;
      const matchInstrument = filterInstrument === 'todos' || aluno.instrumento === filterInstrument;
      
      return matchSearch && matchStatus && matchInstrument;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Função para atualizar status do aluno
  const toggleAlunoStatus = async (alunoId, novoStatus) => {
    try {
      // Atualizar estado local (implementar persistência conforme necessário)
      setAlunos(prev => prev.map(aluno => 
        aluno.id === alunoId 
          ? { ...aluno, ativo: novoStatus, status: novoStatus ? aluno.status : 'inativo' }
          : aluno
      ));

      console.log('✅ Status do aluno atualizado localmente');
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      alert('Erro ao atualizar status do aluno');
    }
  };

  // Função para "promover" aluno para professor
  const promoverParaProfessor = async (alunoId) => {
    if (!window.confirm('Tem certeza que deseja promover este aluno para professor?')) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tipo_usuario: 'professor' })
        .eq('id', alunoId);

      if (updateError) throw updateError;

      // Remover do estado local
      setAlunos(prev => prev.filter(aluno => aluno.id !== alunoId));
      
      console.log('✅ Aluno promovido para professor');
      alert('Aluno promovido para professor com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao promover aluno:', err);
      alert('Erro ao promover aluno: ' + err.message);
    }
  };

  // Função para deletar aluno (converte para usuário comum)
  const deleteAluno = async (alunoId) => {
    if (!window.confirm('Tem certeza que deseja remover este aluno? Ele será convertido para usuário comum.')) {
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tipo_usuario: 'usuario' })
        .eq('id', alunoId);

      if (updateError) throw updateError;

      // Remover do estado local
      setAlunos(prev => prev.filter(aluno => aluno.id !== alunoId));
      
      console.log('✅ Aluno removido');
      alert('Aluno convertido para usuário comum com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao remover aluno:', err);
      alert('Erro ao remover aluno: ' + err.message);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      ativo: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: '🟢', 
        label: 'Ativo' 
      },
      moderado: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: '🟡', 
        label: 'Moderado' 
      },
      inativo: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: '🔴', 
        label: 'Inativo' 
      }
    };
    return configs[status] || configs.inativo;
  };

  const getNivelConfig = (nivel) => {
    const configs = {
      beginner: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Iniciante' },
      intermediate: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Intermediário' },
      advanced: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Avançado' },
      expert: { bg: 'bg-red-100', text: 'text-red-800', label: 'Expert' }
    };
    return configs[nivel] || configs.beginner;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatLastAccess = (dateString) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoje';
    if (diffDays === 2) return 'Ontem';
    if (diffDays <= 7) return `${diffDays} dias atrás`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
    return `${Math.ceil(diffDays / 30)} meses atrás`;
  };

  const formatTempoPratica = (minutos) => {
    if (minutos < 60) return `${minutos}min`;
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  };

  // Obter lista única de instrumentos para o filtro
  const instrumentosUnicos = [...new Set(alunos.map(a => a.instrumento))].sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
            </div>
            <p className="text-slate-600 font-medium">Carregando alunos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-pink-50">
        <div className="flex items-center justify-center h-screen">
          <div className="max-w-md w-full mx-4">
            <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Erro ao carregar</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <button 
                  onClick={fetchAlunos}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  Tentar Novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Administrativo */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Painel Administrativo</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-blue-600 font-medium">Alunos</span>
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

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Informações Principais */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Gestão de Alunos
                  </h1>
                  <p className="text-slate-600 mt-2">
                    Acompanhe o progresso e gerencie todos os estudantes da Nipo School
                  </p>
                </div>
              </div>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg text-center">
                <div className="text-2xl font-bold text-slate-900">{stats.total || 0}</div>
                <div className="text-sm text-slate-600">Total</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg text-center">
                <div className="text-2xl font-bold text-green-600">{stats.ativos || 0}</div>
                <div className="text-sm text-slate-600">Ativos</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_aulas || 0}</div>
                <div className="text-sm text-slate-600">Aulas</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total_tempo_pratica || 0}h</div>
                <div className="text-sm text-slate-600">Prática</div>
              </div>
            </div>
          </div>

          {/* Estatísticas por Instrumento */}
          {stats.instrumentos && stats.instrumentos.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribuição por Instrumentos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stats.instrumentos.map(inst => (
                  <div key={inst.instrumento} className="bg-white/60 backdrop-blur-sm rounded-xl p-3 border border-white/50 shadow-sm text-center">
                    <div className="text-lg font-bold text-slate-900">{inst.quantidade}</div>
                    <div className="text-xs text-slate-600 capitalize">{inst.instrumento}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar alunos por nome, email ou instrumento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="moderado">Moderados</option>
                <option value="inativo">Inativos</option>
              </select>

              <select
                value={filterInstrument}
                onChange={(e) => setFilterInstrument(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os Instrumentos</option>
                {instrumentosUnicos.map(inst => (
                  <option key={inst} value={inst} className="capitalize">{inst}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="nome">Ordenar por Nome</option>
                <option value="membro_desde">Por Data de Cadastro</option>
                <option value="ultimo_acesso">Por Último Acesso</option>
                <option value="pontos">Por Pontos</option>
                <option value="aulas_assistidas">Por Aulas Assistidas</option>
              </select>

              <button
                onClick={fetchAlunos}
                className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Resultados da busca */}
          <div className="mt-4 text-sm text-slate-600">
            Mostrando {alunosFiltrados.length} de {alunos.length} alunos
          </div>
        </div>

        {/* Lista de Alunos */}
        <div className="space-y-4">
          {alunosFiltrados.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum aluno encontrado</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca.</p>
            </div>
          ) : (
            alunosFiltrados.map((aluno) => {
              const statusConfig = getStatusConfig(aluno.status);
              const nivelConfig = getNivelConfig(aluno.nivel);
              
              return (
                <div key={aluno.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Avatar e Info Principal */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        {aluno.avatar ? (
                          <img src={aluno.avatar} alt={aluno.nome} className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {aluno.nome.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{aluno.nome}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                            <span>{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${nivelConfig.bg} ${nivelConfig.text}`}>
                            {nivelConfig.label}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{aluno.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Music className="w-4 h-4" />
                            <span className="capitalize">{aluno.instrumento}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Aluno há {aluno.tempo_como_aluno} dias</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas de Progresso */}
                    <div className="grid grid-cols-4 gap-3 lg:w-96">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-lg font-bold text-blue-600">{aluno.aulas_assistidas}</div>
                        <div className="text-xs text-blue-700">Aulas</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-lg font-bold text-green-600">{aluno.exercicios_completados}</div>
                        <div className="text-xs text-green-700">Exercícios</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="text-lg font-bold text-purple-600">{formatTempoPratica(aluno.tempo_pratica)}</div>
                        <div className="text-xs text-purple-700">Prática</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-xl">
                        <div className="text-lg font-bold text-orange-600">{aluno.pontos}</div>
                        <div className="text-xs text-orange-700">Pontos</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:w-36">
                      <button 
                        onClick={() => navigate(`/admin/alunos/${aluno.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden lg:inline">Ver Perfil</span>
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/admin/alunos/editar/${aluno.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden lg:inline">Editar</span>
                      </button>
                      
                      <button 
                        onClick={() => promoverParaProfessor(aluno.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-sm"
                      >
                        <Award className="w-4 h-4" />
                        <span className="hidden lg:inline">Promover</span>
                      </button>
                      
                      <button 
                        onClick={() => deleteAluno(aluno.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden lg:inline">Remover</span>
                      </button>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="mt-6 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      {/* Última atividade */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>Último acesso: {formatLastAccess(aluno.ultimo_acesso)}</span>
                      </div>

                      {/* Status do perfil */}
                      <div className="flex items-center gap-2">
                        {aluno.profile_completo ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-green-600 text-sm">Perfil completo</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                            <span className="text-amber-600 text-sm">Perfil incompleto</span>
                          </>
                        )}
                      </div>

                      {/* Progresso atual */}
                      <div className="flex items-center gap-2 text-slate-600">
                        <BarChart3 className="w-4 h-4" />
                        <span>Nível: {aluno.nivel_progresso}</span>
                      </div>
                    </div>

                    {/* Ações adicionais */}
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Membro desde {formatDate(aluno.membro_desde)}</span>
                        {aluno.streak_dias > 0 && (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Star className="w-4 h-4" />
                            {aluno.streak_dias} dias seguidos
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAlunoStatus(aluno.id, !aluno.ativo)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            aluno.ativo 
                              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {aluno.ativo ? 'Desativar' : 'Ativar'}
                        </button>
                        
                        <button
                          onClick={() => navigate(`/admin/alunos/progresso/${aluno.id}`)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full text-xs font-medium transition-colors"
                        >
                          Ver Progresso
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Ações em Lote (se houver alunos selecionados) */}
        {selectedAlunos.length > 0 && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-xl p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">
                  {selectedAlunos.length} aluno(s) selecionado(s)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Implementar ação em lote
                      console.log('Exportar dados dos alunos selecionados');
                    }}
                    className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button
                    onClick={() => setSelectedAlunos([])}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAlunos;