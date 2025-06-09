import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/contexts/AuthContext';
import { supabase } from '../../shared/lib/supabase/supabaseClient';

const DebugAdminPanel = () => {
  const { user, userProfile } = useAuth();
  const [debugInfo, setDebugInfo] = useState({});
  const [loading, setLoading] = useState(false);

  const testarConexoes = async () => {
    setLoading(true);
    const debug = {};

    try {
      // 1. Testar dados do usuário atual
      debug.usuarioAtual = {
        user: user,
        userProfile: userProfile
      };

      // 2. Testar busca de profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(5);

      debug.profiles = {
        data: profiles,
        error: profilesError,
        count: profiles?.length || 0
      };

      // 3. Testar busca de conteúdos
      const { data: conteudos, error: conteudosError } = await supabase
        .from('professores_conteudos')
        .select('*')
        .limit(5);

      debug.conteudos = {
        data: conteudos,
        error: conteudosError,
        count: conteudos?.length || 0
      };

      // 4. Testar filtro de alunos
      const { data: alunos, error: alunosError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'aluno');

      debug.alunos = {
        data: alunos,
        error: alunosError,
        count: alunos?.length || 0
      };

      // 5. Testar se tem admin
      const { data: admins, error: adminsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('tipo_usuario', 'admin');

      debug.admins = {
        data: admins,
        error: adminsError,
        count: admins?.length || 0
      };

    } catch (error) {
      debug.erro_geral = error.message;
    }

    setDebugInfo(debug);
    setLoading(false);
  };

  useEffect(() => {
    testarConexoes();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">🔍 Debug do Painel Admin</h1>
            <button
              onClick={testarConexoes}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testando...' : '🔄 Testar Novamente'}
            </button>
          </div>

          <div className="space-y-6">
            {/* Usuário Atual */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">👤 Usuário Atual</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700">Auth User:</h4>
                  <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(debugInfo.usuarioAtual?.user, null, 2)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">User Profile:</h4>
                  <pre className="text-sm bg-white p-2 rounded border overflow-x-auto">
                    {JSON.stringify(debugInfo.usuarioAtual?.userProfile, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Profiles */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">👥 Profiles (Todos)</h3>
              <div className="mb-2">
                <span className="font-medium">Count: </span>
                <span className="text-blue-600">{debugInfo.profiles?.count || 0}</span>
              </div>
              {debugInfo.profiles?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                  Erro: {debugInfo.profiles.error.message}
                </div>
              )}
              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto max-h-60">
                {JSON.stringify(debugInfo.profiles?.data, null, 2)}
              </pre>
            </div>

            {/* Alunos */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">👨‍🎓 Alunos (tipo_usuario = 'aluno')</h3>
              <div className="mb-2">
                <span className="font-medium">Count: </span>
                <span className="text-green-600">{debugInfo.alunos?.count || 0}</span>
              </div>
              {debugInfo.alunos?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                  Erro: {debugInfo.alunos.error.message}
                </div>
              )}
              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto max-h-60">
                {JSON.stringify(debugInfo.alunos?.data, null, 2)}
              </pre>
            </div>

            {/* Admins */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">👨‍💼 Admins (tipo_usuario = 'admin')</h3>
              <div className="mb-2">
                <span className="font-medium">Count: </span>
                <span className="text-purple-600">{debugInfo.admins?.count || 0}</span>
              </div>
              {debugInfo.admins?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                  Erro: {debugInfo.admins.error.message}
                </div>
              )}
              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto max-h-60">
                {JSON.stringify(debugInfo.admins?.data, null, 2)}
              </pre>
            </div>

            {/* Conteúdos */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">📚 Conteúdos</h3>
              <div className="mb-2">
                <span className="font-medium">Count: </span>
                <span className="text-yellow-600">{debugInfo.conteudos?.count || 0}</span>
              </div>
              {debugInfo.conteudos?.error && (
                <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
                  Erro: {debugInfo.conteudos.error.message}
                </div>
              )}
              <pre className="text-sm bg-white p-2 rounded border overflow-x-auto max-h-60">
                {JSON.stringify(debugInfo.conteudos?.data, null, 2)}
              </pre>
            </div>

            {/* Erro Geral */}
            {debugInfo.erro_geral && (
              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3 text-red-800">❌ Erro Geral</h3>
                <pre className="text-sm bg-white p-2 rounded border text-red-700">
                  {debugInfo.erro_geral}
                </pre>
              </div>
            )}
          </div>

          {/* Instruções */}
          <div className="mt-8 bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-blue-800">📋 Como usar este debug</h3>
            <div className="text-sm text-blue-700 space-y-2">
              <p>1. <strong>Usuário Atual:</strong> Verifica se você está logado e com que perfil</p>
              <p>2. <strong>Profiles:</strong> Mostra todos os usuários da tabela profiles</p>
              <p>3. <strong>Alunos:</strong> Filtra apenas usuários com tipo_usuario = 'aluno'</p>
              <p>4. <strong>Admins:</strong> Filtra apenas usuários com tipo_usuario = 'admin'</p>
              <p>5. <strong>Conteúdos:</strong> Mostra dados da tabela professores_conteudos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAdminPanel;