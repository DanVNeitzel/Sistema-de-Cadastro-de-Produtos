# Sistema de Cadastro de Produtos

## 📋 Visão Geral

Sistema full stack desenvolvido para gerenciamento de produtos com operações CRUD completas, interface responsiva e integração preparada para backend .NET. O projeto apresenta uma arquitetura moderna com **Feature Flags** para alternar entre dados mock e API real, além de menu lateral customizado com suporte completo para mobile e desktop.

## ✨ Destaques do Projeto

- ✅ **CRUD Completo** de produtos com validações robustas
- ✅ **Interface Responsiva** com menu drawer customizado
- ✅ **Feature Flags** para alternar entre Mock e API Real
- ✅ **Testes Automatizados** (53 testes passando)
- ✅ **Home Dashboard** com navegação por cards
- ✅ **Interceptor HTTP Avançado** com retry automático
- ✅ **Validação Visual** com bordas coloridas e mensagens de erro
- ✅ **Gerenciador de Colunas** customizado
- ✅ **Breadcrumbs Dinâmicos** iniciando sempre na Home
- ✅ **Formatação Monetária** com máscara brasileira (R$)

## 🏗️ Arquitetura do Projeto

```
📁 Projeto/
├── 📁 frontend/                    # Aplicação Angular
│   └── 📁 product-management/
│       ├── 📁 src/
│       │   ├── 📁 app/
│       │   │   ├── 📁 components/   # Componentes da aplicação
│       │   │   │   ├── home/        # Dashboard inicial
│       │   │   │   ├── product-list/
│       │   │   │   ├── product-form/
│       │   │   │   ├── product-detail/
│       │   │   │   └── not-found/
│       │   │   ├── 📁 models/       # Interfaces e tipos TypeScript
│       │   │   ├── 📁 services/     # Serviços (Mock + API Real)
│       │   │   │   ├── product.service.ts
│       │   │   │   ├── product-mock.service.ts
│       │   │   │   └── product-api.service.ts
│       │   │   └── 📁 interceptors/ # Interceptors HTTP
│       │   ├── 📁 environments/     # Configurações de ambiente
│       │   │   ├── environment.ts
│       │   │   └── environment.prod.ts
│       │   ├── 📄 index.html
│       │   ├── 📄 main.ts
│       │   └── 📄 styles.scss
│       ├── 📄 package.json
│       ├── 📄 angular.json
│       └── 📄 tsconfig.json
├── 📁 backend/                     # API .NET (estrutura preparada)
│   └── 📁 ProductManagement.API/
│       ├── 📁 Controllers/
│       ├── 📁 Models/
│       ├── 📁 Data/
│       └── 📁 Services/
├── 📄 README.md
├── 📄 DEVELOPMENT.md
├── 📄 MOCK-SERVICE-BOAS-PRATICAS.md
└── 📄 ERROS-CORRIGIDOS.md
```

## 🚀 Tecnologias Utilizadas

### Frontend (Implementado)
- **Angular 17** - Framework principal (standalone components)
- **PO-UI 17.0.0** - Biblioteca de componentes UI
- **RxJS** - Programação reativa (BehaviorSubject, Operators)
- **TypeScript** - Linguagem principal com strict mode
- **SCSS** - Pré-processador CSS com variáveis e mixins
- **Formulários Reativos** - Gerenciamento avançado de formulários
- **Jasmine 5.1.0** - Framework de testes
- **Karma 6.4.0** - Test runner

### Backend (Estrutura Preparada)
- **.NET 8** - Framework da API
- **Entity Framework Core** - ORM
- **SQL Server / InMemory** - Banco de dados
- **Swagger** - Documentação da API

## 💻 Como Executar o Projeto

### Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (versão 18 ou superior) - [Download](https://nodejs.org/)
- **npm** (vem com Node.js) ou **yarn**
- **Angular CLI** (versão 17)

