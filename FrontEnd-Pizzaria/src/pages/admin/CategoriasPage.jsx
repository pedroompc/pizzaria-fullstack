import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Edit2, Trash2, X, Tag } from 'lucide-react'
import { categoriesApi } from '../../api'
import toast from 'react-hot-toast'

function CategoriaModal({ open, onClose, onSaved, editData }) {
  const isEdit = !!editData
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => { setName(editData?.name || '') }, [editData, open])
  if (!open) return null

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Informe o nome da categoria'); return }
    setLoading(true)
    try {
      if (isEdit) await categoriesApi.update(editData.id, { name })
      else await categoriesApi.create({ name })
      toast.success(isEdit ? 'Categoria atualizada!' : 'Categoria criada!')
      onSaved(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao salvar') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Editar Categoria' : 'Nova Categoria'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome da categoria *</label>
              <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Pizzas, Bebidas, Sobremesas…" autoFocus />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : (isEdit ? 'Salvar' : 'Criar categoria')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await categoriesApi.list(); setCategorias(res.data || []) }
    catch { toast.error('Erro ao carregar categorias') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (c) => {
    if (!confirm(`Excluir categoria "${c.name}"? Os produtos vinculados ficarão sem categoria.`)) return
    try { await categoriesApi.delete(c.id); toast.success('Categoria excluída'); load() }
    catch { toast.error('Erro ao excluir') }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Categorias</h2>
          <p>{categorias.length} categorias cadastradas</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true) }}>
          <Plus size={16} /> Nova categoria
        </button>
      </div>

      {loading ? (
        <div className="loading-full"><div className="spinner" /></div>
      ) : categorias.length === 0 ? (
        <div className="empty-state card">
          <Tag size={32} />
          <h3>Nenhuma categoria ainda</h3>
          <p>Crie categorias como Pizzas, Bebidas e Sobremesas para organizar seu cardápio.</p>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setModal(true)}>
            <Plus size={16} /> Criar primeira categoria
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {categorias.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ padding: 8, background: 'var(--ember-subtle)', borderRadius: 8, color: 'var(--ember)' }}>
                    <Tag size={16} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--cream-faint)' }}>
                      {c._count?.products ?? c.products?.length ?? 0} produtos
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(c); setModal(true) }}>
                    <Edit2 size={13} />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(c)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoriaModal open={modal} onClose={() => { setModal(false); setEditing(null) }} onSaved={load} editData={editing} />
    </div>
  )
}
