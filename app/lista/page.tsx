'use client'

import { useEffect, useState, useCallback, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, X, ListChecks } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getListaDesejos, inserirDesejo, atualizarDesejo, deletarDesejo } from '@/lib/supabase'
import { ItemDesejo, Prioridade, PRIORIDADES, COR_PRIORIDADE, BG_PRIORIDADE } from '@/lib/types'
import { formatarMoeda } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'

const FORM_VAZIO = {
  nome: '',
  valor_estimado: '',
  prioridade: 'Normal' as Prioridade,
  observacao: '',
}

export default function ListaPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()

  const [itens, setItens] = useState<ItemDesejo[]>([])
  const [buscando, setBuscando] = useState(true)
  const [formAberto, setFormAberto] = useState(false)
  const [form, setForm] = useState(FORM_VAZIO)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [mostrarConcluidos, setMostrarConcluidos] = useState(false)

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true)
    try {
      setItens(await getListaDesejos())
    } catch (e) {
      console.error(e)
      setErro('Erro ao carregar lista.')
    } finally {
      setBuscando(false)
    }
  }, [])

  useEffect(() => {
    if (autenticado) buscarDados()
  }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  async function handleAdicionar(e: FormEvent) {
    e.preventDefault()
    if (!form.nome.trim()) return
    setSalvando(true)
    try {
      const novo = await inserirDesejo({
        nome: form.nome.trim(),
        valor_estimado: form.valor_estimado
          ? parseFloat(form.valor_estimado.replace(',', '.'))
          : null,
        prioridade: form.prioridade,
        concluido: false,
        observacao: form.observacao.trim() || null,
      })
      setItens((prev) => [novo, ...prev])
      setForm(FORM_VAZIO)
      setFormAberto(false)
    } catch (e) {
      console.error(e)
      setErro('Erro ao adicionar.')
    } finally {
      setSalvando(false)
    }
  }

  async function handleToggleConcluido(item: ItemDesejo) {
    try {
      const atualizado = await atualizarDesejo(item.id, { concluido: !item.concluido })
      setItens((prev) =>
        prev
          .map((i) => (i.id === item.id ? atualizado : i))
          .sort((a, b) => Number(a.concluido) - Number(b.concluido))
      )
    } catch (e) {
      console.error(e)
    }
  }

  async function handleDeletar(id: string) {
    if (!confirm('Remover este item da lista?')) return
    try {
      await deletarDesejo(id)
      setItens((prev) => prev.filter((i) => i.id !== id))
    } catch (e) {
      console.error(e)
    }
  }

  const pendentes = itens.filter((i) => !i.concluido)
  const concluidos = itens.filter((i) => i.concluido)
  const totalEstimado = pendentes.reduce((s, i) => s + (i.valor_estimado ?? 0), 0)

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Lista de Desejos
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {buscando ? '...' : (
            <>
              {pendentes.length} pendente{pendentes.length !== 1 ? 's' : ''}
              {totalEstimado > 0 && (
                <span style={{ color: 'var(--text-muted)' }}>
                  {' · estimado '}{formatarMoeda(totalEstimado)}
                </span>
              )}
            </>
          )}
        </p>
      </div>

      <div className="px-4 pt-4 space-y-3 pb-4">
        {/* Botão abrir formulário */}
        <button
          onClick={() => setFormAberto(!formAberto)}
          className="w-full flex items-center justify-between p-4 card transition-all active:scale-[0.98]"
          style={{ borderColor: formAberto ? 'var(--accent)' : 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-soft)' }}>
              <Plus size={18} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Adicionar item
            </span>
          </div>
          {formAberto
            ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
          }
        </button>

        {/* Formulário */}
        {formAberto && (
          <div className="card p-4 animate-fade-up">
            <form onSubmit={handleAdicionar} className="space-y-4">
              <div>
                <span className="label">Nome</span>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Tênis, Viagem, TV..."
                  required
                  maxLength={100}
                  className="input-base"
                  autoFocus
                />
              </div>

              <div>
                <span className="label">
                  Valor estimado{' '}
                  <span className="normal-case font-normal opacity-60">(opcional)</span>
                </span>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold"
                    style={{ color: 'var(--text-muted)' }}>R$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.valor_estimado}
                    onChange={(e) => {
                      let v = e.target.value.replace(/[^0-9.,]/g, '')
                      const partes = v.split(/[.,]/)
                      if (partes.length > 2) v = partes[0] + ',' + partes.slice(1).join('')
                      setForm((f) => ({ ...f, valor_estimado: v }))
                    }}
                    placeholder="0,00"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div>
                <span className="label">Prioridade</span>
                <div className="flex gap-2 mt-1">
                  {PRIORIDADES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, prioridade: p }))}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95"
                      style={form.prioridade === p
                        ? { background: BG_PRIORIDADE[p], color: COR_PRIORIDADE[p], border: `1px solid ${COR_PRIORIDADE[p]}` }
                        : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="label">
                  Observação{' '}
                  <span className="normal-case font-normal opacity-60">(opcional)</span>
                </span>
                <textarea
                  value={form.observacao}
                  onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))}
                  placeholder="Link, loja, detalhes..."
                  rows={2}
                  maxLength={200}
                  className="input-base resize-none mt-1"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setFormAberto(false); setForm(FORM_VAZIO) }}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
                  style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando || !form.nome.trim()}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-40"
                  style={{ background: 'var(--accent)', boxShadow: '0 4px 16px var(--accent-glow)' }}
                >
                  {salvando ? 'Salvando...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="card p-3 flex items-center justify-between animate-fade-in"
            style={{ borderColor: 'var(--red)', background: 'var(--red-soft)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>{erro}</p>
            <button onClick={() => setErro('')}>
              <X size={16} style={{ color: 'var(--red)' }} />
            </button>
          </div>
        )}

        {/* Skeleton */}
        {buscando && (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-16" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        )}

        {/* Pendentes */}
        {!buscando && pendentes.length > 0 && (
          <div className="space-y-2">
            {pendentes.map((item, i) => (
              <div key={item.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <ItemCard
                  item={item}
                  onToggle={() => handleToggleConcluido(item)}
                  onDeletar={() => handleDeletar(item.id)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!buscando && itens.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-soft)' }}>
              <ListChecks size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Lista vazia
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Adicione coisas que vocês querem fazer ou comprar.
            </p>
          </div>
        )}

        {/* Concluídos — seção colapsável */}
        {!buscando && concluidos.length > 0 && (
          <div>
            <button
              onClick={() => setMostrarConcluidos(!mostrarConcluidos)}
              className="w-full flex items-center justify-between py-3 transition-opacity hover:opacity-70"
            >
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color: 'var(--text-muted)' }}>
                Concluídos ({concluidos.length})
              </span>
              {mostrarConcluidos
                ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
              }
            </button>

            {mostrarConcluidos && (
              <div className="space-y-2 animate-fade-up">
                {concluidos.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    onToggle={() => handleToggleConcluido(item)}
                    onDeletar={() => handleDeletar(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

// ─── Card de item ─────────────────────────────────────────────────────────────

function ItemCard({
  item,
  onToggle,
  onDeletar,
}: {
  item: ItemDesejo
  onToggle: () => void
  onDeletar: () => void
}) {
  return (
    <div
      className="card flex items-center gap-3 p-4 transition-all"
      style={{
        borderLeft: `3px solid ${item.concluido ? 'var(--text-muted)' : COR_PRIORIDADE[item.prioridade]}`,
        opacity: item.concluido ? 0.55 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className="flex-shrink-0 transition-all active:scale-90"
        aria-label={item.concluido ? 'Marcar como pendente' : 'Marcar como concluído'}
      >
        {item.concluido
          ? <CheckCircle2 size={22} style={{ color: 'var(--green)' }} />
          : <Circle size={22} style={{ color: 'var(--text-muted)' }} />
        }
      </button>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="font-semibold text-sm"
            style={{
              color: 'var(--text-primary)',
              textDecoration: item.concluido ? 'line-through' : 'none',
            }}
          >
            {item.nome}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {item.valor_estimado != null && (
              <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                {formatarMoeda(item.valor_estimado)}
              </span>
            )}
            {/* Badge prioridade — só para pendentes */}
            {!item.concluido && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                style={{
                  background: BG_PRIORIDADE[item.prioridade],
                  color: COR_PRIORIDADE[item.prioridade],
                }}
              >
                {item.prioridade}
              </span>
            )}
          </div>
        </div>
        {item.observacao && (
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
            {item.observacao}
          </p>
        )}
      </div>

      {/* Deletar */}
      <button
        onClick={onDeletar}
        className="flex-shrink-0 p-1.5 rounded-lg transition-all active:scale-90"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Remover item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
