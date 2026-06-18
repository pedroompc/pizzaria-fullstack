// Ponto de entrada da API REST da PizzaSystem - [Pedro Marinho]
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express')

const swaggerSpec = require('./swagger')
const authRoutes = require('./routes/auth.routes')
const usersRoutes = require('./routes/users.routes')
const categoriesRoutes = require('./routes/categories.routes')
const productsRoutes = require('./routes/products.routes')
const ordersRoutes = require('./routes/orders.routes')

const app = express()
const PORT = process.env.PORT || 4000

// CORS liberado para o frontend (Vite roda em http://localhost:5173)
app.use(cors())
app.use(express.json())

// Rota de saúde / boas-vindas
app.get('/', (_req, res) => {
  res.json({ name: 'PizzaSystem API', status: 'online', docs: '/docs' })
})

// Documentação Swagger
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Rotas da aplicação
app.use('/auth', authRoutes)
app.use('/users', usersRoutes)
app.use('/categories', categoriesRoutes)
app.use('/products', productsRoutes)
app.use('/orders', ordersRoutes)

// 404 para rotas não encontradas
app.use((_req, res) => res.status(404).json({ message: 'Rota não encontrada' }))

// Garante dados iniciais: se o banco estiver vazio, roda o seed automaticamente.
// Importante em hospedagem gratuita, onde o disco pode reiniciar zerado. - [Pedro Marinho]
const prisma = require('./lib/prisma')
const seed = require('./seed')

async function ensureSeed() {
  try {
    const count = await prisma.user.count()
    if (count === 0) {
      console.log('🌱 Banco vazio — populando dados iniciais...')
      await seed()
    }
  } catch (err) {
    console.error('Não foi possível verificar/popular o banco:', err.message)
  }
}

ensureSeed().finally(() => {
  app.listen(PORT, () => {
    console.log(`🍕 API rodando na porta ${PORT}`)
    console.log(`📚 Documentação Swagger em /docs`)
  })
})
