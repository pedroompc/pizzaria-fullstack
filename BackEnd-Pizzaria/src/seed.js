// Popula o banco com um admin e dados de exemplo - [Pedro Marinho]
// Rode com: npm run seed
require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('./lib/prisma')

async function seed() {
  console.log('🌱 Limpando dados antigos...')
  // A ordem importa por causa das relações (itens -> pedidos -> ...)
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('👤 Criando usuários...')
  const hash = (s) => bcrypt.hashSync(s, 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@pizza.com',
      pwd: hash('admin123'),
      phone: '81999990000',
      address: 'Av. Boa Viagem, 1000, Recife, PE',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })

  await prisma.user.create({
    data: {
      name: 'Gerente Pizzaria',
      email: 'gerente@pizza.com',
      pwd: hash('gerente123'),
      phone: '81988887777',
      role: 'MANAGER',
      status: 'ACTIVE',
    },
  })

  const cliente1 = await prisma.user.create({
    data: {
      name: 'Maria Santos',
      email: 'maria@email.com',
      pwd: hash('cliente123'),
      phone: '81991112222',
      address: 'Rua das Flores, 45, Boa Vista, Recife, PE',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  })

  const cliente2 = await prisma.user.create({
    data: {
      name: 'João Oliveira',
      email: 'joao@email.com',
      pwd: hash('cliente123'),
      phone: '81993334444',
      address: 'Av. Caxangá, 200, Madalena, Recife, PE',
      role: 'CUSTOMER',
      status: 'ACTIVE',
    },
  })

  console.log('🏷️  Criando categorias...')
  const pizzas = await prisma.category.create({ data: { name: 'Pizzas' } })
  const bebidas = await prisma.category.create({ data: { name: 'Bebidas' } })
  const sobremesas = await prisma.category.create({ data: { name: 'Sobremesas' } })

  console.log('🍕 Criando produtos...')
  const margherita = await prisma.product.create({
    data: { name: 'Pizza Margherita', description: 'Molho de tomate, mussarela e manjericão', price: 39.9, categoryId: pizzas.id, available: true },
  })
  const calabresa = await prisma.product.create({
    data: { name: 'Pizza Calabresa', description: 'Calabresa fatiada, cebola e mussarela', price: 42.0, categoryId: pizzas.id, available: true },
  })
  const portuguesa = await prisma.product.create({
    data: { name: 'Pizza Portuguesa', description: 'Presunto, ovo, cebola, ervilha e mussarela', price: 45.5, categoryId: pizzas.id, available: true },
  })
  const refri = await prisma.product.create({
    data: { name: 'Refrigerante 2L', description: 'Coca-Cola, Guaraná ou Fanta', price: 12.0, categoryId: bebidas.id, available: true },
  })
  const suco = await prisma.product.create({
    data: { name: 'Suco Natural 500ml', description: 'Laranja, uva ou maracujá', price: 9.0, categoryId: bebidas.id, available: true },
  })
  const pudim = await prisma.product.create({
    data: { name: 'Pudim de Leite', description: 'Fatia individual de pudim caseiro', price: 14.0, categoryId: sobremesas.id, available: true },
  })

  console.log('🧾 Criando pedidos de exemplo...')
  // Pedido 1: entregue (gera receita no dashboard)
  await prisma.order.create({
    data: {
      userId: cliente1.id,
      address: cliente1.address,
      note: 'Sem cebola, por favor',
      status: 'DELIVERED',
      total: margherita.price * 1 + refri.price * 1,
      items: {
        create: [
          { productId: margherita.id, quantity: 1, price: margherita.price },
          { productId: refri.id, quantity: 1, price: refri.price },
        ],
      },
    },
  })

  // Pedido 2: em preparo
  await prisma.order.create({
    data: {
      userId: cliente2.id,
      address: cliente2.address,
      status: 'PREPARING',
      total: calabresa.price * 2 + suco.price * 2,
      items: {
        create: [
          { productId: calabresa.id, quantity: 2, price: calabresa.price },
          { productId: suco.id, quantity: 2, price: suco.price },
        ],
      },
    },
  })

  // Pedido 3: pendente
  await prisma.order.create({
    data: {
      userId: cliente1.id,
      address: cliente1.address,
      status: 'PENDING',
      total: portuguesa.price * 1 + pudim.price * 2,
      items: {
        create: [
          { productId: portuguesa.id, quantity: 1, price: portuguesa.price },
          { productId: pudim.id, quantity: 2, price: pudim.price },
        ],
      },
    },
  })

  console.log('\n✅ Seed concluído!')
  console.log('\n🔑 Credenciais para login:')
  console.log('   ADMIN   -> admin@pizza.com   / admin123')
  console.log('   GERENTE -> gerente@pizza.com / gerente123')
  console.log('   CLIENTE -> maria@email.com   / cliente123')
}

// Reutilizável pelo servidor (seed automático quando o banco está vazio)
module.exports = seed

// Quando rodado direto (npm run seed), executa e encerra a conexão
if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('❌ Erro no seed:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
