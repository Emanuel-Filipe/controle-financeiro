'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentos, deletarLancamento } from '@/lib/supabase'
import { Lancamento, TipoLancamento, CategoriaLancamento, CATEGORIAS_DESPESA, CATEGORIAS_RECEITA } from '@/lib/types'
import { formatarMoeda, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import NavMes from '@/components/NavMes'
import ItemLancamento from '@/components/ItemLancamento'

type Filtro = {
  tipo: TipoLancamento | 'Todos'
  categoria: CategoriaLancamento | 'Todas'
  busca: string
}

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
  const [filtro, setFiltro] = useState<Filtro>({
    tipo: 'Todos',
    categoria: 'Todas',
    busca: '',
  })

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true)
    setErro('')
    try {
      const dados = await getLancamentos(ano, mes)
      setLancamentos(dados)
    } catch (e) {
      console.error(e)
      setErro('Erro ao carregar lançamentos.')
    } finally {
      setBuscando(false)
    }
  }, [ano, mes])

  useEffect(() => {
    if (autenticado) buscarDados()
  }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  async function handleDeletar(id: string) {
    if (!confirm('Excluir este lançamento?')) return
    try {
      await deletarLancamento(id)
      setLancamentos((prev) => prev.filter((l) => l.id !== id))
    } catch (e) {
      console.error(e)
      alert('Erro ao excluir. Tente novamente.')
    }
  }

  // Filtros aplicados
  const filtrados = lancamentos.filter((l) => {
    if (filtro.tipo !== 'Todos' && l.tipo !== filtro.tipo) return false
    if (filtro.categoria !== 'Todas' && l.categoria !== filtro.categoria) return false
    if (
      filtro.busca &&
      !l.descricao.toLowerCase().includes(filtro.busca.toLowerCase())
    )
      return false
    return true
  })

  // Totais dos filtrados
  const totalReceitas = filtrados
    .filter((l) => l.tipo === 'Receita')
    .reduce((s, l) => s + l.valor, 0)
  const totalDespesas = filtrados
    .filter((l) => l.tipo === 'Despesa')
    .reduce((s, l) => s + l.valor, 0)

  const todasCategorias: (CategoriaLancamento | 'Todas')[] = [
    'Todas',
    ...CATEGORIAS_DESPESA,
    ...CATEGORIAS_RECEITA.filter((c) => !CATEGORIAS_DESPESA.includes(c)),
  ]

  const filtrosAtivos =
    filtro.tipo !== 'Todos' || filtro.categoria !== 'Todas' || filtro.busca !== ''

  return (
    <div className="min-h-screen bg-slate-50 page-content">
      {/* Header */}
      <div className="bg-indigo-600 pt-12 pb-5 px-4">
        <h1 className="text-white text-xl font-bold">Histórico</h1>
        <p className="text-indigo-200 text-sm mt-0.5 capitalize">
          {nomeMes(mes, ano)}
        </p>
      </div>

      {/* Navegação de mês */}
      <NavMes
        ano={ano}
        mes={mes}
        onChange={(a, m) => {
          setAno(a)
          setMes(m)
        }}
      />

      {/* Barra de busca + filtro */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={filtro.busca}
              onChange={(e) => setFiltro((f) => ({ ...f, busca: e.target.value }))}
              placeholder="Buscar descrição..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`p-2.5 rounded-xl border transition-colors ${
              filtrosAtivos
                ? 'bg-indigo-100 border-indigo-300 text-indigo-600'
                : 'bg-gray-100 border-gray-200 text-gray-500'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Painel de filtros */}
        {mostrarFiltros && (
          <div className="mt-3 space-y-3 pb-2">
            {/* Tipo */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tipo
              </p>
              <div className="flex gap-2">
                {(['Todos', 'Receita', 'Despesa'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFiltro((f) => ({ ...f, tipo: t }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filtro.tipo === t
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Categoria
              </p>
              <div className="flex flex-wrap gap-2">
                {todasCategorias.map((c) => (
                  <button
                    key={c}
                    onClick={() =>
                      setFiltro((f) => ({ ...f, categoria: c as CategoriaLancamento | 'Todas' }))
                    }
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      filtro.categoria === c
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Limpar filtros */}
            {filtrosAtivos && (
              <button
                onClick={() =>
                  setFiltro({ tipo: 'Todos', categoria: 'Todas', busca: '' })
                }
                className="flex items-center gap-1.5 text-sm text-red-500 font-medium"
              >
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-3 space-y-3">
        {/* Resumo rápido */}
        {!buscando && filtrados.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide">
                Receitas
              </p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatarMoeda(totalReceitas)}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-xs text-red-500 font-medium uppercase tracking-wide">
                Despesas
              </p>
              <p className="text-sm font-bold text-red-600 mt-0.5">
                {formatarMoeda(totalDespesas)}
              </p>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {erro}
          </div>
        )}

        {/* Carregando */}
        {buscando && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Lista */}
        {!buscando && (
          <>
            <p className="text-xs text-gray-400 font-medium">
              {filtrados.length} lançamento{filtrados.length !== 1 ? 's' : ''}
            </p>
            <div className="space-y-2 pb-4">
              {filtrados.map((l) => (
                <ItemLancamento
                  key={l.id}
                  lancamento={l}
                  onDeletar={handleDeletar}
                />
              ))}
            </div>

            {filtrados.length === 0 && !erro && (
              <div className="flex flex-col items-center py-12 text-center">
                <Search size={40} className="text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">
                  {filtrosAtivos ? 'Nenhum resultado para os filtros.' : 'Nenhum lançamento neste mês.'}
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
