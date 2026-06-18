import React, { useEffect, useState } from 'react'
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import { ordersApi, usersApi, productsApi } from '../../api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '../../contexts/AuthContext'

const STATUS_CONFIG = {
  PENDING:          { label: 'Pendente',    badge: 'badge-pending', icon: Clock },
  PREPARING:        { label: 'Preparando',  badge: 'badge-ember',   icon: Clock },
  OUT_FOR_DELIVERY: { label: 'Entrega',     badge: 'badge-info',    icon: Truck },
  DELIVERED:        { label: 'Entregue',    badge: 'badge-active',  icon: CheckCircle },
  CANCELLED:        { label: 'Cancelado',   badge: 'badge-danger',  icon: XCircle },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ orders: 0, users: 0, products: 0, revenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, usersRes, productsRes] = await Promise.all([
          ordersApi.list(),
          usersApi.list(),
          productsApi.list(),
        ])
        const orders = ordersRes.data || []
        const revenue = orders
          .filter(o => o.status === 'DELIVERED')
          .reduce((sum, o) => sum + (o.total || 0), 0)

        setStats({
          orders: orders.length,
          users: usersRes.data?.length || 0,
          products: productsRes.data?.length || 0,
          revenue,
        })
        setRecentOrders(orders.slice(0, 8))
      } catch {
        // backend not connected yet — show zeros
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div>
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h2>
        <p style={{ color: 'var(--cream-faint)', fontSize: 14, marginTop: 4 }}>
          Aqui está um resumo da sua pizzaria hoje.
        </p>
      </div>

      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Total de Pedidos</div>
              <div className="stat-value">{loading ? '—' : stats.orders}</div>
            </div>
            <div style={{ padding: 10, background: 'var(--ember-subtle)', borderRadius: 10, color: 'var(--ember)' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Clientes</div>
              <div className="stat-value">{loading ? '—' : stats.users}</div>
            </div>
            <div style={{ padding: 10, background: 'rgba(62,207,142,0.1)', borderRadius: 10, color: 'var(--green)' }}>
              <Users size={18} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Produtos</div>
              <div className="stat-value">{loading ? '—' : stats.products}</div>
            </div>
            <div style={{ padding: 10, background: 'rgba(99,179,237,0.1)', borderRadius: 10, color: 'var(--blue)' }}>
              <Package size={18} />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className="stat-label">Receita Total</div>
              <div className="stat-value stat-green">
                {loading ? '—' : `R$ ${stats.revenue.toFixed(2)}`}
              </div>
            </div>
            <div style={{ padding: 10, background: 'rgba(62,207,142,0.1)', borderRadius: 10, color: 'var(--green)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16 }}>
            Pedidos Recentes
          </h3>
          <a href="/pedidos" className="btn btn-ghost btn-sm">Ver todos</a>
        </div>

        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : recentOrders.length === 0 ? (
          <div className="empty-state" style={{ padding: '32px 0' }}>
            <ShoppingBag size={32} />
            <h3>Nenhum pedido ainda</h3>
            <p style={{ fontSize: 13 }}>Os pedidos aparecerão aqui quando o backend estiver conectado.</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
                  return (
                    <tr key={order.id}>
                      <td><span className="tag">{order.id?.slice(0, 8)}</span></td>
                      <td><strong>{order.user?.name || '—'}</strong></td>
                      <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                      <td><span className="price">R$ {(order.total || 0).toFixed(2)}</span></td>
                      <td style={{ color: 'var(--cream-faint)', fontSize: 12 }}>
                        {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
