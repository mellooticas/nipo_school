# 🎌 Plano de Desenvolvimento - Nipo School

## 📋 Status Atual vs. Funcionalidades Necessárias

### ✅ **O que já temos funcionando:**
- [x] Estrutura base Next.js 13+
- [x] Sistema de autenticação (Supabase)
- [x] RouteGuard implementado
- [x] Design System Nipo consolidado
- [x] Dashboard básico
- [x] Layout responsivo

### 🔄 **Próximas implementações prioritárias:**

## 🚀 **FASE 1 - Estrutura Base Completa**

### **1.1 Páginas Principais (Urgente)**
```
📂 app/protected/
├── 📄 perfil/page.jsx           # Perfil do usuário
├── 📄 modulos/page.jsx          # Grade curricular/trilhas
├── 📄 conquistas/page.jsx       # Gamificação
├── 📄 devocional/page.jsx       # Conteúdo bíblico
├── 📄 pratica/page.jsx          # Exercícios práticos
└── 📄 rafa-beat/page.jsx        # Funcionalidade especial
```

### **1.2 Componentes Essenciais**
```
📂 shared/components/
├── 📂 Profile/
│   ├── ProfileCard.jsx          # Cartão do perfil
│   ├── ProgressChart.jsx        # Gráfico de progresso
│   └── CertificatesList.jsx     # Lista de certificados
├── 📂 Modules/
│   ├── ModuleCard.jsx           # Card do módulo
│   ├── LessonList.jsx           # Lista de aulas
│   └── ProgressTracker.jsx      # Rastreador de progresso
├── 📂 Gamification/
│   ├── BadgeCard.jsx            # Medalhas/insígnias
│   ├── RankingTable.jsx         # Tabela de ranking
│   └── PointsDisplay.jsx        # Exibição de pontos
└── 📂 VideoPlayer/
    ├── NipoPlayer.jsx           # Player customizado
    ├── PlaylistSidebar.jsx      # Sidebar da playlist
    └── VideoControls.jsx        # Controles do vídeo
```

## 🗄️ **FASE 2 - Estrutura do Banco de Dados**

### **Tabelas Necessárias:**
```sql
-- Usuários (já existe no Supabase Auth)
users_profiles
├── id (uuid)
├── user_id (auth.users)
├── full_name
├── avatar_url
├── church_name
├── main_instrument
├── level (beginner, intermediate, advanced)
├── total_points
└── created_at

-- Módulos/Cursos
modules
├── id (uuid)
├── title
├── description
├── level_required
├── instrument_category
├── order_index
├── is_active
└── created_at

-- Aulas
lessons
├── id (uuid)
├── module_id
├── title
├── description
├── video_url
├── duration_minutes
├── pdf_materials[]
├── audio_files[]
├── order_index
├── is_free
└── created_at

-- Progresso do usuário
user_progress
├── id (uuid)
├── user_id
├── lesson_id
├── completed_at
├── watch_time_seconds
├── is_completed
└── notes

-- Gamificação
achievements
├── id (uuid)
├── name
├── description
├── badge_icon
├── points_required
└── category

user_achievements
├── id (uuid)
├── user_id
├── achievement_id
└── earned_at
```

## 🎯 **FASE 3 - Funcionalidades por Prioridade**

### **🔥 Alta Prioridade (Próximas 2 semanas)**
1. **Perfil do Usuário**
   - Edição de informações
   - Upload de avatar
   - Exibição de progresso geral

2. **Módulos/Trilhas**
   - Listagem de cursos disponíveis
   - Filtros por instrumento/nível
   - Visualização de progresso

3. **Player de Vídeo**
   - Player básico funcional
   - Controle de progresso
   - Marcação de aula como concluída

### **⚡ Média Prioridade (3-4 semanas)**
4. **Sistema de Conquistas**
   - Medalhas e pontos
   - Ranking básico
   - Notificações de conquistas

5. **Conteúdo Devocional**
   - Textos bíblicos
   - Estudos relacionados à música
   - Histórias bíblicas de músicos

### **💡 Baixa Prioridade (Futuro)**
6. **IA e Chat**
7. **Comunidade/Fórum**
8. **Funcionalidades offline**

## 🛠️ **Implementação Técnica**

### **Stack Confirmada:**
- **Frontend**: Next.js 13+ (App Router)
- **Backend**: Supabase (Database + Auth + Storage)
- **Styling**: Tailwind CSS + Design System Nipo
- **Estado**: Context API (já implementado)
- **Deploy**: Vercel (recomendado)

### **Estrutura de Development:**
```
📂 Estrutura Recomendada:
├── 📂 app/protected/           # Páginas protegidas
├── 📂 shared/components/       # Componentes reutilizáveis
├── 📂 shared/hooks/           # Custom hooks
├── 📂 shared/lib/             # Utilitários e configs
├── 📂 services/               # Serviços (Supabase, APIs)
└── 📂 styles/                 # Design system
```

## 🎯 **Próximo Passo Imediato**

**Vamos começar implementando:**
1. ✅ Estrutura do banco de dados (preciso ver seu schema atual)
2. ✅ Página de perfil completamente funcional
3. ✅ Listagem básica de módulos
4. ✅ Player de vídeo simples

**Está pronto para começar?** 
Me envie a estrutura atual do banco de dados no Supabase para alinharmos as tabelas necessárias e partir para o desenvolvimento! 🚀

---

### 📊 **Resumo de Prioridades:**
| Funcionalidade | Prioridade | Tempo Estimado | Status |
|----------------|------------|----------------|--------|
| Perfil Usuario | 🔥 Alta | 3-4 dias | ⏳ Pendente |
| Módulos/Trilhas | 🔥 Alta | 5-7 dias | ⏳ Pendente |
| Video Player | 🔥 Alta | 4-5 dias | ⏳ Pendente |
| Conquistas | ⚡ Média | 3-4 dias | ⏳ Pendente |
| Devocional | ⚡ Média | 2-3 dias | ⏳ Pendente |
| IA/Chat | 💡 Baixa | 1-2 semanas | 🔮 Futuro |