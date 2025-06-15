// features/admin/pages/AdminAlunosTest.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';

const AdminAlunosTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testSupabase = async () => {
      try {
        console.log('🧪 Teste básico iniciado...');
        
        // Teste super simples
        const { data: testData, error: testError } = await supabase
          .from('profiles')
          .select('id, email, tipo_usuario')
          .eq('tipo_usuario', 'aluno')
          .limit(5);

        if (testError) {
          throw testError;
        }

        console.log('✅ Teste bem-sucedido:', testData);
        setData(testData);
        
      } catch (err) {
        console.error('❌ Erro no teste:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    testSupabase();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Teste de Conexão</h1>
        <p>Carregando teste...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Erro no Teste</h1>
        <p className="bg-red-100 p-4 rounded">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-green-600">Teste Bem-sucedido!</h1>
      <p className="mb-4">Encontrados {data?.length || 0} alunos:</p>
      
      <div className="bg-gray-100 p-4 rounded">
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => window.location.href = '/admin'}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar ao Admin
        </button>
      </div>
    </div>
  );
};

export default AdminAlunosTest;