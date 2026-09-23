'use client'

import { useState, useRef } from 'react'

interface InputValorProps {
  valor: string
  onChange: (valor: string) => void
  cor?: string
}

export default function InputValor({ valor, onChange, cor }: InputValorProps) {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value

    // Permite apenas dígitos, vírgula e ponto
    v = v.replace(/[^0-9.,]/g, '')

    // Garante no máximo uma vírgula ou ponto
    const partes = v.split(/[.,]/)
    if (partes.length > 2) {
      v = partes[0] + ',' + partes.slice(1).join('')
    }

    // Limita a 2 casas decimais
    const match = v.match(/^(\d*)[.,](\d{0,2})/)
    if (match) {
      v = match[1] + ',' + match[2]
    }

    onChange(v)
  }

  // Converte para número válido para o submit
  function valorNumerico(): number {
    return parseFloat(valor.replace(',', '.')) || 0
  }

  // Exposição via dataset para o form conseguir ler
  return (
    <div className="relative">
      <span
        className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg select-none"
        style={{ color: 'var(--text-muted)' }}
      >
        R$
      </span>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*[.,]?[0-9]*"
        autoComplete="off"
        value={valor}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="0,00"
        data-valor={valorNumerico()}
        className="input-base text-3xl font-bold pl-12"
        style={{
          color: cor ?? 'var(--text-primary)',
          background: 'transparent',
          border: 'none',
          boxShadow: focused ? '0 0 0 2px var(--accent-glow)' : 'none',
          borderRadius: '0.875rem',
          padding: '0.5rem 1rem 0.5rem 3rem',
          transition: 'box-shadow 0.2s ease',
        }}
      />
    </div>
  )
}
