'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentos } from '@/lib/supabase'
import { Lancamento, GastoCategoria, CORES_CATEGORIA } from '@/lib/types'
import { formatarMoeda, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import NavMes from '@/components/NavMes'
import CardResumo from '@/components/CardResumo'
import ItemLancamento from '@/components/ItemLancamento'
import GraficoCategoria from '@/components/GraficoCategoria'

export default function DashboardPage() {
  const { autenticado, carregando } = useAuth()
  const router = useRouter()

  const { ano: anoAtual, mes: mesAtualNum } = mesAtual()
  const [ano, setAno] = useState(anoAtual)
  const [mes, setMes] = useState(mesAtualNum)
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [buscando, setBuscando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!carregando && !autenticado) {
      router.replace('/login')
    }
  }, [autenticado, carregando, router])

  const buscarDados = useCallback(async () => {
    setBuscando(true)
    setErro('')
    try {
      const dados = await getLancamentos(ano, mes)
      setLancamentos(dados)
    } catch (e) {
      console.error(e)
      setErro('Erro ao carregar dados. Verifique a conexão.')
    } finally {
      setBuscando(false)
    }
  }, [ano, mes])

  useEffect(() => {
    if (autenticado) buscarDados()
  }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  // Cálculos do resumo
  const receitas = lancamentos
    .filter((l) => l.tipo === 'Receita')
    .reduce((s, l) => s + l.valor, 0)

  const despesas = lancamentos
    .filter((l) => l.tipo === 'Despesa')
    .reduce((s, l) => s + l.valor, 0)

  const saldo = receitas - despesas

  // Gastos por categoria
  const porCategoria = lancamentos
    .filter((l) => l.tipo === 'Despesa')
    .reduce<Record<string, number>>((acc, l) => {
      acc[l.categoria] = (acc[l.categoria] ?? 0) + l.valor
      return acc
    }, {})

  const gastosCategoria: GastoCategoria[] = Object.entries(porCategoria)
    .map(([categoria, total]) => ({
      categoria: categoria as GastoCategoria['categoria'],
      total,
      cor: CORES_CATEGORIA[categoria] ?? '#94a3b8',
    }))
    .sort((a, b) => b.total - a.total)

  // Últimos 5 lançamentos
  const ultimos = lancamentos.slice(0, 5)

  return (
    <div className="min-h-screen bg-slate-50 page-content">
      {/* Header */}
      <div className="bg-indigo-600 pt-12 pb-6 px-4">
        <p className="text-indigo-200 text-sm capitalize">{nomeMes(mes, ano)}</p>
        <p className="text-white text-3xl font-bold mt-1">
          {formatarMoeda(saldo)}
        </p>
        <p className="text-indigo-200 text-xs mt-1">Saldo do mês</p>
      </div>

      {/* Navegação de mês */}
      <NavMes ano={ano} mes={mes} onChange={(a, m) => { setAno(a); setMes(m) }} />

      <div className="px-4 pt-4 space-y-4">
        {/* Cards receita/despesa */}
        <div className="grid grid-cols-2 gap-3">
          <CardResumo
            titulo="Receitas"
            valor={formatarMoeda(receitas)}
            cor="verde"
            icone={<TrendingUp size={16} />}
          />
          <CardResumo
            titulo="Despesas"
            valor={formatarMoeda(despesas)}
            cor="vermelho"
            icone={<TrendingDown size={16} />}
          />
        </div>

        {/* Saldo */}
        <CardResumo
          titulo="Saldo do mês"
          valor={formatarMoeda(saldo)}
          cor={saldo >= 0 ? 'azul' : 'vermelho'}
          icone={<Wallet size={16} />}
        />

        {/* Erro */}
        {erro && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
            {erro}
          </div>
        )}

        {/* Carregando */}
        {buscando && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Gráfico de categorias */}
        {!buscando && gastosCategoria.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-800 mb-4">Gastos por categoria</h2>
            <GraficoCategoria dados={gastosCategoria} />
          </div>
        )}

        {/* Últimos lançamentos */}
        {!buscando && ultimos.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-gray-800">Últimos lançamentos</h2>
              <button
                onClick={() => router.push('/historico')}
                className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
              >
                Ver todos <ArrowUpRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {ultimos.map((l) => (
                <ItemLancamento key={l.id} lancamento={l} />
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!buscando && lancamentos.length === 0 && !erro && (
          <div className="flex flex-col items-center py-12 text-center">
            <Wallet size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">Nenhum lançamento</p>
            <p className="text-gray-400 text-sm mt-1">
              Toque em Lançar para adicionar o primeiro.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
