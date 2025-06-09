// features/admin/pages/AdminProfessores.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, ChevronRight, ArrowLeft, Users, Search, Filter, 
  Eye, Edit, Trash2, Plus, UserCheck, BookOpen, Calendar,
  Star, Activity, Mail, Phone, MapPin, Award, TrendingUp,
  Download, RefreshCw, Settings, AlertTriangle
} from 'lucide-react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const AdminProfessores = () => {
  const navigate = useNavigate();
  const [professores, setProfessores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState('nome');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedProfessores, setSelectedProfessores] = useState([]);
  const [stats, setStats] = useState({});

  const fetchProfessores = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Buscando professores na tabela profiles...');

      // ✅ BUSCAR APENAS OS PROFESSORES DA TABELA PROFILES
      const { data: professoresData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'professor')
        .order('joined_at', { ascending: false });

      if (profError) {
        console.error('❌ Erro ao buscar professores:', profError);
        throw profError;
      }

      console.log('👨‍🏫 Professores encontrados:', professoresData?.length || 0);
      console.log('📋 Dados dos professores:', professoresData);

      // ✅ VERIFICAR SE EXISTEM REGISTROS COMPLEMENTARES NA TABELA PROFESSORES
      let professoresComplementares = [];
      try {
        const { data: profComplementarData, error: profCompError } = await supabase
          .from('professores')
          .select('*');

        if (!profCompError && profComplementarData) {
          professoresComplementares = profComplementarData;
          console.log('📝 Dados complementares encontrados:', professoresComplementares.length);
        }
      } catch (err) {
        console.log('ℹ️ Tabela professores não encontrada ou vazia (normal)');
      }

      // ✅ PROCESSAR OS 3 PROFESSORES REAIS
      const processedData = professoresData.map(profile => {
        // Buscar dados complementares se existirem
        const dadosComplementares = professoresComplementares.find(pc => pc.id === profile.id) || {};
        
        // Nome: usar 'nome' primeiro, depois 'full_name'
        let nomeExibicao = profile.nome || profile.full_name || profile.email?.split('@')[0] || 'Professor';

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

        const professorProcessado = {
          id: profile.id,
          nome: nomeExibicao,
          email: profile.email || 'Email não informado',
          avatar: profile.avatar_url || null,
          instrumento: profile.instrument || 'Não especificado',
          especialidade: dadosComplementares.especialidades?.join(', ') || profile.instrument || 'Geral',
          formacao: dadosComplementares.formacao || 'Não informado',
          biografia: dadosComplementares.biografia || profile.bio || 'Não informado',
          status: status,
          ativo: dadosComplementares.ativo !== undefined ? dadosComplementares.ativo : true,
          telefone: profile.phone || 'Não informado',
          endereco: profile.city && profile.state ? `${profile.city}, ${profile.state}` : 'Não informado',
          total_conteudos: 0, // Será implementado quando houver sistema de conteúdos
          total_visualizacoes: 0,
          total_downloads: 0,
          media_visualizacoes: 0,
          ultimo_acesso: profile.last_active || null,
          membro_desde: profile.joined_at,
          profile_completo: !!(profile.nome && profile.instrument && profile.bio),
          pontos: profile.total_points || 0,
          nivel_usuario: profile.user_level || 'beginner',
          criado_em: dadosComplementares.criado_em || profile.joined_at
        };

        console.log(`✅ Professor processado: ${professorProcessado.nome} (${professorProcessado.email})`);
        return professorProcessado;
      });

      console.log('🎯 Total processados:', processedData.length);

      setProfessores(processedData);

      // Calcular estatísticas baseadas nos dados reais
      const totalProfessores = processedData.length;
      const professoresAtivos = processedData.filter(p => p.status === 'ativo').length;
      const professoresModerados = processedData.filter(p => p.status === 'moderado').length;
      const professoresInativos = processedData.filter(p => p.status === 'inativo').length;
      const totalConteudos = processedData.reduce((sum, p) => sum + p.total_conteudos, 0);
      const totalVisualizacoes = processedData.reduce((sum, p) => sum + p.total_visualizacoes, 0);

      const statsCalculadas = {
        total: totalProfessores,
        ativos: professoresAtivos,
        moderados: professoresModerados,
        inativos: professoresInativos,
        total_conteudos: totalConteudos,
        total_visualizacoes: totalVisualizacoes,
        media_conteudos: totalProfessores > 0 ? Math.round(totalConteudos / totalProfessores) : 0
      };

      setStats(statsCalculadas);

      console.log('📊 Estatísticas:', statsCalculadas);
      console.log('✅ Busca finalizada com sucesso!');

    } catch (err) {
      console.error('❌ Erro ao buscar professores:', err);
      setError('Erro ao carregar lista de professores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  // Filtrar e ordenar professores
  const professoresFiltrados = professores
    .filter(prof => {
      const matchSearch = prof.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prof.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prof.instrumento.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus === 'todos' || prof.status === filterStatus;
      
      return matchSearch && matchStatus;
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

  // ✅ FUNÇÃO CORRIGIDA - Atualizar apenas na tabela que existe
  const toggleProfessorStatus = async (professorId, novoStatus) => {
    try {
      // Se a tabela professores existir, atualizar lá
      // Senão, usar uma abordagem alternativa (como metadata no profiles)
      let updateSuccess = false;

      try {
        const { error: profError } = await supabase
          .from('professores')
          .update({ ativo: novoStatus })
          .eq('id', professorId);

        if (!profError) {
          updateSuccess = true;
          console.log('✅ Status atualizado na tabela professores');
        }
      } catch (err) {
        console.log('ℹ️ Tabela professores não disponível, usando alternativa');
      }

      if (!updateSuccess) {
        // Alternativa: atualizar um campo no profiles ou usar outra estratégia
        console.log('ℹ️ Atualizando status localmente (implementar persistência conforme necessário)');
      }

      // Atualizar estado local
      setProfessores(prev => prev.map(prof => 
        prof.id === professorId 
          ? { ...prof, ativo: novoStatus, status: novoStatus ? prof.status : 'inativo' }
          : prof
      ));

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      alert('Erro ao atualizar status do professor');
    }
  };

  // ✅ FUNÇÃO CORRIGIDA - Não deletar da tabela profiles (é perigoso!)
  const deleteProfessor = async (professorId) => {
    if (!window.confirm('Tem certeza que deseja remover as permissões de professor deste usuário?')) {
      return;
    }

    try {
      // OPÇÃO 1: Apenas alterar o tipo_usuario para 'aluno'
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ tipo_usuario: 'aluno' })
        .eq('id', professorId);

      if (updateError) throw updateError;

      // OPÇÃO 2: Se existir tabela professores, deletar registro complementar
      try {
        await supabase
          .from('professores')
          .delete()
          .eq('id', professorId);
      } catch (err) {
        console.log('ℹ️ Registro complementar não encontrado (normal)');
      }

      // Remover do estado local
      setProfessores(prev => prev.filter(prof => prof.id !== professorId));
      
      console.log('✅ Permissões de professor removidas');
      alert('Usuário convertido para aluno com sucesso!');
      
    } catch (err) {
      console.error('❌ Erro ao remover professor:', err);
      alert('Erro ao remover professor: ' + err.message);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent rounded-full animate-ping border-t-blue-400 mx-auto"></div>
            </div>
            <p className="text-slate-600 font-medium">Carregando professores...</p>
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
                  onClick={fetchProfessores}
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
                    <span className="text-blue-600 font-medium">Professores</span>
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Informações Principais */}
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                    Gestão de Professores
                  </h1>
                  <p className="text-slate-600 mt-2">
                    Gerencie todos os educadores da Nipo School
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
                <div className="text-2xl font-bold text-blue-600">{stats.total_conteudos || 0}</div>
                <div className="text-sm text-slate-600">Conteúdos</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total_visualizacoes || 0}</div>
                <div className="text-sm text-slate-600">Visualizações</div>
              </div>
            </div>
          </div>
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
                placeholder="Buscar professores por nome, email ou instrumento..."
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
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="nome">Ordenar por Nome</option>
                <option value="total_conteudos">Por Conteúdos</option>
                <option value="total_visualizacoes">Por Visualizações</option>
                <option value="membro_desde">Por Data de Cadastro</option>
              </select>

              <button
                onClick={fetchProfessores}
                className="px-4 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-all duration-200"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Resultados da busca */}
          <div className="mt-4 text-sm text-slate-600">
            Mostrando {professoresFiltrados.length} de {professores.length} professores
          </div>
        </div>

        {/* Lista de Professores */}
        <div className="space-y-4">
          {professoresFiltrados.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum professor encontrado</h3>
              <p className="text-slate-600">Tente ajustar os filtros de busca ou adicione novos professores.</p>
            </div>
          ) : (
            professoresFiltrados.map((professor) => {
              const statusConfig = getStatusConfig(professor.status);
              
              return (
                <div key={professor.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Avatar e Info Principal */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                        {professor.avatar ? (
                          <img src={professor.avatar} alt={professor.nome} className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                          <span className="text-white text-xl font-bold">
                            {professor.nome.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-slate-900 truncate">{professor.nome}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1`}>
                            <span>{statusConfig.icon}</span>
                            {statusConfig.label}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{professor.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4" />
                            <span>{professor.instrumento} • {professor.especialidade}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Membro desde {formatDate(professor.membro_desde)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Estatísticas */}
                    <div className="grid grid-cols-3 gap-4 lg:w-80">
                      <div className="text-center p-3 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{professor.total_conteudos}</div>
                        <div className="text-xs text-blue-700">Conteúdos</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{professor.total_visualizacoes}</div>
                        <div className="text-xs text-green-700">Visualizações</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-xl">
                        <div className="text-2xl font-bold text-purple-600">{professor.media_visualizacoes}</div>
                        <div className="text-xs text-purple-700">Média</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:w-32">
                      <button 
                        onClick={() => navigate(`/admin/professores/${professor.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden lg:inline">Ver</span>
                      </button>
                      
                      <button 
                        onClick={() => navigate(`/admin/professores/editar/${professor.id}`)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="hidden lg:inline">Editar</span>
                      </button>
                      
                      <button 
                        onClick={() => deleteProfessor(professor.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden lg:inline">Remover</span>
                      </button>
                    </div>
                  </div>

                  {/* Última atividade */}
                  <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500">
                    <span>Último acesso: {formatLastAccess(professor.ultimo_acesso)}</span>
                    <div className="flex items-center gap-4">
                      {professor.profile_completo ? (
                        <span className="text-green-600">✓ Perfil completo</span>
                      ) : (
                        <span className="text-amber-600">⚠ Perfil incompleto</span>
                      )}
                      <button
                        onClick={() => toggleProfessorStatus(professor.id, !professor.ativo)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          professor.ativo 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {professor.ativo ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfessores;