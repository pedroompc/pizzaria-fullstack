import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('pizza_user')
    const token = localStorage.getItem('pizza_token')
    if (stored && token) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  const login = async (email, pwd) => {
    const res = await authApi.login({ email, pwd })
    const { token, user: u } = res.data
    localStorage.setItem('pizza_token', token)
    localStorage.setItem('pizza_user', JSON.stringify(u))
    setUser(u)
    toast.success(`Bem-vindo, ${u.name}!`)
    navigate('/dashboard')
  }

  const register = async (data) => {
    const res = await authApi.register(data)
    const { token, user: u } = res.data
    localStorage.setItem('pizza_token', token)
    localStorage.setItem('pizza_user', JSON.stringify(u))
    setUser(u)
    toast.success('Conta criada com sucesso!')
    navigate('/dashboard')
  }

  const logout = () => {
    localStorage.removeItem('pizza_token')
    localStorage.removeItem('pizza_user')
    setUser(null)
    navigate('/login')
    toast.success('Até logo!')
  }

  const isAdmin = user?.role === 'SUPER_ADMIN'
  const isManager = user?.role === 'MANAGER' || isAdmin

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
