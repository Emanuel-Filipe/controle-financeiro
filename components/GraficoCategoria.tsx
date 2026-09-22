'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { GastoCategoria } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'

interface GraficoCategoriaProps {
  dados: GastoCategoria[]
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: GastoCategoria }> }) {
  if (active && payload?.length) {
    const item = payload[0].payload
    return (
      <div className="card px-3 py-2" style={{ minWidth: 140 }}>
        <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{item.categoria}</p>
        <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>{formatarMoeda(item.total)}</p>
      </div>
    )
  }
  return null
}

export default function GraficoCategoria({ dados }: GraficoCategoriaProps) {
  const top5 = dados.slice(0, 5)
  const total = dados.reduce((s, d) => s + d.total, 0)

  return (
    <div>
      <div className="h-44 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={top5}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={76}
              paddingAngle={4}
              dataKey="total"
              strokeWidth={0}
            >
              {top5.map((entry, index) => (
                <Cell key={index} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Total no centro */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total</span>
          <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{formatarMoeda(total)}</span>
        </div>
      </div>

      {/* Legenda */}
      <div className="space-y-2.5 mt-1">
        {dados.map((item) => {
          const pct = total > 0 ? Math.round((item.total / total) * 100) : 0
          return (
            <div key={item.categoria} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.cor }} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{item.categoria}</span>
                  <span className="text-xs font-bold ml-2 flex-shrink-0" style={{ color: 'var(--text-primary)' }}>{formatarMoeda(item.total)}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-card-hover)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: item.cor }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
