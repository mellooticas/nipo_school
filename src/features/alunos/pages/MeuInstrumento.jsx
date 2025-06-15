// features/alunos/pages/MeuInstrumento.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../shared/lib/supabase/supabaseClient';
import {
  Music, ArrowLeft, BookOpen, Play, Award, Users, Clock,
  Volume2, FileText, Camera, Heart, Share2, Download,
  TrendingUp, Target, Lightbulb, Star, ChevronRight,
  PlayCircle, Headphones, Mic, Youtube, Instagram,
  Image, Brain, Link, Eye, Pause, X, Search, Filter,
  Tag, MapPin, Crown, Radio, Home, RefreshCw
} from 'lucide-react';

// ============================================================================
// 1. COMPONENTES UTILITÁRIOS (ADAPTADOS DO ADMIN)
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
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-4 border-l-4 border-${color}-500 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-lg group`}>
      <Icon className={`w-6 h-6 text-${color}-500 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`} />
      <p className="text-2xl font-bold text-gray-900 tabular-nums">{count}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
};

const ProgressRing = ({ progress, size = 50, color = "blue" }) => {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size/2} cy={size/2} r="18" stroke="currentColor" 
                strokeWidth="3" fill="transparent" className="text-gray-200"/>
        <circle cx={size/2} cy={size/2} r="18" stroke="currentColor" 
                strokeWidth="3" fill="transparent" strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset} 
                className={`text-${color}-500 transition-all duration-1000 ease-out`}
                style={{ transitionDelay: '300ms' }} />
      </svg>
      <span className="absolute text-xs font-semibold text-gray-700">{progress}%</span>
    </div>
  );
};

const WaveformVisualizer = ({ isActive }) => (
  <div className="flex items-center justify-center gap-1 h-6">
    {[...Array(10)].map((_, i) => (
      <div key={i} 
           className={`w-1 bg-blue-500 rounded-full transition-all duration-300 ${
             isActive ? 'animate-pulse' : ''
           }`}
           style={{ 
             height: isActive ? `${Math.random() * 16 + 8}px` : '3px',
             animationDelay: `${i * 100}ms`,
             animationDuration: '800ms'
           }} />
    ))}
  </div>
);

// ============================================================================
// 2. MODAL DE MÍDIA (ADAPTADO)
// ============================================================================

const MidiaModal = ({ midia, onClose }) => {
  if (!midia) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
         onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl transform scale-100 transition-all duration-300"
           onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{midia.titulo}</h3>
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
            {midia.tipo === 'imagem' && <Image className="w-12 h-12 text-gray-400" />}
            {midia.tipo === 'video' && <Play className="w-12 h-12 text-gray-400" />}
            {midia.tipo === 'audio' && <Volume2 className="w-12 h-12 text-gray-400" />}
            {midia.tipo === '3d' && <Search className="w-12 h-12 text-gray-400" />}
          </div>
          
          <p className="text-gray-600 mb-4">{midia.descricao}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Eye className="w-4 h-4" />
              <span>{midia.visualizacoes || 0} visualizações</span>
            </div>
            {midia.url && (
              <a href={midia.url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
// 3. COMPONENTES ESPECÍFICOS PARA ALUNOS
// ============================================================================

const InstrumentosRelacionadosAluno = ({ relacionados, instrumento }) => {
  const [showAll, setShowAll] = useState(false);
  const displayItems = showAll ? relacionados : relacionados.slice(0, 4);

  // Agrupar por tipo de relação
  const relacionadosAgrupados = relacionados.reduce((grupos, rel) => {
    const tipo = rel.tipo_relacao || 'outros';
    if (!grupos[tipo]) grupos[tipo] = [];
    grupos[tipo].push(rel);
    return grupos;
  }, {});

  const getTipoInfo = (tipo) => {
    const tipos = {
      'familia': { 
        label: 'Mesma Família Musical', 
        icon: Users, 
        color: 'blue',
        description: 'Instrumentos que compartilham características sonoras'
      },
      'dificuldade': { 
        label: 'Nível Similar', 
        icon: Target, 
        color: 'green',
        description: 'Instrumentos com dificuldade parecida'
      },
      'tecnica': { 
        label: 'Técnica Similar', 
        icon: Music, 
        color: 'purple',
        description: 'Instrumentos com técnicas de execução parecidas'
      },
      'material': { 
        label: 'Mesmo Material', 
        icon: Tag, 
        color: 'orange',
        description: 'Instrumentos feitos com materiais similares'
      },
      'origem': { 
        label: 'Mesma Origem', 
        icon: MapPin, 
        color: 'red',
        description: 'Instrumentos da mesma região geográfica'
      },
      'outros': { 
        label: 'Você Pode Gostar', 
        icon: Star, 
        color: 'yellow',
        description: 'Outros instrumentos interessantes'
      }
    };
    return tipos[tipo] || tipos['outros'];
  };

  if (relacionados.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Link className="w-5 h-5 text-blue-500" />
          Instrumentos Relacionados
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Music className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Explore outros instrumentos para expandir seus horizontes musicais!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Link className="w-5 h-5 text-blue-500" />
        Explore Outros Instrumentos ({relacionados.length})
      </h3>

      <div className="space-y-8">
        {Object.entries(relacionadosAgrupados).map(([tipo, instrumentos]) => {
          const tipoInfo = getTipoInfo(tipo);
          const Icon = tipoInfo.icon;

          return (
            <div key={tipo}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg bg-${tipoInfo.color}-100 flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 text-${tipoInfo.color}-600`} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{tipoInfo.label}</h4>
                  <p className="text-xs text-gray-500">{tipoInfo.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {instrumentos.map((rel, index) => (
                  <div key={rel.id} 
                       className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300 group cursor-pointer bg-gradient-to-br from-white to-blue-50/30"
                       style={{ animationDelay: `${index * 150}ms` }}>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Music className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {rel.relacionado_nome}
                          </h5>
                          <p className="text-xs text-gray-500 capitalize">{rel.tipo_relacao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-gray-500">Similaridade:</span>
                          <ProgressRing progress={rel.similaridade_score || 75} size={30} color="blue" />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{rel.descricao_relacao}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {rel.dificuldade_relativa && (
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            rel.dificuldade_relativa === 'mais_facil' ? 'bg-green-100 text-green-700' :
                            rel.dificuldade_relativa === 'similar' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>
                            {rel.dificuldade_relativa === 'mais_facil' ? '🟢 Mais Fácil' :
                             rel.dificuldade_relativa === 'similar' ? '🔵 Nível Similar' :
                             '🟠 Mais Desafiador'}
                          </span>
                        )}
                      </div>
                      
                      <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs bg-blue-100 hover:bg-blue-200 hover:text-blue-700 px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Conhecer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Motivação para explorar */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">💡 Dica do Professor</h4>
            <p className="text-sm text-gray-600">
              Conhecer instrumentos relacionados ao {instrumento?.nome} pode enriquecer muito seu aprendizado! 
              Cada instrumento traz novas perspectivas musicais.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SonsPlayerAluno = ({ instrumento, sons, audioAtivo, setAudioAtivo }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = (som) => {
    setAudioAtivo(som.id);
    setIsPlaying(true);
    
    // Simular reprodução (substitua por lógica real quando tiver arquivos de áudio)
    setTimeout(() => {
      setIsPlaying(false);
      setAudioAtivo(null);
    }, 3000);
  };

  const stopAudio = () => {
    setIsPlaying(false);
    setAudioAtivo(null);
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-blue-500" />
        Sons do {instrumento?.nome} ({sons.length})
      </h3>

      {/* Player Control para Alunos */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-4 mb-3">
          <Headphones className="w-5 h-5 text-blue-500" />
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
      
      {/* Grid de sons para alunos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sons.map((som, index) => (
          <div key={som.id} 
               className="group border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-blue-300 cursor-pointer hover:-translate-y-1"
               onClick={() => playAudio(som)}
               style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  audioAtivo === som.id 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-110' 
                    : 'bg-blue-100 text-blue-600 group-hover:bg-blue-200 group-hover:scale-105'
                }`}>
                  {audioAtivo === som.id && isPlaying ? 
                    <Radio className="w-4 h-4 animate-pulse" /> : 
                    <Play className="w-4 h-4" />
                  }
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{som.nota_musical}</h4>
                  <p className="text-xs text-gray-500">{som.tecnica}</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                {som.dinamica}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{som.artista_performer}</span>
              <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                audioAtivo === som.id ? 'opacity-100' : ''
              }`}>
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Play className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const GaleriaMidiasAluno = ({ midias, filtroMidia, setFiltroMidia }) => {
  const [modalMidia, setModalMidia] = useState(null);
  const midiasFiltered = filtroMidia === 'todos' ? midias : midias.filter(midia => midia.tipo === filtroMidia);

  return (
    <>
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-blue-500" />
            Galeria de Conteúdo ({midias.length})
          </h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select value={filtroMidia} onChange={(e) => setFiltroMidia(e.target.value)} 
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all">
              <option value="todos">Todos</option>
              <option value="imagem">Imagens</option>
              <option value="video">Vídeos</option>
              <option value="audio">Áudios</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {midiasFiltered.map((midia, index) => (
            <div key={midia.id} 
                 className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-white"
                 onClick={() => setModalMidia(midia)}
                 style={{ animationDelay: `${index * 150}ms` }}>
              <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative overflow-hidden">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {midia.tipo === 'imagem' && <Image className="w-10 h-10 text-blue-400" />}
                  {midia.tipo === 'video' && <Play className="w-10 h-10 text-blue-400" />}
                  {midia.tipo === 'audio' && <Volume2 className="w-10 h-10 text-blue-400" />}
                </div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                      <Eye className="w-5 h-5 text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <h4 className="font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{midia.titulo}</h4>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{midia.descricao}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">{midia.categoria}</span>
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

const HistoriaInstrumentoAluno = ({ instrumento, curiosidades }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-amber-500" />
        Conheça seu {instrumento?.nome}
      </h3>
      
      {instrumento?.historia && (
        <div className="prose prose-gray max-w-none mb-6">
          <p className="text-gray-700 leading-relaxed">{instrumento.historia}</p>
        </div>
      )}

      {instrumento && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Origem</h4>
            <p className="text-sm text-gray-600">{instrumento.origem}</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Tag className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Família</h4>
            <p className="text-sm text-gray-600">{instrumento.familia_instrumental}</p>
          </div>
          
          <div className="text-center group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">Nível</h4>
            <p className="text-sm text-gray-600 capitalize">{instrumento.dificuldade_aprendizado}</p>
          </div>
        </div>
      )}
    </div>

    {/* Curiosidades para Alunos */}
    {curiosidades && curiosidades.length > 0 && (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Curiosidades Incríveis ({curiosidades.length})
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          {curiosidades.map((cur, index) => (
            <div key={cur.id} 
                 className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:border-yellow-300 group"
                 style={{ animationDelay: `${index * 200}ms` }}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
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

const TecnicasAluno = ({ tecnicas }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('todos');
  
  const tecnicasFiltered = tecnicas.filter(tecnica => {
    const matchSearch = searchTerm === '' || 
      tecnica.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnica.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchNivel = filtroNivel === 'todos' || tecnica.nivel === filtroNivel;
    return matchSearch && matchNivel;
  });

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <Target className="w-5 h-5 text-green-500" />
        Técnicas para Aprender ({tecnicasFiltered.length})
      </h3>

      {/* Busca e filtros para alunos */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar técnicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <select value={filtroNivel} onChange={(e) => setFiltroNivel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all">
          <option value="todos">Todos os níveis</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tecnicasFiltered
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
                  ⏱️ {tecnica.tempo_pratica_recomendado || 15} min/dia
                </span>
                {tecnica.tipo_tecnica && (
                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                    {tecnica.tipo_tecnica}
                  </span>
                )}
              </div>
              <ProgressRing progress={Math.min((tecnica.ordem_aprendizado || 1) * 20, 100)} size={30} color="green" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL
// ============================================================================

const MeuInstrumento = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  
  // Estados principais
  const [instrumento, setInstrumento] = useState(null);
  const [conteudos, setConteudos] = useState({
    curiosidades: [],
    midias: [],
    sons: [],
    tecnicas: [],
    quiz: [],
    performances: [],
    relacionados: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados da UI
  const [activeTab, setActiveTab] = useState('overview');
  const [audioAtivo, setAudioAtivo] = useState(null);
  const [filtroMidia, setFiltroMidia] = useState('todos');

  // ✅ CARREGAR DADOS COMPLETOS
  const carregarMeuInstrumento = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userProfile?.instrument) {
        setError('Instrumento não definido no seu perfil. Entre em contato com a administração.');
        return;
      }

      console.log('🎵 Carregando instrumento do aluno:', userProfile.instrument);

      // 1. Buscar dados básicos do instrumento
      const { data: instrumentoData, error: instrumentoError } = await supabase
        .from('instrumentos')
        .select('*')
        .ilike('nome', `%${userProfile.instrument}%`)
        .single();

      if (instrumentoError) {
        throw new Error(`Instrumento "${userProfile.instrument}" não encontrado no sistema.`);
      }

      setInstrumento(instrumentoData);

      // 2. Buscar TODOS os conteúdos relacionados (como no Admin)
      const instrumentoId = instrumentoData.id;
      
      const [
        { data: curiosidades },
        { data: midias },
        { data: sons },
        { data: tecnicas },
        { data: quiz },
        { data: performances },
        { data: relacionados }
      ] = await Promise.all([
        supabase.from('instrumento_curiosidades').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_midias').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_sons').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_tecnicas').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_quiz').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_performances').select('*').eq('instrumento_id', instrumentoId),
        supabase.from('instrumento_relacionados').select('*').eq('instrumento_id', instrumentoId)
      ]);

      setConteudos({
        curiosidades: curiosidades || [],
        midias: midias || [],
        sons: sons || [],
        tecnicas: tecnicas || [],
        quiz: quiz || [],
        performances: performances || [],
        relacionados: relacionados || []
      });

      console.log('✅ Dados completos carregados:', {
        instrumento: instrumentoData.nome,
        curiosidades: curiosidades?.length || 0,
        midias: midias?.length || 0,
        sons: sons?.length || 0,
        tecnicas: tecnicas?.length || 0,
        quiz: quiz?.length || 0,
        performances: performances?.length || 0,
        relacionados: relacionados?.length || 0
      });

    } catch (err) {
      console.error('❌ Erro ao carregar instrumento:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      carregarMeuInstrumento();
    }
  }, [carregarMeuInstrumento]);

  // ✅ COMPONENTES DA INTERFACE

  const TabButton = ({ id, label, icon: Icon, count = 0 }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 flex-shrink-0 ${
        activeTab === id
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-white/60 text-gray-700 hover:bg-white/80'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="font-medium text-sm">{label}</span>
      {count > 0 && (
        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
          activeTab === id ? 'bg-white/20' : 'bg-blue-100 text-blue-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  // Abas disponíveis para alunos
  const abasDisponiveis = [
    { id: 'overview', label: 'Visão Geral', icon: Target },
    { id: 'historia', label: 'História', icon: Clock },
    { id: 'sons', label: 'Sons', icon: Volume2, count: conteudos.sons.length },
    { id: 'galeria', label: 'Galeria', icon: Image, count: conteudos.midias.length },
    { id: 'tecnicas', label: 'Técnicas', icon: Target, count: conteudos.tecnicas.length },
    { id: 'quiz', label: 'Quiz', icon: Brain, count: conteudos.quiz.length },
    { id: 'performances', label: 'Performances', icon: Star, count: conteudos.performances.length },
    { id: 'relacionados', label: 'Relacionados', icon: Link, count: conteudos.relacionados.length },
  ];

  // ✅ LOADING E ERROR STATES
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center animate-pulse shadow-xl">
            <Music className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Carregando seu Instrumento</h3>
          <p className="text-base text-gray-600">Buscando todo o conteúdo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ops! Algo deu errado</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button 
                onClick={carregarMeuInstrumento}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Tentar Novamente
              </button>
              <button 
                onClick={() => navigate('/alunos')}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!instrumento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">Instrumento não encontrado</h3>
          <p className="text-gray-600">Seu instrumento não foi encontrado no sistema.</p>
        </div>
      </div>
    );
  }

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

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header do Aluno */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-6 animate-fade-in">
              <button
                onClick={() => navigate('/alunos')}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Meu Instrumento</h1>
                <p className="text-blue-100">Tudo sobre o {instrumento.nome}</p>
              </div>
              <div className="ml-auto flex items-center gap-3">
                <button 
                  onClick={carregarMeuInstrumento} 
                  disabled={loading} 
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Atualizar</span>
                </button>
              </div>
            </div>

            {/* Hero do Instrumento Melhorado */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="w-32 h-32 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform duration-300">
                  {instrumento.imagem ? (
                    <img 
                      src={instrumento.imagem} 
                      alt={instrumento.nome}
                      className="w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <Music className="w-16 h-16 text-white" />
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2">{instrumento.nome}</h2>
                  <p className="text-blue-100 mb-4">
                    {instrumento.descricao || 'Um instrumento incrível para aprender música!'}
                  </p>
                  
                  {/* Stats Cards Melhorados */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Lightbulb} value={conteudos.curiosidades.length} label="Curiosidades" color="yellow" delay={0} />
                    <StatCard icon={PlayCircle} value={conteudos.midias.length} label="Vídeos" color="red" delay={200} />
                    <StatCard icon={Volume2} value={conteudos.sons.length} label="Sons" color="purple" delay={400} />
                    <StatCard icon={Target} value={conteudos.tecnicas.length} label="Técnicas" color="green" delay={600} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navegação por Abas Melhorada */}
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="mb-8 sticky top-4 z-10 animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="flex flex-nowrap overflow-x-auto gap-2 bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-xl border border-blue-100">
              {abasDisponiveis.map((aba, index) => (
                <TabButton 
                  key={aba.id} 
                  id={aba.id} 
                  label={aba.label} 
                  icon={aba.icon} 
                  count={aba.count} 
                />
              ))}
            </div>
          </div>

          {/* Conteúdo das Abas */}
          <div className="mt-8">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                {/* Informações do Instrumento */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Music className="w-5 h-5 text-blue-500" />
                    Sobre o {instrumento.nome}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {instrumento.descricao || 'Um instrumento fantástico que vai te proporcionar uma jornada musical incrível!'}
                  </p>

                  {/* Características do Instrumento */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {instrumento.origem && (
                      <div className="text-center group">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Origem</h4>
                        <p className="text-sm text-gray-600">{instrumento.origem}</p>
                      </div>
                    )}
                    
                    {instrumento.familia_instrumental && (
                      <div className="text-center group">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Tag className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Família</h4>
                        <p className="text-sm text-gray-600">{instrumento.familia_instrumental}</p>
                      </div>
                    )}
                    
                    {instrumento.material_principal && (
                      <div className="text-center group">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Material</h4>
                        <p className="text-sm text-gray-600">{instrumento.material_principal}</p>
                      </div>
                    )}
                    
                    {instrumento.dificuldade_aprendizado && (
                      <div className="text-center group">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                          <Target className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">Dificuldade</h4>
                        <p className="text-sm text-gray-600 capitalize">{instrumento.dificuldade_aprendizado}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Preview dos Conteúdos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500" />
                      Curiosidades
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {conteudos.curiosidades.length} curiosidades interessantes sobre seu instrumento.
                    </p>
                    <button 
                      onClick={() => setActiveTab('historia')}
                      className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Descobrir <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <PlayCircle className="w-5 h-5 text-red-500" />
                      Conteúdo Multimídia
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {conteudos.midias.length} vídeos e conteúdos para aprender.
                    </p>
                    <button 
                      onClick={() => setActiveTab('galeria')}
                      className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Assistir <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Volume2 className="w-5 h-5 text-purple-500" />
                      Sons & Áudios
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {conteudos.sons.length} exemplos sonoros para treinar o ouvido.
                    </p>
                    <button 
                      onClick={() => setActiveTab('sons')}
                      className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Ouvir <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-500" />
                      Técnicas de Estudo
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {conteudos.tecnicas.length} técnicas para dominar seu instrumento.
                    </p>
                    <button 
                      onClick={() => setActiveTab('tecnicas')}
                      className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Aprender <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Link className="w-5 h-5 text-indigo-500" />
                      Instrumentos Relacionados
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">
                      {conteudos.relacionados.length} instrumentos similares para explorar.
                    </p>
                    <button 
                      onClick={() => setActiveTab('relacionados')}
                      className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Explorar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* História e Curiosidades */}
            {activeTab === 'historia' && (
              <HistoriaInstrumentoAluno 
                instrumento={instrumento} 
                curiosidades={conteudos.curiosidades} 
              />
            )}

            {/* Sons */}
            {activeTab === 'sons' && (
              <SonsPlayerAluno 
                instrumento={instrumento} 
                sons={conteudos.sons} 
                audioAtivo={audioAtivo} 
                setAudioAtivo={setAudioAtivo} 
              />
            )}

            {/* Galeria */}
            {activeTab === 'galeria' && (
              <GaleriaMidiasAluno 
                midias={conteudos.midias} 
                filtroMidia={filtroMidia} 
                setFiltroMidia={setFiltroMidia} 
              />
            )}

            {/* Técnicas */}
            {activeTab === 'tecnicas' && (
              <TecnicasAluno tecnicas={conteudos.tecnicas} />
            )}

            {/* Quiz */}
            {activeTab === 'quiz' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  Quiz sobre {instrumento.nome} ({conteudos.quiz.length} perguntas)
                </h3>
                
                {conteudos.quiz.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {conteudos.quiz.map((pergunta, index) => (
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
                          <button className="text-purple-600 font-medium hover:text-purple-700 transition-colors">
                            Responder
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Ainda não há quiz disponível para este instrumento.</p>
                  </div>
                )}
              </div>
            )}

            {/* Performances */}
            {activeTab === 'performances' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  Performances Inspiradoras ({conteudos.performances.length})
                </h3>
                
                {conteudos.performances.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {conteudos.performances.map((performance, index) => (
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
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Ainda não há performances cadastradas para este instrumento.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MeuInstrumento;