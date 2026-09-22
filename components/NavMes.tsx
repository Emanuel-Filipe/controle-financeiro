'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { nomeMes, mesAnterior, mesSeguinte } from '@/lib/utils'

interface NavMesProps {
  ano: number
  mes: number
  onChange: (ano: number, mes: number) => void
}

export default function NavMes({ ano, mes, onChange }: NavMesProps) {
  function anterior() {
    const { ano: a, mes: m } = mesAnterior(ano, mes)
    onChange(a, m)
  }
  function seguinte() {
    const { ano: a, mes: m } = mesSeguinte(ano, mes)
    onChange(a, m)
  }

  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <button
        onClick={anterior}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}
      >
        <ChevronLeft size={18} />
      </button>
      <span
        className="font-semibold text-base capitalize"
        style={{ color: 'var(--text-primary)' }}
      >
        {nomeMes(mes, ano)}
      </span>
      <button
        onClick={seguinte}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
