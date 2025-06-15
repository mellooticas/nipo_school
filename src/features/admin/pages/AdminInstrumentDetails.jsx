import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// --- ÍCONES ---
import {
  Music, Users, GraduationCap, BookOpen, Activity, ChevronLeft,
  RefreshCw, Settings, BarChart3, Target, Trophy, Star, Crown,
  ArrowLeft, Home, Volume2, Image, Clock, Brain, Search, Link,
  Play, Pause, Download, Eye, Heart, Share, Filter, Tag, MapPin,
  X, Headphones, Radio
} from 'lucide-react';

// --- CONTEXTOS E HOOKS ---
import { useAuth } from '../../../shared/contexts/AuthContext';

// --- SERVIÇOS ---
import { instrumentsService } from '../../instrumentos/services/instrumentsService';
import { instrumentDetailService } from '../../instrumentos/services/instrumentDetailService';

// ============================================================================
// 1. COMPONENTES UTILITÁRIOS
// ============================================================================

const StatCard = ({ icon: Icon, value, label, color, delay = 0 }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const increment = value / 30;
      const counter = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, 50);
      return () => clearInterval(counter);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-6 border-l-4 border-${color}-500 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-xl group`}>
      <Icon className={`w-8 h-8 text-${color}-500 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`} />
      <p className="text-3xl font-bold text-gray-900 tabular-nums">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  );
};

const ProgressRing = ({ progress, size = 60, color = "purple" }) => {
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r="20" stroke="currentColor" 
                strokeWidth="4" fill="transparent" className="text-gray-200"/>
        <circle cx={size/2} cy={size/2} r="20" stroke="currentColor" 
                strokeWidth="4" fill="transparent" strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset} 
                className={`text-${color}-500 transition-all duration-1000 ease-out`}
                style={{ transitionDelay: '300ms' }} />
      </svg>
      <span className="absolute text-sm font-semibold text-gray-700">{progress}%</span>
    </div>
  );
};

const WaveformVisualizer = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-8">
    {[...Array(12)].map((_, i) => (
      <div key={i} 
           className={`w-1 bg-purple-500 rounded-full transition-all duration-300 ${
             isActive ? 'animate-pulse' : ''
           }`}
           style={{ 
             height: isActive ? `${Math.random() * 20 + 10}px` : '4px',
             animationDelay: `${i * 100}ms`,
             animationDuration: '800ms'
           }} />
    ))}
  </div>
);

// ============================================================================
// 2. MODAL DE MÍDIA
// ============================================================================

const MidiaModal = ({ midia, onClose }) => {
  if (!midia) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl transform scale-100 transition-all duration-300"
           onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{midia.titulo}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{midia.categoria}</span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{midia.nivel}</span>
              </div>
            </div>
            <button onClick={onClose} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-4 flex items-center justify-center">
            {midia.tipo === 'imagem' && <Image className="w-16 h-16 text-gray-400" />}
            {midia.tipo === 'video' && <Play className="w-16 h-16 text-gray-400" />}
            {midia.tipo === 'audio' && <Volume2 className="w-16 h-16 text-gray-400" />}
            {midia.tipo === '3d' && <Search className="w-16 h-16 text-gray-400" />}
          </div>
          
          <p className="text-gray-600 mb-4">{midia.descricao}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{midia.visualizacoes || 0} visualizações</span>
            </div>
            {midia.url && (
              <a href={midia.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Download className="w-4 h-4" />
                Abrir Original
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. COMPONENTES INTERNOS MELHORADOS
// ============================================================================

const SonsPlayer = ({ instrumento, sons, audioAtivo, setAudioAtivo }) => {
  const [audioElement, setAudioElement] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playAudio = (som) => {
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }
    
    // Simular reprodução (substitua por lógica real quando tiver arquivos de áudio)
    setAudioAtivo(som.id);
    setIsPlaying(true);
    
    // Simular duração
    setTimeout(() => {
      setIsPlaying(false);
      setAudioAtivo(null);
    }, 3000);
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
    }
    setIsPlaying(false);
    setAudioAtivo(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-purple-500" />
        Sons do {instrumento?.nome} ({sons.length})
      </h3>

      {/* Player Control */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
        <div className="flex items-center gap-4 mb-3">
          <Headphones className="w-5 h-5 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">
            {isPlaying ? 'Reproduzindo...' : 'Clique em um som para ouvir'}
          </span>
          {isPlaying && (
            <button onClick={stopAudio} 
                    className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors">
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <WaveformVisualizer isActive={isPlaying} />
      </div>
      
      {/* Grid de sons melhorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sons.map((som, index) => (
          <div key={som.id} 
               className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 cursor-pointer hover:-translate-y-1"
               onClick={() => playAudio(som)}
               style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  audioAtivo === som.id 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-110' 
                    : 'bg-purple-100 text-purple-600 group-hover:bg-purple-200 group-hover:scale-105'
                }`}>
                  {audioAtivo === som.id && isPlaying ? 
                    <Radio className="w-5 h-5 animate-pulse" /> : 
                    <Play className="w-5 h-5" />
                  }
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{som.nota_musical}</h4>
                  <p className="text-xs text-gray-500">{som.tecnica}</p>
                </div>
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {som.dinamica}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{som.artista_performer}</span>
              <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                audioAtivo === som.id ? 'opacity-100' : ''
              }`}>
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                  <Play className="w-3 h-3 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GaleriaMidias = ({ midias, filtroMidia, setFiltroMidia }) => {
  const [modalMidia, setModalMidia] = useState(null);
  const midiasFiltered = filtroMidia === 'todos' ? midias : midias.filter(midia => midia.tipo === filtroMidia);

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-500" />
            Galeria de Mídias ({midias.length})
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={filtroMidia} onChange={(e) => setFiltroMidia(e.target.value)} 
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all">
              <option value="todos">Todos</option>
              <option value="imagem">Imagens</option>
              <option value="video">Vídeos</option>
              <option value="audio">Áudios</option>
              <option value="3d">3D</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {midiasFiltered.map((midia, index) => (
            <div key={midia.id} 
                 className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 bg-white"
                 onClick={() => setModalMidia(midia)}
                 style={{ animationDelay: `${index * 150}ms` }}>
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {midia.tipo === 'imagem' && <Image className="w-12 h-12 text-gray-400" />}
                  {midia.tipo === 'video' && <Play className="w-12 h-12 text-gray-400" />}
                  {midia.tipo === 'audio' && <Volume2 className="w-12 h-12 text-gray-400" />}
                  {midia.tipo === '3d' && <Search className="w-12 h-12 text-gray-400" />}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{midia.titulo}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{midia.descricao}</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{midia.categoria}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{midia.nivel}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" /> 
                    {midia.visualizacoes || 0}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <MidiaModal midia={modalMidia} onClose={() => setModalMidia(null)} />
    </>
  );
};

const HistoriaInstrumento = ({ instrumento, curiosidades }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" />
        História do {instrumento?.nome}
      </h3>
      
      {instrumento?.historia && (
        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-700 leading-relaxed text-lg">{instrumento.historia}</p>
        </div>
      )}

      {instrumento && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Origem</h4>
            <p className="text-sm text-gray-600">{instrumento.origem}</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Tag className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Família</h4>
            <p className="text-sm text-gray-600">{instrumento.familia_instrumental}</p>
          </div>
          
          <div className="text-center group">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Dificuldade</h4>
            <p className="text-sm text-gray-600 capitalize">{instrumento.dificuldade_aprendizado}</p>
          </div>
        </div>
      )}
    </div>

    {curiosidades && curiosidades.length > 0 && (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Curiosidades ({curiosidades.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {curiosidades.map((cur, index) => (
            <div key={cur.id} 
                 className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-yellow-300 group"
                 style={{ animationDelay: `${index * 200}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                  💡
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-2 group-hover:text-yellow-600 transition-colors">{cur.titulo}</h4>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed">{cur.conteudo}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                      {cur.categoria}
                    </span>
                    {cur.fonte && (
                      <span className="text-xs text-gray-500">Fonte: {cur.fonte}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const TecnicasInstrumento = ({ tecnicas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  
  const tecnicasFiltered = tecnicas.filter(tecnica => {
    const matchSearch = searchTerm === '' || 
      tecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnica.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchNivel = filtroNivel === 'todos' || tecnica.nivel === filtroNivel;
    return matchSearch && matchNivel;
  });

  const tecnicasAgrupadas = tecnicasFiltered.reduce((grupos, tecnica) => {
    const grupo = tecnica.grupo_tecnico || 'Outras';
    if (!grupos[grupo]) grupos[grupo] = [];
    grupos[grupo].push(tecnica);
    return grupos;
  }, {});

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-500" />
        Técnicas de Aprendizado ({tecnicasFiltered.length})
      </h3>

      {/* Busca e filtros */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar técnicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>
        <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 transition-all">
          <option value="todos">Todos os níveis</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
      </div>

      <div className="space-y-8">
        {Object.entries(tecnicasAgrupadas).map(([grupo, tecnicasGrupo]) => (
          <div key={grupo}>
            <h4 className="font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              {grupo}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tecnicasGrupo
                .sort((a, b) => (a.ordem_aprendizado || 0) - (b.ordem_aprendizado || 0))
                .map((tecnica, index) => (
                <div key={tecnica.id} 
                     className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-green-300 group"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">{tecnica.nome}</h5>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      tecnica.nivel === 'iniciante' ? 'bg-green-100 text-green-700' :
                      tecnica.nivel === 'intermediario' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tecnica.nivel}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{tecnica.descricao}</p>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">
                        ⏱️ {tecnica.tempo_pratica_recomendado || 0} min/dia
                      </span>
                      {tecnica.tipo_tecnica && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                          {tecnica.tipo_tecnica}
                        </span>
                      )}
                    </div>
                    <ProgressRing progress={Math.min((tecnica.ordem_aprendizado || 1) * 10, 100)} size={30} color="green" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizInstrumento = ({ quiz }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
      <Brain className="w-5 h-5 text-purple-500" />
      Quiz Interativo ({quiz.length} perguntas)
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {quiz.map((pergunta, index) => (
        <div key={pergunta.id} 
             className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-purple-300 group"
             style={{ animationDelay: `${index * 150}ms` }}>
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
              {pergunta.pergunta}
            </h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              pergunta.dificuldade === 'facil' ? 'bg-green-100 text-green-700' :
              pergunta.dificuldade === 'medio' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {pergunta.dificuldade}
            </span>
          </div>
          
          <div className="space-y-1 mb-4">
            {JSON.parse(pergunta.opcoes).map((opcao, index) => (
              <div key={index} 
                   className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded hover:bg-gray-100 transition-colors cursor-pointer">
                {opcao}
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium">
              {pergunta.categoria}
            </span>
            <span className="text-gray-500 capitalize">{pergunta.tipo_pergunta}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PerformancesInstrumento = ({ performances }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
      <Star className="w-5 h-5 text-yellow-500" />
      Performances Famosas ({performances.length})
    </h3>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {performances.map((performance, index) => (
        <div key={performance.id} 
             className="border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-yellow-300 group bg-gradient-to-br from-white to-yellow-50/30"
             style={{ animationDelay: `${index * 200}ms` }}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 group-hover:text-yellow-600 transition-colors">
                {performance.titulo}
              </h4>
              <p className="text-sm text-gray-600 font-medium">{performance.artista}</p>
              {performance.compositor && performance.compositor !== performance.artista && (
                <p className="text-xs text-gray-500">Compositor: {performance.compositor}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                {performance.genero_musical}
              </span>
              {performance.ano_performance && (
                <span className="text-xs text-gray-500 font-medium">{performance.ano_performance}</span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{performance.descricao_tecnica}</p>
          
          <div className="flex items-center justify-between">
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              performance.dificuldade_execucao === 'iniciante' ? 'bg-green-100 text-green-700' :
              performance.dificuldade_execucao === 'intermediario' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {performance.dificuldade_execucao}
            </span>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="w-3 h-3" />
                {performance.visualizacoes || 0}
              </div>
              {performance.video_url && (
                <button className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-yellow-100 hover:bg-yellow-200 rounded-full">
                  <Play className="w-4 h-4 text-yellow-600" />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const InstrumentosRelacionados = ({ relacionados }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in">
    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
      <Link className="w-5 h-5 text-blue-500" />
      Instrumentos Relacionados ({relacionados.length})
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {relacionados.map((rel, index) => (
        <div key={rel.id} 
             className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group cursor-pointer"
             style={{ animationDelay: `${index * 150}ms` }}>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              {rel.relacionado_nome}
            </h4>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
              {rel.tipo_relacao}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{rel.descricao_relacao}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Similaridade:</span>
              <ProgressRing progress={rel.similaridade_score} size={40} color="blue" />
            </div>
            <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-600 px-3 py-1 rounded-lg font-medium">
              Ver Detalhes
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// 4. COMPONENTE PRINCIPAL
// ============================================================================

const AdminInstrumentDetails = () => {
  // --- HOOKS ---
  const { instrumentoId } = useParams();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // --- ESTADOS ---
  const [instrumentoCompleto, setInstrumentoCompleto] = useState(null);
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de controle da UI
  const [abaAtiva, setAbaAtiva] = useState('resumo');
  const [audioAtivo, setAudioAtivo] = useState(null);
  const [filtroMidia, setFiltroMidia] = useState('todos');

  // --- LÓGICA DE DADOS ---
  const carregarDados = useCallback(async () => {
    if (!instrumentoId) {
      setError("ID do instrumento não encontrado na URL.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [statsResult, completoResult] = await Promise.all([
        instrumentsService.getInstrumentStats(instrumentoId),
        instrumentDetailService.getInstrumentoCompleto(instrumentoId)
      ]);

      if (statsResult.success) {
        setEstatisticas(statsResult.data);
      } else {
        console.warn("Aviso: Falha ao buscar estatísticas.", statsResult.error);
        setEstatisticas({}); // Garante que não seja nulo
      }

      if (completoResult.success) {
        setInstrumentoCompleto(completoResult.data);
      } else {
        throw new Error(completoResult.error || "Não foi possível carregar os detalhes do instrumento.");
      }
    } catch (err) {
      console.error("Erro fatal ao carregar dados da página:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [instrumentoId]);

  // Efeito para carregar os dados na primeira vez ou quando o ID mudar
  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Efeito para verificar permissões de admin
  useEffect(() => {
    if (userProfile && userProfile.tipo_usuario !== 'admin') {
      console.warn("Acesso negado. Redirecionando para o dashboard.");
      navigate('/dashboard');
    }
  }, [userProfile, navigate]);

  // --- VARIÁVEIS DERIVADAS ---
  const instrumentoInfo = instrumentoCompleto?.instrumentoDetalhado;
  const categoria = instrumentoInfo ? instrumentsService.getCategorias().find(cat => cat.id === instrumentoInfo.categoria) : null;
  
  const {
    sons = [],
    midias = [],
    tecnicas = [],
    curiosidades = [],
    performances = [],
    quiz = [],
    relacionados = []
  } = instrumentoCompleto || {};

  // Tema dinâmico por categoria
  const getCategoryTheme = (categoria) => {
    const themes = {
      'corda': {
        primary: 'from-amber-500 to-orange-500',
        secondary: 'from-amber-50 to-orange-50',
        accent: 'amber',
        emoji: '🎸'
      },
      'percussao': {
        primary: 'from-red-500 to-pink-500', 
        secondary: 'from-red-50 to-pink-50',
        accent: 'red',
        emoji: '🥁'
      },
      'teclado': {
        primary: 'from-blue-500 to-indigo-500',
        secondary: 'from-blue-50 to-indigo-50', 
        accent: 'blue',
        emoji: '🎹'
      }
    };
    return themes[categoria] || themes['corda'];
  };

  const theme = getCategoryTheme(instrumentoInfo?.categoria);

  const abasDisponiveis = [
    { id: 'resumo', label: 'Resumo', icon: BarChart3 },
    { id: 'historia', label: 'História & Fatos', icon: Clock },
    { id: 'sons', label: 'Sons', icon: Volume2, count: sons.length },
    { id: 'galeria', label: 'Galeria', icon: Image, count: midias.length },
    { id: 'tecnicas', label: 'Técnicas', icon: Target, count: tecnicas.length },
    { id: 'quiz', label: 'Quiz', icon: Brain, count: quiz.length },
    { id: 'performances', label: 'Performances', icon: Star, count: performances.length },
    { id: 'relacionados', label: 'Relacionados', icon: Link, count: relacionados.length },
  ];

  // --- RENDERIZAÇÃO CONDICIONAL (LOADING / ERROR) ---
  if (loading) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme?.secondary || 'from-orange-50 via-red-50 to-pink-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className={`w-20 h-20 bg-gradient-to-br ${theme?.primary || 'from-purple-500 to-purple-600'} rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse shadow-xl`}>
            <Music className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Carregando Instrumento</h3>
          <p className="text-base text-gray-600">Buscando todos os detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !instrumentoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <div className="text-8xl mb-6">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Erro ao Carregar Instrumento</h2>
          <p className="text-base text-gray-700 mb-8 leading-relaxed">{error || 'Instrumento não encontrado ou não existe.'}</p>
          <button onClick={() => navigate('/admin/instruments')} 
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            Voltar à Lista de Instrumentos
          </button>
        </div>
      </div>
    );
  }

  // --- RENDERIZAÇÃO PRINCIPAL (JSX) ---
  return (
    <>
      {/* CSS para animações */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className={`min-h-screen bg-gradient-to-br ${theme.secondary}`}>
        {/* Header Administrativo */}
        <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <button onClick={() => navigate('/admin')} 
                          className="flex items-center gap-1 hover:text-purple-600 transition-colors">
                    <Crown className="w-4 h-4" />
                    <span>Dashboard Admin</span>
                  </button>
                  <span>/</span>
                  <button onClick={() => navigate('/admin/instruments')} 
                          className="hover:text-purple-600 transition-colors">
                    Instrumentos
                  </button>
                  <span>/</span>
                  <span className="text-gray-900 font-medium">{instrumentoInfo.nome}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 bg-gradient-to-br ${theme.primary} rounded-3xl flex items-center justify-center shadow-xl hover:scale-105 transition-transform duration-300`}>
                    <span className="text-4xl">{categoria?.emoji || theme.emoji || '🎵'}</span>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-light mb-2 text-gray-900">{instrumentoInfo.nome}</h1>
                    <p className="text-gray-600 flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{categoria?.nome || 'Categoria'}</span>
                      {instrumentoInfo.origem && (
                        <>
                          <span>•</span>
                          <span className="text-sm">{instrumentoInfo.origem}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
                <button onClick={() => navigate('/admin/instruments')} 
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all hover:scale-105">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Lista</span>
                </button>
                
                <button onClick={carregarDados} disabled={loading} 
                        className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105">
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navegação por Abas Melhorada */}
          <div className="mb-8 sticky top-[140px] z-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex flex-nowrap overflow-x-auto gap-2 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-purple-100">
              {abasDisponiveis.map((aba, index) => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 relative ${
                    abaAtiva === aba.id 
                      ? `bg-gradient-to-r ${theme.primary} text-white shadow-lg transform scale-105` 
                      : 'text-gray-600 hover:bg-gray-100 hover:scale-102'
                  }`}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <aba.icon className="w-4 h-4" />
                  <span>{aba.label}</span>
                  {aba.count !== undefined && aba.count > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      abaAtiva === aba.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {aba.count}
                    </span>
                  )}
                  {abaAtiva === aba.id && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="mt-8">
            {abaAtiva === 'resumo' && (
              <div className="space-y-8 animate-fade-in">
                {/* Cards de estatísticas animados */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard icon={Volume2} value={sons.length} label="Sons Disponíveis" color={theme.accent} delay={0} />
                  <StatCard icon={Image} value={midias.length} label="Mídias na Galeria" color="blue" delay={200} />
                  <StatCard icon={Target} value={tecnicas.length} label="Técnicas de Ensino" color="green" delay={400} />
                  <StatCard icon={Brain} value={quiz.length} label="Perguntas de Quiz" color="yellow" delay={600} />
                </div>

                {/* Informações expandidas do instrumento */}
                {instrumentoInfo && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in" style={{ animationDelay: '800ms' }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Music className="w-5 h-5 text-purple-500" />
                      Detalhes do Instrumento
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {instrumentoInfo.origem && (
                        <div className="text-center group">
                          <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">Origem</h4>
                          <p className="text-sm text-gray-600">{instrumentoInfo.origem}</p>
                        </div>
                      )}
                      
                      {instrumentoInfo.familia_instrumental && (
                        <div className="text-center group">
                          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Tag className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">Família</h4>
                          <p className="text-sm text-gray-600">{instrumentoInfo.familia_instrumental}</p>
                        </div>
                      )}
                      
                      {instrumentoInfo.material_principal && (
                        <div className="text-center group">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Search className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">Material</h4>
                          <p className="text-sm text-gray-600">{instrumentoInfo.material_principal}</p>
                        </div>
                      )}
                      
                      {instrumentoInfo.dificuldade_aprendizado && (
                        <div className="text-center group">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                            <Target className="w-8 h-8 text-white" />
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">Dificuldade</h4>
                          <p className="text-sm text-gray-600 capitalize">{instrumentoInfo.dificuldade_aprendizado}</p>
                        </div>
                      )}
                    </div>

                    {instrumentoInfo.tecnica_producao_som && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-2">Como Produz Som</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{instrumentoInfo.tecnica_producao_som}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Anatomia do instrumento */}
                {instrumentoInfo?.anatomia_partes && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-purple-100 animate-fade-in" style={{ animationDelay: '1000ms' }}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                      <Search className="w-5 h-5 text-indigo-500" />
                      Anatomia do {instrumentoInfo.nome}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.entries(instrumentoInfo.anatomia_partes).map(([parte, desc], index) => (
                        <div key={parte} 
                             className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-indigo-300 group"
                             style={{ animationDelay: `${1200 + index * 100}ms` }}>
                          <h4 className="font-medium text-gray-900 capitalize mb-2 group-hover:text-indigo-600 transition-colors">
                            {parte.replace(/_/g, ' ')}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Outras abas */}
            {abaAtiva === 'sons' && <SonsPlayer instrumento={instrumentoInfo} sons={sons} audioAtivo={audioAtivo} setAudioAtivo={setAudioAtivo} />}
            {abaAtiva === 'galeria' && <GaleriaMidias midias={midias} filtroMidia={filtroMidia} setFiltroMidia={setFiltroMidia} />}
            {abaAtiva === 'historia' && <HistoriaInstrumento instrumento={instrumentoInfo} curiosidades={curiosidades} />}
            {abaAtiva === 'tecnicas' && <TecnicasInstrumento tecnicas={tecnicas} />}
            {abaAtiva === 'quiz' && <QuizInstrumento quiz={quiz} />}
            {abaAtiva === 'performances' && <PerformancesInstrumento performances={performances} />}
            {abaAtiva === 'relacionados' && <InstrumentosRelacionados relacionados={relacionados} />}
          </div>
        </div>
      </div>
    </>
  );
};
 
export default AdminInstrumentDetails;