export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export function formatarData(dataIso: string): string {
  const [ano, mes, dia] = dataIso.split('-')
  return `${dia}/${mes}/${ano}`
}

export function mesAtual(): { ano: number; mes: number } {
  const hoje = new Date()
  return { ano: hoje.getFullYear(), mes: hoje.getMonth() + 1 }
}

export function nomeMes(mes: number, ano: number): string {
  return new Date(ano, mes - 1, 1).toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })
}

export function dataHoje(): string {
  const hoje = new Date()
  return hoje.toISOString().split('T')[0]
}

export function mesAnterior(ano: number, mes: number): { ano: number; mes: number } {
  if (mes === 1) return { ano: ano - 1, mes: 12 }
  return { ano, mes: mes - 1 }
}

export function mesSeguinte(ano: number, mes: number): { ano: number; mes: number } {
  if (mes === 12) return { ano: ano + 1, mes: 1 }
  return { ano, mes: mes + 1 }
}

export function classeValor(tipo: string): string {
  return tipo === 'Receita' ? 'text-emerald-600' : 'text-red-500'
}
