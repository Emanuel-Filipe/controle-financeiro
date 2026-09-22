'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal, X, Receipt } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentosComComprovante } from '@/lib/supabase'
import {
  Lancamento,
  TipoLancamento,
  CategoriaLancamento,
  CATEGORIAS_DESPESA,
  CATEGORIAS_RECEITA,
} from '@/lib/types'
import { formatarMoeda, formatarData, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import ModalComprovante from '@/components/ModalComprovante'

type Filtro = {
  busca: string
  tipo: TipoLancamento | 'Todos'
  categoria: CategoriaLancamento | 'Todas'
  mes: number | 0   // 0 = todos os meses
  ano: number
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
  const [filtro, setFiltro] = useState<Filtro>({
    busca: '',
    tipo: 'Todos',
    categoria: 'Todas',
    mes: mesAtualNum,
    ano: anoAtual,
  })

  useEffect(() => {
    if (!carregando && !autenticado) router.replace('/login')
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true)
    setErro('')
    try {
      const dados = await getLancamentosComComprovante()
      setLancamentos(dados)
    } catch (e) {
      console.error(e)
      setErro('Erro ao carregar comprovantes.')
    } finally {
      setBuscando(false)
    }
  }, [])

  useEffect(() => {
    if (autenticado) buscarDados()
  }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  // Aplica filtros
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

  const filtrosAtivos =
    filtro.tipo !== 'Todos' ||
    filtro.categoria !== 'Todas' ||
    filtro.busca !== '' ||
    filtro.mes !== mesAtualNum

  const todasCategorias: (CategoriaLancamento | 'Todas')[] = [
    'Todas',
    ...CATEGORIAS_DESPESA,
    ...CATEGORIAS_RECEITA.filter((c) => !CATEGORIAS_DESPESA.includes(c)),
  ]

  // Meses disponíveis baseados nos dados reais
  const mesesDisponiveis = Array.from(
    new Set(lancamentos.map((l) => {
      const [ano, mes] = l.data.split('-').map(Number)
      return `${ano}-${mes}`
    }))
  ).sort((a, b) => b.localeCompare(a))

  return (
    <div className="min-h-screen bg-slate-50 page-content">
      {/* Header */}
      <div className="bg-indigo-600 pt-12 pb-5 px-4">
        <h1 className="text-white text-xl font-bold">Comprovantes</h1>
        <p className="text-indigo-200 text-sm mt-0.5">
          {buscando ? '...' : `${lancamentos.length} comprovante${lancamentos.length !== 1 ? 's' : ''} no total`}
        </p>
      </div>

      {/* Barra de busca + filtro */}
      <div className="px-4 pt-3 pb-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filtro.busca}
              onChange={(e) => setFiltro((f) => ({ ...f, busca: e.target.value }))}
              placeholder="Buscar por descrição..."
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
            {/* Mês */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Mês</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setFiltro((f) => ({ ...f, mes: 0 }))}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    filtro.mes === 0 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Todos
                </button>
                {mesesDisponiveis.map((key) => {
                  const [ano, mes] = key.split('-').map(Number)
                  return (
                    <button
                      key={key}
                      onClick={() => setFiltro((f) => ({ ...f, mes, ano }))}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                        filtro.mes === mes && filtro.ano === ano
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {nomeMes(mes, ano)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tipo */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Tipo</p>
              <div className="flex gap-2">
                {(['Todos', 'Receita', 'Despesa'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setFiltro((f) => ({ ...f, tipo: t }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      filtro.tipo === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Categoria */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2">
                {todasCategorias.map((c) => (
                  <button
                    key={c}
                    onClick={() => setFiltro((f) => ({ ...f, categoria: c as CategoriaLancamento | 'Todas' }))}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      filtro.categoria === c ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {filtrosAtivos && (
              <button
                onClick={() => setFiltro({ busca: '', tipo: 'Todos', categoria: 'Todas', mes: mesAtualNum, ano: anoAtual })}
                className="flex items-center gap-1.5 text-sm text-red-500 font-medium"
              >
                <X size={14} /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      <div className="px-4 pt-3">
        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600 mb-3">
            {erro}
          </div>
        )}

        {/* Carregando */}
        {buscando && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Contagem */}
        {!buscando && (
          <p className="text-xs text-gray-400 font-medium mb-3">
            {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
          </p>
        )}

        {/* Grade de comprovantes */}
        {!buscando && filtrados.length > 0 && (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {filtrados.map((l) => (
              <CardComprovante
                key={l.id}
                lancamento={l}
                onClick={() => setSelecionado(l)}
              />
            ))}
          </div>
        )}

        {/* Estado vazio */}
        {!buscando && filtrados.length === 0 && !erro && (
          <div className="flex flex-col items-center py-16 text-center">
            <Receipt size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">
              {filtrosAtivos ? 'Nenhum resultado para os filtros.' : 'Nenhum comprovante ainda.'}
            </p>
            {!filtrosAtivos && (
              <p className="text-gray-400 text-sm mt-1">
                Anexe fotos ao fazer um lançamento.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Modal de visualização */}
      {selecionado?.comprovante_url && (
        <ModalComprovante
          aberto={!!selecionado}
          url={selecionado.comprovante_url}
          lancamento={selecionado}
          onFechar={() => setSelecionado(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}

// ─── Card da galeria ──────────────────────────────────────────────────────────

function CardComprovante({
  lancamento,
  onClick,
}: {
  lancamento: Lancamento
  onClick: () => void
}) {
  const ehReceita = lancamento.tipo === 'Receita'

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 active:scale-95 transition-transform text-left"
    >
      {/* Miniatura */}
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={lancamento.comprovante_url!}
          alt={`Comprovante ${lancamento.descricao}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-xs font-semibold text-gray-800 truncate">{lancamento.descricao}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{formatarData(lancamento.data)}</p>
        <p className={`text-xs font-bold mt-1 ${ehReceita ? 'text-emerald-600' : 'text-red-500'}`}>
          {ehReceita ? '+' : '-'} {formatarMoeda(lancamento.valor)}
        </p>
        <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-500 rounded-full px-1.5 py-0.5 truncate max-w-full">
          {lancamento.categoria}
        </span>
      </div>
    </button>
  )
}
