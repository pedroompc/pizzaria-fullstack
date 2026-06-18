# 🍕 PizzaSystem — Backend (API REST)

API REST de gestão de pizzaria: autenticação JWT, CRUD de Usuários, Clientes, Produtos, Categorias e Pedidos, com documentação Swagger.

## Stack

- **Node.js + Express** — rotas RESTful
- **Prisma + SQLite** — ORM e banco de dados (arquivo `dev.db`)
- **JWT (jsonwebtoken)** — autenticação de rotas privadas
- **bcryptjs** — hash de senhas
- **Swagger (swagger-ui-express)** — documentação dos endpoints
- **CORS** — liberado para o frontend

---

## Como rodar

```bash
# 1. Instalar dependências
npm install

# 2. Criar o banco SQLite + popular com dados de exemplo (admin, produtos, pedidos)
npm run setup        # equivale a: prisma db push && node src/seed.js

# 3. Subir a API
npm run dev          # http://localhost:4000  (Swagger em /docs)
```

> A API roda na porta **4000**, que é exatamente a que o frontend espera.

---

## 🔑 Credenciais de acesso (criadas pelo seed)

| Papel | E-mail | Senha |
|-------|--------|-------|
| Super Admin | `admin@pizza.com` | `admin123` |
| Gerente | `gerente@pizza.com` | `gerente123` |
| Cliente | `maria@email.com` | `cliente123` |

---

## Documentação Swagger

Com a API rodando, acesse **http://localhost:4000/docs**.
Para testar rotas privadas: faça `POST /auth/login`, copie o `token` e clique em **Authorize** (cadeado) → cole o token.

---

## Endpoints principais

| Método | Rota | Descrição | Protegida |
|--------|------|-----------|-----------|
| POST | `/auth/login` | Login (retorna token + user) | ❌ |
| POST | `/auth/register` | Cadastro de cliente | ❌ |
| GET/POST | `/users` | Listar / criar usuários | ✅ |
| PATCH/DELETE | `/users/:id` | Editar / excluir | ✅ |
| PATCH | `/users/:id/status` | Alterar status | ✅ |
| GET/POST | `/categories` | Listar / criar categorias | ✅ |
| GET/POST | `/products` | Listar / criar produtos | ✅ |
| GET | `/products/available` | Produtos disponíveis | ✅ |
| GET/POST | `/orders` | Listar / criar pedidos | ✅ |
| PATCH | `/orders/:id/status` | Avançar status do pedido | ✅ |

Todas as rotas protegidas exigem o header `Authorization: Bearer <token>`.

---

## Scripts úteis

```bash
npm run dev       # API com auto-reload (nodemon)
npm start         # API em modo produção
npm run seed      # repovoar o banco
npm run db:studio # abrir o Prisma Studio (visualizar dados)
```
