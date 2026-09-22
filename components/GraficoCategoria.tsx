'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { GastoCategoria } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'

interface GraficoCategoriaProps {
  dados: GastoCategoria[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: GastoCategoria }> }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload
    return (
      <div className="bg-white shadow-lg rounded-xl px-3 py-2 border border-gray-100">
        <p className="text-xs font-semibold text-gray-700">{item.categoria}</p>
        <p className="text-sm font-bold text-gray-900">{formatarMoeda(item.total)}</p>
      </div>
    )
  }
  return null
}

export default function GraficoCategoria({ dados }: GraficoCategoriaProps) {
  const top5 = dados.slice(0, 5)

  return (
    <div>
      {/* Gráfico de rosca */}
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top5}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={3}
              dataKey="total"
            >
              {top5.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda */}
      <div className="space-y-2 mt-2">
        {dados.map((item) => (
          <div key={item.categoria} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.cor }}
              />
              <span className="text-sm text-gray-600">{item.categoria}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800">
              {formatarMoeda(item.total)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