### Passo 1: Verificar Instalações
```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Instalar Angular CLI globalmente (se ainda não tiver)
npm install -g @angular/cli
```

### Passo 2: Navegar até a Pasta do Projeto
```bash
# A partir da raiz do repositório, navegue até a pasta do frontend
cd frontend/product-management
```

### Passo 3: Instalar Dependências
```bash
# Instalar todas as dependências do projeto
npm install

# Aguarde a instalação (pode levar alguns minutos)
# O npm irá baixar todas as dependências listadas no package.json
```

### Passo 4: Executar o Projeto
```bash
# Iniciar o servidor de desenvolvimento
npm start

# OU usar o comando do Angular CLI diretamente
ng serve
```

### Passo 5: Acessar a Aplicação
Após a compilação bem-sucedida, você verá no terminal:
```
** Angular Live Development Server is listening on localhost:4200 **
✔ Compiled successfully.
```

Abra seu navegador e acesse:
```
http://localhost:4200
```

### 🎯 Comandos Úteis

```bash
# Iniciar com porta customizada
ng serve --port 4300

# Iniciar e abrir automaticamente no navegador
ng serve --open

# Modo de produção (otimizado)
ng build --configuration production

# Rodar testes unitários
ng test

# Rodar testes com coverage
ng test --code-coverage

# Rodar linter
ng lint
```

### ⚙️ Configuração de Feature Flags

Por padrão, o projeto usa **dados mock** em desenvolvimento. Para alternar entre Mock e API Real:

**Desenvolvimento (Mock)** - Edite `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api',
  useMockData: true,  // ✅ Dados mock (sem backend necessário)
  apiTimeout: 30000,
  enableDebugMode: true
};
```

**Produção (API Real)** - Edite `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.seudominio.com/api',
  useMockData: false,  // ✅ API real (requer backend)
  apiTimeout: 30000,
  enableDebugMode: false
};
```

### 🐛 Troubleshooting

**Erro: "ng: command not found"**
```bash
# Instale o Angular CLI globalmente
npm install -g @angular/cli
```

**Erro: "Port 4200 is already in use"**
```bash
# Use uma porta diferente
ng serve --port 4300
```

**Erro de dependências após npm install**
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Erro: "This version of CLI is only compatible with Angular versions..."**
```bash
# Verifique as versões no package.json
# Atualize o Angular CLI se necessário
npm install -g @angular/cli@latest
```

## 🎯 Funcionalidades Implementadas

### ✅ Componentes Frontend

#### 🏠 Home Dashboard (`home`)
- **Cards interativos** com navegação rápida
- **Design responsivo** adaptável a mobile/tablet/desktop
- **4 seções principais**: Gerenciar Produtos, Novo Produto, Relatórios, Configurações
- **Animações** de hover com gradientes
- **Ícones PO-UI** coloridos por categoria
- **Arquivos**: `home.component.ts`, `home.component.html`, `home.component.scss`

#### 🍔 Menu Lateral Customizado (`app.component`)
- **Menu Desktop**: PO-UI Menu tradicional
- **Menu Mobile**: Drawer customizado com overlay
- **Detecção automática**: Breakpoint em 769px
- **Animações suaves**: Transform com cubic-bezier
- **Submenus expansíveis**: Produtos com Listar e Novo
- **Header customizado**: Gradiente roxo/azul
- **Botão hamburger**: Visível na toolbar mobile
- **Auto-close**: Fecha ao navegar ou clicar no overlay
- **Arquivos**: `app.component.*`

#### 📋 Listagem de Produtos (`product-list`)
- **Tabela responsiva** com dados dos produtos
- **Filtros avançados**: Nome, categoria, preço (min/max), status (ativo/inativo)
- **Paginação automática** com controle de páginas
- **Ações por linha**: Visualizar, editar, excluir (com modal PO-UI)
- **Busca em tempo real** com debounce (500ms)
- **Gerenciador de colunas** customizado com gradiente
- **Status visual**: Tags coloridas (Ativo/Inativo)
- **Conversão de filtros**: String para boolean no status
- **Arquivos**: `product-list.component.*`

