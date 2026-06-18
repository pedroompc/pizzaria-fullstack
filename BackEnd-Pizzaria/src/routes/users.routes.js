// CRUD de usuários (clientes, gerentes, admins) - [Pedro Marinho]
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')
const { authRequired } = require('../middleware/auth')
const { sanitizeUser } = require('../lib/helpers')

const router = Router()

// Todas as rotas de usuário exigem autenticação
router.use(authRequired)

// GET /users -> lista todos os usuários
router.get('/', async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(users.map(sanitizeUser))
})

// GET /users/active -> apenas usuários com status ACTIVE
router.get('/active', async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { name: 'asc' },
  })
  res.json(users.map(sanitizeUser))
})

// GET /users/:id -> um usuário
router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } })
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' })
  res.json(sanitizeUser(user))
})

// POST /users -> cria usuário
router.post('/', async (req, res) => {
  try {
    const { name, email, pwd, phone, address, role, status } = req.body
    if (!name || !email || !pwd) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios' })
    }
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) return res.status(409).json({ message: 'E-mail já cadastrado' })

    const hash = await bcrypt.hash(pwd, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        pwd: hash,
        phone: phone || null,
        address: address || null,
        role: role || 'CUSTOMER',
        status: status || 'ACTIVE',
      },
    })
    res.status(201).json(sanitizeUser(user))
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro ao criar usuário' })
  }
})

// PATCH /users/:id -> atualiza usuário (re-hash da senha se enviada)
router.patch('/:id', async (req, res) => {
  try {
    const { name, email, pwd, phone, address, role, status } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (email !== undefined) data.email = email
    if (phone !== undefined) data.phone = phone
    if (address !== undefined) data.address = address
    if (role !== undefined) data.role = role
    if (status !== undefined) data.status = status
    if (pwd) data.pwd = await bcrypt.hash(pwd, 10)

    const user = await prisma.user.update({ where: { id: req.params.id }, data })
    res.json(sanitizeUser(user))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Usuário não encontrado' })
    console.error(err)
    res.status(500).json({ message: 'Erro ao atualizar usuário' })
  }
})

// PATCH /users/:id/status -> altera apenas o status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status },
    })
    res.json(sanitizeUser(user))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Usuário não encontrado' })
    res.status(500).json({ message: 'Erro ao atualizar status' })
  }
})

// DELETE /users/:id -> remove usuário
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'Usuário excluído' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Usuário não encontrado' })
    res.status(500).json({ message: 'Erro ao excluir usuário' })
  }
})

module.exports = router
