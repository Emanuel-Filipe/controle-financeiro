'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [shake, setShake] = useState(false)
  const { entrar } = useAuth()
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!senha.trim()) return
    setCarregando(true)
    setErro('')
    await new Promise((r) => setTimeout(r, 350))
    const sucesso = entrar(senha)
    if (sucesso) {
      router.replace('/')
    } else {
      setErro('Senha incorreta')
      setSenha('')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    }
    setCarregando(false)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Glow de fundo */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, var(--accent-glow) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10 animate-fade-up">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{
              background: 'linear-gradient(135deg, var(--accent) 0%, #818cf8 100%)',
              boxShadow: '0 8px 32px var(--accent-glow)',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="3"/>
              <path d="M2 10h20"/>
              <circle cx="7" cy="15" r="1" fill="white" stroke="none"/>
            </svg>
          </div>
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Finanças
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Controle familiar · Acesso privado
          </p>
        </div>

        {/* Card */}
        <div
          className={`card p-6 animate-scale-in delay-100 ${shake ? 'animate-[shakeX_0.4s_ease]' : ''}`}
          style={shake ? { animation: 'shakeX 0.4s ease' } : {}}
        >
          <label className="label">Senha de acesso</label>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-base pr-12 text-lg tracking-widest"
                style={{ letterSpacing: senha ? '0.25em' : undefined }}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                style={{ color: 'var(--text-muted)' }}
                tabIndex={-1}
              >
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {erro && (
              <p
                className="text-sm text-center font-medium animate-fade-in"
                style={{ color: 'var(--red)' }}
              >
                {erro}
              </p>
            )}

            <button
              type="submit"
              disabled={carregando || !senha.trim()}
              className="btn-primary"
            >
              {carregando ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                  Verificando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        <p
          className="text-center text-xs mt-6 animate-fade-in delay-300"
          style={{ color: 'var(--text-muted)' }}
        >
          Somente membros da família têm acesso
        </p>
      </div>
    </div>
  )
}
