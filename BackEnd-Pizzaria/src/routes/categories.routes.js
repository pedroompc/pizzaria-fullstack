// CRUD de categorias de produtos - [Pedro Marinho]
const { Router } = require('express')
const prisma = require('../lib/prisma')
const { authRequired, requireManager } = require('../middleware/auth')

const router = Router()
// Gestão de categorias: somente gerente/admin
router.use(authRequired)
router.use(requireManager)

// GET /categories -> lista categorias com a contagem de produtos (_count.products)
router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  res.json(categories)
})

// GET /categories/:id
router.get('/:id', async (req, res) => {
  const category = await prisma.category.findUnique({
    where: { id: req.params.id },
    include: { _count: { select: { products: true } } },
  })
  if (!category) return res.status(404).json({ message: 'Categoria não encontrada' })
  res.json(category)
})

// POST /categories -> { name }
router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ message: 'O nome é obrigatório' })
    const category = await prisma.category.create({ data: { name } })
    res.status(201).json(category)
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar categoria' })
  }
})

// PATCH /categories/:id -> { name }
router.patch('/:id', async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name: req.body.name },
    })
    res.json(category)
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada' })
    res.status(500).json({ message: 'Erro ao atualizar categoria' })
  }
})

// DELETE /categories/:id -> os produtos vinculados ficam sem categoria (SetNull)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ message: 'Categoria excluída' })
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Categoria não encontrada' })
    res.status(500).json({ message: 'Erro ao excluir categoria' })
  }
})

module.exports = router
