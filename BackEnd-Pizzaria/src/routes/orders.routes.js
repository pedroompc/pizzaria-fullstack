// CRUD de pedidos, com itens, cálculo de total e regras por papel - [Pedro Marinho]
// Cliente (CUSTOMER): cria e vê apenas os PRÓPRIOS pedidos.
// Gerente/Admin: vê todos, atualiza status e exclui.
const { Router } = require('express')
const prisma = require('../lib/prisma')
const { authRequired, requireManager } = require('../middleware/auth')
const { sanitizeUser } = require('../lib/helpers')

const router = Router()
router.use(authRequired)

// Define o que vem aninhado em cada pedido (cliente + itens com produto)
const orderInclude = {
  user: true,
  items: { include: { product: true } },
}

// Remove a senha do usuário aninhado antes de devolver o pedido
function cleanOrder(order) {
  if (!order) return order
  return { ...order, user: order.user ? sanitizeUser(order.user) : null }
}

const STATUSES = ['PENDING', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']

// Helper: o usuário logado é gerente/admin?
const isManager = (req) => req.user.role === 'MANAGER' || req.user.role === 'SUPER_ADMIN'

// GET /orders/mine -> pedidos do próprio usuário logado (usado pela área do cliente)
router.get('/mine', async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders.map(cleanOrder))
})

// GET /orders -> todos os pedidos (somente gerente/admin)
router.get('/', requireManager, async (_req, res) => {
  const orders = await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' } })
  res.json(orders.map(cleanOrder))
})

// GET /orders/status/:status (somente gerente/admin)
router.get('/status/:status', requireManager, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { status: req.params.status },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders.map(cleanOrder))
})

// GET /orders/user/:userId (somente gerente/admin)
router.get('/user/:userId', requireManager, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.params.userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  })
  res.json(orders.map(cleanOrder))
})

// GET /orders/:id -> gerente vê qualquer um; cliente só o próprio
router.get('/:id', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { id: req.params.id }, include: orderInclude })
  if (!order) return res.status(404).json({ message: 'Pedido não encontrado' })
  if (!isManager(req) && order.userId !== req.user.id) {
    return res.status(403).json({ message: 'Você não tem acesso a este pedido' })
  }
  res.json(cleanOrder(order))
})

// POST /orders -> { userId?, address, note, items: [{ productId, quantity }] }
// Cliente cria sempre para si mesmo (userId ignorado); gerente pode criar para um cliente.
router.post('/', async (req, res) => {
  try {
    const { address, note, items } = req.body
    const userId = isManager(req) ? (req.body.userId || req.user.id) : req.user.id

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'O pedido precisa de ao menos um item' })
    }

    // Busca os produtos para congelar o preço atual e calcular o total
    const productIds = items.map((i) => i.productId)
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } })
    const priceMap = new Map(products.map((p) => [p.id, p.price]))

    let total = 0
    const itemData = items.map((i) => {
      const price = priceMap.get(i.productId)
      if (price === undefined) {
        throw Object.assign(new Error('Produto inexistente'), { http: 400 })
      }
      const quantity = parseInt(i.quantity) || 1
      total += price * quantity
      return { productId: i.productId, quantity, price }
    })

    const order = await prisma.order.create({
      data: {
        userId,
        address: address || null,
        note: note || null,
        status: 'PENDING',
        total,
        items: { create: itemData },
      },
      include: orderInclude,
    })
    res.status(201).json(cleanOrder(order))
  } catch (err) {
    if (err.http === 400) return res.status(400).json({ message: err.message })
    console.error(err)
    res.status(500).json({ message: 'Erro ao criar pedido' })
  }
})

// PATCH /orders/:id -> atualiza dados simples (somente gerente/admin)
router.patch('/:id', requireManager, async (req, res) => {
  try {
    const { address, note, status } = req.body
    const data = {}
    if (address !== undefined) data.address = address
    if (note !== undefined) data.note = note
    if (status !== undefined) data.status = status

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: orderInclude,
    })
    res.json(cleanOrder(order))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Pedido não encontrado' })
    res.status(500).json({ message: 'Erro ao atualizar pedido' })
  }
})

// PATCH /orders/:id/status -> avança/altera o status (somente gerente/admin)
router.patch('/:id/status', requireManager, async (req, res) => {
  try {
    const { status } = req.body
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Status inválido' })
    }
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: orderInclude,
    })
    res.json(cleanOrder(order))
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Pedido não encontrado' })
    res.status(500).json({ message: 'Erro ao atualizar status' })
  }
})

// DELETE /orders/:id (somente gerente/admin)
router.delete('/:id', requireManager, async (req, res) => {
  try {
    await prisma.order.delete({ where: { id: req.params.id } })
    res.json({ message: 'Pedido excluído' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Pedido não encontrado' })
    res.status(500).json({ message: 'Erro ao excluir pedido' })
  }
})

module.exports = router
