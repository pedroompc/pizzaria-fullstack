// Layout da área do cliente: topo simples com cardápio e meus pedidos - [Pedro Marinho]
import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Pizza, ShoppingBag, ClipboardList, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function CustomerLayout() {
  const { user, logout } = useAuth()

  const linkStyle = ({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
    borderRadius: 'var(--radius-md, 10px)', fontSize: 14, fontWeight: 500,
    color: isActive ? 'var(--ember)' : 'var(--cream-faint)',
    background: isActive ? 'var(--ember-subtle)' : 'transparent',
    textDecoration: 'none',
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #14110f)' }}>
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px', borderBottom: '1px solid var(--border, #2a2521)',
        position: 'sticky', top: 0, background: 'var(--bg-elevated, #1b1714)', zIndex: 10,
      }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
          <Pizza size={20} color="var(--ember)" />
          PizzaSystem
        </div>

        <nav style={{ display: 'flex', gap: 6 }}>
          <NavLink to="/loja" style={linkStyle}>
            <ShoppingBag size={16} /> Cardápio
          </NavLink>
          <NavLink to="/meus-pedidos" style={linkStyle}>
            <ClipboardList size={16} /> Meus Pedidos
          </NavLink>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: 'var(--cream-faint)' }}>
            Olá, <strong style={{ color: 'var(--cream, #f5efe6)' }}>{user?.name?.split(' ')[0]}</strong>
          </span>
          <button onClick={logout} className="btn btn-ghost btn-sm" title="Sair">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 24px' }}>
        <Outlet />
      </main>
    </div>
  )
}
