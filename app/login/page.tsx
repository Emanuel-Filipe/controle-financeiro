'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Lock, Eye, EyeOff, Wallet } from 'lucide-react'

export default function LoginPage() {
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const { entrar } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!senha.trim()) return

    setCarregando(true)
    setErro('')

    // Pequeno delay para UX
    await new Promise((r) => setTimeout(r, 300))

    const sucesso = entrar(senha)
    if (sucesso) {
      router.replace('/')
    } else {
      setErro('Senha incorreta. Tente novamente.')
      setSenha('')
    }
    setCarregando(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-indigo-50 to-slate-100">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-lg mb-4">
          <Wallet size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Controle Financeiro</h1>
        <p className="text-gray-500 text-sm mt-1">Área restrita da família</p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha de acesso
          </label>
          <div className="relative">
            <Lock
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type={mostrarSenha ? 'text' : 'password'}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Digite a senha"
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-3.5 border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {erro && (
            <p className="mt-3 text-sm text-red-500 text-center">{erro}</p>
          )}

          <button
            type="submit"
            disabled={carregando || !senha.trim()}
            className="mt-4 w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {carregando ? 'Verificando...' : 'Entrar'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Somente membros da família têm acesso.
        </p>
      </form>
    </div>
  )
}
