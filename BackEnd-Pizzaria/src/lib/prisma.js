// Instância única do Prisma Client compartilhada por toda a API - [Pedro Marinho]
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

module.exports = prisma
