# 🌳 Árvore Completa de Arquivos - Nipo School

```
nipo-school-app/
├── 📁 app/
│   ├── App.jsx
│   ├── main.jsx
│   └── 📁 router/
│       └── AppRouter.jsx                    🎯 ROTEADOR PRINCIPAL
│
├── 📁 assets/
│   └── (arquivos estáticos)
│
├── 📁 features/                             📦 FUNCIONALIDADES
│   ├── 📁 admin/
│   │   ├── 📁 components/
│   │   │   ├── AdminQuickAccess.jsx
│   │   │   ├── AulaCard.jsx
│   │   │   └── KanbanBoard.jsx
│   │   ├── 📁 hooks/
│   │   │   └── useAulas.js
│   │   ├── 📁 pages/
│   │   │   ├── AdminInstrumentDetails.jsx
│   │   │   ├── AdminInstruments.jsx
│   │   │   ├── AulaDetail.jsx
│   │   │   ├── dashboard.jsx
│   │   │   └── Kanban.jsx
│   │   └── 📁 services/
│   │       └── adminService.js
│   │
│   ├── 📁 alunos/
│   │   ├── 📁 components/
│   │   │   ├── AlunoDashboard.jsx
│   │   │   ├── AlunoProgress.jsx
│   │   │   ├── AlunoStats.jsx
│   │   │   ├── MinhasConquistas.jsx
│   │   │   └── ProximasAulas.jsx
│   │   ├── 📁 hooks/
│   │   │   ├── useAlunoProgress.js
│   │   │   └── useAlunoStats.js
│   │   ├── 📁 pages/
│   │   │   └── AlunoDashboard.jsx
│   │   └── 📁 services/
│   │
│   ├── 📁 auth/                             🔐 AUTENTICAÇÃO
│   │   ├── 📁 components/
│   │   │   ├── CompleteProfile.jsx
│   │   │   ├── ConfirmEmail.jsx
│   │   │   └── LoginForm.jsx
│   │   ├── 📁 hooks/
│   │   │   └── useAuthFlow.js               🎯 FLUXO DE AUTH
│   │   ├── 📁 pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx                 📝 REGISTRO
│   │   │   └── Vote.jsx                     🗳️ VOTAÇÃO
│   │   └── 📁 services/
│   │
│   ├── 📁 devocional/
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   │   └── useDevotionals.js
│   │   ├── 📁 pages/
│   │   └── 📁 services/
│   │
│   ├── 📁 gamificacao/
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   │   └── useAchievements.js
│   │   ├── 📁 pages/
│   │   └── 📁 services/
│   │
│   ├── 📁 instrumentos/
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   │   ├── useInstrumentPage.js
│   │   │   └── useInstruments.js
│   │   ├── 📁 pages/
│   │   │   ├── InstrumentoPagina.jsx
│   │   │   ├── InstrumentosLayout.jsx
│   │   │   └── InstrumentosList.jsx
│   │   └── 📁 services/
│   │       ├── instrumentPageService.js
│   │       └── instrumentsService.js
│   │
│   ├── 📁 modulos/
│   │   ├── 📁 components/
│   │   ├── 📁 hooks/
│   │   │   └── useModules.js
│   │   ├── 📁 pages/
│   │   └── 📁 services/
│   │
│   ├── 📁 professores/
│   │   ├── 📁 components/
│   │   │   ├── AdminAccessBanner.jsx
│   │   │   ├── CategorySelector.jsx
│   │   │   ├── ConteudoCard.jsx
│   │   │   ├── ConteudoGrid.jsx
│   │   │   ├── DebugAdminPanel.jsx
│   │   │   ├── FileUpload.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── FormConteudo.jsx
│   │   │   ├── ListaConteudos.jsx
│   │   │   ├── PreviewModal.jsx
│   │   │   ├── ProfessorAccessBanner.jsx
│   │   │   ├── ProfessorSidebar.jsx
│   │   │   ├── QuickSwitch.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   ├── StatsCard.jsx
│   │   │   └── VideoUpload.jsx
│   │   ├── 📁 hooks/
│   │   │   ├── useFileUpload.js
│   │   │   ├── useProfessoresConteudos.js
│   │   │   └── useProfessoresStats.js
│   │   ├── 📁 pages/
│   │   │   ├── ConteudoDetalhes.jsx
│   │   │   ├── ProfessorAccessModal.jsx
│   │   │   ├── ProfessoresConteudos.jsx
│   │   │   ├── ProfessoresDashboard.jsx
│   │   │   ├── ProfessoresEstatisticas.jsx
│   │   │   ├── ProfessoresLayout.jsx
│   │   │   ├── ProfessoresMinhaArea.jsx
│   │   │   └── ProfessoresNovo.jsx
│   │   └── 📁 services/
│   │       └── professoresService.js
│   │
│   └── 📁 turmas/
│       ├── 📁 components/
│       ├── 📁 hooks/
│       │   ├── useAulasAvancado.js
│       │   └── useTurmas.js
│       ├── 📁 pages/
│       └── 📁 services/
│           └── turmasService.js
│
├── 📁 pages/
│   └── Dashboard.jsx                        🏠 DASHBOARD PRINCIPAL
│
├── 📁 shared/                               🛠️ RECURSOS COMPARTILHADOS
│   ├── 📁 components/
│   │   ├── 📁 Audio/
│   │   ├── 📁 Common/
│   │   ├── 📁 Layout/
│   │   └── 📁 UI/
│   ├── 📁 contexts/
│   │   ├── AudioContext.js
│   │   ├── AuthContext.tsx                  🎯 CONTEXT DE AUTH
│   │   └── ProgressoContext.js
│   ├── 📁 hooks/
│   │   ├── index.js
│   │   └── useSmartRedirect.ts              🎯 HOOK DE REDIRECIONAMENTO
│   ├── 📁 lib/
│   │   ├── 📁 audio/
│   │   ├── 📁 constants/
│   │   ├── 📁 supabase/
│   │   │   └── supabaseClient.ts           🔗 CLIENTE SUPABASE
│   │   └── 📁 utils/
│   ├── 📁 services/
│   │   └── redirectService.js               🎯 SERVIÇO DE REDIRECIONAMENTO
│   └── 📁 utils/
│       └── accessControl.js
│
├── 📁 styles/
│   ├── components.css
│   ├── globals.css
│   ├── nipo-design-system.css
│   └── professores.css
│
└── 📁 types/
    ├── auth.ts                              📝 TIPOS DE AUTH
    ├── supabase.ts
    └── vite-env.d.ts

## 🎯 ARQUIVOS CHAVE PARA REDIRECIONAMENTO:

### Fluxo de Redirecionamento:
1. **Register.jsx** → signup() → **AuthContext.tsx**
2. **AuthContext.tsx** → redirectByVote() → **redirectService.js**
3. **redirectService.js** → getSmartRedirect() → retorna rota
4. **AppRouter.jsx** → define rotas disponíveis

### Arquivos Críticos:
- 🔥 **shared/services/redirectService.js** - Lógica principal
- 🔥 **shared/contexts/AuthContext.tsx** - Orquestra o redirect
- 🔥 **shared/hooks/useSmartRedirect.ts** - Hook auxiliar
- 🔥 **app/router/AppRouter.jsx** - Definição das rotas
- 🔥 **features/auth/pages/Vote.jsx** - Página de votação
- 🔥 **features/auth/hooks/useAuthFlow.js** - Fluxo de autenticação

## 🚨 PRIORIDADE DE INVESTIGAÇÃO:
1. **redirectService.js** (lógica de direcionamento)
2. **Vote.jsx** (destino do redirect)
3. **AppRouter.jsx** (rotas válidas)
4. **useAuthFlow.js** (fluxo de auth)
```