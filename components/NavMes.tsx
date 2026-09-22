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
    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
      <button
        onClick={anterior}
        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft size={20} className="text-gray-600" />
      </button>
      <span className="font-semibold text-gray-800 capitalize text-base">
        {nomeMes(mes, ano)}
      </span>
      <button
        onClick={seguinte}
        className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight size={20} className="text-gray-600" />
      </button>
    </div>
  )
}
