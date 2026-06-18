# 🍕 PizzaSystem — Frontend

Sistema completo de gestão de pedidos para pizzaria. CRUD completo de Clientes, Produtos, Pedidos, Categorias e Usuários, com autenticação JWT.

## Stack

- **React 18** + Vite
- **React Router v6** — roteamento SPA
- **Axios** — chamadas HTTP com interceptors JWT
- **react-hot-toast** — notificações
- **Lucide React** — ícones
- **date-fns** — formatação de datas (pt-BR)
- CSS puro com design system em variáveis CSS (sem Tailwind, sem UI lib)

---

## Estrutura do projeto

```
src/
├── api/
│   └── index.js          ← Todos os endpoints da API (Axios)
├── components/
│   └── layout/
│       └── AppLayout.jsx ← Sidebar + topbar
├── contexts/
│   └── AuthContext.jsx   ← Auth com JWT, login/logout/register
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   └── admin/
│       ├── DashboardPage.jsx
│       ├── ClientesPage.jsx
│       ├── ProdutosPage.jsx
│       ├── PedidosPage.jsx
│       ├── UsuariosPage.jsx
│       └── CategoriasPage.jsx
├── App.jsx               ← Rotas protegidas
├── main.jsx
└── index.css             ← Design system completo
```

---

## Instalação e uso

```bash
# 1. Instale as dependências
npm install

# 2. Configure a URL da API (opcional — padrão: http://localhost:4000)
echo "VITE_API_URL=http://localhost:4000" > .env

# 3. Rode o servidor de desenvolvimento
npm run dev
```

Acesse: **http://localhost:5173**

---

## Conectando ao Backend

O arquivo principal de integração é `src/api/index.js`.

O frontend espera que a API retorne:

### Login (`POST /auth/login`)
```json
{
  "token": "jwt-token-aqui",
  "user": { "id": "...", "name": "...", "email": "...", "role": "MANAGER" }
}
```

### Register (`POST /auth/register`)
```json
{
  "token": "jwt-token-aqui",
  "user": { ... }
}
```

Todos os outros endpoints seguem a spec da API (Swagger) que está no `Documento_Importante.js`.

O token JWT é enviado automaticamente via header `Authorization: Bearer <token>` em todas as requisições após o login.

### Variável de ambiente

```env
VITE_API_URL=http://localhost:4000
```

Substitua pela URL do seu servidor de produção ao fazer deploy.

---

## Rotas do frontend

| Rota | Página | Proteção |
|------|--------|----------|
| `/login` | Login | Pública |
| `/cadastro` | Cadastro | Pública |
| `/dashboard` | Dashboard | Autenticado |
| `/clientes` | CRUD Clientes | Autenticado |
| `/produtos` | CRUD Produtos | Autenticado |
| `/pedidos` | CRUD Pedidos | Autenticado |
| `/categorias` | CRUD Categorias | Autenticado |
| `/usuarios` | CRUD Usuários | Autenticado |

---

## Funcionalidades implementadas

### ✅ Autenticação
- Login com e-mail/senha → JWT armazenado no localStorage
- Cadastro de novo usuário com endereço (estado/cidade)
- Logout com limpeza de sessão
- Redirecionamento automático (rotas protegidas/públicas)
- Auto-logout em 401 (token expirado)

### ✅ Dashboard
- Cards de estatísticas (pedidos, clientes, produtos, receita)
- Tabela de pedidos recentes
- Saudação personalizada por horário

### ✅ Clientes
- Listagem com busca (nome, e-mail, telefone)
- Criar/editar/excluir cliente
- Alternar status (Ativo/Suspenso)
- Seleção de estado brasileiro (27 estados)

### ✅ Produtos
- Listagem com busca e filtro por categoria
- Criar/editar/excluir produto
- Toggle de disponibilidade
- Vinculação a categorias

### ✅ Pedidos
- Listagem com filtro por status
- Criar pedido (selecionar cliente, produtos, quantidade)
- Cálculo automático de total
- Avançar status: PENDING → PREPARING → OUT_FOR_DELIVERY → DELIVERED
- Modal de detalhes do pedido
- Excluir pedido

### ✅ Categorias
- Cards visuais com contagem de produtos
- Criar/editar/excluir categoria

### ✅ Usuários
- CRUD completo
- Gerenciar role (CUSTOMER / MANAGER / SUPER_ADMIN)
- Alterar status inline na tabela

---

## Build para produção

```bash
npm run build
# Arquivos gerados em ./dist/
```
