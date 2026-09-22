'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { sessaoValida, salvarSessao, limparSessao } from '@/lib/auth'

interface AuthContextType {
  autenticado: boolean
  carregando: boolean
  entrar: (senha: string) => boolean
  sair: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [autenticado, setAutenticado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    setAutenticado(sessaoValida())
    setCarregando(false)
  }, [])

  function entrar(senha: string): boolean {
    const senhaCorreta = process.env.NEXT_PUBLIC_APP_PASSWORD
    if (senha === senhaCorreta) {
      salvarSessao()
      setAutenticado(true)
      return true
    }
    return false
  }

  function sair() {
    limparSessao()
    setAutenticado(false)
  }

  return (
    <AuthContext.Provider value={{ autenticado, carregando, entrar, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
