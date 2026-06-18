// Cardápio do cliente: monta o carrinho e finaliza o pedido - [Pedro Marinho]
import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, Pizza } from 'lucide-react'
import { productsApi } from '../../api'
import { ordersApi } from '../../api'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LojaPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState({}) // { [productId]: quantity }
  const [address, setAddress] = useState(user?.address || '')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productsApi.listAvailable()
      setProducts(res.data || [])
    } catch { toast.error('Erro ao carregar o cardápio') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const add = (id) => setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }))
  const remove = (id) => setCart(c => {
    const q = (c[id] || 0) - 1
    const next = { ...c }
    if (q <= 0) delete next[id]; else next[id] = q
    return next
  })

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const p = products.find(p => p.id === id)
    return p ? { ...p, qty } : null
  }).filter(Boolean)

  const total = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.qty, 0)
  const count = cartItems.reduce((s, i) => s + i.qty, 0)

  // Agrupa os produtos por categoria para exibir o cardápio organizado
  const grouped = products.reduce((acc, p) => {
    const cat = p.category?.name || 'Outros'
    ;(acc[cat] = acc[cat] || []).push(p)
    return acc
  }, {})

  const finalizar = async () => {
    if (cartItems.length === 0) { toast.error('Adicione ao menos um item'); return }
    if (!address.trim()) { toast.error('Informe o endereço de entrega'); return }
    setSaving(true)
    try {
      await ordersApi.create({
        address,
        note,
        items: cartItems.map(i => ({ productId: i.id, quantity: i.qty })),
      })
      toast.success('Pedido realizado com sucesso! 🍕')
      setCart({}); setNote('')
      navigate('/meus-pedidos')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao finalizar o pedido')
    } finally { setSaving(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Cardápio</h2>
          <p>Monte seu pedido e finalize a entrega</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24, alignItems: 'start' }}>
        {/* Cardápio */}
        <div>
          {loading ? (
            <div className="loading-full"><div className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="empty-state card"><Pizza size={32} /><h3>Cardápio vazio no momento</h3></div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 24 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12 }}>{cat}</h3>
                <div style={{ display: 'grid', gap: 12 }}>
                  {items.map(p => (
                    <div key={p.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{p.name}</div>
                        {p.description && <div style={{ fontSize: 13, color: 'var(--cream-faint)' }}>{p.description}</div>}
                        <div className="price" style={{ marginTop: 4 }}>R$ {parseFloat(p.price).toFixed(2)}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {cart[p.id] ? (
                          <>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => remove(p.id)}><Minus size={14} /></button>
                            <strong style={{ minWidth: 18, textAlign: 'center' }}>{cart[p.id]}</strong>
                            <button className="btn btn-ghost btn-icon btn-sm" onClick={() => add(p.id)}><Plus size={14} /></button>
                          </>
                        ) : (
                          <button className="btn btn-primary btn-sm" onClick={() => add(p.id)}>
                            <Plus size={14} /> Adicionar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Carrinho */}
        <div className="card" style={{ position: 'sticky', top: 90 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <ShoppingCart size={18} color="var(--ember)" />
            <strong>Seu pedido</strong>
            {count > 0 && <span className="badge badge-ember">{count}</span>}
          </div>

          {cartItems.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--cream-faint)' }}>Seu carrinho está vazio. Adicione itens do cardápio.</p>
          ) : (
            <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
              {cartItems.map(i => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{i.qty}× {i.name}</span>
                  <span className="price">R$ {(parseFloat(i.price) * i.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Endereço de entrega *</label>
            <input className="form-input" value={address} onChange={e => setAddress(e.target.value)} placeholder="Rua, número, bairro…" />
          </div>
          <div className="form-group">
            <label className="form-label">Observação</label>
            <input className="form-input" value={note} onChange={e => setNote(e.target.value)} placeholder="Sem cebola, troco para R$50…" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 15 }}>
            <span style={{ color: 'var(--cream-faint)' }}>Total</span>
            <span className="price" style={{ fontSize: 18 }}>R$ {total.toFixed(2)}</span>
          </div>

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving || cartItems.length === 0} onClick={finalizar}>
            {saving ? <div className="spinner" /> : 'Finalizar pedido'}
          </button>
        </div>
      </div>
    </div>
  )
}
