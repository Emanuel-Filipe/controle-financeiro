'use client'

import { useEffect } from 'react'
import { X, Download, ExternalLink } from 'lucide-react'
import { Lancamento } from '@/lib/types'
import { formatarMoeda, formatarData } from '@/lib/utils'

interface ModalComprovanteProps {
  aberto: boolean; url: string; lancamento: Lancamento; onFechar: () => void
}

export default function ModalComprovante({ aberto, url, lancamento, onFechar }: ModalComprovanteProps) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onFechar() }
    if (aberto) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [aberto, onFechar])

  useEffect(() => {
    document.body.style.overflow = aberto ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [aberto])

  if (!aberto) return null

  const ehReceita = lancamento.tipo === 'Receita'

  return (
    <div className="fixed inset-0 z-50 flex flex-col animate-fade-in" style={{ background: 'rgba(0,0,0,0.96)' }} onClick={onFechar}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-white truncate">{lancamento.descricao}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{lancamento.categoria}</span>
            <span className="text-gray-600">·</span>
            <span className="text-xs text-gray-400">{formatarData(lancamento.data)}</span>
            <span className="text-gray-600">·</span>
            <span className="text-xs font-bold" style={{ color: ehReceita ? '#10d98a' : '#ff4d6d' }}>
              {ehReceita ? '+' : '−'}{formatarMoeda(lancamento.valor)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 ml-3">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="p-2.5 rounded-xl transition-all hover:bg-white/10 text-gray-400 hover:text-white">
            <ExternalLink size={18} />
          </a>
          <a href={url} download
            className="p-2.5 rounded-xl transition-all hover:bg-white/10 text-gray-400 hover:text-white">
            <Download size={18} />
          </a>
          <button onClick={onFechar}
            className="p-2.5 rounded-xl transition-all hover:bg-white/10 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Imagem */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto" onClick={(e) => e.stopPropagation()}>
        <img src={url} alt={`Comprovante de ${lancamento.descricao}`}
          className="max-w-full max-h-full object-contain rounded-xl animate-scale-in" />
      </div>

      <p className="text-center text-xs pb-8 text-gray-700">Toque fora para fechar</p>
    </div>
  )
}
