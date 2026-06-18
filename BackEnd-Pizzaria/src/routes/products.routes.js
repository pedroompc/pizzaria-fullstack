// CRUD de produtos do cardápio - [Pedro Marinho]
const { Router } = require('express')
const prisma = require('../lib/prisma')
const { authRequired } = require('../middleware/auth')

const router = Router()
router.use(authRequired)

// Inclui sempre a categoria aninhada (o frontend lê product.category.name)
const withCategory = { include: { category: true } }

// GET /products -> todos os produtos
router.get('/', async (_req, res) => {
  const products = await prisma.product.findMany({ ...withCategory, orderBy: { name: 'asc' } })
  res.json(products)
})

// GET /products/available -> apenas disponíveis (usado na criação de pedidos)
router.get('/available', async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { available: true },
    ...withCategory,
    orderBy: { name: 'asc' },
  })
  res.json(products)
})

// GET /products/category/:categoryId -> produtos de uma categoria
router.get('/category/:categoryId', async (req, res) => {
  const products = await prisma.product.findMany({
    where: { categoryId: req.params.categoryId },
    ...withCategory,
    orderBy: { name: 'asc' },
  })
  res.json(products)
})

// GET /products/:id
router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id }, ...withCategory })
  if (!product) return res.status(404).json({ message: 'Produto não encontrado' })
  res.json(product)
})

// POST /products -> { name, description, price, categoryId, available }
router.post('/', async (req, res) => {
  try {
    const { name, price, description, categoryId, available } = req.body
    if (!name || price === undefined || price === null) {
      return res.status(400).json({ message: 'Nome e preço são obrigatórios' })
    }
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        categoryId: categoryId || null,
        available: available !== false,
      },
      ...withCategory,
    })
    res.status(201).json(product)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Erro ao criar produto' })
  }
})

// PATCH /products/:id
router.patch('/:id', async (req, res) => {
  try {
    const { name, description, price, categoryId, available } = req.body
    const data = {}
    if (name !== undefined) data.name = name
    if (description !== undefined) data.description = description
    if (price !== undefined) data.price = parseFloat(price)
    if (categoryId !== undefined) data.categoryId = categoryId || null
    if (available !== undefined) data.available = available

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
      ...withCategory,
    })
    res.json(product)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Produto não encontrado' })
    console.error(err)
    res.status(500).json({ message: 'Erro ao atualizar produto' })
  }
})

// DELETE /products/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: req.params.id } })
    res.json({ message: 'Produto excluído' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Produto não encontrado' })
    res.status(500).json({ message: 'Erro ao excluir produto' })
  }
})

module.exports = router
