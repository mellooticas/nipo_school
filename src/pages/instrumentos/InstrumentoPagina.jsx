import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  useInstrumentPage, 
  useInstrumentProgress, 
  useInstrumentContent,
  useInstrumentRanking,
  useProximasAtividades,
  useTurmasInstrumento
} from '../../shared/hooks';
import { useAuth } from '../../shared/contexts/AuthContext';

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