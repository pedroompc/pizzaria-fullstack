// Middleware de autenticação JWT - [Pedro Marinho]
// Protege as rotas privadas: exige um token válido no header Authorization.
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-padrao-de-desenvolvimento'

// Verifica o token "Authorization: Bearer <token>" e injeta req.user
function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null

  if (!token) {
    return res.status(401).json({ message: 'Token não fornecido' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload // { id, role }
    next()
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' })
  }
}

// Gera um token JWT para um usuário
function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { authRequired, signToken, JWT_SECRET }
