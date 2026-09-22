'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Tema = 'dark' | 'light'

interface ThemeContextType {
  tema: Tema
  toggleTema: () => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('dark')

  useEffect(() => {
    const salvo = localStorage.getItem('cf_tema') as Tema | null
    const inicial = salvo ?? 'dark'
    setTema(inicial)
    document.documentElement.setAttribute('data-theme', inicial)
  }, [])

  function toggleTema() {
    setTema((t) => {
      const novo: Tema = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('cf_tema', novo)
      document.documentElement.setAttribute('data-theme', novo)
      return novo
    })
  }

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme deve ser usado dentro de ThemeProvider')
  return ctx
}
