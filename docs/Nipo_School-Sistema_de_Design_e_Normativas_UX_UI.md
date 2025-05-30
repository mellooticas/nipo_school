# Nipo School - Sistema de Design e Normativas UX/UI

## 📋 Índice
1. [Filosofia de Design](#filosofia-de-design)
2. [Cores e Paleta](#cores-e-paleta)
3. [Tipografia](#tipografia)
4. [Componentes Base](#componentes-base)
5. [Layout e Grid](#layout-e-grid)
6. [Responsividade Mobile-First](#responsividade-mobile-first)
7. [Animações e Microinterações](#animações-e-microinterações)
8. [Padrões de Navegação](#padrões-de-navegação)
9. [Estados e Feedback](#estados-e-feedback)
10. [Acessibilidade](#acessibilidade)
11. [Classes CSS Padronizadas](#classes-css-padronizadas)

---

## 🎨 Filosofia de Design

### Princípios Centrais
- **Mobile-First**: 95%+ dos acessos são mobile
- **Minimalismo Zen**: Interfaces limpas e funcionais
- **Gamificação Sutil**: Elementos lúdicos sem sobrecarregar
- **Consistência Total**: Todos os componentes seguem o mesmo padrão
- **Performance**: Carregamento rápido e animações fluidas

### Inspiração Visual
- Baseado no logo oficial Nipo School (vermelho + elementos japoneses)
- Estética clean com toques de gamificação
- Gradientes suaves e glassmorphism
- Emojis como elementos visuais principais

---

## 🎨 Cores e Paleta

### Cores Primárias
```css
:root {
  /* Cores Oficiais Nipo School */
  --nipo-red-50: #fef2f2;
  --nipo-red-100: #fee2e2;
  --nipo-red-200: #fecaca;
  --nipo-red-300: #fca5a5;
  --nipo-red-400: #f87171;
  --nipo-red-500: #ef4444; /* Cor principal */
  --nipo-red-600: #dc2626;
  --nipo-red-700: #b91c1c;
  
  /* Cores Secundárias */
  --nipo-orange-50: #fff7ed;
  --nipo-orange-100: #ffedd5;
  --nipo-orange-500: #f97316;
  --nipo-orange-600: #ea580c;
  
  /* Cores Neutras */
  --nipo-gray-50: #f8fafc;
  --nipo-gray-100: #f1f5f9;
  --nipo-gray-200: #e2e8f0;
  --nipo-gray-300: #cbd5e1;
  --nipo-gray-400: #94a3b8;
  --nipo-gray-500: #64748b;
  --nipo-gray-600: #475569;
  --nipo-gray-700: #334155;
  --nipo-gray-800: #1e293b;
  --nipo-gray-900: #0f172a;
  
  /* Cores de Status */
  --nipo-success: #10b981;
  --nipo-warning: #f59e0b;
  --nipo-error: #ef4444;
  --nipo-info: #3b82f6;
}
```

### Background Padrão
```css
.nipo-bg-main {
  background: linear-gradient(to bottom right, #fff7ed, #fef2f2, #fdf2f8);
}
```

---

## ✍️ Tipografia

### Famílias de Fonte
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
  --font-primary: 'Inter', system-ui, sans-serif;
  --font-zen: 'Inter', system-ui, sans-serif; /* Para textos especiais */
}
```

### Hierarquia de Texto
```css
.nipo-text-h1 { @apply text-2xl sm:text-4xl font-light text-gray-800; }
.nipo-text-h2 { @apply text-xl sm:text-2xl font-bold text-gray-900; }
.nipo-text-h3 { @apply text-lg font-semibold text-gray-900; }
.nipo-text-body { @apply text-base text-gray-700; }
.nipo-text-small { @apply text-sm text-gray-600; }
.nipo-text-xs { @apply text-xs text-gray-500; }
```

---

## 🧩 Componentes Base

### 1. Cards (Componente Principal)
```jsx
// Estrutura Padrão de Card
<div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all duration-300">
  {/* Conteúdo */}
</div>
```

### 2. Botões
```jsx
// Botão Primário
<button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg">
  Texto do Botão
</button>

// Botão Secundário
<button className="bg-white/90 backdrop-blur-sm border border-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium">
  Texto do Botão
</button>
```

### 3. Stats Cards (Cartões de Estatísticas)
```jsx
<div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-[cor]-200 text-center">
  <IconComponent className="w-6 h-6 text-[cor]-500 mx-auto mb-2" />
  <p className="text-2xl font-bold text-gray-900">{valor}</p>
  <p className="text-xs text-gray-600">{label}</p>
</div>
```

### 4. Navigation Header
```jsx
<nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50">
  <div className="flex items-center justify-between px-4 sm:px-6 py-4">
    {/* Logo + Nome */}
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
        <span className="text-white text-sm sm:text-lg font-bold">鳥</span>
      </div>
      <div>
        <span className="font-bold text-gray-800 text-base sm:text-lg">Nipo School</span>
        <p className="text-xs text-red-500 font-medium hidden sm:block">#NipoSchoolOn</p>
      </div>
    </div>
    
    {/* Avatar + Actions */}
    <div className="flex items-center space-x-2 sm:space-x-4">
      {/* Conteúdo do header */}
    </div>
  </div>
</nav>
```

---

## 📐 Layout e Grid

### Container Principal
```jsx
<div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
  {/* Conteúdo da página */}
</div>
```

### Grid de Cards
```jsx
// 2 colunas mobile, 4 desktop
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {/* Stats cards */}
</div>

// 1 coluna mobile, 2 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
  {/* Action buttons */}
</div>
```

### Espaçamentos Padronizados
```css
.nipo-spacing-xs { @apply space-y-2; }
.nipo-spacing-sm { @apply space-y-4; }
.nipo-spacing-md { @apply space-y-6; }
.nipo-spacing-lg { @apply space-y-8; }
```

---

## 📱 Responsividade Mobile-First

### Breakpoints
- **Mobile**: < 640px (padrão)
- **Tablet**: 640px - 1024px (sm:)
- **Desktop**: > 1024px (lg:)

### Regras Mobile-First
1. **Sempre começar com mobile**
2. **Textos menores no mobile**: `text-base sm:text-lg`
3. **Padding reduzido**: `px-4 sm:px-6`
4. **Grid colapsado**: `grid-cols-1 sm:grid-cols-2`
5. **Ícones menores**: `w-4 h-4 sm:w-5 sm:h-5`

### Padrão de Componente Responsivo
```jsx
<div className="
  w-full
  px-4 sm:px-6 
  text-sm sm:text-base
  rounded-lg sm:rounded-xl
  p-4 sm:p-6
">
  {/* Conteúdo */}
</div>
```

---

## ✨ Animações e Microinterações

### Animações Padrão
```css
/* Hover básico */
.nipo-hover {
  @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1;
}

/* Loading */
.nipo-loading {
  @apply animate-pulse;
}

/* Floating musical notes */
.nipo-float {
  animation: nipoFloat 6s ease-in-out infinite;
}

@keyframes nipoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
```

### Microinterações Padrão
1. **Hover cards**: `hover:shadow-xl hover:-translate-y-1`
2. **Button press**: `active:scale-95`
3. **Loading states**: `animate-pulse`
4. **Entrance**: `animate-fade-in`

---

## 🧭 Padrões de Navegação

### Header Fixo
- Sempre sticky no topo
- Background com blur
- Logo + nome sempre visível
- Avatar do usuário à direita

### Breadcrumbs
```jsx
<nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
  <Link to="/dashboard" className="hover:text-gray-700 transition-colors">
    Dashboard Principal
  </Link>
  <ChevronRight className="w-4 h-4" />
  <span className="text-gray-900 font-medium">Página Atual</span>
</nav>
```

### Footer Padrão
```jsx
<footer className="text-center py-8 border-t border-red-200 bg-white/50 rounded-t-2xl backdrop-blur-sm">
  <div className="mb-4">
    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mx-auto mb-2 flex items-center justify-center">
      <span className="text-white text-sm font-bold">鳥</span>
    </div>
  </div>
  <p className="text-gray-600 font-medium mb-1">Nipo School App &copy; 2025</p>
  <p className="text-red-500 text-sm font-bold">
    🎵 "Se não for divertido, ninguém aprende. Se não for fácil, ninguém começa. Se não for TikTokável, ninguém compartilha."
  </p>
  <p className="text-xs text-gray-400 mt-2">Versão Beta • ADNIPO Suzano</p>
</footer>
```

---

## 🔄 Estados e Feedback

### Loading States
```jsx
// Skeleton loading para cards
<div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
  <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
</div>
```

### Empty States
```jsx
<div className="text-center py-8">
  <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
  <p className="text-gray-600">Nenhum item disponível ainda.</p>
</div>
```

### Error States
```jsx
<div className="text-center py-8">
  <div className="text-6xl mb-4">🚫</div>
  <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro</h2>
  <p className="text-gray-600 mb-6">{mensagemErro}</p>
</div>
```

---

## ♿ Acessibilidade

### Cores e Contraste
- Todos os textos seguem WCAG 2.1 AA
- Cores de foco visíveis: `focus:ring-2 focus:ring-red-500`

### Navegação por Teclado
```jsx
<button className="focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
  {/* Conteúdo */}
</button>
```

### Textos Alternativos
- Sempre incluir `alt` em imagens
- `aria-label` em ícones clicáveis

---

## 🎯 Classes CSS Padronizadas

### Layout Classes
```css
.nipo-container { @apply max-w-4xl mx-auto px-4 sm:px-6 py-6; }
.nipo-section { @apply mb-8; }
.nipo-grid-stats { @apply grid grid-cols-2 lg:grid-cols-4 gap-4; }
.nipo-grid-actions { @apply grid grid-cols-1 sm:grid-cols-2 gap-6; }
```

### Component Classes
```css
.nipo-card { 
  @apply bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-red-100 hover:shadow-xl transition-all duration-300; 
}

.nipo-button-primary { 
  @apply bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg; 
}

.nipo-stats-card { 
  @apply bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center border border-gray-200; 
}

.nipo-nav { 
  @apply bg-white/90 backdrop-blur-md shadow-sm border-b border-red-100 sticky top-0 z-50; 
}
```

### State Classes
```css
.nipo-loading { @apply animate-pulse; }
.nipo-hover { @apply transition-all duration-200 hover:shadow-md hover:-translate-y-1; }
.nipo-focus { @apply focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2; }
```

---

## 📱 Exemplo de Página Completa Padronizada

```jsx
const PaginaPadrao = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      
      {/* Navigation - SEMPRE IGUAL */}
      <nav className="nipo-nav">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-md">
              <span className="text-white text-sm sm:text-lg font-bold">鳥</span>
            </div>
            <div>
              <span className="font-bold text-gray-800 text-base sm:text-lg">Nipo School</span>
              <p className="text-xs text-red-500 font-medium hidden sm:block">#NipoSchoolOn</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            {loading && <RefreshCw className="w-4 h-4 text-red-500 animate-spin" />}
            {/* Avatar */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="nipo-container">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <Link to="/dashboard" className="hover:text-gray-700 transition-colors">Dashboard</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium">Página Atual</span>
        </nav>

        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="nipo-text-h1 mb-3">Título da Página</h1>
          <p className="nipo-text-body">Descrição da página</p>
        </header>

        {/* Stats Grid */}
        <div className="nipo-grid-stats nipo-section">
          {/* Stats cards */}
        </div>

        {/* Content Cards */}
        <div className="space-y-8">
          <div className="nipo-card">
            {/* Conteúdo */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="nipo-grid-actions nipo-section">
          {/* Botões de ação */}
        </div>

        {/* Footer - SEMPRE IGUAL */}
        <footer className="text-center py-8 border-t border-red-200 bg-white/50 rounded-t-2xl backdrop-blur-sm">
          {/* Footer content padrão */}
        </footer>
      </div>
      
      {/* Floating Elements */}
      <div className="fixed top-1/4 left-4 text-red-200 text-2xl animate-bounce opacity-30 pointer-events-none">🎵</div>
    </div>
  );
};
```

---

## ✅ Checklist de Implementação

### Para cada nova página/componente:

- [ ] **Mobile-First**: Testado em 375px primeiro
- [ ] **Navigation**: Header padrão implementado
- [ ] **Background**: Gradiente padrão aplicado
- [ ] **Cards**: Usando classes `nipo-card`
- [ ] **Spacing**: Usando grid e spacing padronizados
- [ ] **Colors**: Apenas cores da paleta oficial
- [ ] **Typography**: Hierarquia respeitada
- [ ] **Loading**: Estados de carregamento implementados
- [ ] **Hover**: Microinterações aplicadas
- [ ] **Accessibility**: Focus e aria-labels
- [ ] **Footer**: Footer padrão incluído
- [ ] **Floating Elements**: Notas musicais se apropriado

---

## 🎯 Conclusão

Este sistema garante:
- **Consistência total** em todas as páginas
- **Experiência mobile perfeita** 
- **Manutenibilidade** do código
- **Performance otimizada**
- **Identidade visual forte**

**Regra de Ouro**: Se não está neste documento, não deve ser implementado diferente do padrão estabelecido.