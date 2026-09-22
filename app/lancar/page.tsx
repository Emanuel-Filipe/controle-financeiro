'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Camera, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { inserirLancamento, uploadComprovante } from '@/lib/supabase'
import {
  LancamentoForm, TipoLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA,
  FORMAS_PAGAMENTO, STATUS_OPTIONS, CategoriaLancamento,
} from '@/lib/types'
import { dataHoje } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'

const FORM_VAZIO: LancamentoForm = {
  data: dataHoje(), descricao: '', tipo: 'Despesa', categoria: 'Alimentação',
  forma_pagamento: 'Pix', valor: '', status: 'Pago', observacao: '',
}

type EstadoEnvio = 'idle' | 'enviando' | 'sucesso' | 'erro'

function ToggleBtn({ ativo, cor, onClick, children }: {
  ativo: boolean; cor: string; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
      style={ativo
        ? { background: cor, color: '#fff', boxShadow: `0 4px 16px ${cor}60` }
        : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }
      }
    >
      {children}
    </button>
  )
}

function ChipBtn({ ativo, onClick, children }: {
  ativo: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95"
      style={ativo
        ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }
        : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
      }
    >
      {children}
    </button>
  )
}

export default function LancarPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()
  const [form, setForm] = useState<LancamentoForm>(FORM_VAZIO)
  const [estado, setEstado] = useState<EstadoEnvio>('idle')
  const [erroMsg, setErroMsg] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  if (carregando || !autenticado) return null

  function set<K extends keyof LancamentoForm>(campo: K, valor: LancamentoForm[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function trocarTipo(tipo: TipoLancamento) {
    setForm((f) => ({
      ...f, tipo,
      categoria: tipo === 'Despesa' ? 'Alimentação' : 'Salário',
      status: tipo === 'Despesa' ? 'Pago' : 'Recebido',
    }))
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivo(file)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.descricao.trim() || !form.valor || parseFloat(form.valor) <= 0) return
    setEstado('enviando')
    setErroMsg('')
    try {
      const lancamento = await inserirLancamento({
        data: form.data, descricao: form.descricao.trim(), tipo: form.tipo,
        categoria: form.categoria, forma_pagamento: form.forma_pagamento,
        valor: parseFloat(form.valor.replace(',', '.')),
        status: form.status, observacao: form.observacao.trim() || undefined,
      })
      if (arquivo) {
        const url = await uploadComprovante(arquivo, lancamento.id)
        const { atualizarLancamento } = await import('@/lib/supabase')
        await atualizarLancamento(lancamento.id, { comprovante_url: url })
      }
      setEstado('sucesso')
      setTimeout(() => {
        setForm({ ...FORM_VAZIO, data: dataHoje() })
        setArquivo(null); setPreview(null); setEstado('idle')
        router.push('/')
      }, 1400)
    } catch (err) {
      console.error(err)
      setErroMsg('Erro ao salvar. Tente novamente.')
      setEstado('erro')
    }
  }

  const categorias = form.tipo === 'Despesa' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA
  const corTipo = form.tipo === 'Despesa' ? 'var(--red)' : 'var(--green)'

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Novo Lançamento</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>Registre uma entrada ou saída</p>
      </div>

      {estado === 'sucesso' && (
        <div className="mx-4 mt-4 card p-4 flex items-center gap-3 animate-bounce-in" style={{ borderColor: 'var(--green)', background: 'var(--green-soft)' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>Lançamento salvo!</p>
        </div>
      )}
      {estado === 'erro' && (
        <div className="mx-4 mt-4 card p-4 flex items-center gap-3 animate-fade-in" style={{ borderColor: 'var(--red)', background: 'var(--red-soft)' }}>
          <AlertCircle size={20} style={{ color: 'var(--red)', flexShrink: 0 }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--red)' }}>{erroMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-3">
        {/* Tipo */}
        <div className="card p-4">
          <span className="label">Tipo</span>
          <div className="flex gap-2">
            <ToggleBtn ativo={form.tipo === 'Despesa'} cor="var(--red)" onClick={() => trocarTipo('Despesa')}>− Despesa</ToggleBtn>
            <ToggleBtn ativo={form.tipo === 'Receita'} cor="var(--green)" onClick={() => trocarTipo('Receita')}>+ Receita</ToggleBtn>
          </div>
        </div>

        {/* Valor */}
        <div className="card p-4">
          <span className="label">Valor</span>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: 'var(--text-muted)' }}>R$</span>
            <input
              type="number" inputMode="decimal" step="0.01" min="0.01"
              value={form.valor}
              onChange={(e) => set('valor', e.target.value)}
              placeholder="0,00"
              required
              className="input-base pl-12 text-3xl font-bold"
              style={{ color: corTipo, background: 'transparent', border: 'none', boxShadow: 'none', padding: '0.5rem 1rem 0.5rem 3rem' }}
            />
          </div>
        </div>

        {/* Descrição + Data */}
        <div className="card p-4 space-y-4">
          <div>
            <span className="label">Descrição</span>
            <input type="text" value={form.descricao} onChange={(e) => set('descricao', e.target.value)}
              placeholder="Ex: Mercado, Salário, Uber..." required maxLength={100} className="input-base" />
          </div>
          <div>
            <span className="label">Data</span>
            <input type="date" value={form.data} onChange={(e) => set('data', e.target.value)} required className="input-base" />
          </div>
        </div>

        {/* Categoria */}
        <div className="card p-4">
          <span className="label">Categoria</span>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value as CategoriaLancamento)}
            className="input-base mt-1">
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Forma de pagamento */}
        <div className="card p-4">
          <span className="label">Forma de pagamento</span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {FORMAS_PAGAMENTO.map((f) => (
              <ChipBtn key={f} ativo={form.forma_pagamento === f} onClick={() => set('forma_pagamento', f)}>{f}</ChipBtn>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="card p-4">
          <span className="label">Status</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {STATUS_OPTIONS.map((s) => (
              <ChipBtn key={s} ativo={form.status === s} onClick={() => set('status', s)}>{s}</ChipBtn>
            ))}
          </div>
        </div>

        {/* Observação */}
        <div className="card p-4">
          <span className="label">Observação <span className="normal-case font-normal opacity-60">(opcional)</span></span>
          <textarea value={form.observacao} onChange={(e) => set('observacao', e.target.value)}
            placeholder="Nota adicional..." rows={2} maxLength={200}
            className="input-base resize-none mt-1" />
        </div>

        {/* Comprovante */}
        <div className="card p-4">
          <span className="label">Comprovante <span className="normal-case font-normal opacity-60">(opcional)</span></span>
          {preview ? (
            <div className="relative mt-2">
              <img src={preview} alt="Preview" className="w-full max-h-48 object-cover rounded-xl" />
              <button type="button" onClick={() => { setArquivo(null); setPreview(null) }}
                className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <X size={14} style={{ color: 'var(--text-primary)' }} />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => inputFileRef.current?.click()}
              className="mt-2 w-full py-6 rounded-xl flex flex-col items-center gap-2 border-2 border-dashed transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
              <div className="flex gap-3">
                <Camera size={20} />
                <ImageIcon size={20} />
              </div>
              <span className="text-sm font-medium">Tirar foto ou galeria</span>
            </button>
          )}
          <input ref={inputFileRef} type="file" accept="image/*" capture="environment"
            onChange={handleArquivo} className="hidden" />
        </div>

        {/* Botão */}
        <button
          type="submit"
          disabled={estado === 'enviando' || estado === 'sucesso' || !form.descricao.trim() || !form.valor}
          className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-40"
          style={{ background: corTipo, boxShadow: `0 4px 20px ${corTipo}50` }}
        >
          {estado === 'enviando' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </span>
          ) : estado === 'sucesso' ? 'Salvo ✓' : `Salvar ${form.tipo}`}
        </button>
      </form>
      <BottomNav />
    </div>
  )
}
