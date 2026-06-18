import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pizza, ShoppingBag, Users, Star } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', pwd: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.pwd) { toast.error('Preencha todos os campos'); return }
    setLoading(true)
    try {
      await login(form.email, form.pwd)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-layout">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-hero">
          <div className="auth-hero-tag">Gestão completa</div>
          <h1>
            Sua pizzaria<br />no <span>controle</span><br />total
          </h1>
          <p>
            Gerencie pedidos, clientes, produtos e equipe em um só lugar.
            Simples, rápido e feito para pizzarias.
          </p>

          <div className="auth-features">
            {[
              { icon: ShoppingBag, text: 'Controle de pedidos em tempo real' },
              { icon: Users,       text: 'Gestão completa de clientes' },
              { icon: Pizza,       text: 'Catálogo de produtos e cardápio' },
              { icon: Star,        text: 'Dashboard com métricas do negócio' },
            ].map(({ icon: Icon, text }) => (
              <div className="auth-feature" key={text}>
                <div className="auth-feature-icon">
                  <Icon size={14} />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          <div className="auth-brand">
            <div className="dot" />
            PizzaSystem
          </div>
          <p className="auth-subtitle">Entre na sua conta para continuar</p>

          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                className="form-input"
                type="email"
                name="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={handle}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPwd ? 'text' : 'password'}
                  name="pwd"
                  placeholder="••••••••"
                  value={form.pwd}
                  onChange={handle}
                  autoComplete="current-password"
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cream-faint)',
                    display: 'flex', padding: 4
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 8, padding: '12px' }}
              disabled={loading}
            >
              {loading ? <div className="spinner" /> : 'Entrar'}
            </button>
          </form>

          <div className="divider">ou</div>

          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--cream-faint)' }}>
            Não tem conta?{' '}
            <Link to="/cadastro" className="auth-link">Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
