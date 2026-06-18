// Rotas de autenticação: login e cadastro (JWT) - [Pedro Marinho]
const { Router } = require('express')
const bcrypt = require('bcryptjs')
const prisma = require('../lib/prisma')
const { signToken } = require('../middleware/auth')
const { sanitizeUser } = require('../lib/helpers')

const router = Router()

// POST /auth/login  -> { token, user }
// O frontend envia { email, pwd }
router.post('/login', async (req, res) => {
  try {
    const { email, pwd } = req.body
    if (!email || !pwd) {
      return res.status(400).json({ message: 'E-mail e senha são obrigatórios' })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    const ok = await bcrypt.compare(pwd, user.pwd)
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas' })
    }

    if (user.status === 'INATIVE') {
      return res.status(403).json({ message: 'Usuário inativo. Contate o administrador.' })
    }

    const token = signToken(user)
    return res.json({ token, user: sanitizeUser(user) })
  } catch (err) {
    console.error('Erro no login:', err)
    return res.status(500).json({ message: 'Erro interno no login' })
  }
})

// POST /auth/register  -> { token, user }
// O frontend envia { name, email, pwd, phone, address }
router.post('/register', async (req, res) => {
  try {
    const { name, email, pwd, phone, address } = req.body
    if (!name || !email || !pwd) {
      return res.status(400).json({ message: 'Nome, e-mail e senha são obrigatórios' })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return res.status(409).json({ message: 'Já existe uma conta com este e-mail' })
    }

    const hash = await bcrypt.hash(pwd, 10)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        pwd: hash,
        phone: phone || null,
        address: address || null,
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    })

    const token = signToken(user)
    return res.status(201).json({ token, user: sanitizeUser(user) })
  } catch (err) {
    console.error('Erro no cadastro:', err)
    return res.status(500).json({ message: 'Erro interno no cadastro' })
  }
})

module.exports = router
