'use client'

import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

export default function ThemeToggle() {
  const { tema, toggleTema } = useTheme()
  const [visivel, setVisivel] = useState(true)
  const [ultimoScroll, setUltimoScroll] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollAtual = window.scrollY

      if (scrollAtual <= 10) {
        // Topo da página — sempre mostra
        setVisivel(true)
      } else if (scrollAtual > ultimoScroll) {
        // Scrollando para baixo — esconde
        setVisivel(false)
      } else {
        // Scrollando para cima — mostra
        setVisivel(true)
      }

      setUltimoScroll(scrollAtual)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ultimoScroll])

  return (
    <button
      onClick={toggleTema}
      aria-label="Alternar tema"
      className="fixed z-50 top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        color: 'var(--text-secondary)',
        boxShadow: 'var(--shadow-card)',
        opacity: visivel ? 1 : 0,
        transform: visivel ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.85)',
        pointerEvents: visivel ? 'auto' : 'none',
      }}
    >
      {tema === 'dark'
        ? <Sun size={18} strokeWidth={1.8} />
        : <Moon size={18} strokeWidth={1.8} />
      }
    </button>
  )
}
