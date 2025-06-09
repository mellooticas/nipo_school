import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useInstrumentPage } from '../../shared/hooks/useInstrumentPage';
import { instrumentsService } from '../../services/instrumentsService';

import {
  Music,
  Users,
  GraduationCap,
  BookOpen,
  Activity,
  ChevronLeft,
  RefreshCw,
  Settings,
  BarChart3,
  Target,
  Trophy,
  Star
} from 'lucide-react';

const AdminInstrumentDetails = () => {
  const { instrumentoId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // Usando o hook existente para dados da página do instrumento
  const {
    instrumento,
    alunos,
    professores,
    turmas,
    ranking,
    loading,
    error,
    refresh
  } = useInstrumentPage(instrumentoId);

  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [estatisticas, setEstatisticas] = useState({});
  const [loadingStats, setLoadingStats] = useState(false);

  // Verificar permissões de admin
  useEffect(() => {
    if (userProfile?.tipo_usuario !== 'admin' && user?.user_metadata?.tipo_usuario !== 'admin') {
      navigate('/dashboard');
    }
  }, [userProfile, user, navigate]);

  // Carregar estatísticas detalhadas
  useEffect(() => {
    const carregarEstatisticas = async () => {
      if (!instrumentoId) return;

      try {
        setLoadingStats(true);
        const result = await instrumentsService.getInstrumentStats(instrumentoId);

        if (result.success) {
          setEstatisticas(result.data);
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (instrumentoId) {
      carregarEstatisticas();
    }
  }, [instrumentoId]);

  // Buscar dados do instrumento se não existir
  const [instrumentoInfo, setInstrumentoInfo] = useState(null);

  useEffect(() => {
    const buscarInstrumento = async () => {
      if (instrumento) {
        setInstrumentoInfo(instrumento);
        return;
      }

      try {
        const result = await instrumentsService.getAllInstruments();
        if (result.success) {
          const inst = result.data.find(i => i.id === instrumentoId);
          setInstrumentoInfo(inst);
        }
      } catch (error) {
        console.error('Erro ao buscar instrumento:', error);
      }
    };

    buscarInstrumento();
  }, [instrumentoId, instrumento]);

  // Categoria do instrumento
  const categoria = instrumentoInfo ?
    instrumentsService.getCategorias().find(cat => cat.id === instrumentoInfo.categoria) : null;

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-base text-gray-700">Carregando detalhes do instrumento...</p>
        </div>
      </div>
    );
  }

  if (error || !instrumentoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Instrumento não encontrado</h2>
          <p className="text-base text-gray-700 mb-6">{error || 'Instrumento não existe ou foi removido'}</p>
          <button
            onClick={() => navigate('/admin/instruments')}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
          >
            Voltar à Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate('/admin/instruments')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl">{categoria?.emoji || '🎵'}</span>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-light mb-1">{instrumentoInfo.nome}</h1>
                  <p className="text-red-100 flex items-center gap-2">
                    <span>{categoria?.nome || 'Categoria'}</span>
                    <span>•</span>
                    <span>{estatisticas.total_alunos || 0} alunos</span>
                    <span>•</span>
                    <span>{estatisticas.total_professores || 0} professores</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refresh}
                disabled={loading}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Configurar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 border-blue-500 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{estatisticas.total_alunos || 0}</p>
            <p className="text-sm text-gray-600 mb-2">Alunos Matriculados</p>
            {estatisticas.distribuicao_niveis && (
              <div className="text-xs text-gray-500">
                <div>Iniciante: {estatisticas.distribuicao_niveis.beginner || 0}</div>
                <div>Intermediário: {estatisticas.distribuicao_niveis.intermediate || 0}</div>
                <div>Avançado: {estatisticas.distribuicao_niveis.advanced || 0}</div>
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 border-green-500 text-center">
            <GraduationCap className="w-8 h-8 text-green-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{estatisticas.total_professores || 0}</p>
            <p className="text-sm text-gray-600 mb-2">Professores</p>
            <div className="text-xs text-gray-500">
              <div>Experiência média:</div>
              <div className="font-medium">{estatisticas.media_experiencia || 0} anos</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 border-purple-500 text-center">
            <BookOpen className="w-8 h-8 text-purple-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{estatisticas.total_turmas || 0}</p>
            <p className="text-sm text-gray-600 mb-2">Turmas Ativas</p>
            <div className="text-xs text-gray-500">
              <div>Total de vagas:</div>
              <div className="font-medium">{estatisticas.total_vagas || 0}</div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 border-orange-500 text-center">
            <Activity className="w-8 h-8 text-orange-500 mx-auto mb-3" />
            <p className="text-3xl font-bold text-gray-900">{ranking?.length || 0}</p>
            <p className="text-sm text-gray-600 mb-2">No Ranking</p>
            <div className="text-xs text-gray-500">
              <div>Top performer:</div>
              <div className="font-medium">{ranking?.[0]?.nome?.split(' ')[0] || 'Nenhum'}</div>
            </div>
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-red-100">
            {[
              { id: 'resumo', label: 'Resumo', icon: BarChart3 },
              { id: 'alunos', label: 'Alunos', icon: Users },
              { id: 'professores', label: 'Professores', icon: GraduationCap },
              { id: 'turmas', label: 'Turmas', icon: BookOpen },
              { id: 'ranking', label: 'Ranking', icon: Trophy }
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
                  abaAtiva === aba.id
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <aba.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{aba.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'resumo' && (
          <div className="space-y-8">
            {/* Gráficos de Distribuição */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Distribuição por Nível */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Distribuição por Nível
                </h3>
                <div className="space-y-4">
                  {estatisticas.distribuicao_niveis && Object.entries(estatisticas.distribuicao_niveis).map(([nivel, count]) => {
                    const total = Object.values(estatisticas.distribuicao_niveis).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={nivel} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {nivel === 'beginner' ? 'Iniciante' : nivel === 'intermediate' ? 'Intermediário' : 'Avançado'}
                          </span>
                          <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Professores por Nível de Ensino */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-500" />
                  Professores por Nível de Ensino
                </h3>
                <div className="space-y-4">
                  {estatisticas.professores_por_nivel && Object.entries(estatisticas.professores_por_nivel).map(([nivel, count]) => {
                    const total = Object.values(estatisticas.professores_por_nivel).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div key={nivel} className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {nivel === 'todos' ? 'Todos os níveis' : nivel}
                          </span>
                          <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Atividade Recente */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500" />
                Resumo de Atividade
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Alunos Ativos</h4>
                  <p className="text-sm text-gray-600">
                    {alunos?.filter(a => {
                      if (!a.ultimo_acesso) return false;
                      const ultimoAcesso = new Date(a.ultimo_acesso);
                      const agora = new Date();
                      const diffDays = (agora - ultimoAcesso) / (1000 * 60 * 60 * 24);
                      return diffDays <= 7;
                    }).length || 0} nos últimos 7 dias
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Turmas com Vagas</h4>
                  <p className="text-sm text-gray-600">
                    {turmas?.filter(t => t.vagas_disponiveis > 0).length || 0} turmas disponíveis
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Top Performer</h4>
                  <p className="text-sm text-gray-600">
                    {ranking?.[0]?.nome || 'Nenhum'} - {ranking?.[0]?.pontos || 0} pts
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'alunos' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                Alunos do {instrumentoInfo.nome} ({alunos?.length || 0})
              </h3>
            </div>

            <div className="p-6">
              {alunos && alunos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Aluno</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Nível</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Pontos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Sequência</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Ingresso</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Último Acesso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alunos.map(aluno => (
                        <tr key={aluno.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{aluno.nome}</div>
                              <div className="text-sm text-gray-500">{aluno.email}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              aluno.nivel === 'beginner' ? 'bg-green-100 text-green-700' :
                              aluno.nivel === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {aluno.nivel === 'beginner' ? 'Iniciante' :
                               aluno.nivel === 'intermediate' ? 'Intermediário' : 'Avançado'}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-900">{aluno.pontos || 0}</td>
                          <td className="py-3 px-4">
                            <span className="flex items-center gap-1">
                              🔥 {aluno.sequencia || 0}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {aluno.data_ingresso ? new Date(aluno.data_ingresso).toLocaleDateString('pt-BR') : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {aluno.ultimo_acesso ? new Date(aluno.ultimo_acesso).toLocaleDateString('pt-BR') : 'Nunca'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum aluno matriculado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'professores' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-green-500" />
                Professores de {instrumentoInfo.nome} ({professores?.length || 0})
              </h3>
            </div>

            <div className="p-6">
              {professores && professores.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {professores.map(professor => (
                    <div key={professor.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {professor.nome?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{professor.nome}</h4>
                          <p className="text-sm text-gray-600 mb-2">{professor.email}</p>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">Nível de Ensino:</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {professor.nivel_ensino || 'Não informado'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500">Experiência:</span>
                              <span className="text-xs text-gray-700">{professor.anos_experiencia || 0} anos</span>
                            </div>
                          </div>

                          {professor.biografia && (
                            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{professor.biografia}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum professor cadastrado ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'turmas' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                Turmas de {instrumentoInfo.nome} ({turmas?.length || 0})
              </h3>
            </div>

            <div className="p-6">
              {turmas && turmas.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {turmas.map(turma => (
                    <div key={turma.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">{turma.nome}</h4>
                          <p className="text-sm text-gray-600">{turma.descricao}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          turma.vagas_disponiveis > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {turma.vagas_disponiveis > 0 ? 'Vagas Disponíveis' : 'Lotada'}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Professor:</span>
                          <span className="font-medium">{turma.professor_nome || 'Não definido'}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Nível:</span>
                          <span className="font-medium capitalize">{turma.nivel}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Matriculados:</span>
                          <span className="font-medium">{turma.total_matriculados || 0} / {turma.max_alunos}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Início:</span>
                          <span className="font-medium">
                            {turma.data_inicio ? new Date(turma.data_inicio).toLocaleDateString('pt-BR') : 'Não definido'}
                          </span>
                        </div>
                      </div>

                      {/* Barra de progresso de vagas */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Ocupação da turma</span>
                          <span>{Math.round(((turma.total_matriculados || 0) / turma.max_alunos) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                            style={{ width: `${Math.min(((turma.total_matriculados || 0) / turma.max_alunos) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma turma criada ainda</p>
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'ranking' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-red-100">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking de {instrumentoInfo.nome} (Top {ranking?.length || 0})
              </h3>
            </div>

            <div className="p-6">
              {ranking && ranking.length > 0 ? (
                <div className="space-y-4">
                  {ranking.map((aluno, index) => (
                    <div key={aluno.id} className={`flex items-center gap-4 p-4 rounded-xl ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' :
                      index === 1 ? 'bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200' :
                      index === 2 ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200' :
                      'bg-gray-50 border border-gray-100'
                    }`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-white' :
                        index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500 text-white' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white' :
                        'bg-gradient-to-br from-blue-400 to-blue-500 text-white'
                      }`}>
                        {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : `#${aluno.posicao || index + 1}`}
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{aluno.nome}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>Nível: {aluno.nivel === 'beginner' ? 'Iniciante' : aluno.nivel === 'intermediate' ? 'Intermediário' : 'Avançado'}</span>
                          <span>•</span>
                          <span>{aluno.licoes || 0} lições concluídas</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-lg text-gray-900">{aluno.pontos || 0} pts</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          🔥 {aluno.sequencia || 0} dias
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Ranking ainda não disponível</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInstrumentDetails;