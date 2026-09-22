'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentos } from '@/lib/supabase'
import { Lancamento, TipoLancamento, CategoriaLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from '@/lib/types'
import { formatarMoeda, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import NavMes from '@/components/NavMes'
import ItemLancamento from '@/components/ItemLancamento'

type Filtro = { tipo: TipoLancamento | 'Todos'; categoria: CategoriaLancamento | 'Todas'; busca: string }

export default function HistoricoPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()
  const { ano: anoAtual, mes: mesAtualNum } = mesAtual()
  const [ano, setAno] = useState(anoAtual)
  const [mes, setMes] = useState(mesAtualNum)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [buscando, setBuscando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [filtro, setFiltro] = useState<Filtro>({ tipo: 'Todos', categoria: 'Todas', busca: '' })

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true); setErro('')
    try {
      setLancamentos(await getLancamentos(ano, mes))
    } catch (e) {
      console.error(e); setErro('Erro ao carregar lançamentos.')
    } finally { setBuscando(false) }
  }, [ano, mes])

  useEffect(() => { if (autenticado) buscarDados() }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  const filtrados = lancamentos.filter((l) => {
    if (filtro.tipo !== 'Todos' && l.tipo !== filtro.tipo) return false
    if (filtro.categoria !== 'Todas' && l.categoria !== filtro.categoria) return false
    if (filtro.busca && !l.descricao.toLowerCase().includes(filtro.busca.toLowerCase())) return false
    return true
  })

  const totalReceitas = filtrados.filter((l) => l.tipo === 'Receita').reduce((s, l) => s + l.valor, 0)
  const totalDespesas = filtrados.filter((l) => l.tipo === 'Despesa').reduce((s, l) => s + l.valor, 0)

  const todasCategorias: (CategoriaLancamento | 'Todas')[] = [
    'Todas', ...CATEGORIAS_DESPESA,
    ...CATEGORIAS_RECEITA.filter((c) => !CATEGORIAS_DESPESA.includes(c)),
  ]

  const filtrosAtivos = filtro.tipo !== 'Todos' || filtro.categoria !== 'Todas' || filtro.busca !== ''

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Histórico</h1>
        <p className="text-sm mt-0.5 capitalize" style={{ color: 'var(--text-secondary)' }}>{nomeMes(mes, ano)}</p>
      </div>

      <NavMes ano={ano} mes={mes} onChange={(a, m) => { setAno(a); setMes(m) }} />

      {/* Busca */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text" value={filtro.busca}
              onChange={(e) => setFiltro((f) => ({ ...f, busca: e.target.value }))}
              placeholder="Buscar..."
              className="input-base pl-9 py-2.5 text-sm"
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: filtrosAtivos ? 'var(--accent-soft)' : 'var(--bg-card-hover)',
              border: `1px solid ${filtrosAtivos ? 'var(--accent)' : 'var(--border)'}`,
              color: filtrosAtivos ? 'var(--accent)' : 'var(--text-muted)',
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mt-3 space-y-3 pb-1 animate-fade-up">
            <div>
              <p className="label">Tipo</p>
              <div className="flex gap-2">
                {(['Todos', 'Receita', 'Despesa'] as const).map((t) => (
                  <button key={t} onClick={() => setFiltro((f) => ({ ...f, tipo: t }))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={filtro.tipo === t
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="label">Categoria</p>
              <div className="flex flex-wrap gap-1.5">
                {todasCategorias.map((c) => (
                  <button key={c} onClick={() => setFiltro((f) => ({ ...f, categoria: c as CategoriaLancamento | 'Todas' }))}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
                    style={filtro.categoria === c
                      ? { background: 'var(--accent)', color: '#fff' }
                      : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {filtrosAtivos && (
              <button onClick={() => setFiltro({ tipo: 'Todos', categoria: 'Todas', busca: '' })}
                className="flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--red)' }}>
                <X size={13} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 space-y-3">
        {/* Resumo */}
        {!buscando && filtrados.length > 0 && (
          <div className="grid grid-cols-2 gap-2 animate-fade-up">
            <div className="card p-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--green)' }}>Receitas</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--green)' }}>{formatarMoeda(totalReceitas)}</p>
            </div>
            <div className="card p-3 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--red)' }}>Despesas</p>
              <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--red)' }}>{formatarMoeda(totalDespesas)}</p>
            </div>
          </div>
        )}

        {erro && <div className="card p-3 text-sm" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>{erro}</div>}

        {buscando && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16" style={{ animationDelay: `${i * 80}ms` }} />)}
          </div>
        )}

        {!buscando && (
          <>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
              {filtrados.length} lançamento{filtrados.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2 pb-4">
              {filtrados.map((l, i) => (
                <div key={l.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                  <ItemLancamento lancamento={l} />
                </div>
              ))}
            </div>
            {filtrados.length === 0 && !erro && (
              <div className="flex flex-col items-center py-16 text-center animate-fade-in">
                <Search size={40} className="mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {filtrosAtivos ? 'Nenhum resultado.' : 'Nenhum lançamento neste mês.'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
