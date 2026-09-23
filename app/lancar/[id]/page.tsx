'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { CheckCircle2, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentoPorId, atualizarLancamento, deletarLancamento, uploadComprovante, deletarComprovante } from '@/lib/supabase'
import { Lancamento, LancamentoForm, TipoLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA, FORMAS_PAGAMENTO, STATUS_OPTIONS, CategoriaLancamento, FormaPagamento, StatusLancamento } from '@/lib/types'
import BottomNav from '@/components/BottomNav'
import InputValor from '@/components/InputValor'
import SeletorComprovante from '@/components/SeletorComprovante'

type EstadoEnvio = 'idle' | 'carregando' | 'enviando' | 'sucesso' | 'erro'

function ChipBtn({ ativo, onClick, children }: { ativo: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="py-2 px-3 rounded-lg text-xs font-semibold transition-all active:scale-95"
      style={ativo
        ? { background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent)' }
        : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
      {children}
    </button>
  )
}

export default function EditarLancamentoPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [lancamentoOriginal, setLancamentoOriginal] = useState<Lancamento | null>(null)
  const [form, setForm] = useState<LancamentoForm | null>(null)
  const [estado, setEstado] = useState<EstadoEnvio>('carregando')
  const [erroMsg, setErroMsg] = useState('')
  const [novoArquivo, setNovoArquivo] = useState<File | null>(null)
  const [previewNovo, setPreviewNovo] = useState<string | null>(null)
  const [removerComprovante, setRemoverComprovante] = useState(false)

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  useEffect(() => {
    if (!autenticado || !id) return
    async function carregar() {
      try {
        const l = await getLancamentoPorId(id)
        setLancamentoOriginal(l)
        setForm({ data: l.data, descricao: l.descricao, tipo: l.tipo, categoria: l.categoria, forma_pagamento: l.forma_pagamento, valor: String(l.valor), status: l.status, observacao: l.observacao ?? '' })
        setEstado('idle')
      } catch (e) {
        console.error(e); setErroMsg('Erro ao carregar.'); setEstado('erro')
      }
    }
    carregar()
  }, [autenticado, id])

  useEffect(() => () => { if (previewNovo) URL.revokeObjectURL(previewNovo) }, [previewNovo])

  if (carregando || !autenticado) return null

  function set<K extends keyof LancamentoForm>(campo: K, valor: LancamentoForm[K]) {
    setForm((f) => f ? { ...f, [campo]: valor } : f)
  }

  function trocarTipo(tipo: TipoLancamento) {
    setForm((f) => f ? { ...f, tipo, categoria: tipo === 'Despesa' ? 'Alimentação' : 'Salário', status: tipo === 'Despesa' ? 'Pago' : 'Recebido' } : f)
  }

  function handleNovoArquivo(file: File) {
    setNovoArquivo(file)
    if (previewNovo) URL.revokeObjectURL(previewNovo)
    setPreviewNovo(URL.createObjectURL(file))
    setRemoverComprovante(false)
  }

  function handleRemoverComprovante() {
    setRemoverComprovante(true)
    setNovoArquivo(null)
    if (previewNovo) URL.revokeObjectURL(previewNovo)
    setPreviewNovo(null)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form || !lancamentoOriginal) return
    if (!form.descricao.trim() || !form.valor || parseFloat(form.valor.replace(',', '.')) <= 0) return
    setEstado('enviando'); setErroMsg('')
    try {
      let novaUrl: string | null | undefined = undefined
      if (novoArquivo) {
        if (lancamentoOriginal.comprovante_url) await deletarComprovante(lancamentoOriginal.comprovante_url).catch(() => {})
        novaUrl = await uploadComprovante(novoArquivo, id)      } else if (removerComprovante && lancamentoOriginal.comprovante_url) {
        await deletarComprovante(lancamentoOriginal.comprovante_url).catch(() => {})
        novaUrl = null
      }
      const payload: Partial<Omit<Lancamento, 'id' | 'created_at'>> = {
        data: form.data, descricao: form.descricao.trim(), tipo: form.tipo,
        categoria: form.categoria as CategoriaLancamento, forma_pagamento: form.forma_pagamento as FormaPagamento,
        valor: parseFloat(form.valor.replace(',', '.')),
        status: form.status as StatusLancamento,
        observacao: form.observacao.trim() || undefined,
      }
      if (novaUrl !== undefined) payload.comprovante_url = novaUrl ?? undefined
      await atualizarLancamento(id, payload)
      setEstado('sucesso')
      setTimeout(() => router.push('/historico'), 1200)
    } catch (err) {
      console.error(err); setErroMsg('Erro ao salvar.'); setEstado('erro')
    }
  }

  async function handleDeletar() {
    if (!confirm('Excluir este lançamento permanentemente?')) return
    try {
      if (lancamentoOriginal?.comprovante_url) await deletarComprovante(lancamentoOriginal.comprovante_url).catch(() => {})
      await deletarLancamento(id)
      router.replace('/historico')
    } catch (err) { console.error(err); alert('Erro ao excluir.') }
  }

  if (estado === 'carregando') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!form) return null

  const comprovanteAtual = removerComprovante ? null : (lancamentoOriginal?.comprovante_url ?? null)
  const previewExibir = previewNovo ?? comprovanteAtual
  const corTipo = form.tipo === 'Despesa' ? 'var(--red)' : 'var(--green)'
  const categorias = form.tipo === 'Despesa' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-secondary)' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Editar Lançamento</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Altere os campos desejados</p>
        </div>
      </div>

      {estado === 'sucesso' && (
        <div className="mx-4 mt-4 card p-4 flex items-center gap-3 animate-bounce-in" style={{ borderColor: 'var(--green)', background: 'var(--green-soft)' }}>
          <CheckCircle2 size={20} style={{ color: 'var(--green)', flexShrink: 0 }} />
          <p className="font-semibold text-sm" style={{ color: 'var(--green)' }}>Lançamento atualizado!</p>
        </div>
      )}
      {estado === 'erro' && erroMsg && (
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
            {(['Despesa', 'Receita'] as TipoLancamento[]).map((tipo) => (
              <button key={tipo} type="button" onClick={() => trocarTipo(tipo)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={form.tipo === tipo
                  ? { background: tipo === 'Despesa' ? 'var(--red)' : 'var(--green)', color: '#fff', boxShadow: `0 4px 16px ${tipo === 'Despesa' ? 'var(--red)' : 'var(--green)'}60` }
                  : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                {tipo === 'Despesa' ? '− Despesa' : '+ Receita'}
              </button>
            ))}
          </div>
        </div>

        {/* Valor */}
        <div className="card p-4">
          <span className="label">Valor</span>
          <InputValor
            valor={form.valor}
            onChange={(v) => set('valor', v)}
            cor={corTipo}
          />
        </div>

        {/* Descrição + Data */}
        <div className="card p-4 space-y-4">
          <div>
            <span className="label">Descrição</span>
            <input type="text" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} required maxLength={100} className="input-base" />
          </div>
          <div>
            <span className="label">Data</span>
            <input type="date" value={form.data} onChange={(e) => set('data', e.target.value)} required className="input-base" />
          </div>
        </div>

        {/* Categoria */}
        <div className="card p-4">
          <span className="label">Categoria</span>
          <select value={form.categoria} onChange={(e) => set('categoria', e.target.value as CategoriaLancamento)} className="input-base mt-1">
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Forma */}
        <div className="card p-4">
          <span className="label">Forma de pagamento</span>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {FORMAS_PAGAMENTO.map((f) => <ChipBtn key={f} ativo={form.forma_pagamento === f} onClick={() => set('forma_pagamento', f)}>{f}</ChipBtn>)}
          </div>
        </div>

        {/* Status */}
        <div className="card p-4">
          <span className="label">Status</span>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {STATUS_OPTIONS.map((s) => <ChipBtn key={s} ativo={form.status === s} onClick={() => set('status', s)}>{s}</ChipBtn>)}
          </div>
        </div>

        {/* Observação */}
        <div className="card p-4">
          <span className="label">Observação <span className="normal-case font-normal opacity-60">(opcional)</span></span>
          <textarea value={form.observacao} onChange={(e) => set('observacao', e.target.value)} rows={2} maxLength={200} className="input-base resize-none mt-1" />
        </div>

        {/* Comprovante */}
        <div className="card p-4">
          <span className="label">Comprovante <span className="normal-case font-normal opacity-60">(opcional)</span></span>
          <SeletorComprovante
            preview={previewExibir}
            onArquivo={handleNovoArquivo}
            onRemover={handleRemoverComprovante}
          />
        </div>

        {/* Salvar */}
        <button type="submit" disabled={estado === 'enviando' || estado === 'sucesso'}
          className="w-full py-4 rounded-2xl font-bold text-base text-white transition-all active:scale-[0.97] disabled:opacity-40"
          style={{ background: 'var(--accent)', boxShadow: '0 4px 20px var(--accent-glow)' }}>
          {estado === 'enviando' ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </span>
          ) : estado === 'sucesso' ? 'Salvo ✓' : 'Salvar alterações'}
        </button>

        {/* Excluir */}
        <button type="button" onClick={handleDeletar}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.97]"
          style={{ background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid rgba(255,77,109,0.2)' }}>
          <Trash2 size={18} /> Excluir lançamento
        </button>
      </form>
      <BottomNav />
    </div>
  )
}
