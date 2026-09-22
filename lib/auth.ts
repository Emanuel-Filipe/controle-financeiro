const SESSION_KEY = 'cf_auth'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias

interface SessionData {
  expiresAt: number
}

export function verificarSenha(senha: string): boolean {
  const senhaCorreta = process.env.NEXT_PUBLIC_APP_PASSWORD
  return senha === senhaCorreta
}

export function salvarSessao(): void {
  if (typeof window === 'undefined') return
  const sessao: SessionData = {
    expiresAt: Date.now() + SESSION_DURATION_MS,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
  // Também salva em localStorage para persistir entre abas
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessao))
}

export function sessaoValida(): boolean {
  if (typeof window === 'undefined') return false

  // Verifica sessionStorage primeiro, depois localStorage
  const rawSession =
    sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY)

  if (!rawSession) return false

  try {
    const sessao: SessionData = JSON.parse(rawSession)
    if (Date.now() > sessao.expiresAt) {
      limparSessao()
      return false
    }
    // Sincroniza para sessionStorage se veio do localStorage
    sessionStorage.setItem(SESSION_KEY, rawSession)
    return true
  } catch {
    return false
  }
}

export function limparSessao(): void {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
  localStorage.removeItem(SESSION_KEY)
}
