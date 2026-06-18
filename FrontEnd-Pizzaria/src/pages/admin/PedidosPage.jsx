import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X, ShoppingBag, Minus, ChevronRight } from 'lucide-react'
import { ordersApi, usersApi, productsApi } from '../../api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  PENDING:          { label: 'Pendente',      badge: 'badge-pending', next: 'PREPARING' },
  PREPARING:        { label: 'Preparando',    badge: 'badge-ember',   next: 'OUT_FOR_DELIVERY' },
  OUT_FOR_DELIVERY: { label: 'Em entrega',    badge: 'badge-info',    next: 'DELIVERED' },
  DELIVERED:        { label: 'Entregue',      badge: 'badge-active',  next: null },
  CANCELLED:        { label: 'Cancelado',     badge: 'badge-danger',  next: null },
}

const ALL_STATUSES = Object.keys(STATUS_CONFIG)

// ── Order detail drawer ──────────────────────────────────────
function OrderDetail({ order, onClose, onStatusChange }) {
  if (!order) return null
  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
  const total = order.total ?? order.items?.reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0) ?? 0

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <span className="modal-title">Pedido #{order.id?.slice(0, 8)}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>CLIENTE</div>
              <div style={{ fontWeight: 600 }}>{order.user?.name || '—'}</div>
              <div style={{ fontSize: 12, color: 'var(--cream-faint)' }}>{order.user?.phone || ''}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>STATUS</div>
              <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>DATA/HORA</div>
              <div style={{ fontSize: 13 }}>
                {order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>TOTAL</div>
              <div className="price" style={{ fontSize: 18 }}>R$ {parseFloat(total).toFixed(2)}</div>
            </div>
          </div>

          {order.address && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>ENDEREÇO</div>
              <div style={{ fontSize: 13 }}>{order.address}</div>
            </div>
          )}
          {order.note && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 4 }}>OBSERVAÇÃO</div>
              <div style={{ fontSize: 13, color: 'var(--cream-muted)' }}>{order.note}</div>
            </div>
          )}

          <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 8 }}>ITENS</div>
          <div className="order-items">
            {(order.items || []).map((item, i) => (
              <div className="order-item-row" key={i}>
                <span>{item.product?.name || item.name || `Item ${i+1}`}</span>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <span style={{ color: 'var(--cream-faint)', fontSize: 12 }}>×{item.quantity}</span>
                  <span className="price" style={{ fontSize: 13 }}>R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {cfg.next && (
            <div style={{ marginTop: 20 }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => onStatusChange(order.id, cfg.next)}
              >
                Avançar para: {STATUS_CONFIG[cfg.next]?.label}
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── New order modal ──────────────────────────────────────────
function NewOrderModal({ open, onClose, onSaved, users, products }) {
  const [form, setForm] = useState({ userId: '', address: '', note: '' })
  const [items, setItems] = useState([{ productId: '', quantity: 1 }])
  const [loading, setLoading] = useState(false)

  if (!open) return null
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const addItem = () => setItems(i => [...i, { productId: '', quantity: 1 }])
  const removeItem = (idx) => setItems(i => i.filter((_, j) => j !== idx))
  const updateItem = (idx, field, val) => setItems(i => i.map((item, j) => j === idx ? { ...item, [field]: val } : item))

  const total = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId)
    return sum + (p ? parseFloat(p.price) * item.quantity : 0)
  }, 0)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.userId || !form.address) { toast.error('Selecione o cliente e informe o endereço'); return }
    if (items.some(i => !i.productId)) { toast.error('Selecione o produto em todos os itens'); return }
    setLoading(true)
    try {
      await ordersApi.create({ ...form, items: items.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) })) })
      toast.success('Pedido criado!')
      onSaved(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao criar pedido') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <span className="modal-title">Novo Pedido</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Cliente *</label>
              <select className="form-select" name="userId" value={form.userId} onChange={handle}>
                <option value="">Selecione o cliente…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.phone || u.email}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Endereço de entrega *</label>
              <input className="form-input" name="address" value={form.address} onChange={handle} placeholder="Rua Principal, 123, Bairro" />
            </div>
            <div className="form-group">
              <label className="form-label">Observação</label>
              <input className="form-input" name="note" value={form.note} onChange={handle} placeholder="Sem cebola, extra queijo…" />
            </div>

            <div style={{ fontSize: 11, color: 'var(--cream-faint)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '1px' }}>Itens do Pedido</div>

            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
                <select className="form-select" style={{ flex: 1 }} value={item.productId} onChange={e => updateItem(idx, 'productId', e.target.value)}>
                  <option value="">Produto…</option>
                  {products.filter(p => p.available !== false).map(p => (
                    <option key={p.id} value={p.id}>{p.name} — R$ {parseFloat(p.price).toFixed(2)}</option>
                  ))}
                </select>
                <input className="form-input" type="number" min="1" max="99" value={item.quantity}
                  onChange={e => updateItem(idx, 'quantity', e.target.value)}
                  style={{ width: 64 }} />
                {items.length > 1 && (
                  <button type="button" className="btn btn-danger btn-icon" onClick={() => removeItem(idx)}>
                    <Minus size={14} />
                  </button>
                )}
              </div>
            ))}

            <button type="button" className="btn btn-ghost btn-sm" onClick={addItem} style={{ marginBottom: 12 }}>
              <Plus size={13} /> Adicionar item
            </button>

            <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--cream-faint)', fontSize: 14 }}>Total estimado</span>
              <span className="price">R$ {total.toFixed(2)}</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : 'Criar pedido'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ────────────────────────────────────────────────
