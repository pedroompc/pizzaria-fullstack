import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, UserX, UserCheck, X } from 'lucide-react'
import { usersApi } from '../../api'
import toast from 'react-hot-toast'

const STATES = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const EMPTY = { name: '', email: '', pwd: '', phone: '', address: '', state: 'PE', city: '' }

function ClienteModal({ open, onClose, onSaved, editData }) {
  const isEdit = !!editData
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) setForm({ ...EMPTY, ...editData, pwd: '' })
    else setForm(EMPTY)
  }, [editData, open])

  if (!open) return null
  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!isEdit && !form.pwd) || !form.phone) {
      toast.error('Preencha os campos obrigatórios'); return
    }
    setLoading(true)
    try {
      const address = [form.address, form.city, form.state].filter(Boolean).join(', ')
      const payload = { name: form.name, email: form.email, phone: form.phone, address }
      if (!isEdit || form.pwd) payload.pwd = form.pwd
      if (!isEdit) { payload.role = 'CUSTOMER'; payload.status = 'ACTIVE' }

      if (isEdit) await usersApi.update(editData.id, payload)
      else await usersApi.create(payload)

      toast.success(isEdit ? 'Cliente atualizado!' : 'Cliente criado!')
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao salvar cliente')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Editar Cliente' : 'Novo Cliente'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome completo *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="Maria Santos" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={handle} placeholder="maria@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone *</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handle} placeholder="(81) 99999-9999" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{isEdit ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}</label>
              <input className="form-input" type="password" name="pwd" value={form.pwd} onChange={handle} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="form-group">
              <label className="form-label">Endereço</label>
              <input className="form-input" name="address" value={form.address} onChange={handle} placeholder="Rua Principal, 123, Bairro" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Cidade</label>
                <input className="form-input" name="city" value={form.city} onChange={handle} placeholder="Recife" />
              </div>
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select className="form-select" name="state" value={form.state} onChange={handle}>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : (isEdit ? 'Salvar' : 'Criar cliente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const STATUS_MAP = {
  ACTIVE:  { label: 'Ativo',     badge: 'badge-active' },
  SUSPEND: { label: 'Suspenso',  badge: 'badge-pending' },
  INATIVE: { label: 'Inativo',   badge: 'badge-danger' },
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await usersApi.list()
      const customers = (res.data || []).filter(u => u.role === 'CUSTOMER')
      setClientes(customers)
    } catch { toast.error('Erro ao carregar clientes') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const toggleStatus = async (c) => {
    const next = c.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVE'
    try {
      await usersApi.updateStatus(c.id, next)
      toast.success(`Cliente ${next === 'ACTIVE' ? 'ativado' : 'suspenso'}`)
      load()
    } catch { toast.error('Erro ao atualizar status') }
  }

  const del = async (c) => {
    if (!confirm(`Excluir cliente "${c.name}"?`)) return
    try {
      await usersApi.delete(c.id)
      toast.success('Cliente excluído')
      load()
    } catch { toast.error('Erro ao excluir') }
  }

  const filtered = clientes.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Clientes</h2>
          <p>{clientes.length} clientes cadastrados</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true) }}>
          <Plus size={16} /> Novo cliente
        </button>
      </div>

      <div className="action-row">
        <div className="search-bar">
          <Search size={15} color="var(--cream-faint)" />
          <input placeholder="Buscar por nome, email ou telefone…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum cliente encontrado</h3>
            <p>Tente um termo diferente ou adicione um novo cliente.</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const s = STATUS_MAP[c.status] || STATUS_MAP.ACTIVE
                return (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.phone || '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || '—'}</td>
                    <td><span className={`badge ${s.badge}`}>{s.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" title={c.status === 'ACTIVE' ? 'Suspender' : 'Ativar'} onClick={() => toggleStatus(c)}>
                          {c.status === 'ACTIVE' ? <UserX size={14} /> : <UserCheck size={14} />}
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(c); setModal(true) }}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(c)}>
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

      <ClienteModal
        open={modal}
        onClose={() => { setModal(false); setEditing(null) }}
        onSaved={load}
        editData={editing}
      />
    </div>
  )
}
