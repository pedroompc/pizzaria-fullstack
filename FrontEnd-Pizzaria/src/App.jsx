import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import CustomerLayout from './components/layout/CustomerLayout'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import DashboardPage from './pages/admin/DashboardPage'
import ClientesPage from './pages/admin/ClientesPage'
import ProdutosPage from './pages/admin/ProdutosPage'
import PedidosPage from './pages/admin/PedidosPage'
import UsuariosPage from './pages/admin/UsuariosPage'
import CategoriasPage from './pages/admin/CategoriasPage'
import LojaPage from './pages/customer/LojaPage'
import MeusPedidosPage from './pages/customer/MeusPedidosPage'

const Loading = () => (
  <div className="loading-full" style={{ minHeight: '100vh' }}>
    <div className="spinner" style={{ width: 32, height: 32 }} />
  </div>
)

// Qualquer usuário autenticado
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Loading />
  return user ? children : <Navigate to="/login" replace />
}

// Apenas gerente/admin — cliente é redirecionado para a loja - [Pedro Marinho]
function ManagerRoute({ children }) {
  const { user, loading, isManager } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  if (!isManager) return <Navigate to="/loja" replace />
  return children
}

// Já logado: manda para a área certa conforme o papel
function PublicRoute({ children }) {
  const { user, loading, isManager } = useAuth()
  if (loading) return null
  if (user) return <Navigate to={isManager ? '/dashboard' : '/loja'} replace />
  return children
}

// Rota "coringa": leva cada um para a sua home
function HomeRedirect() {
  const { user, loading, isManager } = useAuth()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={isManager ? '/dashboard' : '/loja'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/cadastro" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Área de gestão — somente gerente/admin */}
      <Route path="/" element={<ManagerRoute><AppLayout /></ManagerRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="produtos" element={<ProdutosPage />} />
        <Route path="pedidos" element={<PedidosPage />} />
        <Route path="usuarios" element={<UsuariosPage />} />
        <Route path="categorias" element={<CategoriasPage />} />
      </Route>

      {/* Área do cliente — qualquer usuário autenticado */}
      <Route element={<ProtectedRoute><CustomerLayout /></ProtectedRoute>}>
        <Route path="loja" element={<LojaPage />} />
        <Route path="meus-pedidos" element={<MeusPedidosPage />} />
      </Route>

      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
