import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Play, BookOpen, User } from 'lucide-react';
import { supabase } from '../../shared/lib/supabase/supabaseClient';
import { useAuth } from '../../shared/contexts/AuthContext';

const ProximasAulas = () => {
  const { user } = useAuth();
  const [proximasAulas, setProximasAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchProximasAulas();
    }
  }, [user?.id]);

  const fetchProximasAulas = async () => {
    try {
      // Buscar matrículas ativas do aluno
      const { data: matriculas, error: matriculasError } = await supabase
        .from('matriculas')
        .select(`
          turma_id,
          turmas!inner(
            id,
            nome,
            horario,
            dia_semana,
            data_inicio,
            data_fim,
            professor_id,
            instrumentos!inner(nome),
            professores!inner(
              profiles!inner(full_name)
            )
          )
        `)
        .eq('aluno_id', user.id)
        .eq('status', 'ativa');

      if (matriculasError) throw matriculasError;

      // Processar próximas aulas
      const agora = new Date();
      const proximasAulasData = [];

      matriculas?.forEach(matricula => {
        const turma = matricula.turmas;
        const proximas = getProximasAulasTurma(turma, agora);
        proximasAulasData.push(...proximas);
      });

      // Ordenar por data/hora
      proximasAulasData.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

      setProximasAulas(proximasAulasData.slice(0, 5)); // Mostrar apenas 5 próximas

    } catch (error) {
      console.error('Erro ao buscar próximas aulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProximasAulasTurma = (turma, agora) => {
    const proximas = [];
    const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
    const diaTurma = diasSemana.indexOf(turma.dia_semana.toLowerCase());
    
    if (diaTurma === -1) return proximas;

    // Calcular próximas 4 semanas
    for (let semana = 0; semana < 4; semana++) {
      const proximaData = new Date(agora);
      const diasAteProximaAula = (diaTurma - proximaData.getDay() + 7) % 7;
      proximaData.setDate(proximaData.getDate() + diasAteProximaAula + (semana * 7));
      
      // Verificar se está dentro do período da turma
      const dataInicio = new Date(turma.data_inicio);
      const dataFim = new Date(turma.data_fim);
      
      if (proximaData >= dataInicio && proximaData <= dataFim && proximaData > agora) {
        // Adicionar horário
        const [hora, minuto] = turma.horario.split(':');
        proximaData.setHours(parseInt(hora), parseInt(minuto), 0, 0);

        proximas.push({
          id: `${turma.id}-${proximaData.getTime()}`,
          turma: turma.nome,
          instrumento: turma.instrumentos.nome,
          professor: turma.professores.profiles.full_name,
          dataHora: proximaData.toISOString(),
          dia: proximaData.toLocaleDateString('pt-BR', { weekday: 'long' }),
          data: proximaData.toLocaleDateString('pt-BR'),
          horario: turma.horario
        });
      }
    }

    return proximas;
  };

  const formatarTempo = (dataHora) => {
    const agora = new Date();
    const aula = new Date(dataHora);
    const diffHoras = Math.ceil((aula - agora) / (1000 * 60 * 60));
    
    if (diffHoras < 24) {
      return `em ${diffHoras}h`;
    } else {
      const diffDias = Math.ceil(diffHoras / 24);
      return `em ${diffDias} dias`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-green-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-500" />
          Próximas Aulas
        </h2>
        <div className="bg-green-50 px-3 py-1 rounded-full">
          <span className="text-green-700 font-bold text-sm">{proximasAulas.length}</span>
        </div>
      </div>

      {proximasAulas.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Nenhuma aula agendada.</p>
          <p className="text-sm text-gray-500 mt-2">Consulte suas turmas para mais informações.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proximasAulas.map((aula) => (
            <div
              key={aula.id}
              className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">
                  {aula.turma}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {aula.instrumento} • Prof. {aula.professor}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-green-600 font-medium flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {aula.horario}
                  </span>
                  <span className="text-xs text-gray-500">
                    {aula.dia}, {aula.data}
                  </span>
                  <span className="text-xs text-blue-600 font-medium">
                    {formatarTempo(aula.dataHora)}
                  </span>
                </div>
              </div>

              <button className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                <Play className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProximasAulas;