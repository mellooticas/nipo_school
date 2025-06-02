import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useInstruments } from '../../shared/hooks/useInstruments';
import { instrumentsService } from '../../services/instrumentsService';

import {
  Music,
  Users,
  BookOpen,
  TrendingUp,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  BarChart3,
  GraduationCap,
  Award,
  Calendar,
  Activity,
  ArrowRight,
  Shield,
  Settings,
  Package,
  AlertTriangle,
  Wrench,
  DollarSign,
  Clock,
  QrCode,
  MapPin,
  CheckCircle,
  XCircle,
  Tool
} from 'lucide-react';

const AdminInstruments = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Hook existente para instrumentos básicos
  const { 
    instrumentos, 
    loading, 
    error, 
    refresh,
    totalInstrumentos 
  } = useInstruments();

  // Estados para gestão física
  const [instrumentosFisicos, setInstrumentosFisicos] = useState([]);
  const [cessoes, setCessoes] = useState([]);
  const [manutencoes, setManutencoes] = useState([]);
  const [estatisticasPatrimonio, setEstatisticasPatrimonio] = useState({});
  const [alertas, setAlertas] = useState([]);
  const [loadingPhysical, setLoadingPhysical] = useState(false);

  // Estados de interface
  const [abaAtiva, setAbaAtiva] = useState('instrumentos'); // 'instrumentos', 'fisicos', 'cessoes', 'manutencoes'
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [termoBusca, setTermoBusca] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  // Estados dos modais
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalCriarFisico, setModalCriarFisico] = useState(false);
  const [modalCessao, setModalCessao] = useState(false);
  const [modalManutencao, setModalManutencao] = useState(false);

  const [instrumentoSelecionado, setInstrumentoSelecionado] = useState(null);
  const [novoInstrumento, setNovoInstrumento] = useState({
    nome: '',
    categoria: 'corda'
  });

  // Estados para instrumento físico
  const [novoInstrumentoFisico, setNovoInstrumentoFisico] = useState({
    instrumento_id: '',
    codigo_patrimonio: '',
    numero_serie: '',
    marca: '',
    modelo: '',
    valor_aquisicao: '',
    data_aquisicao: '',
    localizacao: '',
    observacoes: ''
  });

  // Estados para cessão
  const [novaCessao, setNovaCessao] = useState({
    instrumento_fisico_id: '',
    aluno_id: '',
    tipo_cessao: 'temporaria',
    data_fim_prevista: '',
    condicoes_uso: '',
    termo_responsabilidade: false
  });

  // Estados para manutenção
  const [novaManutencao, setNovaManutencao] = useState({
    instrumento_fisico_id: '',
    tipo_manutencao: 'preventiva',
    descricao_problema: '',
    tecnico_responsavel: '',
    valor_servico: '',
    data_saida_prevista: ''
  });

  // Verificar permissões de admin
  useEffect(() => {
    if (userProfile?.tipo_usuario !== 'admin' && user?.user_metadata?.tipo_usuario !== 'admin') {
      navigate('/dashboard');
    }
  }, [userProfile, user, navigate]);

  // Carregar dados físicos
  const carregarDadosFisicos = async () => {
    try {
      setLoadingPhysical(true);
      
      const [
        fisicosResult,
        cessoesResult,
        manutencoesResult,
        statsResult,
        alertasResult
      ] = await Promise.all([
        instrumentsService.getInstrumentosFisicos(),
        instrumentsService.getCessoesAtivas(),
        instrumentsService.getManutencoes(),
        instrumentsService.getEstatisticasPatrimonio(),
        instrumentsService.getAlertasVencimento(7)
      ]);

      if (fisicosResult.success) setInstrumentosFisicos(fisicosResult.data);
      if (cessoesResult.success) setCessoes(cessoesResult.data);
      if (manutencoesResult.success) setManutencoes(manutencoesResult.data);
      if (statsResult.success) setEstatisticasPatrimonio(statsResult.data);
      if (alertasResult.success) setAlertas(alertasResult.data);

    } catch (error) {
      console.error('Erro ao carregar dados físicos:', error);
    } finally {
      setLoadingPhysical(false);
    }
  };

  useEffect(() => {
    carregarDadosFisicos();
  }, []);

  // Categorias disponíveis
  const categorias = instrumentsService.getCategorias();

  // Estatísticas gerais expandidas
  const estatisticasGerais = {
    // Instrumentos básicos
    total_instrumentos: totalInstrumentos,
    total_alunos: instrumentos.reduce((sum, inst) => sum + (inst.estatisticas?.total_alunos || 0), 0),
    total_professores: instrumentos.reduce((sum, inst) => sum + (inst.estatisticas?.total_professores || 0), 0),
    instrumentos_ativos: instrumentos.filter(inst => inst.ativo).length,
    
    // Patrimônio físico
    total_fisicos: estatisticasPatrimonio.patrimonio?.total_instrumentos || 0,
    valor_total: estatisticasPatrimonio.patrimonio?.valor_total || 0,
    disponveis: estatisticasPatrimonio.patrimonio?.disponveis || 0,
    emprestados: estatisticasPatrimonio.patrimonio?.emprestados || 0,
    manutencao: estatisticasPatrimonio.patrimonio?.manutencao || 0,
    
    // Alertas
    vencimentos_proximos: alertas.length,
    cessoes_ativas: estatisticasPatrimonio.cessoes?.ativas || 0,
    manutencoes_abertas: estatisticasPatrimonio.manutencoes?.abertas || 0
  };

  // Handlers para instrumentos básicos
  const handleCriarInstrumento = async () => {
    if (!novoInstrumento.nome.trim()) return;

    try {
      setLoadingAction(true);
      
      const resultado = await instrumentsService.createInstrument(novoInstrumento);
      
      if (resultado.success) {
        setModalCriar(false);
        setNovoInstrumento({ nome: '', categoria: 'corda' });
        refresh();
      } else {
        alert('Erro ao criar instrumento: ' + resultado.error);
      }
    } catch (error) {
      console.error('Erro ao criar instrumento:', error);
      alert('Erro ao criar instrumento');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handlers para instrumentos físicos
  const handleCriarInstrumentoFisico = async () => {
    if (!novoInstrumentoFisico.instrumento_id || !novoInstrumentoFisico.codigo_patrimonio) return;

    try {
      setLoadingAction(true);
      
      const resultado = await instrumentsService.createInstrumentoFisico(novoInstrumentoFisico);
      
      if (resultado.success) {
        setModalCriarFisico(false);
        setNovoInstrumentoFisico({
          instrumento_id: '',
          codigo_patrimonio: '',
          numero_serie: '',
          marca: '',
          modelo: '',
          valor_aquisicao: '',
          data_aquisicao: '',
          localizacao: '',
          observacoes: ''
        });
        carregarDadosFisicos();
      } else {
        alert('Erro ao criar instrumento físico: ' + resultado.error);
      }
    } catch (error) {
      console.error('Erro ao criar instrumento físico:', error);
      alert('Erro ao criar instrumento físico');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handlers para cessões
  const handleCriarCessao = async () => {
    if (!novaCessao.instrumento_fisico_id || !novaCessao.aluno_id) return;

    try {
      setLoadingAction(true);
      
      const resultado = await instrumentsService.createCessao({
        ...novaCessao,
        responsavel_entrega: user.id
      });
      
      if (resultado.success) {
        setModalCessao(false);
        setNovaCessao({
          instrumento_fisico_id: '',
          aluno_id: '',
          tipo_cessao: 'temporaria',
          data_fim_prevista: '',
          condicoes_uso: '',
          termo_responsabilidade: false
        });
        carregarDadosFisicos();
      } else {
        alert('Erro ao criar cessão: ' + resultado.error);
      }
    } catch (error) {
      console.error('Erro ao criar cessão:', error);
      alert('Erro ao criar cessão');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleFinalizarCessao = async (cessaoId) => {
    if (!confirm('Confirma a devolução deste instrumento?')) return;

    try {
      setLoadingAction(true);
      
      const resultado = await instrumentsService.finalizarCessao(cessaoId, 'Devolução via sistema');
      
      if (resultado.success) {
        carregarDadosFisicos();
      } else {
        alert('Erro ao finalizar cessão: ' + resultado.error);
      }
    } catch (error) {
      console.error('Erro ao finalizar cessão:', error);
      alert('Erro ao finalizar cessão');
    } finally {
      setLoadingAction(false);
    }
  };

  // Filtrar dados
  const instrumentosFiltrados = instrumentos.filter(instrumento => {
    const matchCategoria = filtroCategoria === 'todos' || instrumento.categoria === filtroCategoria;
    const matchBusca = instrumento.nome.toLowerCase().includes(termoBusca.toLowerCase());
    return matchCategoria && matchBusca;
  });

  const instrumentosFisicosFiltrados = instrumentosFisicos.filter(instrumento => {
    const matchBusca = instrumento.codigo_patrimonio.toLowerCase().includes(termoBusca.toLowerCase()) ||
                     instrumento.marca?.toLowerCase().includes(termoBusca.toLowerCase()) ||
                     instrumento.modelo?.toLowerCase().includes(termoBusca.toLowerCase());
    return matchBusca;
  });

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
          <p className="text-base text-gray-700">Carregando instrumentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header Administrativo */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-light mb-2 flex items-center gap-3">
                <Music className="w-8 h-8" />
                Gestão Completa de Instrumentos
              </h1>
              <p className="text-red-100">
                Sistema completo de gestão educacional e patrimônio físico
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  refresh();
                  carregarDadosFisicos();
                }}
                disabled={loading || loadingPhysical}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${(loading || loadingPhysical) ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Atualizar</span>
              </button>

              <button
                onClick={() => {
                  if (abaAtiva === 'instrumentos') setModalCriar(true);
                  else if (abaAtiva === 'fisicos') setModalCriarFisico(true);
                  else if (abaAtiva === 'cessoes') setModalCessao(true);
                  else if (abaAtiva === 'manutencoes') setModalManutencao(true);
                }}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {abaAtiva === 'instrumentos' && 'Novo Instrumento'}
                  {abaAtiva === 'fisicos' && 'Novo Físico'}
                  {abaAtiva === 'cessoes' && 'Nova Cessão'}
                  {abaAtiva === 'manutencoes' && 'Nova Manutenção'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard de Estatísticas Expandido */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Instrumentos Básicos */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-blue-500 text-center">
            <Music className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.total_instrumentos}</p>
            <p className="text-xs text-gray-600">Tipos</p>
          </div>
          
          {/* Patrimônio Total */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-500 text-center">
            <Package className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.total_fisicos}</p>
            <p className="text-xs text-gray-600">Físicos</p>
          </div>
          
          {/* Valor Total */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-purple-500 text-center">
            <DollarSign className="w-6 h-6 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              R$ {(estatisticasGerais.valor_total / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-600">Patrimônio</p>
          </div>
          
          {/* Disponíveis */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-emerald-500 text-center">
            <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.disponveis}</p>
            <p className="text-xs text-gray-600">Disponíveis</p>
          </div>
          
          {/* Em Uso */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-orange-500 text-center">
            <Users className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.emprestados}</p>
            <p className="text-xs text-gray-600">Em Uso</p>
          </div>
          
          {/* Alertas */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-red-500 text-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{estatisticasGerais.vencimentos_proximos}</p>
            <p className="text-xs text-gray-600">Alertas</p>
          </div>
        </div>

        {/* Alertas de Vencimento */}
        {alertas.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900">Atenção: {alertas.length} cessões próximas do vencimento!</h3>
                <div className="mt-2 space-y-1">
                  {alertas.slice(0, 3).map(alerta => (
                    <p key={alerta.id} className="text-sm text-red-700">
                      • {alerta.instrumentos_fisicos?.codigo_patrimonio} - {alerta.alunos?.profiles?.full_name} 
                      (vence em {Math.ceil((new Date(alerta.data_fim_prevista) - new Date()) / (1000 * 60 * 60 * 24))} dias)
                    </p>
                  ))}
                  {alertas.length > 3 && (
                    <p className="text-sm text-red-600 font-medium">
                      + {alertas.length - 3} outros vencimentos próximos
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegação por Abas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-red-100">
            {[
              { id: 'instrumentos', label: 'Instrumentos', icon: Music, count: estatisticasGerais.total_instrumentos },
              { id: 'fisicos', label: 'Patrimônio', icon: Package, count: estatisticasGerais.total_fisicos },
              { id: 'cessoes', label: 'Cessões', icon: Users, count: estatisticasGerais.cessoes_ativas },
              { id: 'manutencoes', label: 'Manutenções', icon: Wrench, count: estatisticasGerais.manutencoes_abertas }
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
                {aba.count > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    abaAtiva === aba.id ? 'bg-white/20' : 'bg-gray-200'
                  }`}>
                    {aba.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={
                    abaAtiva === 'instrumentos' ? 'Buscar instrumentos...' :
                    abaAtiva === 'fisicos' ? 'Buscar por código, marca ou modelo...' :
                    abaAtiva === 'cessoes' ? 'Buscar cessões...' :
                    'Buscar manutenções...'
                  }
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por Categoria (apenas para instrumentos) */}
            {abaAtiva === 'instrumentos' && (
              <div className="lg:w-64">
                <select
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="todos">Todas as Categorias</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.emoji} {categoria.nome}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo das Abas */}
        {abaAtiva === 'instrumentos' && (
          <>
            {/* Grid de Instrumentos Básicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {instrumentosFiltrados.map(instrumento => (
                <InstrumentoCard
                  key={instrumento.id}
                  instrumento={instrumento}
                  onEditar={() => {
                    setInstrumentoSelecionado(instrumento);
                    setModalEditar(true);
                  }}
                  onExcluir={() => {
                    if (!confirm(`Tem certeza que deseja desativar "${instrumento.nome}"?`)) return;
                    // Implementar exclusão
                  }}
                  onVisualizar={() => navigate(`/professores/admin/instruments/${instrumento.id}`)}
                  loading={loadingAction}
                />
              ))}
            </div>

            {/* Estado vazio */}
            {instrumentosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum instrumento encontrado</h3>
                <p className="text-gray-600 mb-6">
                  {termoBusca || filtroCategoria !== 'todos' 
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando o primeiro instrumento'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {abaAtiva === 'fisicos' && (
          <>
            {/* Grid de Instrumentos Físicos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {instrumentosFisicosFiltrados.map(fisico => (
                <InstrumentoFisicoCard
                  key={fisico.id}
                  fisico={fisico}
                  onIniciarCessao={() => {
                    setNovaCessao(prev => ({ ...prev, instrumento_fisico_id: fisico.id }));
                    setModalCessao(true);
                  }}
                  onIniciarManutencao={() => {
                    setNovaManutencao(prev => ({ ...prev, instrumento_fisico_id: fisico.id }));
                    setModalManutencao(true);
                  }}
                  loading={loadingAction}
                />
              ))}
            </div>

            {/* Estado vazio */}
            {instrumentosFisicosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum instrumento físico cadastrado</h3>
                <p className="text-gray-600 mb-6">Comece cadastrando o primeiro instrumento do patrimônio</p>
                <button
                  onClick={() => setModalCriarFisico(true)}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Cadastrar Primeiro Instrumento
                </button>
              </div>
            )}
          </>
        )}

        {abaAtiva === 'cessoes' && (
          <>
            {/* Lista de Cessões Ativas */}
            <div className="space-y-4">
              {cessoes.map(cessao => (
                <CessaoCard
                  key={cessao.id}
                  cessao={cessao}
                  onFinalizar={() => handleFinalizarCessao(cessao.id)}
                  loading={loadingAction}
                />
              ))}
            </div>

            {/* Estado vazio */}
            {cessoes.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma cessão ativa</h3>
                <p className="text-gray-600 mb-6">Todos os instrumentos estão disponíveis</p>
              </div>
            )}
          </>
        )}

        {abaAtiva === 'manutencoes' && (
          <>
            {/* Lista de Manutenções */}
            <div className="space-y-4">
              {manutencoes.filter(m => ['aguardando', 'em_andamento'].includes(m.status)).map(manutencao => (
                <ManutencaoCard
                  key={manutencao.id}
                  manutencao={manutencao}
                  loading={loadingAction}
                />
              ))}
            </div>

            {/* Estado vazio */}
            {manutencoes.filter(m => ['aguardando', 'em_andamento'].includes(m.status)).length === 0 && (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma manutenção pendente</h3>
                <p className="text-gray-600 mb-6">Todos os instrumentos estão em bom estado</p>
              </div>
            )}
          </>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="text-red-500">⚠️</div>
              <div>
                <h3 className="font-medium text-red-900">Erro ao carregar dados</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAIS - Mantendo os existentes e adicionando novos */}
      
      {/* Modal Criar Instrumento Básico */}
      {modalCriar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
<div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
           <h3 className="text-xl font-semibold text-gray-900 mb-6">Novo Instrumento</h3>
           
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Nome do Instrumento
               </label>
               <input
                 type="text"
                 value={novoInstrumento.nome}
                 onChange={(e) => setNovoInstrumento(prev => ({ ...prev, nome: e.target.value }))}
                 placeholder="Ex: Violão, Piano, Bateria..."
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Categoria
               </label>
               <select
                 value={novoInstrumento.categoria}
                 onChange={(e) => setNovoInstrumento(prev => ({ ...prev, categoria: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               >
                 {categorias.map(categoria => (
                   <option key={categoria.id} value={categoria.id}>
                     {categoria.emoji} {categoria.nome}
                   </option>
                 ))}
               </select>
             </div>
           </div>

           <div className="flex justify-end space-x-3 mt-8">
             <button
               onClick={() => setModalCriar(false)}
               disabled={loadingAction}
               className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
             >
               Cancelar
             </button>
             <button
               onClick={handleCriarInstrumento}
               disabled={loadingAction || !novoInstrumento.nome.trim()}
               className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
             >
               {loadingAction ? 'Criando...' : 'Criar Instrumento'}
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Modal Criar Instrumento Físico */}
     {modalCriarFisico && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
           <h3 className="text-xl font-semibold text-gray-900 mb-6">Cadastrar Instrumento Físico</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Tipo de Instrumento *
               </label>
               <select
                 value={novoInstrumentoFisico.instrumento_id}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, instrumento_id: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               >
                 <option value="">Selecione o instrumento</option>
                 {instrumentos.map(inst => (
                   <option key={inst.id} value={inst.id}>{inst.nome}</option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Código Patrimônio *
               </label>
               <input
                 type="text"
                 value={novoInstrumentoFisico.codigo_patrimonio}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, codigo_patrimonio: e.target.value }))}
                 placeholder="Ex: VL001, PN002"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Marca
               </label>
               <input
                 type="text"
                 value={novoInstrumentoFisico.marca}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, marca: e.target.value }))}
                 placeholder="Ex: Yamaha, Fender"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Modelo
               </label>
               <input
                 type="text"
                 value={novoInstrumentoFisico.modelo}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, modelo: e.target.value }))}
                 placeholder="Ex: F310, C40"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Número de Série
               </label>
               <input
                 type="text"
                 value={novoInstrumentoFisico.numero_serie}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, numero_serie: e.target.value }))}
                 placeholder="Número de série"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Valor de Aquisição
               </label>
               <input
                 type="number"
                 value={novoInstrumentoFisico.valor_aquisicao}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, valor_aquisicao: e.target.value }))}
                 placeholder="R$ 0,00"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Data de Aquisição
               </label>
               <input
                 type="date"
                 value={novoInstrumentoFisico.data_aquisicao}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, data_aquisicao: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Localização
               </label>
               <input
                 type="text"
                 value={novoInstrumentoFisico.localizacao}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, localizacao: e.target.value }))}
                 placeholder="Ex: Sala 1, Armário A"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div className="md:col-span-2">
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Observações
               </label>
               <textarea
                 value={novoInstrumentoFisico.observacoes}
                 onChange={(e) => setNovoInstrumentoFisico(prev => ({ ...prev, observacoes: e.target.value }))}
                 placeholder="Observações adicionais..."
                 rows="3"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>
           </div>

           <div className="flex justify-end space-x-3 mt-8">
             <button
               onClick={() => setModalCriarFisico(false)}
               disabled={loadingAction}
               className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
             >
               Cancelar
             </button>
             <button
               onClick={handleCriarInstrumentoFisico}
               disabled={loadingAction || !novoInstrumentoFisico.instrumento_id || !novoInstrumentoFisico.codigo_patrimonio}
               className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
             >
               {loadingAction ? 'Cadastrando...' : 'Cadastrar Instrumento'}
             </button>
           </div>
         </div>
       </div>
     )}

     {/* Modal Criar Cessão */}
     {modalCessao && (
       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
           <h3 className="text-xl font-semibold text-gray-900 mb-6">Nova Cessão de Instrumento</h3>
           
           <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Instrumento *
               </label>
               <select
                 value={novaCessao.instrumento_fisico_id}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, instrumento_fisico_id: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               >
                 <option value="">Selecione o instrumento</option>
                 {instrumentosFisicos.filter(f => f.disponivel).map(fisico => (
                   <option key={fisico.id} value={fisico.id}>
                     {fisico.codigo_patrimonio} - {fisico.marca} {fisico.modelo}
                   </option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Aluno *
               </label>
               <input
                 type="text"
                 value={novaCessao.aluno_id}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, aluno_id: e.target.value }))}
                 placeholder="ID do aluno (busca será implementada)"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Tipo de Cessão
               </label>
               <select
                 value={novaCessao.tipo_cessao}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, tipo_cessao: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               >
                 <option value="temporaria">Temporária</option>
                 <option value="comodato">Comodato</option>
                 <option value="emprestimo_aula">Empréstimo para Aula</option>
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Data de Devolução Prevista
               </label>
               <input
                 type="date"
                 value={novaCessao.data_fim_prevista}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, data_fim_prevista: e.target.value }))}
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 Condições de Uso
               </label>
               <textarea
                 value={novaCessao.condicoes_uso}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, condicoes_uso: e.target.value }))}
                 placeholder="Condições e responsabilidades..."
                 rows="3"
                 className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
               />
             </div>

             <div className="flex items-center gap-2">
               <input
                 type="checkbox"
                 checked={novaCessao.termo_responsabilidade}
                 onChange={(e) => setNovaCessao(prev => ({ ...prev, termo_responsabilidade: e.target.checked }))}
                 className="rounded border-gray-300 text-red-600 focus:ring-red-500"
               />
               <label className="text-sm text-gray-700">
                 Termo de responsabilidade assinado
               </label>
             </div>
           </div>

           <div className="flex justify-end space-x-3 mt-8">
             <button
               onClick={() => setModalCessao(false)}
               disabled={loadingAction}
               className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
             >
               Cancelar
             </button>
             <button
               onClick={handleCriarCessao}
               disabled={loadingAction || !novaCessao.instrumento_fisico_id || !novaCessao.aluno_id}
               className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
             >
               {loadingAction ? 'Criando...' : 'Criar Cessão'}
             </button>
           </div>
         </div>
       </div>
     )}
   </div>
 );
};

// Componente do Card do Instrumento (mantido igual)
const InstrumentoCard = ({ instrumento, onEditar, onExcluir, onVisualizar, loading }) => {
 const categoria = instrumentsService.getCategorias().find(cat => cat.id === instrumento.categoria);
 
 return (
   <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all duration-300 group">
     <div className="flex items-start justify-between mb-4">
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-md">
           <span className="text-2xl">{categoria?.emoji || '🎵'}</span>
         </div>
         <div>
           <h3 className="text-lg font-semibold text-gray-900">{instrumento.nome}</h3>
           <p className="text-sm text-gray-600">{categoria?.nome || 'Categoria'}</p>
         </div>
       </div>
       
       <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button
           onClick={onVisualizar}
           disabled={loading}
           className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
           title="Visualizar detalhes"
         >
           <Eye className="w-4 h-4" />
         </button>
         <button
           onClick={onEditar}
           disabled={loading}
           className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
           title="Editar instrumento"
         >
           <Edit3 className="w-4 h-4" />
         </button>
         <button
           onClick={onExcluir}
           disabled={loading}
           className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
           title="Desativar instrumento"
         >
           <Trash2 className="w-4 h-4" />
         </button>
       </div>
     </div>

     <div className="grid grid-cols-2 gap-4 mb-4">
       <div className="text-center">
         <p className="text-lg font-bold text-gray-900">{instrumento.estatisticas?.total_alunos || 0}</p>
         <p className="text-xs text-gray-600">Alunos</p>
       </div>
       <div className="text-center">
         <p className="text-lg font-bold text-gray-900">{instrumento.estatisticas?.total_professores || 0}</p>
         <p className="text-xs text-gray-600">Professores</p>
       </div>
       <div className="text-center">
         <p className="text-lg font-bold text-gray-900">{instrumento.estatisticas?.novos_alunos_30dias || 0}</p>
         <p className="text-xs text-gray-600">Novos (30d)</p>
       </div>
       <div className="text-center">
         <p className="text-lg font-bold text-gray-900">
           {instrumento.estatisticas?.media_experiencia_professores || 0}a
         </p>
         <p className="text-xs text-gray-600">Exp. Média</p>
       </div>
     </div>

     <button
       onClick={onVisualizar}
       disabled={loading}
       className="w-full px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium flex items-center justify-center gap-2 group disabled:opacity-50"
     >
       <span>Ver Detalhes</span>
       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
     </button>
   </div>
 );
};

// Novo Componente: Card de Instrumento Físico
const InstrumentoFisicoCard = ({ fisico, onIniciarCessao, onIniciarManutencao, loading }) => {
 const categoria = instrumentsService.getCategorias().find(cat => 
   cat.id === fisico.instrumentos?.categoria
 );

 const getStatusColor = (estado, disponivel) => {
   if (!disponivel && estado === 'bom') return 'border-orange-500 bg-orange-50';
   if (estado === 'manutencao') return 'border-yellow-500 bg-yellow-50';
   if (estado === 'danificado') return 'border-red-500 bg-red-50';
   return 'border-green-500 bg-green-50';
 };

 const getStatusText = (estado, disponivel) => {
   if (!disponivel && estado === 'bom') return 'Em Uso';
   if (estado === 'manutencao') return 'Manutenção';
   if (estado === 'danificado') return 'Danificado';
   return 'Disponível';
 };

 return (
   <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border-2 ${getStatusColor(fisico.estado, fisico.disponivel)} hover:shadow-xl transition-all duration-300 group`}>
     <div className="flex items-start justify-between mb-4">
       <div className="flex items-center gap-3">
         <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
           <span className="text-2xl">{categoria?.emoji || '🎵'}</span>
         </div>
         <div>
           <h3 className="text-lg font-semibold text-gray-900">{fisico.codigo_patrimonio}</h3>
           <p className="text-sm text-gray-600">{fisico.instrumentos?.nome}</p>
           <p className="text-xs text-gray-500">{fisico.marca} {fisico.modelo}</p>
         </div>
       </div>
       
       <div className="text-right">
         <span className={`px-3 py-1 rounded-full text-xs font-medium ${
           fisico.disponivel && fisico.estado === 'bom' ? 'bg-green-100 text-green-700' :
           !fisico.disponivel && fisico.estado === 'bom' ? 'bg-orange-100 text-orange-700' :
           fisico.estado === 'manutencao' ? 'bg-yellow-100 text-yellow-700' :
           'bg-red-100 text-red-700'
         }`}>
           {getStatusText(fisico.estado, fisico.disponivel)}
         </span>
       </div>
     </div>

     <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
       <div>
         <p className="text-gray-600">Localização:</p>
         <p className="font-medium">{fisico.localizacao || 'Não informado'}</p>
       </div>
       <div>
         <p className="text-gray-600">Valor:</p>
         <p className="font-medium">R$ {fisico.valor_aquisicao || '0,00'}</p>
       </div>
       <div>
         <p className="text-gray-600">Série:</p>
         <p className="font-medium">{fisico.numero_serie || 'N/A'}</p>
       </div>
       <div>
         <p className="text-gray-600">Aquisição:</p>
         <p className="font-medium">
           {fisico.data_aquisicao ? new Date(fisico.data_aquisicao).toLocaleDateString('pt-BR') : 'N/A'}
         </p>
       </div>
     </div>

     <div className="flex gap-2">
       {fisico.disponivel && fisico.estado === 'bom' && (
         <button
           onClick={onIniciarCessao}
           disabled={loading}
           className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
         >
           Emprestar
         </button>
       )}
       
       {fisico.estado === 'bom' && (
         <button
           onClick={onIniciarManutencao}
           disabled={loading}
           className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm"
         >
           Manutenção
         </button>
       )}
     </div>

     {fisico.observacoes && (
       <div className="mt-3 p-2 bg-gray-50 rounded-lg">
         <p className="text-xs text-gray-600">{fisico.observacoes}</p>
       </div>
     )}
   </div>
 );
};

// Novo Componente: Card de Cessão
const CessaoCard = ({ cessao, onFinalizar, loading }) => {
 const diasRestantes = Math.ceil(
   (new Date(cessao.data_fim_prevista) - new Date()) / (1000 * 60 * 60 * 24)
 );

 return (
   <div className={`bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 ${
     diasRestantes <= 0 ? 'border-red-500' : diasRestantes <= 7 ? 'border-yellow-500' : 'border-green-500'
   }`}>
     <div className="flex items-center justify-between">
       <div className="flex-1">
         <div className="flex items-center gap-4 mb-3">
           <h3 className="text-lg font-semibold text-gray-900">
             {cessao.instrumentos_fisicos?.codigo_patrimonio}
           </h3>
           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
             diasRestantes <= 0 ? 'bg-red-100 text-red-700' :
             diasRestantes <= 7 ? 'bg-yellow-100 text-yellow-700' :
             'bg-green-100 text-green-700'
           }`}>
             {diasRestantes <= 0 ? 'VENCIDA' : `${diasRestantes} dias`}
           </span>
         </div>
         
         <div className="grid grid-cols-2 gap-4 text-sm">
           <div>
             <p className="text-gray-600">Aluno:</p>
             <p className="font-medium">{cessao.alunos?.profiles?.full_name}</p>
           </div>
           <div>
             <p className="text-gray-600">Tipo:</p>
             <p className="font-medium capitalize">{cessao.tipo_cessao}</p>
           </div>
           <div>
             <p className="text-gray-600">Início:</p>
             <p className="font-medium">{new Date(cessao.data_inicio).toLocaleDateString('pt-BR')}</p>
           </div>
           <div>
             <p className="text-gray-600">Devolução Prevista:</p>
             <p className="font-medium">{new Date(cessao.data_fim_prevista).toLocaleDateString('pt-BR')}</p>
           </div>
         </div>
       </div>
       
       <div className="ml-4">
         <button
           onClick={onFinalizar}
           disabled={loading}
           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
         >
           Finalizar
         </button>
       </div>
     </div>
   </div>
 );
};

// Novo Componente: Card de Manutenção
const ManutencaoCard = ({ manutencao, loading }) => {
 return (
   <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
     <div className="flex items-center justify-between">
       <div className="flex-1">
         <div className="flex items-center gap-4 mb-3">
           <h3 className="text-lg font-semibold text-gray-900">
             {manutencao.instrumentos_fisicos?.codigo_patrimonio}
           </h3>
           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
             manutencao.status === 'aguardando' ? 'bg-yellow-100 text-yellow-700' :
             'bg-blue-100 text-blue-700'
           }`}>
             {manutencao.status === 'aguardando' ? 'Aguardando' : 'Em Andamento'}
           </span>
         </div>
         
         <div className="grid grid-cols-2 gap-4 text-sm">
           <div>
             <p className="text-gray-600">Tipo:</p>
             <p className="font-medium capitalize">{manutencao.tipo_manutencao}</p>
           </div>
           <div>
             <p className="text-gray-600">Técnico:</p>
             <p className="font-medium">{manutencao.tecnico_responsavel || 'Não definido'}</p>
           </div>
           <div>
             <p className="text-gray-600">Entrada:</p>
             <p className="font-medium">{new Date(manutencao.data_entrada).toLocaleDateString('pt-BR')}</p>
           </div>
           <div>
             <p className="text-gray-600">Previsão:</p>
             <p className="font-medium">
               {manutencao.data_saida_prevista ? 
                 new Date(manutencao.data_saida_prevista).toLocaleDateString('pt-BR') : 
                 'Não definida'
               }
             </p>
           </div>
         </div>
         
         {manutencao.descricao_problema && (
           <div className="mt-3">
             <p className="text-gray-600 text-sm">Problema:</p>
             <p className="text-sm">{manutencao.descricao_problema}</p>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

export default AdminInstruments;