'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X, Receipt } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentosComComprovante } from '@/lib/supabase'
import { Lancamento, TipoLancamento, CategoriaLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from '@/lib/types'
import { formatarMoeda, formatarData, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import ModalComprovante from '@/components/ModalComprovante'

type Filtro = {
  busca: string; tipo: TipoLancamento | 'Todos'
  categoria: CategoriaLancamento | 'Todas'; mes: number; ano: number
}

export default function ComprovantesPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()
  const { ano: anoAtual, mes: mesAtualNum } = mesAtual()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [buscando, setBuscando] = useState(true)
  const [erro, setErro] = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [selecionado, setSelecionado] = useState<Lancamento | null>(null)
  const [filtro, setFiltro] = useState<Filtro>({ busca: '', tipo: 'Todos', categoria: 'Todas', mes: 0, ano: anoAtual })

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true); setErro('')
    try { setLancamentos(await getLancamentosComComprovante()) }
    catch (e) { console.error(e); setErro('Erro ao carregar.') }
    finally { setBuscando(false) }
  }, [])

  useEffect(() => { if (autenticado) buscarDados() }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  const filtrados = lancamentos.filter((l) => {
    if (filtro.tipo !== 'Todos' && l.tipo !== filtro.tipo) return false
    if (filtro.categoria !== 'Todas' && l.categoria !== filtro.categoria) return false
    if (filtro.busca && !l.descricao.toLowerCase().includes(filtro.busca.toLowerCase())) return false
    if (filtro.mes !== 0) {
      const [ano, mes] = l.data.split('-').map(Number)
      if (ano !== filtro.ano || mes !== filtro.mes) return false
    }
    return true
  })

  const filtrosAtivos = filtro.tipo !== 'Todos' || filtro.categoria !== 'Todas' || filtro.busca !== '' || filtro.mes !== 0
  const todasCategorias: (CategoriaLancamento | 'Todas')[] = ['Todas', ...CATEGORIAS_DESPESA, ...CATEGORIAS_RECEITA.filter((c) => !CATEGORIAS_DESPESA.includes(c))]
  const mesesDisponiveis = Array.from(new Set(lancamentos.map((l) => { const [a, m] = l.data.split('-').map(Number); return `${a}-${m}` }))).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      <div className="px-5 pt-14 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Comprovantes</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {buscando ? '...' : `${lancamentos.length} arquivo${lancamentos.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Busca + filtros */}
      <div className="px-4 pt-3 pb-2" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" value={filtro.busca}
              onChange={(e) => setFiltro((f) => ({ ...f, busca: e.target.value }))}
              placeholder="Buscar por descrição..."
              className="input-base pl-9 py-2.5 text-sm" />
          </div>
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="p-2.5 rounded-xl transition-all"
            style={{
              background: filtrosAtivos ? 'var(--accent-soft)' : 'var(--bg-card-hover)',
              border: `1px solid ${filtrosAtivos ? 'var(--accent)' : 'var(--border)'}`,
              color: filtrosAtivos ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mt-3 space-y-3 pb-1 animate-fade-up">
            <div>
              <p className="label">Mês</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button onClick={() => setFiltro((f) => ({ ...f, mes: 0 }))}
                  className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={filtro.mes === 0 ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                  Todos
                </button>
                {mesesDisponiveis.map((key) => {
                  const [a, m] = key.split('-').map(Number)
                  return (
                    <button key={key} onClick={() => setFiltro((f) => ({ ...f, mes: m, ano: a }))}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                      style={filtro.mes === m && filtro.ano === a ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                      {nomeMes(m, a)}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <p className="label">Tipo</p>
              <div className="flex gap-2">
                {(['Todos', 'Receita', 'Despesa'] as const).map((t) => (
                  <button key={t} onClick={() => setFiltro((f) => ({ ...f, tipo: t }))}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={filtro.tipo === t ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
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
                    style={filtro.categoria === c ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            {filtrosAtivos && (
              <button onClick={() => setFiltro({ busca: '', tipo: 'Todos', categoria: 'Todas', mes: 0, ano: anoAtual })}
                className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--red)' }}>
                <X size={13} /> Limpar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-3">
        {erro && <div className="card p-3 text-sm mb-3" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>{erro}</div>}

        {buscando && (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton rounded-2xl" style={{ aspectRatio: '3/4', animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        )}

        {!buscando && (
          <>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--text-muted)' }}>
              {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
            </p>
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 pb-4">
                {filtrados.map((l, i) => (
                  <div key={l.id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <CardComprovante lancamento={l} onClick={() => setSelecionado(l)} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center py-16 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-soft)' }}>
                  <Receipt size={28} style={{ color: 'var(--accent)' }} />
                </div>
                <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {filtrosAtivos ? 'Nenhum resultado.' : 'Nenhum comprovante.'}
                </p>
                {!filtrosAtivos && <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Anexe fotos ao lançar.</p>}
              </div>
            )}
          </>
        )}
      </div>

      {selecionado?.comprovante_url && (
        <ModalComprovante aberto={!!selecionado} url={selecionado.comprovante_url}
          lancamento={selecionado} onFechar={() => setSelecionado(null)} />
      )}
      <BottomNav />
    </div>
  )
}

function CardComprovante({ lancamento, onClick }: { lancamento: Lancamento; onClick: () => void }) {
  const ehReceita = lancamento.tipo === 'Receita'
  return (
    <button onClick={onClick}
      className="card overflow-hidden text-left active:scale-95 transition-transform w-full"
      style={{ borderRadius: '1.25rem' }}>
      <div className="overflow-hidden" style={{ aspectRatio: '4/3', background: 'var(--bg-card-hover)' }}>
        <img src={lancamento.comprovante_url!} alt={lancamento.descricao}
          className="w-full h-full object-cover transition-transform hover:scale-105 duration-300" loading="lazy" />
      </div>
      <div className="p-3">
        <p className="text-xs font-bold truncate" style={{ color: 'var(--text-primary)' }}>{lancamento.descricao}</p>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{formatarData(lancamento.data)}</p>
        <p className="text-xs font-bold mt-1.5" style={{ color: ehReceita ? 'var(--green)' : 'var(--red)' }}>
          {ehReceita ? '+' : '−'}{formatarMoeda(lancamento.valor)}
        </p>
        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{ background: 'var(--bg-card-hover)', color: 'var(--text-muted)' }}>
          {lancamento.categoria}
        </span>
      </div>
    </button>
  )
}
