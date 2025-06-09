// Barrel export para todos os hooks

// Hooks existentes
export { useModules } from './useModules';
export { useAchievements } from './useAchievements';
export { useProgress } from './useProgress';
export { useDevotionals } from './useDevotionals';

// Novos hooks - Sistema de Instrumentos
export { 
  useInstruments, 
  useInstrumentosList, 
  useInstrumentosComStats 
} from './useInstruments';

export { 
  useInstrumentPage, 
  useInstrumentActivities, 
  useInstrumentProgress, 
  useInstrumentContent, 
  useInstrumentRanking, 
  useProximasAtividades 
} from './useInstrumentPage';

// Adicionar esta linha no final do arquivo shared/hooks/index.js:

// Hooks de Turmas
export { 
  useTurmas, 
  useTurma, 
  useMatriculas, 
  useTurmasStats, 
  useTurmasProfessor, 
  useTurmasInstrumento, 
  useTurmasDisponiveis 
} from './useTurmas';