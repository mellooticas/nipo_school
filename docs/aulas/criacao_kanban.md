# 📋 Kanban Admin - Especificação Completa

## 🎯 Objetivo
Sistema Kanban pedagógico para gestão administrativa de aulas, permitindo visualização, edição e controle de status por diferentes perfis de usuário.

---

## 🗄️ Estrutura de Dados

### 🎯 Campos Obrigatórios (Tabela: `aulas`)

- **id**: UUID único do cartão (aula)
- **numero**: Número sequencial da aula (ex: 1, 2, 3...)
- **titulo**: Título/tema da aula (ex: "Som do Corpo e Ritmo")
- **modulo_id**: Chave estrangeira do módulo temático (ref. modulos.id)
- **nome_modulo**: Nome legível do módulo (exibido via view/join)
- **data_programada**: Data prevista para a aula
- **status**: Status atual do cartão [A Fazer, Em Preparação, Concluída, Revisão, Cancelada]
- **objetivo_didatico**: Intenção pedagógica da aula (frase curta)
- **resumo_atividades**: Resumo textual das principais atividades
- **desafio_alpha**: Desafio Alpha (atividade que o aluno deve fazer pós-aula)
- **nivel**: Nível da aula [Iniciante, Intermediário, Avançado]
- **formato**: Formato da aula [Presencial, Online, Híbrido]

### 📂 Campos Complementares (Relacionamentos)

#### 🧑‍🏫 Responsáveis da Aula (Tabela: aula_responsaveis)
- responsavel_id: ID do professor responsável
- nome_responsavel: Nome exibido (via join)

#### 📎 Materiais de Apoio (Tabela: aula_materiais)
- Tipo: [PDF, Vídeo, Partitura, Slides, Link]
- Link: URL ou embed do material

#### 📝 Feedback do Professor (Tabela: aula_feedbacks)
- Texto: Observações pós-aula enviadas pelo professor

#### 📷 Registros Multimídia (Tabela: aula_registros)
- Tipo: [Foto, Vídeo, Ata, Outro]
- Arquivo/Link: URL ou upload no sistema

#### ✅ Checklist (Tabela: aula_checklist)
- Tipo: [Pré-aula, Pós-aula]
- Descrição: Ex: "Imprimir apostilas", "Conferir presença"

#### 🏷️ Tags e Categorização (Tabela: aula_tags)
- Público: [Infantil, Juvenil, Adulto, Misto]
- Instrumento: [Violão, Bateria, Teclado, etc.]
- Categoria livre: [Devocional, Ensaio, Apresentação]

#### 👥 Turmas Relacionadas (Tabela: aula_turmas)
- ID das turmas que terão acesso à aula

---

## 🧠 Visual no App Kanban (admin)

### Cartão Kanban exibe:
- Número + Título
- Data
- Módulo
- Status
- Indicador de material presente (ícone)
- Menu de ações (editar, liberar, registrar)

---

## 🛡️ Regras de Visibilidade por Perfil

### 👑 Admin
- Acesso completo ao Kanban e todos os campos
- Pode agendar, editar, liberar, atribuir, arquivar

### 👩‍🏫 Professor
- Acesso apenas às aulas atribuídas a ele
- Campos visíveis: objetivo, atividades, materiais, desafio, checklist
- Pode registrar feedback, presença, subir registros

### 🧒 Aluno
- Visualiza apenas:
  - Desafio Alpha da semana
  - Materiais práticos (vídeo/partitura)
  - Mural de conquistas
  - Formulário para enviar desafio

---

## 🏗️ Estrutura Técnica

### 📁 Arquivos do Sistema
```
src/
│
├── pages/
│   └── admin/
│       ├── Kanban.jsx          # Página principal do Kanban
│       └── AulaDetail.jsx      # Página detalhada da aula (/admin/aula/:id)
│
├── components/
│   └── kanban/
│       ├── KanbanBoard.jsx     # Board principal com colunas
│       └── AulaCard.jsx        # Card individual da aula
│
└── hooks/
    └── useAulas.js             # Hook para gerenciar dados das aulas
```

### 🎨 Status e Cores
```
A Fazer       -> Cinza   (bg-gray-400)
Em Preparação -> Azul    (bg-blue-400)
Concluída     -> Verde   (bg-green-400)
Revisão       -> Amarelo (bg-yellow-400)
Cancelada     -> Vermelho (bg-red-400)
```

### 🛣️ Rotas
- `/admin/kanban` - Kanban principal (AdminRoute)
- `/admin/aula/:id` - Detalhes da aula (AdminRoute)

### 🔧 Integrações Supabase
- **View Principal**: `view_aulas_admin` (join de aulas + modulos + usuarios)
- **Tabela Principal**: `aulas` (para updates de status)
- **Hook**: `useAulas()` gerencia estado e API calls

### 📱 Funcionalidades Implementadas
- ✅ Visualização em colunas por status
- ✅ Filtro por módulo
- ✅ Navegação para detalhes da aula
- ✅ Loading states e tratamento de erros
- ✅ Design responsivo
- ✅ Proteção de rotas (apenas Admin)

### 🔮 Funcionalidades Futuras
- 🔄 Drag & Drop entre colunas
- 📊 Dashboard com métricas
- 📅 Calendário integrado
- 🔔 Notificações automáticas
- 📋 Formulários de edição inline
- 🏷️ Sistema de tags avançado

---

## 🎯 Campos Visíveis por Tela

### 🖥️ Kanban Board (Cartão)
- `numero` + `titulo`
- `data_programada`
- `nome_modulo`
- `responsavel` (se disponível)
- `objetivo_didatico` (preview)
- Indicadores visuais de status

### 📄 Página de Detalhes (/admin/aula/:id)
- **Header**: numero, titulo, data, modulo, responsavel, status
- **Grid Principal**:
  - 🎯 Objetivo Didático
  - 📋 Resumo das Atividades
  - 🚀 Desafio Alpha
  - ℹ️ Informações Técnicas (nivel, formato, criado_em)
- **Ações**: Editar, Adicionar Materiais, Duplicar

### 🔍 Filtros Disponíveis
- Por Módulo (dropdown)
- Por Status (colunas)
- Contador total de aulas

---

## 🎨 Design System

### 🎨 Cores Principais
- **Fundo**: bg-gray-100
- **Cards**: bg-white com shadow-sm
- **Bordas**: border-gray-200
- **Texto Primário**: text-gray-900
- **Texto Secundário**: text-gray-600

### 🔄 Estados Interativos
- **Hover Cards**: shadow-md + cursor-pointer
- **Buttons Hover**: Escurecimento da cor base
- **Loading**: Spinner azul (border-blue-600)
- **Error**: Fundo vermelho claro com ações

### 📱 Responsividade
- **Mobile**: Scroll horizontal no board
- **Desktop**: Layout completo em grid
- **Tablet**: Colunas adaptáveis

---

## 🧪 Testes e Validação

### ✅ Cenários de Teste
1. **Carregamento**: View vazia, com dados, com erro
2. **Navegação**: Kanban → Detalhes → Voltar
3. **Filtros**: Por módulo, reset, contadores
4. **Responsividade**: Mobile, tablet, desktop
5. **Permissões**: Admin vs não-admin

### 🎯 Métricas de Sucesso
- Tempo de carregamento < 2s
- Interface intuitiva (sem explicações)
- Zero erros de navegação
- 100% responsivo