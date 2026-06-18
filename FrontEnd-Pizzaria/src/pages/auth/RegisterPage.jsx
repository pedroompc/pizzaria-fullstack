import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Pizza } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { fetchStates, fetchCities, fetchAddressByCep } from '../../services/geo'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    name: '', email: '', pwd: '', confirmPwd: '', phone: '',
    street: '', number: '', complement: '', neighborhood: '',
    city: '', state: 'PE', cep: ''
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  // Estados e municípios vindos da API do IBGE - [Pedro Marinho]
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [loadingCep, setLoadingCep] = useState(false)

  // Carrega a lista de estados ao montar a tela
  useEffect(() => {
    fetchStates()
      .then(setStates)
      .catch(() => toast.error('Não foi possível carregar os estados (IBGE)'))
  }, [])

  // Sempre que o estado selecionado mudar, recarrega os municípios
  useEffect(() => {
    if (!form.state) { setCities([]); return }
    fetchCities(form.state)
      .then(setCities)
      .catch(() => toast.error('Não foi possível carregar os municípios (IBGE)'))
  }, [form.state])

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  // Ao sair do campo CEP, consulta o ViaCEP e preenche o endereço automaticamente
  const handleCepBlur = async () => {
    const clean = form.cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const addr = await fetchAddressByCep(clean)
      if (!addr) { toast.error('CEP não encontrado'); return }
      setForm(f => ({
        ...f,
        street: addr.street || f.street,
        neighborhood: addr.neighborhood || f.neighborhood,
        state: addr.state || f.state,
        city: addr.city || f.city,
      }))
    } catch {
      toast.error('Erro ao consultar o CEP')
    } finally {
      setLoadingCep(false)
    }
  }

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

              <div className="form-group">
                <label className="form-label">CEP (preenche o endereço automaticamente)</label>
                <input
                  className="form-input" name="cep" placeholder="50000-000"
                  value={form.cep} onChange={handle} onBlur={handleCepBlur}
                />
                {loadingCep && <span style={{ fontSize: 12, color: 'var(--cream-faint)' }}>Buscando CEP…</span>}
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
                  <label className="form-label">Estado (IBGE)</label>
                  <select className="form-select" name="state" value={form.state} onChange={handle}>
                    <option value="">Selecione…</option>
                    {states.map(s => <option key={s.id} value={s.sigla}>{s.sigla} — {s.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade (IBGE)</label>
                  <select className="form-select" name="city" value={form.city} onChange={handle} disabled={!cities.length}>
                    <option value="">{cities.length ? 'Selecione…' : 'Escolha o estado primeiro'}</option>
                    {cities.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                  </select>
                </div>
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
