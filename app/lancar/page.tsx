'use client'

import { useEffect, useState, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Camera, X, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { inserirLancamento, uploadComprovante } from '@/lib/supabase'
import {
  LancamentoForm,
  TipoLancamento,
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
  FORMAS_PAGAMENTO,
  STATUS_OPTIONS,
  CategoriaLancamento,
} from '@/lib/types'
import { dataHoje } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'

const FORM_VAZIO: LancamentoForm = {
  data: dataHoje(),
  descricao: '',
  tipo: 'Despesa',
  categoria: 'Alimentação',
  forma_pagamento: 'Pix',
  valor: '',
  status: 'Pago',
  observacao: '',
}

type EstadoEnvio = 'idle' | 'enviando' | 'sucesso' | 'erro'

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

  // Limpa URL de preview ao desmontar
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  if (carregando || !autenticado) return null

  function set<K extends keyof LancamentoForm>(campo: K, valor: LancamentoForm[K]) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function trocarTipo(tipo: TipoLancamento) {
    const categoriaDefault: CategoriaLancamento =
      tipo === 'Despesa' ? 'Alimentação' : 'Salário'
    const statusDefault = tipo === 'Despesa' ? 'Pago' : 'Recebido'
    setForm((f) => ({ ...f, tipo, categoria: categoriaDefault, status: statusDefault }))
  }

  function handleArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setArquivo(file)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
  }

  function removerArquivo() {
    setArquivo(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    if (inputFileRef.current) inputFileRef.current.value = ''
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.descricao.trim() || !form.valor || parseFloat(form.valor) <= 0) return

    setEstado('enviando')
    setErroMsg('')

    try {
      // 1. Salva o lançamento primeiro para obter o ID
      const lancamento = await inserirLancamento({
        data: form.data,
        descricao: form.descricao.trim(),
        tipo: form.tipo,
        categoria: form.categoria,
        forma_pagamento: form.forma_pagamento,
        valor: parseFloat(form.valor.replace(',', '.')),
        status: form.status,
        observacao: form.observacao.trim() || undefined,
      })

      // 2. Se tiver comprovante, faz upload e atualiza o lançamento
      if (arquivo) {
        const url = await uploadComprovante(arquivo, lancamento.id)
        const { atualizarLancamento } = await import('@/lib/supabase')
        await atualizarLancamento(lancamento.id, { comprovante_url: url })
      }

      setEstado('sucesso')
      setTimeout(() => {
        setForm({ ...FORM_VAZIO, data: dataHoje() })
        setArquivo(null)
        setPreview(null)
        setEstado('idle')
        router.push('/')
      }, 1500)
    } catch (err) {
      console.error(err)
      setErroMsg('Erro ao salvar. Tente novamente.')
      setEstado('erro')
    }
  }

  const categorias = form.tipo === 'Despesa' ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA
  const isEnviando = estado === 'enviando'

  return (
    <div className="min-h-screen bg-slate-50 page-content">
      {/* Header */}
      <div className="bg-indigo-600 pt-12 pb-5 px-4">
        <h1 className="text-white text-xl font-bold">Novo Lançamento</h1>
        <p className="text-indigo-200 text-sm mt-0.5">Registre uma entrada ou saída</p>
      </div>

      {estado === 'sucesso' && (
        <div className="mx-4 mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={22} />
          <p className="text-emerald-700 font-medium">Lançamento salvo com sucesso!</p>
        </div>
      )}

      {estado === 'erro' && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0" size={22} />
          <p className="text-red-600 font-medium">{erroMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-4 pt-5 space-y-4">
        {/* Tipo */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['Despesa', 'Receita'] as TipoLancamento[]).map((tipo) => (
              <button
                key={tipo}
                type="button"
                onClick={() => trocarTipo(tipo)}
                className={`py-3 rounded-xl font-semibold text-sm transition-all ${
                  form.tipo === tipo
                    ? tipo === 'Despesa'
                      ? 'bg-red-500 text-white shadow-sm'
                      : 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tipo === 'Despesa' ? '− Despesa' : '+ Receita'}
              </button>
            ))}
          </div>
        </div>

        {/* Valor */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Valor (R$)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
              R$
            </span>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              value={form.valor}
              onChange={(e) => set('valor', e.target.value)}
              placeholder="0,00"
              required
              className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Descrição + Data */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={form.descricao}
              onChange={(e) => set('descricao', e.target.value)}
              placeholder="Ex: Mercado, Salário, Uber..."
              required
              maxLength={100}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Data
            </label>
            <input
              type="date"
              value={form.data}
              onChange={(e) => set('data', e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categoria + Forma + Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Categoria
            </label>
            <select
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value as CategoriaLancamento)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categorias.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Forma de pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              {FORMAS_PAGAMENTO.map((forma) => (
                <button
                  key={forma}
                  type="button"
                  onClick={() => set('forma_pagamento', forma)}
                  className={`py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                    form.forma_pagamento === forma
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {forma}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                    form.status === s
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Observação */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Observação <span className="normal-case font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.observacao}
            onChange={(e) => set('observacao', e.target.value)}
            placeholder="Alguma nota adicional..."
            rows={2}
            maxLength={200}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Comprovante */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Comprovante <span className="normal-case font-normal">(opcional)</span>
          </label>

          {/* Preview */}
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview do comprovante"
                className="w-full max-h-48 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={removerArquivo}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md border border-gray-200 text-gray-600 hover:text-red-500"
              >
                <X size={16} />
              </button>
              <p className="text-xs text-gray-400 mt-2 truncate">{arquivo?.name}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputFileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-200 rounded-xl py-6 flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 active:bg-indigo-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <Camera size={22} />
                <ImageIcon size={22} />
              </div>
              <span className="text-sm font-medium">Tirar foto ou escolher da galeria</span>
            </button>
          )}

          {/* Input file oculto — aceita câmera e galeria no mobile */}
          <input
            ref={inputFileRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleArquivo}
            className="hidden"
          />
        </div>

        {/* Botão salvar */}
        <button
          type="submit"
          disabled={isEnviando || estado === 'sucesso' || !form.descricao.trim() || !form.valor}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            form.tipo === 'Despesa'
              ? 'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white'
              : 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
        >
          {isEnviando
            ? 'Salvando...'
            : estado === 'sucesso'
            ? 'Salvo! ✓'
            : `Salvar ${form.tipo}`}
        </button>
      </form>

      <BottomNav />
    </div>
  )
}
