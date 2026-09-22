'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getLancamentos } from '@/lib/supabase'
import { Lancamento, GastoCategoria, CORES_CATEGORIA } from '@/lib/types'
import { formatarMoeda, mesAtual, nomeMes } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import NavMes from '@/components/NavMes'
import ItemLancamento from '@/components/ItemLancamento'
import GraficoCategoria from '@/components/GraficoCategoria'

// Hook para animar número
function useContador(alvo: number, duracao = 700) {
  const [valor, setValor] = useState(0)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const inicio = performance.now()
    const de = 0

    function tick(agora: number) {
      const t = Math.min((agora - inicio) / duracao, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setValor(de + (alvo - de) * ease)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [alvo, duracao])

  return valor
}

function SaldoAnimado({ valor }: { valor: number }) {
  const animado = useContador(valor)
  const positivo = valor >= 0
  return (
    <span style={{ color: positivo ? 'var(--green)' : 'var(--red)' }}>
      {formatarMoeda(animado)}
    </span>
  )
}

function SkeletonCard() {
  return <div className="skeleton h-20 w-full" />
}

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
      setErro('Erro ao carregar dados.')
    } finally {
      setBuscando(false)
    }
  }, [ano, mes])

  useEffect(() => {
    if (autenticado) buscarDados()
  }, [autenticado, buscarDados])

  if (carregando || !autenticado) return null

  const receitas = lancamentos.filter((l) => l.tipo === 'Receita').reduce((s, l) => s + l.valor, 0)
  const despesas = lancamentos.filter((l) => l.tipo === 'Despesa').reduce((s, l) => s + l.valor, 0)
  const saldo = receitas - despesas

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

  const ultimos = lancamentos.slice(0, 5)

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* Header com glow */}
      <div className="relative px-5 pt-14 pb-8 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% -10%, var(--accent-glow) 0%, transparent 70%)',
          }}
        />
        <p className="text-xs font-semibold uppercase tracking-widest mb-1 relative" style={{ color: 'var(--text-muted)' }}>
          {nomeMes(mes, ano)}
        </p>
        <div className="text-4xl font-bold tracking-tight relative">
          {buscando
            ? <span style={{ color: 'var(--text-muted)' }}>—</span>
            : <SaldoAnimado valor={saldo} />
          }
        </div>
        <p className="text-xs mt-1 relative" style={{ color: 'var(--text-secondary)' }}>
          Saldo do mês
        </p>
      </div>

      {/* NavMes */}
      <NavMes ano={ano} mes={mes} onChange={(a, m) => { setAno(a); setMes(m) }} />

      <div className="px-4 pt-4 space-y-4">
        {/* Cards receita / despesa */}
        {buscando ? (
          <div className="grid grid-cols-2 gap-3">
            <SkeletonCard /><SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            {/* Receitas */}
            <div className="card p-4" style={{ borderLeft: '3px solid var(--green)' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={14} style={{ color: 'var(--green)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Receitas</span>
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--green)' }}>{formatarMoeda(receitas)}</p>
            </div>
            {/* Despesas */}
            <div className="card p-4" style={{ borderLeft: '3px solid var(--red)' }}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} style={{ color: 'var(--red)' }} />
                <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Despesas</span>
              </div>
              <p className="text-lg font-bold" style={{ color: 'var(--red)' }}>{formatarMoeda(despesas)}</p>
            </div>
          </div>
        )}

        {/* Erro */}
        {erro && (
          <div className="card p-3 text-sm animate-fade-in" style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
            {erro}
          </div>
        )}

        {/* Gráfico de categorias */}
        {!buscando && gastosCategoria.length > 0 && (
          <div className="card p-5 animate-fade-up delay-100">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
              Gastos por categoria
            </h2>
            <GraficoCategoria dados={gastosCategoria} />
          </div>
        )}

        {/* Últimos lançamentos */}
        {!buscando && ultimos.length > 0 && (
          <div className="animate-fade-up delay-150">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                Últimos lançamentos
              </h2>
              <button
                onClick={() => router.push('/historico')}
                className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--accent)' }}
              >
                Ver todos <ArrowUpRight size={13} />
              </button>
            </div>
            <div className="space-y-2">
              {ultimos.map((l, i) => (
                <div key={l.id} className={`animate-fade-up`} style={{ animationDelay: `${i * 60}ms` }}>
                  <ItemLancamento lancamento={l} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Estado vazio */}
        {!buscando && lancamentos.length === 0 && !erro && (
          <div className="flex flex-col items-center py-16 text-center animate-fade-in">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--accent-soft)' }}
            >
              <TrendingUp size={28} style={{ color: 'var(--accent)' }} />
            </div>
            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>Nenhum lançamento</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Toque em Lançar para começar.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
