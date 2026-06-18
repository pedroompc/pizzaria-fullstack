import React from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Package, ShoppingBag,
  UserCog, Tag, LogOut, Pizza
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pedidos',   icon: ShoppingBag,     label: 'Pedidos' },
  { to: '/clientes',  icon: Users,           label: 'Clientes' },
  { to: '/produtos',  icon: Package,         label: 'Produtos' },
  { to: '/categorias',icon: Tag,             label: 'Categorias' },
  { to: '/usuarios',  icon: UserCog,         label: 'Usuários' },
]

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/pedidos':   'Pedidos',
  '/clientes':  'Clientes',
  '/produtos':  'Produtos',
  '/categorias':'Categorias',
  '/usuarios':  'Usuários',
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'PizzaSystem'

  const initials = user?.name
    ? user.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
    : 'U'

  const roleLabel = { SUPER_ADMIN: 'Super Admin', MANAGER: 'Gerente', CUSTOMER: 'Cliente' }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand">
            <Pizza size={20} color="var(--ember)" />
            PizzaSystem
          </div>
          <div className="brand-sub">Gestão de Pedidos</div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <Icon size={17} className="nav-icon" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info" style={{ flex: 1, overflow: 'hidden' }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{roleLabel[user?.role] || user?.role}</div>
            </div>
            <button onClick={logout} className="btn btn-ghost btn-icon btn-sm" title="Sair">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="page-title">{title}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="notif-dot" />
            <span style={{ fontSize: 12, color: 'var(--cream-faint)' }}>
              {new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </header>

        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