#### 📝 Formulário de Produtos (`product-form`)
- **Formulários reativos** com validações complexas
- **Modo criação e edição** dinâmico
- **Validação visual**:
  - Bordas vermelhas (2px) em campos inválidos
  - Bordas verdes em campos válidos
  - Mensagens de erro abaixo de cada campo
- **Máscara monetária**: R$ 1.234,56
- **Formatação de preço**: Preserva decimais (199,90)
- **Mensagens dinâmicas**: Min/max com valores formatados
- **Modal de cancelamento**: Confirma antes de descartar alterações
- **Breadcrumb dinâmico**: Home > Produtos > Novo/Editar
- **Upload de imagem** com preview
- **6 categorias**: Eletrônicos, Roupas, Casa, Esportes, Livros, Outros
- **Arquivos**: `product-form.component.*`

#### 👁️ Detalhes do Produto (`product-detail`)
- **Layout em duas colunas**: Imagem + Informações
- **Ações rápidas**: Editar e Excluir
- **Modal de confirmação**: Para exclusão com PoDialogService
- **Informações técnicas**: ID, categoria, preço, status, datas
- **Breadcrumb**: Home > Produtos > Detalhes
- **Design responsivo**: Empilhamento em mobile
- **Arquivos**: `product-detail.component.*`

#### ❌ Página 404 (`not-found`)
- Interface amigável para páginas não encontradas
- Navegação de volta para áreas válidas
- Design responsivo com ícone e mensagem
- **Arquivos**: `not-found.component.*`

### 🔧 Serviços e Arquitetura

#### 🎛️ Feature Flag System (app.config.ts)
```typescript
// Alterna automaticamente entre Mock e API Real
{
  provide: ProductService,
  useClass: environment.useMockData ? ProductMockService : ProductApiService
}
```

**Benefícios**:
- ✅ Desenvolvimento independente do backend
- ✅ Testes com dados controlados
- ✅ Transição suave para API real
- ✅ Configuração por ambiente

#### 🛠️ ProductMockService (`product-mock.service`)
```typescript
// Serviço de simulação com dados em memória
getProducts(filters?, pagination?) // Lista com filtros
getProductById(id)                 // Busca por ID
createProduct(product)             // Criação com validação
updateProduct(id, product)         // Atualização
deleteProduct(id)                  // Exclusão

// Características:
- 300ms de latência simulada
- Validações de negócio (categoria, preço)
- Paginação server-side
- Filtros múltiplos (search, category, price, active)
- BehaviorSubject para reatividade
```

#### 🌐 ProductApiService (`product-api.service`)
```typescript
// Serviço de integração com API real
getProducts(filters?, pagination?) // HTTP GET com query params
getProductById(id)                 // HTTP GET por ID
createProduct(product)             // HTTP POST
updateProduct(id, product)         // HTTP PUT
deleteProduct(id)                  // HTTP DELETE

// Características:
- Timeout de 30 segundos
- Retry automático (2 tentativas)
- Tratamento de erros específico por status
- Debug logging condicional
- BehaviorSubject para cache
- HttpParams para filtros
```

#### 🔄 HTTP Interceptor (`http-request.interceptor`)
**Recursos Avançados**:
- ✅ **Headers automáticos**: Content-Type, Accept, X-Requested-With
- ✅ **Loading global**: LoadingService com contador de requisições
- ✅ **Retry inteligente**: Delay exponencial (1s, 2s) apenas em erros de rede
- ✅ **Tratamento de 15+ códigos HTTP**: 400, 401, 403, 404, 409, 422, 429, 500, 502, 503, 504
- ✅ **Mensagens amigáveis**: friendlyMessage + technicalMessage
- ✅ **Debug logging**: Logs detalhados em modo desenvolvimento
- ✅ **Error enrichment**: timestamp, errorDetails, status

