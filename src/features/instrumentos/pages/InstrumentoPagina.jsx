import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useInstrumentPage, 
  useInstrumentProgress, 
  useInstrumentContent,
  useInstrumentRanking,
  useProximasAtividades,
  useTurmasInstrumento
} from '../hooks/useInstrumentPage'; 
import { useAuth } from '../../../shared/contexts/AuthContext';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const InstrumentoPagina = () => {
  const { instrumentoId } = useParams();
  const { userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Hooks para buscar dados
  const { dashboard, loading: loadingDashboard } = useInstrumentPage(instrumentoId);
  const { progresso, registrarTempoPratica } = useInstrumentProgress(instrumentoId);
  const { conteudos, loading: loadingConteudos } = useInstrumentContent(instrumentoId, 6);
  const { ranking } = useInstrumentRanking(instrumentoId, 'pontos_totais', 5);
  const { atividades: proximasAtividades } = useProximasAtividades(instrumentoId, 3);
  const { turmas } = useTurmasInstrumento(instrumentoId);

  // Estados para modais e formulários
  const [showPraticaModal, setShowPraticaModal] = useState(false);
  const [minutosParaRegistrar, setMinutosParaRegistrar] = useState('');

  // Loading state
  if (loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando página do instrumento...</p>
        </div>
      </div>
    );
  }

  // Dados do instrumento
  const instrumentoInfo = dashboard?.instrumento_info;
  const corTema = instrumentoInfo?.cor_tema || '#3B82F6';

  // Função para registrar prática
  const handleRegistrarPratica = async () => {
    try {
      const minutos = parseInt(minutosParaRegistrar);
      if (minutos > 0) {
        await registrarTempoPratica(minutos);
        setShowPraticaModal(false);
        setMinutosParaRegistrar('');
        // Mostrar sucesso
      }
    } catch (error) {
      console.error('Erro ao registrar prática:', error);
      // Mostrar erro
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com cores do instrumento */}
      <div 
        className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
        style={{ 
          background: `linear-gradient(135deg, ${corTema}dd, ${corTema})` 
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {instrumentoInfo?.nome || 'Instrumento'}
              </h1>
              <p className="text-blue-100 text-lg">
                {instrumentoInfo?.descricao_completa || 'Página do instrumento'}
              </p>
              <div className="flex items-center mt-4 space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{instrumentoInfo?.total_alunos || 0}</div>
                  <div className="text-blue-200 text-sm">Alunos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{instrumentoInfo?.total_professores || 0}</div>
                  <div className="text-blue-200 text-sm">Professores</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{turmas?.length || 0}</div>
                  <div className="text-blue-200 text-sm">Turmas</div>
                </div>
              </div>
            </div>
            
            {/* Botões de ação */}
            {userProfile?.tipo_usuario === 'aluno' && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPraticaModal(true)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors"
                >
                  📝 Registrar Prática
                </button>
                <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-colors">
                  🎯 Definir Meta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: '📊 Visão Geral' },
              { id: 'turmas', label: '🎓 Turmas' },
              { id: 'conteudo', label: '📚 Conteúdo' },
              { id: 'progresso', label: '📈 Progresso' },
              { id: 'patrimonio', label: '🏛️ Patrimônio' },
              { id: 'comunidade', label: '👥 Comunidade' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conteúdo das tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab 
            progresso={progresso}
            proximasAtividades={proximasAtividades}
            conteudos={conteudos.slice(0, 3)}
            ranking={ranking.slice(0, 3)}
            corTema={corTema}
          />
        )}

        {activeTab === 'turmas' && (
          <TurmasTab turmas={turmas} corTema={corTema} />
        )}

        {activeTab === 'conteudo' && (
          <ConteudoTab conteudos={conteudos} loading={loadingConteudos} />
        )}

        {activeTab === 'progresso' && userProfile?.tipo_usuario === 'aluno' && (
          <ProgressoTab progresso={progresso} corTema={corTema} />
        )}

        {activeTab === 'patrimonio' && (
          <PatrimonioTab instrumentoId={instrumentoId} corTema={corTema} />
        )}

        {activeTab === 'comunidade' && (
          <ComunidadeTab ranking={ranking} corTema={corTema} />
        )}
      </div>

      {/* Modal para registrar prática */}
      {showPraticaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Registrar Tempo de Prática</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minutos praticados:
              </label>
              <input
                type="number"
                value={minutosParaRegistrar}
                onChange={(e) => setMinutosParaRegistrar(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 30"
                min="1"
                max="480"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPraticaModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegistrarPratica}
                disabled={!minutosParaRegistrar || parseInt(minutosParaRegistrar) <= 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente da tab Visão Geral
const OverviewTab = ({ progresso, proximasAtividades, conteudos, ranking, corTema }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Coluna principal */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progresso pessoal */}
        {progresso && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">📊 Meu Progresso</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: corTema }}>
                  {progresso.pontos_totais || 0}
                </div>
                <div className="text-gray-600 text-sm">Pontos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: corTema }}>
                  {Math.floor((progresso.tempo_pratica_total || 0) / 60)}h
                </div>
                <div className="text-gray-600 text-sm">Prática</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: corTema }}>
                  {progresso.exercicios_completados || 0}
                </div>
                <div className="text-gray-600 text-sm">Exercícios</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: corTema }}>
                  {progresso.nivel_atual || 'Iniciante'}
                </div>
                <div className="text-gray-600 text-sm">Nível</div>
              </div>
            </div>
          </div>
        )}

        {/* Próximas atividades */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📅 Próximas Atividades</h3>
          {proximasAtividades?.length > 0 ? (
            <div className="space-y-3">
              {proximasAtividades.map((atividade) => (
                <div key={atividade.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{atividade.titulo}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(atividade.data_inicio).toLocaleString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">{atividade.local}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium capitalize">{atividade.tipo.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-600">{atividade.professor_nome}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma atividade agendada</p>
          )}
        </div>

        {/* Conteúdo recomendado */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📚 Conteúdo Recomendado</h3>
          {conteudos?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {conteudos.map((conteudo) => (
                <div key={conteudo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="font-medium mb-2">{conteudo.titulo}</div>
                  <div className="text-sm text-gray-600 mb-2">{conteudo.descricao}</div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="capitalize">{conteudo.tipo}</span>
                    <span className="text-gray-500">{conteudo.visualizacoes} views</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum conteúdo disponível</p>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Mini ranking */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Top Alunos</h3>
          {ranking?.length > 0 ? (
            <div className="space-y-3">
              {ranking.map((aluno) => (
                <div key={aluno.aluno_id} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-3">
                    {aluno.posicao}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{aluno.nome}</div>
                    <div className="text-xs text-gray-500">{aluno.pontos_totais} pontos</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Sem dados de ranking</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente da nova aba Patrimônio
const PatrimonioTab = ({ instrumentoId, corTema }) => {
  const [dadosPatrimonio, setDadosPatrimonio] = React.useState({
    instrumentosFisicos: [],
    cessoesAtivas: [],
    historicoCessoes: [],
    estatisticas: {}
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [view, setView] = React.useState('resumo'); // 'resumo', 'fisicos', 'emprestimos', 'historico'

  React.useEffect(() => {
    carregarDadosPatrimonio();
  }, [instrumentoId]);

  const carregarDadosPatrimonio = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Carregando patrimônio para instrumento:', instrumentoId);

      // 1. Buscar instrumentos físicos deste tipo
      const { data: instrumentosFisicos, error: fisicosError } = await supabase
        .from('instrumentos_fisicos')
        .select(`
          *,
          instrumentos (
            id,
            nome,
            categoria
          )
        `)
        .eq('instrumento_id', instrumentoId)
        .order('codigo_patrimonio');

      if (fisicosError) {
        console.error('Erro ao buscar instrumentos físicos:', fisicosError);
        throw fisicosError;
      }

      // 2. Buscar cessões ativas
      const { data: cessoesAtivas, error: cessoesError } = await supabase
        .from('cessoes_instrumentos')
        .select(`
          *,
          instrumentos_fisicos (
            codigo_patrimonio,
            marca,
            modelo
          ),
          alunos (
            nome
          ),
          professores!cessoes_instrumentos_responsavel_entrega_fkey (
            nome
          )
        `)
        .eq('instrumentos_fisicos.instrumento_id', instrumentoId)
        .is('data_devolucao', null); // Cessões ainda ativas

      if (cessoesError) {
        console.error('Erro ao buscar cessões:', cessoesError);
        // Não para a execução, apenas loga o erro
      }

      // 3. Buscar histórico de cessões (últimas 10)
      const { data: historicoCessoes, error: historicoError } = await supabase
        .from('cessoes_instrumentos')
        .select(`
          *,
          instrumentos_fisicos (
            codigo_patrimonio,
            marca,
            modelo
          ),
          alunos (
            nome
          )
        `)
        .eq('instrumentos_fisicos.instrumento_id', instrumentoId)
        .order('data_cessao', { ascending: false })
        .limit(10);

      if (historicoError) {
        console.error('Erro ao buscar histórico:', historicoError);
        // Não para a execução
      }

      // 4. Calcular estatísticas
      const fisicos = instrumentosFisicos || [];
      const cessoes = cessoesAtivas || [];
      
      const stats = {
        totalFisicos: fisicos.length,
        disponiveis: fisicos.filter(i => i.disponivel).length,
        emprestados: fisicos.filter(i => !i.disponivel).length,
        emManutencao: fisicos.filter(i => i.estado_conservacao === 'manutencao').length,
        taxaUso: fisicos.length > 0 ? Math.round((fisicos.filter(i => !i.disponivel).length / fisicos.length) * 100) : 0,
        valorTotal: fisicos.reduce((sum, i) => sum + (parseFloat(i.valor_aquisicao) || 0), 0),
        estadoConservacao: {
          excelente: fisicos.filter(i => i.estado_conservacao === 'excelente').length,
          bom: fisicos.filter(i => i.estado_conservacao === 'bom').length,
          regular: fisicos.filter(i => i.estado_conservacao === 'regular').length,
          ruim: fisicos.filter(i => i.estado_conservacao === 'ruim').length,
          manutencao: fisicos.filter(i => i.estado_conservacao === 'manutencao').length
        }
      };

      setDadosPatrimonio({
        instrumentosFisicos: fisicos,
        cessoesAtivas: cessoes || [],
        historicoCessoes: historicoCessoes || [],
        estatisticas: stats
      });

      console.log('Dados do patrimônio carregados:', {
        fisicos: fisicos.length,
        cessoes: cessoes?.length || 0,
        stats
      });

    } catch (err) {
      console.error('Erro ao carregar dados do patrimônio:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCorEstado = (estado) => {
    const cores = {
      'excelente': 'bg-green-100 text-green-800',
      'bom': 'bg-blue-100 text-blue-800',
      'regular': 'bg-yellow-100 text-yellow-800',
      'ruim': 'bg-red-100 text-red-800',
      'manutencao': 'bg-purple-100 text-purple-800'
    };
    return cores[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: corTema }}></div>
        <p className="text-gray-600">Carregando dados do patrimônio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center mb-2">
          <span className="text-red-500 text-xl mr-2">⚠️</span>
          <h3 className="font-semibold text-red-800">Erro ao carregar patrimônio</h3>
        </div>
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={carregarDadosPatrimonio}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const { instrumentosFisicos, cessoesAtivas, historicoCessoes, estatisticas } = dadosPatrimonio;

  return (
    <div className="space-y-6">
      {/* Navegação */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'resumo', label: '📊 Resumo', badge: estatisticas.totalFisicos },
          { id: 'fisicos', label: '🎵 Físicos', badge: estatisticas.totalFisicos },
          { id: 'emprestimos', label: '🤝 Empréstimos', badge: cessoesAtivas.length },
          { id: 'historico', label: '📋 Histórico', badge: historicoCessoes.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              view === tab.id 
                ? 'text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{ backgroundColor: view === tab.id ? corTema : undefined }}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                view === tab.id ? 'bg-white bg-opacity-20' : 'bg-gray-200 text-gray-600'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Conteúdo por View */}
      {view === 'resumo' && (
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: corTema }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total no Patrimônio</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.totalFisicos}</p>
                  <p className="text-xs text-gray-500 mt-1">Instrumentos cadastrados</p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: corTema }}>
                  <span className="text-white text-2xl">🎵</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disponíveis</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.disponiveis}</p>
                  <p className="text-xs text-gray-500 mt-1">Prontos para empréstimo</p>
                </div>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">✅</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emprestados</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.emprestados}</p>
                  <p className="text-xs text-gray-500 mt-1">Em uso pelos alunos</p>
                </div>
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">🤝</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Taxa de Uso</p>
                  <p className="text-3xl font-bold text-gray-900">{estatisticas.taxaUso}%</p>
                  <p className="text-xs text-gray-500 mt-1">Instrumentos em uso</p>
                </div>
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-2xl">📊</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estado de Conservação */}
          {estatisticas.totalFisicos > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🔧 Estado de Conservação</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(estatisticas.estadoConservacao).map(([estado, quantidade]) => (
                  <div key={estado} className="text-center">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold mb-2 ${getCorEstado(estado)}`}>
                      {estado}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{quantidade}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado Vazio */}
          {estatisticas.totalFisicos === 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                Nenhum instrumento físico cadastrado
              </h3>
              <p className="text-yellow-700 mb-4">
                Este tipo de instrumento ainda não possui exemplares físicos no patrimônio da escola.
              </p>
              <div className="space-y-2 text-sm text-yellow-600">
                <p>💡 <strong>Para resolver:</strong></p>
                <p>1. Acesse a área administrativa</p>
                <p>2. Cadastre os instrumentos físicos disponíveis</p>
                <p>3. Configure códigos patrimoniais e estado</p>
              </div>
              <button
                onClick={() => window.location.href = '/admin/instruments'}
                className="mt-4 px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Cadastrar Instrumentos
              </button>
            </div>
          )}
        </div>
      )}

      {view === 'fisicos' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🎵 Instrumentos Físicos</h3>
          {instrumentosFisicos.length > 0 ? (
            <div className="space-y-4">
              {instrumentosFisicos.map((instrumento) => (
                <div key={instrumento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: instrumento.disponivel ? '#10B981' : '#F59E0B' }}
                    >
                      {instrumento.disponivel ? '✅' : '🤝'}
                    </div>
                    <div>
                      <div className="font-medium">
                        <code className="bg-gray-200 px-2 py-1 rounded text-sm mr-2">
                          {instrumento.codigo_patrimonio}
                        </code>
                        {instrumento.marca} {instrumento.modelo}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${getCorEstado(instrumento.estado_conservacao)}`}>
                          {instrumento.estado_conservacao}
                        </span>
                        {instrumento.valor_aquisicao && (
                          <span>Valor: R$ {parseFloat(instrumento.valor_aquisicao).toLocaleString('pt-BR')}</span>
                        )}
                        {instrumento.data_aquisicao && (
                          <span>Aquisição: {new Date(instrumento.data_aquisicao).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                      {instrumento.observacoes && (
                        <div className="text-xs text-gray-500 mt-1">
                          💬 {instrumento.observacoes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${instrumento.disponivel ? 'text-green-600' : 'text-orange-600'}`}>
                      {instrumento.disponivel ? 'Disponível' : 'Emprestado'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📦</div>
              <p>Nenhum instrumento físico cadastrado para este tipo</p>
            </div>
          )}
        </div>
      )}

      {view === 'emprestimos' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">🤝 Empréstimos Ativos</h3>
          {cessoesAtivas.length > 0 ? (
            <div className="space-y-4">
              {cessoesAtivas.map((cessao) => (
                <div key={cessao.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        Instrumento: <code className="bg-white px-2 py-1 rounded text-sm">
                          {cessao.instrumentos_fisicos?.codigo_patrimonio}
                        </code>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Aluno: <strong>{cessao.alunos?.nome}</strong>
                      </div>
                      <div className="text-sm text-gray-600">
                        Empréstimo: {new Date(cessao.data_cessao).toLocaleDateString('pt-BR')}
                      </div>
                      {cessao.data_devolucao_prevista && (
                        <div className="text-sm text-gray-600">
                          Devolução prevista: {new Date(cessao.data_devolucao_prevista).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-orange-600 font-medium">Ativo</div>
                      {cessao.professores?.nome && (
                        <div className="text-gray-500">Resp: {cessao.professores.nome}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">🤝</div>
              <p>Nenhum empréstimo ativo no momento</p>
            </div>
          )}
        </div>
      )}

      {view === 'historico' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">📋 Histórico de Empréstimos</h3>
          {historicoCessoes.length > 0 ? (
            <div className="space-y-3">
              {historicoCessoes.map((cessao) => (
                <div key={cessao.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-medium">{cessao.alunos?.nome}</span>
                      <span className="mx-2">•</span>
                      <code className="bg-gray-200 px-1 rounded text-xs">
                        {cessao.instrumentos_fisicos?.codigo_patrimonio}
                      </code>
                    </div>
                    <div className="text-gray-500">
                      {new Date(cessao.data_cessao).toLocaleDateString('pt-BR')}
                      {cessao.data_devolucao && (
                        <span> → {new Date(cessao.data_devolucao).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📋</div>
              <p>Nenhum histórico de empréstimo encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Outros componentes de tabs (simplificados por enquanto)
const TurmasTab = ({ turmas, corTema }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">🎓 Turmas Disponíveis</h3>
    {turmas?.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {turmas.map((turma) => (
          <div key={turma.id} className="border rounded-lg p-4">
            <h4 className="font-semibold mb-2">{turma.nome}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Professor: {turma.professor_nome}</div>
              <div>Nível: {turma.nivel}</div>
              <div>Vagas: {turma.vagas_disponiveis}/{turma.max_alunos}</div>
              <div>Valor: R$ {turma.valor_mensalidade}</div>
            </div>
            <button 
              className="mt-3 w-full py-2 px-4 rounded-md text-white font-medium"
              style={{ backgroundColor: corTema }}
            >
              Ver Detalhes
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-4">Nenhuma turma disponível</p>
    )}
  </div>
);

const ConteudoTab = ({ conteudos, loading }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">📚 Todo o Conteúdo</h3>
    {loading ? (
      <div className="text-center py-8">Carregando conteúdos...</div>
    ) : conteudos?.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conteudos.map((conteudo) => (
          <div key={conteudo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
            <h4 className="font-semibold mb-2">{conteudo.titulo}</h4>
            <p className="text-gray-600 text-sm mb-3">{conteudo.descricao}</p>
            <div className="flex justify-between items-center text-sm">
              <span className="capitalize bg-gray-100 px-2 py-1 rounded">{conteudo.tipo}</span>
              <span className="text-gray-500">{conteudo.visualizacoes} views</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-8">Nenhum conteúdo disponível</p>
    )}
  </div>
);

const ProgressoTab = ({ progresso, corTema }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">📈 Progresso Detalhado</h3>
      {progresso ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: corTema }}>
                {progresso.nivel_atual}
              </div>
              <div className="text-gray-600 text-sm">Nível Atual</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: corTema }}>
                {progresso.pontos_totais}
              </div>
              <div className="text-gray-600 text-sm">Pontos Totais</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: corTema }}>
                {Math.floor(progresso.tempo_pratica_total / 60)}h
              </div>
              <div className="text-gray-600 text-sm">Tempo Total</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold" style={{ color: corTema }}>
                {progresso.exercicios_completados}
              </div>
              <div className="text-gray-600 text-sm">Exercícios</div>
            </div>
          </div>
          
          {progresso.objetivo_atual && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Objetivo Atual</h4>
              <p className="text-blue-800">{progresso.objetivo_atual}</p>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-4">Dados de progresso não disponíveis</p>
      )}
    </div>
  </div>
);

const ComunidadeTab = ({ ranking, corTema }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">👥 Ranking da Comunidade</h3>
    {ranking?.length > 0 ? (
      <div className="space-y-3">
        {ranking.map((aluno) => (
          <div key={aluno.aluno_id} className="flex items-center p-4 bg-gray-50 rounded-lg">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold mr-4"
              style={{ backgroundColor: corTema }}
            >
              {aluno.posicao}
            </div>
            <div className="flex-1">
              <div className="font-semibold">{aluno.nome}</div>
              <div className="text-sm text-gray-600">Nível: {aluno.nivel_atual}</div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{aluno.pontos_totais} pontos</div>
              <div className="text-sm text-gray-600">{Math.floor(aluno.tempo_pratica_total / 60)}h de prática</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-8">Nenhum dado de ranking disponível</p>
    )}
  </div>
);

export default InstrumentoPagina;