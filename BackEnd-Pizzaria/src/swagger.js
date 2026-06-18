// Especificação OpenAPI/Swagger da API - [Pedro Marinho]
// Exposta em http://localhost:4000/docs
const PORT = process.env.PORT || 4000

const bearer = [{ bearerAuth: [] }]

const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'PizzaSystem API',
    version: '1.0.0',
    description: 'API REST de gestão de pizzaria (Clientes, Produtos, Pedidos, Categorias e Usuários) com autenticação JWT.',
  },
  servers: [{ url: `http://localhost:${PORT}`, description: 'Servidor local' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Credentials: {
        type: 'object',
        required: ['email', 'pwd'],
        properties: {
          email: { type: 'string', example: 'admin@pizza.com' },
          pwd: { type: 'string', example: 'admin123' },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'pwd'],
        properties: {
          name: { type: 'string', example: 'Maria Santos' },
          email: { type: 'string', example: 'maria@email.com' },
          pwd: { type: 'string', example: 'senha123' },
          phone: { type: 'string', example: '81999999999' },
          address: { type: 'string', example: 'Rua Principal, 123, Boa Vista, Recife, PE' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true },
          role: { type: 'string', enum: ['CUSTOMER', 'MANAGER', 'SUPER_ADMIN'] },
          status: { type: 'string', enum: ['ACTIVE', 'SUSPEND', 'INATIVE'] },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Pizzas' },
        },
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string', example: 'Pizza Margherita' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', example: 39.9 },
          available: { type: 'boolean' },
          categoryId: { type: 'string', nullable: true },
        },
      },
      OrderInput: {
        type: 'object',
        required: ['userId', 'items'],
        properties: {
          userId: { type: 'string' },
          address: { type: 'string' },
          note: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer', example: 2 },
              },
            },
          },
        },
      },
      StatusInput: {
        type: 'object',
        properties: { status: { type: 'string' } },
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Autentica e devolve um token JWT',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Credentials' } } } },
        responses: { 200: { description: 'Login bem-sucedido (token + user)' }, 401: { description: 'Credenciais inválidas' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Cadastra um novo usuário (CUSTOMER) e devolve token',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } } },
        responses: { 201: { description: 'Conta criada' }, 409: { description: 'E-mail já existe' } },
      },
    },
    '/users': {
      get: { tags: ['Usuários'], summary: 'Lista usuários', security: bearer, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Usuários'], summary: 'Cria usuário', security: bearer, requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, responses: { 201: { description: 'Criado' } } },
    },
    '/users/active': {
      get: { tags: ['Usuários'], summary: 'Lista usuários ativos', security: bearer, responses: { 200: { description: 'OK' } } },
    },
    '/users/{id}': {
      get: { tags: ['Usuários'], summary: 'Busca usuário por id', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' }, 404: { description: 'Não encontrado' } } },
      patch: { tags: ['Usuários'], summary: 'Atualiza usuário', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Usuários'], summary: 'Remove usuário', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Excluído' } } },
    },
    '/users/{id}/status': {
      patch: { tags: ['Usuários'], summary: 'Altera o status do usuário', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusInput' } } } }, responses: { 200: { description: 'OK' } } },
    },
    '/categories': {
      get: { tags: ['Categorias'], summary: 'Lista categorias', security: bearer, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Categorias'], summary: 'Cria categoria', security: bearer, requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Category' } } } }, responses: { 201: { description: 'Criada' } } },
    },
    '/categories/{id}': {
      get: { tags: ['Categorias'], summary: 'Busca categoria', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Categorias'], summary: 'Atualiza categoria', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Categorias'], summary: 'Remove categoria', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Excluída' } } },
    },
    '/products': {
      get: { tags: ['Produtos'], summary: 'Lista produtos', security: bearer, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Produtos'], summary: 'Cria produto', security: bearer, requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } } }, responses: { 201: { description: 'Criado' } } },
    },
    '/products/available': {
      get: { tags: ['Produtos'], summary: 'Lista produtos disponíveis', security: bearer, responses: { 200: { description: 'OK' } } },
    },
    '/products/category/{categoryId}': {
      get: { tags: ['Produtos'], summary: 'Lista produtos de uma categoria', security: bearer, parameters: [{ name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/products/{id}': {
      get: { tags: ['Produtos'], summary: 'Busca produto', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Produtos'], summary: 'Atualiza produto', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Produtos'], summary: 'Remove produto', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Excluído' } } },
    },
    '/orders': {
      get: { tags: ['Pedidos'], summary: 'Lista pedidos', security: bearer, responses: { 200: { description: 'OK' } } },
      post: { tags: ['Pedidos'], summary: 'Cria pedido (calcula o total no servidor)', security: bearer, requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/OrderInput' } } } }, responses: { 201: { description: 'Criado' } } },
    },
    '/orders/status/{status}': {
      get: { tags: ['Pedidos'], summary: 'Lista pedidos por status', security: bearer, parameters: [{ name: 'status', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/orders/user/{userId}': {
      get: { tags: ['Pedidos'], summary: 'Lista pedidos de um cliente', security: bearer, parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
    },
    '/orders/{id}': {
      get: { tags: ['Pedidos'], summary: 'Busca pedido', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      patch: { tags: ['Pedidos'], summary: 'Atualiza pedido', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'OK' } } },
      delete: { tags: ['Pedidos'], summary: 'Remove pedido', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Excluído' } } },
    },
    '/orders/{id}/status': {
      patch: { tags: ['Pedidos'], summary: 'Avança/altera o status do pedido', security: bearer, parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/StatusInput' } } } }, responses: { 200: { description: 'OK' } } },
    },
  },
}

module.exports = swaggerSpec
