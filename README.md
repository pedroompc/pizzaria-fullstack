# 🍕 PizzaSystem — Sistema Fullstack de Gestão de Pizzaria

Trabalho final de Fullstack. Sistema web completo de gestão de pedidos para pizzaria, com autenticação JWT, CRUD de Clientes, Usuários, Produtos, Categorias e Pedidos.

Monorepo com **frontend** (React) e **backend** (Node/Express) juntos.

```
TRABALHO FINAL/
├── FrontEnd-Pizzaria/   ← React + Vite (interface)
└── BackEnd-Pizzaria/    ← Node.js + Express + Prisma (API REST)
```

---

## Stack

**Frontend:** React 18, Vite, React Router, Axios, react-hot-toast, Lucide
**Backend:** Node.js, Express, Prisma (SQLite), JWT, bcryptjs, Swagger
**Integrações externas:** IBGE (estados/municípios) e ViaCEP (endereço por CEP)

---

## Como rodar (2 terminais)

### 1. Backend (API em http://localhost:4000)

```bash
cd BackEnd-Pizzaria
npm install
# crie o arquivo .env (veja exemplo abaixo) e então:
npm run setup     # cria o banco SQLite + popula com dados de exemplo
npm run dev
```

Crie um arquivo `BackEnd-Pizzaria/.env` com:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="troque-este-segredo"
PORT=4000
```

### 2. Frontend (interface em http://localhost:5173)

```bash
cd FrontEnd-Pizzaria
npm install
npm run dev
```

---

## 🔑 Credenciais (criadas pelo seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Super Admin | `admin@pizza.com` | `admin123` |
| Gerente | `gerente@pizza.com` | `gerente123` |
| Cliente | `maria@email.com` | `cliente123` |

---

## Documentação da API (Swagger)

Com o backend rodando: **http://localhost:4000/docs**

---

## Funcionalidades

- 🔐 Autenticação JWT (login, cadastro, rotas protegidas, auto-logout)
- 👥 CRUD de Clientes e Usuários (com papéis e status)
- 🍕 CRUD de Produtos e Categorias
- 🧾 CRUD de Pedidos (itens, status, total calculado no servidor, data/hora)
- 📍 Cadastro de endereço com IBGE (estados/municípios) e ViaCEP (CEP)
- 📊 Dashboard com métricas
