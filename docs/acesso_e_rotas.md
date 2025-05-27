# 🎌 Arquivos de Acesso e Rotas - Nipo School

## 🔐 **ARQUIVOS DE AUTENTICAÇÃO**

### **1. Middleware de Rotas**
```
📄 src/middleware.js
```
- **Função**: Intercepta todas as requisições
- **Responsabilidade**: Redirecionar usuários não logados
- **Status**: ❌ Com erro (biblioteca não instalada)

### **2. Context de Autenticação**
```
📄 context/AuthContext.jsx
```
- **Função**: Gerenciar estado global de autenticação
- **Responsabilidade**: Login, logout, verificar usuário logado
- **Status**: ❓ Precisamos ver o conteúdo

### **3. Cliente Supabase**
```
📄 services/supabaseClient.js
```
- **Função**: Configuração da conexão com Supabase
- **Responsabilidade**: Instância do cliente de autenticação
- **Status**: ❓ Precisamos ver o conteúdo

### **4. Route Guard (Proteção)**
```
📄 components/RouteGuard.jsx
📄 shared/components/RouteGuard.jsx
```
- **Função**: Componente que protege rotas
- **Responsabilidade**: Verificar se usuário pode acessar página
- **Status**: ❓ Pode ter duplicado

---

## 🗂️ **ESTRUTURA DE PÁGINAS/ROTAS**

### **🏠 Página Inicial**
```
📄 app/page.jsx
```
- **Rota**: `/`
- **Função**: Landing page ou redirecionamento

### **🔓 Páginas Públicas (Autenticação)**
```
📄 app/auth/layout.jsx          # Layout para páginas de auth
📄 app/auth/login/page.jsx      # Página de login
📄 app/auth/register/page.jsx   # Página de cadastro
```
- **Rotas**: `/auth/login`, `/auth/register`
- **Acesso**: Apenas usuários NÃO logados

### **🔒 Páginas Protegidas**
```
📄 app/protected/layout.jsx                # Layout para área protegida
📄 app/protected/dashboard/page.jsx        # Dashboard principal ✅
📄 app/protected/vote/page.jsx             # Votação ✅
📄 app/protected/vote-confirmation/page.jsx # Confirmação voto ✅
📄 app/protected/conquistas/              # ⚠️ Pasta vazia
📄 app/protected/devocional/              # ⚠️ Pasta vazia
📄 app/protected/modulos/                 # ⚠️ Pasta vazia
📄 app/protected/perfil/                  # ⚠️ Pasta vazia
📄 app/protected/pratica/                 # ⚠️ Pasta vazia
📄 app/protected/rafa-beat/               # ⚠️ Pasta vazia
```
- **Rotas**: `/protected/*`
- **Acesso**: Apenas usuários logados

---

## 🧩 **COMPONENTES DE FORMULÁRIO**

### **Formulários de Autenticação**
```
📄 components/LoginForm.jsx     # Formulário de login
📄 components/RegisterForm.jsx  # Formulário de cadastro
```

### **Componentes UI**
```
📄 shared/components/UI/LoadingZen.jsx    # Loading customizado
📄 shared/components/Layout/Navigation.jsx # Navegação
📄 shared/components/Layout/BottomNavigation.jsx # Nav bottom
```

---

## 🚀 **CONFIGURAÇÕES DE ROTA**

### **Layout Principal**
```
📄 app/layout.jsx               # Layout raiz da aplicação
📄 app/ClientProviders.jsx      # Providers (Context, etc)
```

### **Layouts Específicos**
```
📄 app/auth/layout.jsx          # Layout para login/register
📄 app/protected/layout.jsx     # Layout para área protegida
```

---

## 🔍 **MAPEAMENTO DE ROTAS ATUAL**

| Rota | Arquivo | Status | Acesso |
|------|---------|--------|--------|
| `/` | `app/page.jsx` | ✅ | Público |
| `/auth/login` | `app/auth/login/page.jsx` | ✅ | Não logados |
| `/auth/register` | `app/auth/register/page.jsx` | ✅ | Não logados |
| `/protected/dashboard` | `app/protected/dashboard/page.jsx` | ✅ | Logados |
| `/protected/vote` | `app/protected/vote/page.jsx` | ✅ | Logados |
| `/protected/vote-confirmation` | `app/protected/vote-confirmation/page.jsx` | ✅ | Logados |
| `/protected/conquistas` | ❌ Sem page.jsx | ⏳ | Logados |
| `/protected/devocional` | ❌ Sem page.jsx | ⏳ | Logados |
| `/protected/modulos` | ❌ Sem page.jsx | ⏳ | Logados |
| `/protected/perfil` | ❌ Sem page.jsx | ⏳ | Logados |
| `/protected/pratica` | ❌ Sem page.jsx | ⏳ | Logados |
| `/protected/rafa-beat` | ❌ Sem page.jsx | ⏳ | Logados |

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **1. Conflito no Middleware**
- ❌ Biblioteca `@supabase/auth-helpers-nextjs` não instalada
- 🔧 **Solução**: Desabilitar ou usar versão compatível

### **2. Pastas Vazias**
- ❌ 6 pastas em `/protected/` sem `page.jsx`
- 🔧 **Solução**: Criar páginas ou redirecionar para "em breve"

### **3. Redirecionamentos Inconsistentes**
- ❌ Código usa `/dashboard` mas rota é `/protected/dashboard`
- 🔧 **Solução**: Padronizar todas as referências

### **4. Route Guard Duplicado?**
- ❓ Pode ter em duas localizações
- 🔧 **Solução**: Verificar e usar apenas um

---

## 🎯 **PRÓXIMOS ARQUIVOS NECESSÁRIOS**

### **Para completar funcionalidades básicas:**
```
📄 app/protected/perfil/page.jsx       # Perfil do usuário
📄 app/protected/modulos/page.jsx      # Lista de módulos
📄 app/protected/conquistas/page.jsx   # Sistema de conquistas
📄 app/protected/devocional/page.jsx   # Conteúdo bíblico
📄 app/protected/pratica/page.jsx      # Exercícios práticos
📄 app/protected/rafa-beat/page.jsx    # Funcionalidade especial
```

### **Componentes de navegação:**
```
📄 shared/components/Layout/AppNavigation.jsx    # Nav principal
📄 shared/components/Layout/MobileNav.jsx        # Nav mobile
```

---

## ✅ **CHECKLIST DE CORREÇÕES URGENTES**

- [ ] **Corrigir middleware.js** (erro 500)
- [ ] **Verificar AuthContext.jsx** (método login vs signIn)
- [ ] **Padronizar rotas** (dashboard → protected/dashboard)
- [ ] **Criar páginas faltantes** ou placeholder "Em breve"
- [ ] **Verificar RouteGuard** (localização e funcionamento)
- [ ] **Testar fluxo completo** login → dashboard → navegação

---

**🎌 Resumo**: Temos a estrutura básica funcionando, mas precisamos corrigir o middleware e completar as páginas faltantes!