#### 🌍 Environments (Feature Flags)

**Development** (`environment.ts`):
```typescript
{
  production: false,
  apiUrl: 'http://localhost:5000/api',
  useMockData: true,        // ✅ Usa dados mock
  apiTimeout: 30000,
  enableDebugMode: true
}
```

**Production** (`environment.prod.ts`):
```typescript
{
  production: true,
  apiUrl: 'https://api.seudominio.com/api',
  useMockData: false,       // ✅ Usa API real
  apiTimeout: 30000,
  enableDebugMode: false
}
```

#### 📊 Modelos de Dados (`models/`)
- **Product**: Interface principal com 10 campos
- **ProductCategory**: Enum com 6 categorias
- **ApiResponse**: PaginatedResponse com metadata
- **ProductFilter**: Interface para filtros

## 🧪 Testes (53 testes implementados)

### Cobertura de Testes
- ✅ **AppComponent**: 6 testes
- ✅ **ProductListComponent**: 15 testes
- ✅ **ProductFormComponent**: 12 testes
- ✅ **ProductDetailComponent**: 8 testes
- ✅ **NotFoundComponent**: 2 testes
- ✅ **ProductApiService**: 20+ testes de integração

### Tipos de Testes
- **Unit Tests**: Componentes isolados
- **Integration Tests**: HTTP com HttpTestingController
- **Service Tests**: Mock e API
- **Component Tests**: Rendering e interações

### Como Executar
```bash
# Rodar todos os testes
```bash
# Navegar para a pasta do projeto
cd frontend/product-management

# Rodar todos os testes
npm test

# Rodar com coverage
npm run test -- --code-coverage

# Rodar em modo headless
npm run test -- --browsers=ChromeHeadless --watch=false
```
```

## 🎨 Design e UX

