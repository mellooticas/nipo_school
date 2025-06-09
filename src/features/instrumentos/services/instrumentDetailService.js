import { supabase } from '../../../shared/lib/supabase/supabaseClient';

export const instrumentDetailService = {

  /**
   * Busca os dados completos de um instrumento, alinhado com a estrutura real do banco.
   * @param {string} instrumentoId - O ID do instrumento.
   * @returns {Promise<object>} - Um objeto com todos os dados ou um erro.
   */
  async getInstrumentoCompleto(instrumentoId) {
    if (!instrumentoId) {
      return { success: false, error: 'ID do instrumento não fornecido.' };
    }

    console.log(`🔍 Buscando dados completos para o instrumento: ${instrumentoId}`);

    try {
      // 1. Busca o registro principal do instrumento, que já contém os detalhes.
      const instrumentoPrincipalPromise = supabase
        .from('instrumentos')
        .select('*') // Pega todas as colunas, incluindo historia, origem, etc.
        .eq('id', instrumentoId)
        .single(); // .single() retorna um objeto só, ou um erro se não encontrar.

      // 2. Busca os dados das tabelas relacionadas em paralelo.
      const sonsPromise = supabase.from('instrumento_sons').select('*').eq('instrumento_id', instrumentoId);
      const midiasPromise = supabase.from('instrumento_midias').select('*').eq('instrumento_id', instrumentoId);
      const tecnicasPromise = supabase.from('instrumento_tecnicas').select('*').eq('instrumento_id', instrumentoId);
      const curiosidadesPromise = supabase.from('instrumento_curiosidades').select('*').eq('instrumento_id', instrumentoId);
      const performancesPromise = supabase.from('instrumento_performances').select('*').eq('instrumento_id', instrumentoId);
      const quizPromise = supabase.from('instrumento_quiz').select('*').eq('instrumento_id', instrumentoId);
      const relacionadosPromise = supabase.from('instrumentos_relacionados').select('*').eq('instrumento_id', instrumentoId);

      // Executa todas as buscas ao mesmo tempo
      const [
        instrumentoPrincipalRes,
        sonsRes,
        midiasRes,
        tecnicasRes,
        curiosidadesRes,
        performancesRes,
        quizRes,
        relacionadosRes
      ] = await Promise.all([
        instrumentoPrincipalPromise,
        sonsPromise,
        midiasPromise,
        tecnicasPromise,
        curiosidadesPromise,
        performancesPromise,
        quizPromise,
        relacionadosPromise
      ]);
      
      if (instrumentoPrincipalRes.error) {
        throw new Error(`Instrumento principal não encontrado: ${instrumentoPrincipalRes.error.message}`);
      }

      // Combina tudo em um único objeto de retorno
      const dadosCompletos = {
        instrumentoDetalhado: instrumentoPrincipalRes.data, // Agora contém historia, origem, etc.
        sons: sonsRes.data || [],
        midias: midiasRes.data || [],
        tecnicas: tecnicasRes.data || [],
        curiosidades: curiosidadesRes.data || [],
        performances: performancesRes.data || [],
        quiz: quizRes.data || [],
        relacionados: relacionadosRes.data || []
      };

      console.log('✅ Dados completos do instrumento obtidos com sucesso!', dadosCompletos);
      return { success: true, data: dadosCompletos };

    } catch (error) {
      console.error('❌ Erro no getInstrumentoCompleto:', error.message);
      return { success: false, error: error.message, data: {} };
    }
  }
};