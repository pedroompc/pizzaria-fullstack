import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pizza } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

// Brazilian states for the select
const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO'
]

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', pwd: '', confirmPwd: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: 'PE', cep: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.pwd || !form.phone) {
      toast.error('Preencha os campos obrigatórios'); return
    }
    if (form.pwd !== form.confirmPwd) {
      toast.error('Senhas não conferem'); return
    }
    if (form.pwd.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres'); return
    }

    const address = [
      form.street, form.number, form.complement, form.neighborhood,
      form.city, form.state, form.cep
    ].filter(Boolean).join(', ')

    setLoading(true)
    try {
      await register({
        name: form.name,
        email: form.email,
        pwd: form.pwd,
        phone: form.phone.replace(/\D/g, ''),
        address,
      })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-left">
        <div className="auth-hero">
          <div className="auth-hero-tag">Novo por aqui?</div>
          <h1>
            Crie sua<br />conta em<br /><span>minutos</span>
          </h1>
          <p>
            Preencha seus dados para acessar o sistema de gestão da pizzaria.
            Rápido, seguro e sem complicação.
          </p>
        </div>
      </div>

      <div className="auth-right" style={{ width: 520, overflowY: 'auto' }}>
        <div className="auth-form-wrapper" style={{ maxWidth: 440 }}>
          <div className="auth-brand">
            <div className="dot" />
            PizzaSystem
          </div>
          <p className="auth-subtitle">Crie sua conta agora</p>

          <form onSubmit={submit}>
            {/* Dados pessoais */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cream-faint)', fontWeight: 600, marginBottom: 12 }}>
                Dados Pessoais
              </div>

              <div className="form-group">
                <label className="form-label">Nome completo *</label>
                <input className="form-input" name="name" placeholder="Maria Santos" value={form.name} onChange={handle} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">E-mail *</label>
                  <input className="form-input" type="email" name="email" placeholder="maria@email.com" value={form.email} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefone *</label>
                  <input className="form-input" name="phone" placeholder="(81) 99999-9999" value={form.phone} onChange={handle} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Senha *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      className="form-input" type={showPwd ? 'text' : 'password'}
                      name="pwd" placeholder="Mínimo 6 caracteres" value={form.pwd} onChange={handle}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-faint)', display: 'flex' }}>
                      {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmar senha *</label>
                  <input className="form-input" type="password" name="confirmPwd" placeholder="Repita a senha" value={form.confirmPwd} onChange={handle} />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--cream-faint)', fontWeight: 600, marginBottom: 12 }}>
                Endereço
              </div>

              <div className="form-row">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Rua / Logradouro</label>
                  <input className="form-input" name="street" placeholder="Rua Principal" value={form.street} onChange={handle} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Número</label>
                  <input className="form-input" name="number" placeholder="123" value={form.number} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Complemento</label>
                  <input className="form-input" name="complement" placeholder="Apto 4B" value={form.complement} onChange={handle} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bairro</label>
                <input className="form-input" name="neighborhood" placeholder="Boa Vista" value={form.neighborhood} onChange={handle} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cidade</label>
                  <input className="form-input" name="city" placeholder="Recife" value={form.city} onChange={handle} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select className="form-select" name="state" value={form.state} onChange={handle}>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">CEP</label>
                <input className="form-input" name="cep" placeholder="50000-000" value={form.cep} onChange={handle} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : 'Criar conta'}
            </button>
          </form>

          <div className="divider">ou</div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cream-faint)' }}>
            Já tem conta?{' '}
            <Link to="/login" className="auth-link">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
