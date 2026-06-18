// Acompanhamento dos pedidos do próprio cliente - [Pedro Marinho]
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { ordersApi } from '../../api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING:          { label: 'Pendente',   badge: 'badge-pending' },
  PREPARING:        { label: 'Preparando', badge: 'badge-ember' },
  OUT_FOR_DELIVERY: { label: 'Em entrega', badge: 'badge-info' },
  DELIVERED:        { label: 'Entregue',   badge: 'badge-active' },
  CANCELLED:        { label: 'Cancelado',  badge: 'badge-danger' },
}

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.listMine()
      .then(res => setOrders(res.data || []))
      .catch(() => toast.error('Erro ao carregar seus pedidos'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Meus Pedidos</h2>
          <p>Acompanhe o status dos seus pedidos</p>
        </div>
        <Link to="/loja" className="btn btn-primary"><ShoppingBag size={16} /> Fazer novo pedido</Link>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" /></div>
      ) : orders.length === 0 ? (
        <div className="empty-state card">
          <ShoppingBag size={32} />
          <h3>Você ainda não fez pedidos</h3>
          <p>Que tal pedir uma pizza agora?</p>
          <Link to="/loja" className="btn btn-primary" style={{ marginTop: 16 }}>Ver cardápio</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {orders.map(o => {
            const cfg = STATUS_CONFIG[o.status] || STATUS_CONFIG.PENDING
            return (
              <div key={o.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <span className="tag">#{o.id?.slice(0, 8)}</span>
                    <span style={{ fontSize: 12, color: 'var(--cream-faint)', marginLeft: 8 }}>
                      {o.createdAt ? format(new Date(o.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : ''}
                    </span>
                  </div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>

                <div style={{ display: 'grid', gap: 4, marginBottom: 10 }}>
                  {(o.items || []).map((it, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span>{it.quantity}× {it.product?.name || 'Item'}</span>
                      <span className="price">R$ {((it.price || 0) * (it.quantity || 1)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {o.address && <div style={{ fontSize: 12, color: 'var(--cream-faint)' }}>📍 {o.address}</div>}

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border, #2a2521)', marginTop: 10, paddingTop: 10 }}>
                  <span className="price" style={{ fontSize: 16 }}>Total: R$ {parseFloat(o.total || 0).toFixed(2)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