### Tema e Estilização
- **PO-UI Theme**: Tema padrão customizado
- **Cores Principais**: Gradiente azul/roxo (#667eea → #764ba2)
- **Responsividade**: Mobile-first design (breakpoint 769px)
- **Animações**: Transições suaves com cubic-bezier
- **Menu Customizado**: Drawer lateral 280px com overlay em mobile
- **Cards**: Hover effects com transform e shadow

### Componentes PO-UI Utilizados
- `po-table` - Tabelas responsivas com gerenciador de colunas
- `po-page-default` / `po-page-edit` / `po-page-detail` - Layouts de páginas
- `po-form` - Formulários estruturados
- `po-input` / `po-select` / `po-switch` / `po-upload` - Campos de formulário
- `po-button` - Botões padronizados
- `po-notification` - Sistema de notificações toast
- `po-dialog` - Modais de confirmação (excluir, cancelar)
- `po-loading` - Indicadores de carregamento global
- `po-menu` - Menu lateral (desktop)
- `po-toolbar` - Barra superior
- `po-widget` - Cards da home dashboard
- `po-icon` - Ícones PO-UI
- `po-breadcrumb` - Navegação hierárquica

### Customizações Visuais
- **Tabela**: 
  - Header com gradiente
  - Hover effects nas linhas
  - Tags coloridas para status (verde/vermelho)
  - Gerenciador de colunas com gradiente no header
  
- **Formulário**: 
  - Bordas vermelhas (2px solid) em campos inválidos
  - Bordas verdes em campos válidos
  - Mensagens de erro dinâmicas abaixo dos campos
  - Máscara monetária R$ 1.234,56
  - Upload com preview
  
- **Menu Mobile**: 
  - Drawer 280px com animação slide
  - Overlay semitransparente
  - Header com gradiente
  - Submenus expansíveis com chevron
  - Ícones coloridos
  
- **Home Cards**: 
  - Hover com transform scale(1.05)
  - Shadow elevado no hover
  - Cores por categoria (azul, verde, laranja, roxo)
  - Grid responsivo (1/2/4 colunas)

## 🔄 Fluxo da Aplicação

### Navegação Principal
```
🏠 Home (/)
├── 📋 Gerenciar Produtos → /products
├── ➕ Novo Produto → /products/new
├── 📊 Relatórios (Em breve)
└── ⚙️ Configurações (Em breve)

📋 Lista (/products)
├── ➕ Novo Produto (/products/new)
├── 👁️ Detalhes (/products/:id)
└── ✏️ Editar (/products/edit/:id)

❌ 404 (**) → Página não encontrada
```

### Breadcrumbs Dinâmicos
```
Home
Home > Produtos
Home > Produtos > Novo Produto
Home > Produtos > Editar Produto
Home > Produtos > Detalhes do Produto
```

### Fluxo de Dados (Feature Flag)
```
                    ┌─────────────────┐
                    │   Component     │
                    │ (inject service)│
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │    Feature Flag         │
                │  (environment config)   │
                │  useMockData: boolean   │
                └────────────┬────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
            ┌───────▼──────┐  ┌──────▼────────┐
            │ MockService  │  │  ApiService   │
            │ (In-memory)  │  │  (HTTP Real)  │
            │ - delay 300ms│  │  - timeout 30s│
            │ - validation │  │  - retry x2   │
            └───────┬──────┘  └──────┬────────┘
                    │                 │
                    │        ┌────────▼────────┐
                    │        │  Interceptor    │
                    │        │  - retry logic  │
                    │        │  - error codes  │
                    │        │  - debug logs   │
                    │        └────────┬────────┘
                    │                 │
                    │        ┌────────▼────────┐
                    │        │   Backend API   │
                    │        │    (.NET Core)  │
                    │        │  - Controllers  │
                    │        │  - EF Core      │
                    │        └─────────────────┘
                    │
            ┌───────▼──────────┐
            │ BehaviorSubject  │
            │   products$      │
            │   (Reactive)     │
            └───────┬──────────┘
                    │
            ┌───────▼──────────┐
            │   Component UI   │
            │   (Auto-update)  │
            │   - *ngFor       │
            │   - async pipe   │
            └──────────────────┘
```

### Fluxo de Validação de Formulário
```
User Input → ReactiveForm → Validators
            ↓
    ┌───────┴───────┐
    │  valid?       │
    └───┬───────┬───┘
    YES │       │ NO
        ▼       ▼
    Submit   Show Error
        │       ├─ Border: 2px solid red
        │       ├─ Message: "Campo obrigatório"
        ↓       └─ Icon: po-icon-warning
    Service
        ↓
    API/Mock
        ├─ Success (201/200)
        │    ├─ Update BehaviorSubject
        │    ├─ PoNotification success
        │    └─ Navigate to list
        │
        └─ Error (4xx/5xx)
             ├─ Interceptor catch
             ├─ Enrich error (friendly + technical)
             ├─ PoNotification error
             └─ Stay on form
```

### Fluxo de Exclusão (Delete)
```
User clicks "Excluir"
        ↓
PoDialogService.confirm({
  title: "Confirmar Exclusão",
  message: "Deseja realmente excluir?"
})
        ↓
    ┌───┴────┐
    │ User?  │
    └───┬────┴────┐
   YES │      NO │
       ↓         ↓
   Delete     Cancel
       │
   Service.deleteProduct(id)
       │
   ┌───┴────────┐
   │ Success?   │
   └───┬────┬───┘
  YES │    │ NO
      ▼    ▼
   Remove  Show Error
   from    Message
   List    (notification)
      │
   Navigate
   to list
```

### Fluxo de Cancelamento (Form)
```
User clicks "Cancelar"
        ↓
    ┌───────────┐
    │ Form dirty?│
    └───┬────┬──┘
   YES │    │ NO
       ↓    ↓
   Modal   Navigate
   Confirm  back
       │
   ┌───┴────┐
   │ User?  │
   └───┬────┴────┐
  YES │      NO │
      ↓         ↓
  Navigate   Stay
  back       on form
```