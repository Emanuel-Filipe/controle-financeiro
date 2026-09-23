export type TipoLancamento = 'Receita' | 'Despesa'

export type CategoriaLancamento =
  | 'Moradia'
  | 'Alimentação'
  | 'Transporte'
  | 'Saúde'
  | 'Educação'
  | 'Lazer'
  | 'Assinaturas'
  | 'Compras'
  | 'Dívidas'
  | 'Investimentos/Reserva'
  | 'Impostos/Taxas'
  | 'Salário'
  | 'Outros'

export type FormaPagamento =
  | 'Pix'
  | 'Débito'
  | 'Crédito'
  | 'Dinheiro'
  | 'Boleto'
  | 'Transferência'
  | 'Outro'

export type StatusLancamento = 'Pago' | 'Pendente' | 'Recebido' | 'Previsto'

export interface Lancamento {
  id: string
  data: string          // ISO date string YYYY-MM-DD
  descricao: string
  tipo: TipoLancamento
  categoria: CategoriaLancamento
  forma_pagamento: FormaPagamento
  valor: number
  status: StatusLancamento
  observacao?: string
  comprovante_url?: string
  created_at?: string
}

export interface LancamentoForm {
  data: string
  descricao: string
  tipo: TipoLancamento
  categoria: CategoriaLancamento
  forma_pagamento: FormaPagamento
  valor: string
  status: StatusLancamento
  observacao: string
}

export interface ResumoMes {
  receitas: number
  despesas: number
  saldo: number
}

export interface GastoCategoria {
  categoria: CategoriaLancamento
  total: number
  cor: string
}

export const CATEGORIAS_DESPESA: CategoriaLancamento[] = [
  'Moradia',
  'Alimentação',
  'Transporte',
  'Saúde',
  'Educação',
  'Lazer',
  'Assinaturas',
  'Compras',
  'Dívidas',
  'Investimentos/Reserva',
  'Impostos/Taxas',
  'Outros',
]

export const CATEGORIAS_RECEITA: CategoriaLancamento[] = [
  'Salário',
  'Investimentos/Reserva',
  'Outros',
]

export const FORMAS_PAGAMENTO: FormaPagamento[] = [
  'Pix',
  'Débito',
  'Crédito',
  'Dinheiro',
  'Boleto',
  'Transferência',
  'Outro',
]

export const STATUS_OPTIONS: StatusLancamento[] = [
  'Pago',
  'Pendente',
  'Recebido',
  'Previsto',
]

export const CORES_CATEGORIA: Record<string, string> = {
  Moradia: '#6366f1',
  Alimentação: '#f59e0b',
  Transporte: '#3b82f6',
  Saúde: '#10b981',
  Educação: '#8b5cf6',
  Lazer: '#ec4899',
  Assinaturas: '#14b8a6',
  Compras: '#f97316',
  Dívidas: '#ef4444',
  'Investimentos/Reserva': '#22c55e',
  'Impostos/Taxas': '#64748b',
  Salário: '#22c55e',
  Outros: '#94a3b8',
}

// ─── Lista de Desejos ─────────────────────────────────────────────────────────

export type Prioridade = 'Alta' | 'Normal' | 'Baixa'

export interface ItemDesejo {
  id: string
  nome: string
  valor_estimado?: number | null
  prioridade: Prioridade
  concluido: boolean
  observacao?: string | null
  created_at?: string
}

export const PRIORIDADES: Prioridade[] = ['Alta', 'Normal', 'Baixa']

export const COR_PRIORIDADE: Record<Prioridade, string> = {
  Alta:   'var(--red)',
  Normal: 'var(--accent)',
  Baixa:  'var(--text-muted)',
}

export const BG_PRIORIDADE: Record<Prioridade, string> = {
  Alta:   'var(--red-soft)',
  Normal: 'var(--accent-soft)',
  Baixa:  'var(--bg-card-hover)',
}
