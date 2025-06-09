import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

import {
  ArrowLeft,
  Settings,
  Users,
  Shield,
  Database,
  Bell,
  Palette,
  Music,
  Crown,
  ChevronRight,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Lock,
  Unlock,
  Mail,
  Globe,
  Server,
  Key,
  Upload,
  Download
} from 'lucide-react';

const AdminConfiguracoes = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('usuarios');
  const [saving, setSaving] = useState(false);

  // Estados para configurações
  const [usuarios, setUsuarios] = useState([]);
  const [instrumentosConfig, setInstrumentosConfig] = useState([]);
  const [sistemaConfig, setSistemaConfig] = useState({
    nome_escola: 'Nipo School',
    email_contato: 'contato@niposchool.com',
    telefone: '(11) 99999-9999',
    endereco: 'São Paulo, SP',
    horario_funcionamento: '08:00 - 22:00',
    max_alunos_por_turma: 20,
    backup_automatico: true,
    notificacoes_email: true,
    modo_manutencao: false
  });

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('⚙️ Carregando configurações...');

      // Buscar todos os usuários
      const { data: todosUsuarios, error: usuariosError } = await supabase
        .from('profiles')
        .select('*')
        .order('joined_at', { ascending: false });

      if (usuariosError) throw usuariosError;

      setUsuarios(todosUsuarios || []);

      // Configurações de instrumentos (simulado - pode vir de uma tabela específica)
      setInstrumentosConfig([
        { id: 1, nome: 'Piano', ativo: true, max_nivel: 'expert', cor: '#3B82F6' },
        { id: 2, nome: 'Violão', ativo: true, max_nivel: 'advanced', cor: '#10B981' },
        { id: 3, nome: 'Bateria', ativo: true, max_nivel: 'advanced', cor: '#F59E0B' },
        { id: 4, nome: 'Flauta', ativo: true, max_nivel: 'intermediate', cor: '#8B5CF6' },
        { id: 5, nome: 'Violino', ativo: true, max_nivel: 'expert', cor: '#EF4444' },
        { id: 6, nome: 'Saxofone', ativo: true, max_nivel: 'advanced', cor: '#F97316' },
        { id: 7, nome: 'Teclado', ativo: true, max_nivel: 'intermediate', cor: '#06B6D4' }
      ]);

      console.log('✅ Configurações carregadas');

    } catch (err) {
      console.error('❌ Erro ao carregar configurações:', err);
      setError('Erro ao carregar configurações: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracoes = async (tipo) => {
    try {
      setSaving(true);
      console.log(`💾 Salvando configurações: ${tipo}`);

      // Simular salvamento (aqui você implementaria a lógica real)
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert(`Configurações de ${tipo} salvas com sucesso!`);

    } catch (err) {
      console.error('❌ Erro ao salvar:', err);
      alert('Erro ao salvar configurações: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const alterarTipoUsuario = async (userId, novoTipo) => {
    try {
      console.log(`👤 Alterando tipo de usuário: ${userId} -> ${novoTipo}`);

      const { error } = await supabase
        .from('profiles')
        .update({ tipo_usuario: novoTipo })
        .eq('id', userId);

      if (error) throw error;

      // Atualizar estado local
      setUsuarios(prev => prev.map(user => 
        user.id === userId ? { ...user, tipo_usuario: novoTipo } : user
      ));

      alert(`Usuário alterado para ${novoTipo} com sucesso!`);

    } catch (err) {
      console.error('❌ Erro ao alterar tipo:', err);
      alert('Erro ao alterar tipo de usuário: ' + err.message);
    }
  };

  const toggleInstrumento = (id) => {
    setInstrumentosConfig(prev => prev.map(inst => 
      inst.id === id ? { ...inst, ativo: !inst.ativo } : inst
    ));
  };

  const adicionarInstrumento = () => {
    const nome = prompt('Nome do novo instrumento:');
    if (nome) {
      const novoInstrumento = {
        id: Date.now(),
        nome: nome,
        ativo: true,
        max_nivel: 'intermediate',
        cor: '#6B7280'
      };
      setInstrumentosConfig(prev => [...prev, novoInstrumento]);
    }
  };

  const removerInstrumento = (id) => {
    if (confirm('Tem certeza que deseja remover este instrumento?')) {
      setInstrumentosConfig(prev => prev.filter(inst => inst.id !== id));
    }
  };

  useEffect(() => {
    if (userProfile?.tipo_usuario !== 'admin') {
      setError('Acesso negado. Apenas administradores podem acessar esta área.');
      setLoading(false);
      return;
    }
    carregarDados();
  }, [userProfile]);

  const TabButton = ({ id, label, icon: IconComponent, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-500 text-white shadow-md' 
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {IconComponent && <IconComponent className="w-4 h-4" />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  const ConfigCard = ({ title, description, children, onSave, saveLabel = "Salvar" }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        {onSave && (
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Salvando...' : saveLabel}
          </button>
        )}
      </div>
      {children}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <p className="text-base text-gray-700">Carregando configurações...</p>
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
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900">Configurações do Sistema</h1>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Crown className="w-3 h-3" />
                    <span>Admin</span>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-purple-600 font-medium">Configurações</span>
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
        {/* Navegação por Abas */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-100">
            <TabButton 
              id="usuarios" 
              label="Gestão de Usuários" 
              icon={Users} 
              active={activeTab === 'usuarios'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="instrumentos" 
              label="Instrumentos" 
              icon={Music} 
              active={activeTab === 'instrumentos'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="sistema" 
              label="Sistema" 
              icon={Settings} 
              active={activeTab === 'sistema'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="seguranca" 
              label="Segurança" 
              icon={Shield} 
              active={activeTab === 'seguranca'} 
              onClick={setActiveTab} 
            />
            <TabButton 
              id="notificacoes" 
              label="Notificações" 
              icon={Bell} 
              active={activeTab === 'notificacoes'} 
              onClick={setActiveTab} 
            />
          </div>
        </div>

        {/* Conteúdo das Abas */}
        
        {/* ABA: Gestão de Usuários */}
        {activeTab === 'usuarios' && (
          <div className="space-y-8">
            <ConfigCard 
              title="Gestão de Usuários" 
              description="Gerencie tipos de usuário e permissões"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Usuário</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo Atual</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Último Acesso</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.slice(0, 10).map((usuario) => (
                      <tr key={usuario.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              usuario.tipo_usuario === 'admin' ? 'bg-red-500 text-white' :
                              usuario.tipo_usuario === 'professor' ? 'bg-blue-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                              {(usuario.nome || usuario.full_name || usuario.email).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {usuario.nome || usuario.full_name || 'Sem nome'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">{usuario.instrument || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">{usuario.email}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            usuario.tipo_usuario === 'admin' ? 'bg-red-100 text-red-800' :
                            usuario.tipo_usuario === 'professor' ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {usuario.tipo_usuario}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600">
                          {usuario.last_active ? new Date(usuario.last_active).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="py-4 px-4">
                          <select
                            value={usuario.tipo_usuario}
                            onChange={(e) => alterarTipoUsuario(usuario.id, e.target.value)}
                            className="text-sm border border-gray-200 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="aluno">Aluno</option>
                            <option value="professor">Professor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {usuarios.length > 10 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    Mostrando 10 de {usuarios.length} usuários
                  </p>
                </div>
              )}
            </ConfigCard>

            <ConfigCard 
              title="Ações em Lote" 
              description="Realizar ações em múltiplos usuários"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors text-center">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium text-blue-900">Promover Alunos</div>
                  <div className="text-sm text-blue-600">Para professores</div>
                </button>
                
                <button className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors text-center">
                  <Lock className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <div className="font-medium text-yellow-900">Reset Senhas</div>
                  <div className="text-sm text-yellow-600">Em lote</div>
                </button>
                
                <button className="p-4 border border-green-200 bg-green-50 rounded-xl hover:bg-green-100 transition-colors text-center">
                  <Mail className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <div className="font-medium text-green-900">Enviar Email</div>
                  <div className="text-sm text-green-600">Para todos</div>
                </button>
              </div>
            </ConfigCard>
          </div>
        )}

        {/* ABA: Instrumentos */}
        {activeTab === 'instrumentos' && (
          <div className="space-y-8">
            <ConfigCard 
              title="Instrumentos Disponíveis" 
              description="Configure os instrumentos oferecidos pela escola"
              onSave={() => salvarConfiguracoes('instrumentos')}
            >
              <div className="space-y-4">
                {instrumentosConfig.map((instrumento) => (
                  <div key={instrumento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: instrumento.cor }}
                      ></div>
                      <div>
                        <p className="font-medium text-gray-900">{instrumento.nome}</p>
                        <p className="text-sm text-gray-600">Nível máximo: {instrumento.max_nivel}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={instrumento.ativo}
                          onChange={() => toggleInstrumento(instrumento.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Ativo</span>
                      </label>
                      
                      <button
                        onClick={() => removerInstrumento(instrumento.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={adicionarInstrumento}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-blue-600"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Novo Instrumento
                </button>
              </div>
            </ConfigCard>

            <ConfigCard 
              title="Configurações de Níveis" 
              description="Defina os níveis de dificuldade disponíveis"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['beginner', 'intermediate', 'advanced', 'expert'].map((nivel) => (
                  <div key={nivel} className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-medium text-gray-900 capitalize mb-2">{nivel}</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm text-gray-700">Disponível</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Descrição"
                        className="w-full text-sm border border-gray-200 rounded px-2 py-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ConfigCard>
          </div>
        )}

        {/* ABA: Sistema */}
        {activeTab === 'sistema' && (
          <div className="space-y-8">
            <ConfigCard 
              title="Informações da Escola" 
              description="Configure os dados básicos da instituição"
              onSave={() => salvarConfiguracoes('sistema')}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Escola</label>
                  <input
                    type="text"
                    value={sistemaConfig.nome_escola}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, nome_escola: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email de Contato</label>
                  <input
                    type="email"
                    value={sistemaConfig.email_contato}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, email_contato: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={sistemaConfig.telefone}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, telefone: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Horário de Funcionamento</label>
                  <input
                    type="text"
                    value={sistemaConfig.horario_funcionamento}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, horario_funcionamento: e.target.value})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Alunos por Turma</label>
                  <input
                    type="number"
                    value={sistemaConfig.max_alunos_por_turma}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, max_alunos_por_turma: parseInt(e.target.value)})}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
                  <textarea
                    value={sistemaConfig.endereco}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, endereco: e.target.value})}
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </ConfigCard>

            <ConfigCard 
              title="Configurações Operacionais" 
              description="Ajustes gerais do sistema"
            >
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Backup Automático</p>
                    <p className="text-sm text-gray-600">Realizar backup diário automaticamente</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sistemaConfig.backup_automatico}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, backup_automatico: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notificações por Email</p>
                    <p className="text-sm text-gray-600">Enviar notificações importantes por email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sistemaConfig.notificacoes_email}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, notificacoes_email: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900">Modo Manutenção</p>
                    <p className="text-sm text-red-600">Desabilita acesso para usuários (exceto admins)</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={sistemaConfig.modo_manutencao}
                    onChange={(e) => setSistemaConfig({...sistemaConfig, modo_manutencao: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </label>
              </div>
            </ConfigCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminConfiguracoes;  