'use client'

import { useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { Lancamento } from '@/lib/types'
import { formatarMoeda, formatarData } from '@/lib/utils'

interface ModalComprovanteProps {
  aberto: boolean
  url: string
  lancamento: Lancamento
  onFechar: () => void
}

export default function ModalComprovante({
  aberto,
  url,
  lancamento,
  onFechar,
}: ModalComprovanteProps) {
  // Fecha com ESC no desktop
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onFechar()
    }
    if (aberto) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [aberto, onFechar])

  // Bloqueia scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  if (!aberto) return null

  const ehReceita = lancamento.tipo === 'Receita'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={onFechar}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 pt-12 pb-3 bg-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm truncate">
            {lancamento.descricao}
          </p>
          <p className="text-gray-400 text-xs mt-0.5">
            {lancamento.categoria} · {formatarData(lancamento.data)} ·{' '}
            <span className={ehReceita ? 'text-emerald-400' : 'text-red-400'}>
              {ehReceita ? '+' : '-'} {formatarMoeda(lancamento.valor)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 ml-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Abrir em nova aba"
          >
            <ExternalLink size={20} />
          </a>
          <a
            href={url}
            download
            className="p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Baixar comprovante"
          >
            <Download size={20} />
          </a>
          <button
            onClick={onFechar}
            className="p-2 text-gray-300 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Imagem centralizada */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={url}
          alt={`Comprovante de ${lancamento.descricao}`}
          className="max-w-full max-h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Toque fora para fechar */}
      <p className="text-center text-gray-600 text-xs pb-8">
        Toque fora para fechar
      </p>
    </div>
  )
}
