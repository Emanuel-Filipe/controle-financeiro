'use client'

import { useState } from 'react'
import { Trash2, Paperclip } from 'lucide-react'
import { Lancamento } from '@/lib/types'
import { formatarMoeda, formatarData } from '@/lib/utils'
import { CORES_CATEGORIA } from '@/lib/types'
import ModalComprovante from './ModalComprovante'

interface ItemLancamentoProps {
  lancamento: Lancamento
  onDeletar?: (id: string) => void
}

const badgeStatus: Record<string, string> = {
  Pago: 'bg-emerald-100 text-emerald-700',
  Recebido: 'bg-emerald-100 text-emerald-700',
  Pendente: 'bg-amber-100 text-amber-700',
  Previsto: 'bg-blue-100 text-blue-700',
}

export default function ItemLancamento({ lancamento, onDeletar }: ItemLancamentoProps) {
  const [modalAberto, setModalAberto] = useState(false)
  const cor = CORES_CATEGORIA[lancamento.categoria] ?? '#94a3b8'
  const ehReceita = lancamento.tipo === 'Receita'

  return (
    <>
      <div className="flex items-center gap-3 bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 active:bg-gray-50 transition-colors">
        {/* Bolinha colorida da categoria */}
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
          style={{ backgroundColor: cor }}
        />

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">
                {lancamento.descricao}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {lancamento.categoria} · {formatarData(lancamento.data)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span
                className={`font-semibold text-sm ${
                  ehReceita ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                {ehReceita ? '+' : '-'} {formatarMoeda(lancamento.valor)}
              </span>
              <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  badgeStatus[lancamento.status] ?? 'bg-gray-100 text-gray-500'
                }`}
              >
                {lancamento.status}
              </span>
            </div>
          </div>
          {lancamento.observacao && (
            <p className="text-xs text-gray-400 mt-1 truncate">{lancamento.observacao}</p>
          )}
        </div>

        {/* Ícone comprovante */}
        {lancamento.comprovante_url && (
          <button
            onClick={() => setModalAberto(true)}
            className="p-1.5 text-indigo-400 hover:text-indigo-600 active:text-indigo-700 transition-colors flex-shrink-0"
            aria-label="Ver comprovante"
          >
            <Paperclip size={16} />
          </button>
        )}

        {/* Botão deletar */}
        {onDeletar && (
          <button
            onClick={() => onDeletar(lancamento.id)}
            className="p-1.5 text-gray-300 hover:text-red-400 active:text-red-600 transition-colors flex-shrink-0"
            aria-label="Excluir lançamento"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Modal do comprovante */}
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
