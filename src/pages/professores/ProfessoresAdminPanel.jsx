import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { adminService } from '../../services/adminService';


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

  useEffect(() => {
    // Verificar se é admin
    if (userProfile?.tipo_usuario !== 'admin') {
      setError('Acesso negado. Apenas administradores podem acessar esta área.');
      setLoading(false);
      return;
    }
    
    carregarDados();
  }, [userProfile, periodoFiltro]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [
        gerais,
        alunos,
        professores,
        conteudos,
        ultimos,
        ativos
      ] = await Promise.all([
        adminService.getEstatisticasGerais(),
        adminService.getEstatisticasAlunos(periodoFiltro),
        adminService.getEstatisticasProfessores(),
        adminService.getEstatisticasConteudos(),
        adminService.getUltimosAlunos(10),
        adminService.getAlunosAtivos(20)
      ]);

      setEstatisticasGerais(gerais.data || {});
      setEstatisticasAlunos(alunos.data || {});
      setEstatisticasProfessores(professores.data || {});
      setEstatisticasConteudos(conteudos.data || {});
      setUltimosAlunos(ultimos.data || []);
      setAlunosAtivos(ativos.data || []);
      
    } catch (err) {
      setError('Erro ao carregar dados administrativos');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon, color, trend }) => (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="text-3xl">{icon}</div>
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
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${color}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Administrativo */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                🎓 Painel Administrativo - Nipo School
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
                className="px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50"
              >
                <option value="7dias" className="text-gray-900">Últimos 7 dias</option>
                <option value="30dias" className="text-gray-900">Últimos 30 dias</option>
                <option value="90dias" className="text-gray-900">Últimos 90 dias</option>
                <option value="todos" className="text-gray-900">Todo período</option>
              </select>

              <button
                onClick={carregarDados}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                🔄 Atualizar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegação por Abas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm">
            {[
              { id: 'geral', label: '📊 Visão Geral', icon: '📊' },
              { id: 'alunos', label: '👨‍🎓 Alunos', icon: '👨‍🎓' },
              { id: 'professores', label: '👩‍🏫 Professores', icon: '👩‍🏫' },
              { id: 'conteudos', label: '📚 Conteúdos', icon: '📚' },
              { id: 'instrumentos', label: '🎹 Instrumentos', icon: '🎹' }
            ].map(aba => (
              <button
                key={aba.id}
                onClick={() => setVisualizacaoAtiva(aba.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizacaoAtiva === aba.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {aba.label}
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
                icon="👨‍🎓"
                color="border-blue-500"
                trend={{ positive: true, value: '+12%', period: 'este mês' }}
              />
              <StatCard
                title="Professores Ativos"
                value={estatisticasGerais.total_professores || 0}
                subtitle="Educadores da plataforma"
                icon="👩‍🏫"
                color="border-green-500"
              />
              <StatCard
                title="Conteúdos Publicados"
                value={estatisticasGerais.total_conteudos || 0}
                subtitle="Aulas disponíveis"
                icon="📚"
                color="border-yellow-500"
              />
              <StatCard
                title="Acessos Este Mês"
                value={estatisticasGerais.acessos_mes || 0}
                subtitle="Logins realizados"
                icon="📈"
                color="border-purple-500"
                trend={{ positive: true, value: '+8%', period: 'vs. mês anterior' }}
              />
            </div>

            {/* Gráficos de Atividade */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribuição por Instrumento */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">🎹 Alunos por Instrumento</h3>
                <div className="space-y-4">
                  {estatisticasAlunos.por_instrumento && Object.entries(estatisticasAlunos.por_instrumento).map(([instrumento, count]) => (
                    <ProgressBar
                      key={instrumento}
                      label={`${instrumento.charAt(0).toUpperCase() + instrumento.slice(1)}`}
                      value={count}
                      max={Math.max(...Object.values(estatisticasAlunos.por_instrumento))}
                      color="bg-blue-500"
                      showPercentage={false}
                    />
                  ))}
                </div>
              </div>

              {/* Distribuição por Nível */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Alunos por Nível</h3>
                <div className="space-y-4">
                  {estatisticasAlunos.por_nivel && Object.entries(estatisticasAlunos.por_nivel).map(([nivel, count]) => (
                    <ProgressBar
                      key={nivel}
                      label={`${nivel.charAt(0).toUpperCase() + nivel.slice(1)}`}
                      value={count}
                      max={Math.max(...Object.values(estatisticasAlunos.por_nivel))}
                      color="bg-green-500"
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
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">👨‍🎓 Últimos Alunos Cadastrados</h3>
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
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
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
                icon="👩‍🏫"
                color="border-green-500"
              />
              <StatCard
                title="Conteúdos Criados"
                value={estatisticasProfessores.conteudos_criados || 0}
                subtitle="Este mês"
                icon="📝"
                color="border-blue-500"
              />
              <StatCard
                title="Média de Visualizações"
                value={estatisticasProfessores.media_visualizacoes || 0}
                subtitle="Por conteúdo"
                icon="👁️"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🏆 Top Professores por Engajamento</h3>
              <div className="space-y-4">
                {estatisticasProfessores.top_professores && estatisticasProfessores.top_professores.map((professor, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-yellow-600' :
                        'bg-gray-300'
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
                icon="📚"
                color="border-blue-500"
              />
              <StatCard
                title="Visualizações Totais"
                value={estatisticasConteudos.visualizacoes || 0}
                icon="👁️"
                color="border-green-500"
              />
              <StatCard
                title="Downloads"
                value={estatisticasConteudos.downloads || 0}
                icon="⬇️"
                color="border-purple-500"
              />
              <StatCard
                title="Média por Conteúdo"
                value={`${estatisticasConteudos.media_visualizacoes || 0}`}
                subtitle="visualizações"
                icon="📊"
                color="border-yellow-500"
              />
            </div>

            {/* Conteúdos por Tipo */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📊 Distribuição de Conteúdos por Tipo</h3>
              <div className="space-y-4">
                {estatisticasConteudos.por_tipo && Object.entries(estatisticasConteudos.por_tipo).map(([tipo, count]) => (
                  <ProgressBar
                    key={tipo}
                    label={`${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`}
                    value={count}
                    max={Math.max(...Object.values(estatisticasConteudos.por_tipo))}
                    color="bg-red-500"
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">🎹 Instrumentos Mais Populares</h3>
              <div className="space-y-4">
                {estatisticasAlunos.por_instrumento && Object.entries(estatisticasAlunos.por_instrumento)
                  .sort(([,a], [,b]) => b - a)
                  .map(([instrumento, count], index) => (
                    <div key={instrumento} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">📈 Progressão dos Alunos</h3>
              <div className="space-y-6">
                {estatisticasAlunos.por_nivel && Object.entries(estatisticasAlunos.por_nivel).map(([nivel, count]) => (
                  <div key={nivel}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium capitalize">{nivel}</span>
                      <span className="text-lg font-bold">{count} alunos</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          nivel === 'iniciante' ? 'bg-green-500' :
                          nivel === 'intermediario' ? 'bg-yellow-500' :
                          'bg-red-500'
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
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">⚙️ Ações Administrativas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-medium">Relatório Completo</div>
              <div className="text-sm text-gray-600">Exportar dados</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">👨‍🎓</div>
              <div className="font-medium">Gerenciar Alunos</div>
              <div className="text-sm text-gray-600">Lista completa</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-medium">Moderar Conteúdos</div>
              <div className="text-sm text-gray-600">Aprovar/Rejeitar</div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <div className="font-medium">Configurações</div>
              <div className="text-sm text-gray-600">Sistema</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessoresAdminPanel;