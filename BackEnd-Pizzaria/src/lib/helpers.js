// Funções auxiliares reutilizadas pelas rotas - [Pedro Marinho]

// Remove o campo de senha (pwd) antes de devolver o usuário ao frontend
function sanitizeUser(user) {
  if (!user) return user
  const { pwd, ...safe } = user
  return safe
}

module.exports = { sanitizeUser }
