'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip } from 'lucide-react'
import { Lancamento } from '@/lib/types'
import { formatarMoeda, formatarData } from '@/lib/utils'
import { CORES_CATEGORIA } from '@/lib/types'
import ModalComprovante from './ModalComprovante'

interface ItemLancamentoProps {
  lancamento: Lancamento
}

const badgeMap: Record<string, string> = {
  Pago:      'badge-green',
  Recebido:  'badge-green',
  Pendente:  'badge-amber',
  Previsto:  'badge-blue',
}

export default function ItemLancamento({ lancamento }: ItemLancamentoProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const router = useRouter()
  const cor = CORES_CATEGORIA[lancamento.categoria] ?? '#94a3b8'
  const ehReceita = lancamento.tipo === 'Receita'

  return (
    <>
      <div
        className="card flex items-center gap-3 p-4 cursor-pointer active:scale-[0.98] transition-transform"
        onClick={() => router.push(`/lancar/${lancamento.id}`)}
        style={{ borderRadius: '1rem' }}
      >
        {/* Dot categoria */}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: cor, boxShadow: `0 0 6px ${cor}80` }}
        />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-sm truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {lancamento.descricao}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {lancamento.categoria}
            </span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {formatarData(lancamento.data)}
            </span>
          </div>
          {lancamento.observacao && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {lancamento.observacao}
            </p>
          )}
        </div>

        {/* Valor + status */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span
            className="font-bold text-sm"
            style={{ color: ehReceita ? 'var(--green)' : 'var(--red)' }}
          >
            {ehReceita ? '+' : '−'}{formatarMoeda(lancamento.valor)}
          </span>
          <span className={`badge ${badgeMap[lancamento.status] ?? 'badge-muted'}`}>
            {lancamento.status}
          </span>
        </div>

        {/* Comprovante */}
        {lancamento.comprovante_url && (
          <button
            onClick={(e) => { e.stopPropagation(); setModalAberto(true) }}
            className="p-1.5 rounded-lg transition-all active:scale-90"
            style={{ color: 'var(--accent)', background: 'var(--accent-soft)' }}
            aria-label="Ver comprovante"
          >
            <Paperclip size={15} />
          </button>
        )}
      </div>

      {lancamento.comprovante_url && (
        <ModalComprovante
          aberto={modalAberto}
          url={lancamento.comprovante_url}
          lancamento={lancamento}
          onFechar={() => setModalAberto(false)}
        />
      )}
    </>
  )
}
