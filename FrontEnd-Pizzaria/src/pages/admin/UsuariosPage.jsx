import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, X, UserCog } from 'lucide-react'
import { usersApi } from '../../api'
import toast from 'react-hot-toast'

const ROLES = ['CUSTOMER', 'MANAGER', 'SUPER_ADMIN']
const ROLE_LABELS = { CUSTOMER: 'Cliente', MANAGER: 'Gerente', SUPER_ADMIN: 'Super Admin' }
const STATUSES = ['ACTIVE', 'SUSPEND', 'INATIVE']
const STATUS_MAP = { ACTIVE: { label: 'Ativo', badge: 'badge-active' }, SUSPEND: { label: 'Suspenso', badge: 'badge-pending' }, INATIVE: { label: 'Inativo', badge: 'badge-danger' } }
const ROLE_BADGE = { CUSTOMER: 'badge-muted', MANAGER: 'badge-info', SUPER_ADMIN: 'badge-ember' }

function UsuarioModal({ open, onClose, onSaved, editData }) {
  const isEdit = !!editData
  const [form, setForm] = useState({ name: '', email: '', pwd: '', phone: '', role: 'CUSTOMER', status: 'ACTIVE' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editData) setForm({ name: editData.name || '', email: editData.email || '', pwd: '', phone: editData.phone || '', role: editData.role || 'CUSTOMER', status: editData.status || 'ACTIVE' })
    else setForm({ name: '', email: '', pwd: '', phone: '', role: 'CUSTOMER', status: 'ACTIVE' })
  }, [editData, open])

  if (!open) return null
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || (!isEdit && !form.pwd)) { toast.error('Preencha os campos obrigatórios'); return }
    setLoading(true)
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role, status: form.status }
      if (!isEdit || form.pwd) payload.pwd = form.pwd
      if (isEdit) await usersApi.update(editData.id, payload)
      else await usersApi.create(payload)
      toast.success(isEdit ? 'Usuário atualizado!' : 'Usuário criado!')
      onSaved(); onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Erro ao salvar') }
    finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-input" name="name" value={form.name} onChange={handle} placeholder="João Silva" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" name="email" value={form.email} onChange={handle} placeholder="joao@email.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input className="form-input" name="phone" value={form.phone} onChange={handle} placeholder="(81) 99999-9999" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">{isEdit ? 'Nova senha (deixe em branco)' : 'Senha *'}</label>
              <input className="form-input" type="password" name="pwd" value={form.pwd} onChange={handle} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Papel</label>
                <select className="form-select" name="role" value={form.role} onChange={handle}>
                  {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" name="status" value={form.status} onChange={handle}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_MAP[s].label}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <div className="spinner" /> : (isEdit ? 'Salvar' : 'Criar usuário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { const res = await usersApi.list(); setUsuarios(res.data || []) }
    catch { toast.error('Erro ao carregar usuários') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const del = async (u) => {
    if (!confirm(`Excluir usuário "${u.name}"?`)) return
    try { await usersApi.delete(u.id); toast.success('Usuário excluído'); load() }
    catch { toast.error('Erro ao excluir') }
  }

  const changeStatus = async (u, status) => {
    try { await usersApi.updateStatus(u.id, status); toast.success('Status atualizado'); load() }
    catch { toast.error('Erro ao atualizar status') }
  }

  const filtered = usuarios.filter(u => {
    const match = u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
    const rMatch = !filterRole || u.role === filterRole
    return match && rMatch
  })

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Usuários</h2>
          <p>{usuarios.length} usuários no sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setModal(true) }}>
          <Plus size={16} /> Novo usuário
        </button>
      </div>

      <div className="action-row">
        <div className="search-bar">
          <Search size={15} color="var(--cream-faint)" />
          <input placeholder="Buscar usuário…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ width: 160 }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="">Todos os papéis</option>
          {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
        </select>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div className="loading-full"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><UserCog size={32} /><h3>Nenhum usuário encontrado</h3></div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>E-mail</th><th>Telefone</th><th>Papel</th><th>Status</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const s = STATUS_MAP[u.status] || STATUS_MAP.ACTIVE
                return (
                  <tr key={u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td>{u.email}</td>
                    <td>{u.phone || '—'}</td>
                    <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-muted'}`}>{ROLE_LABELS[u.role] || u.role}</span></td>
                    <td>
                      <select
                        className="form-select" style={{ padding: '4px 8px', fontSize: 12, width: 'auto' }}
                        value={u.status} onChange={e => changeStatus(u, e.target.value)}
                      >
                        {STATUSES.map(st => <option key={st} value={st}>{STATUS_MAP[st].label}</option>)}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setEditing(u); setModal(true) }}><Edit2 size={14} /></button>
                        <button className="btn btn-danger btn-icon btn-sm" onClick={() => del(u)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <UsuarioModal open={modal} onClose={() => { setModal(false); setEditing(null) }} onSaved={load} editData={editing} />
    </div>
  )
}
