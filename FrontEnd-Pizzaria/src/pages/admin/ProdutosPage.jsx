import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X, Package } from 'lucide-react'
import { productsApi, categoriesApi } from '../../api'
import toast from 'react-hot-toast'

function ProdutoModal({ open, onClose, onSaved, editData, categories }) {
  const isEdit = !!editData
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', available: true })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) setForm({
      name: editData.name || '',
      description: editData.description || '',
      price: editData.price || '',
      categoryId: editData.categoryId || editData.category?.id || '',
      available: editData.available !== false,
    })
    else setForm({ name: '', description: '', price: '', categoryId: '', available: true })
  }, [editData, open])

  if (!open) return null
  const handle = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm(f => ({ ...f, [e.target.name]: val }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.price || !form.categoryId) {
      toast.error('Nome, preço e categoria são obrigatórios'); return
    }
    setLoading(true)
    try {
      const payload = { ...form, price: parseFloat(form.price) }
      if (isEdit) await productsApi.update(editData.id, payload)
      else await productsApi.create(payload)
      toast.success(isEdit ? 'Produto atualizado!' : 'Produto criado!')
      onSaved(); onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar produto')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Editar Produto' : 'Novo Produto'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome do produto *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Pizza Margherita" />
            </div>
            <div className="form-group">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handle} placeholder="Descrição do produto…" rows={3} style={{ resize: 'vertical' }} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Preço (R$) *</label>
                <input className="form-input" type="number" step="0.01" min="0" name="price" value={form.price} onChange={handle} placeholder="29.90" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select className="form-select" name="categoryId" value={form.categoryId} onChange={handle}>
                  <option value="">Selecione…</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label className="toggle">
                <input type="checkbox" name="available" checked={form.available} onChange={handle} />
                <span className="toggle-slider" />
              </label>
              <span className="form-label" style={{ marginBottom: 0 }}>Produto disponível</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : (isEdit ? 'Salvar' : 'Criar produto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, cRes] = await Promise.all([productsApi.list(), categoriesApi.list()])
      setProdutos(pRes.data || [])
      setCategories(cRes.data || [])
    } catch { toast.error('Erro ao carregar produtos') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (p) => {
    if (!confirm(`Excluir produto "${p.name}"?`)) return
    try { await productsApi.delete(p.id); toast.success('Produto excluído'); load() }
    catch { toast.error('Erro ao excluir') }
  }

  const toggleAvail = async (p) => {
    try {
      await productsApi.update(p.id, { available: !p.available })
      toast.success(`Produto ${!p.available ? 'disponibilizado' : 'indisponibilizado'}`)
      load()
    } catch { toast.error('Erro ao atualizar') }
  }

  const filtered = produtos.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || p.categoryId === filterCat || p.category?.id === filterCat
    return matchSearch && matchCat
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Produtos</h2>
          <p>{produtos.length} produtos no catálogo</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true) }}>
          <Plus size={16} /> Novo produto
        </button>
      </div>

      <div className="action-row">
        <div className="search-bar">
          <Search size={15} color="var(--cream-faint)" />
          <input placeholder="Buscar produto…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 180 }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">Todas as categorias</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Package size={32} />
            <h3>Nenhum produto encontrado</h3>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Descrição</th>
                <th>Preço</th>
                <th>Disponível</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td><span className="badge badge-muted">{p.category?.name || '—'}</span></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--cream-faint)', fontSize: 13 }}>
                    {p.description || '—'}
                  </td>
                  <td><span className="price">R$ {parseFloat(p.price || 0).toFixed(2)}</span></td>
                  <td>
                    <label className="toggle" onClick={() => toggleAvail(p)}>
                      <input type="checkbox" readOnly checked={p.available !== false} />
                      <span className="toggle-slider" />
                    </label>
                  </td>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(p); setModal(true) }}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(p)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProdutoModal
        open={modal} onClose={() => { setModal(false); setEditing(null) }}
        onSaved={load} editData={editing} categories={categories}
      />
    </div>
  )
}