export default function PedidosPage() {
  const [pedidos, setPedidos] = useState([])
  const [users, setUsers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modal, setModal] = useState(false)
  const [detail, setDetail] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [oRes, uRes, pRes] = await Promise.all([ordersApi.list(), usersApi.listActive(), productsApi.listAvailable()])
      setPedidos(oRes.data || [])
      setUsers(uRes.data || [])
      setProducts(pRes.data || [])
    } catch { toast.error('Erro ao carregar pedidos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const changeStatus = async (id, status) => {
    try {
      await ordersApi.updateStatus(id, status)
      toast.success(`Status atualizado: ${STATUS_CONFIG[status]?.label}`)
      load()
      setDetail(d => d?.id === id ? { ...d, status } : d)
    } catch { toast.error('Erro ao atualizar status') }
  }

  const del = async (id) => {
    if (!confirm('Excluir este pedido?')) return
    try { await ordersApi.delete(id); toast.success('Pedido excluído'); load() }
    catch { toast.error('Erro ao excluir') }
  }

  const filtered = pedidos.filter(p => {
    const matchSearch = p.id?.includes(search) || p.user?.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Pedidos</h2>
          <p>{pedidos.length} pedidos no total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Novo pedido
        </button>
      </div>

      <div className="action-row">
        <div className="search-bar">
          <Search size={15} color="var(--cream-faint)" />
          <input placeholder="Buscar por ID ou cliente…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos os status</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={32} />
            <h3>Nenhum pedido encontrado</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Endereço</th>
                <th>Status</th>
                <th>Total</th>
                <th>Data</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.PENDING
                const total = p.total ?? 0
                return (
                  <tr key={p.id} style={{ cursor: 'pointer' }} onClick={() => setDetail(p)}>
                    <td><span className="tag">{p.id?.slice(0,8)}</span></td>
                    <td><strong>{p.user?.name || '—'}</strong></td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12, color: 'var(--cream-faint)' }}>{p.address || '—'}</td>
                    <td><span className={`badge ${cfg.badge}`}>{cfg.label}</span></td>
                    <td><span className="price">R$ {parseFloat(total).toFixed(2)}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--cream-faint)' }}>
                      {p.createdAt ? format(new Date(p.createdAt), "dd/MM/yy HH:mm", { locale: ptBR }) : '—'}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        {cfg.next && (
                          <button className="btn btn-ghost btn-sm" onClick={() => changeStatus(p.id, cfg.next)}>
                            Avançar
                          </button>
                        )}
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(p.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <NewOrderModal open={modal} onClose={() => setModal(false)} onSaved={load} users={users} products={products} />
      <OrderDetail order={detail} onClose={() => setDetail(null)} onStatusChange={(id, status) => { changeStatus(id, status); setDetail(null) }} />
    </div>
  )
}
