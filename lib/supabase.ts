import { createClient } from '@supabase/supabase-js'
import { Lancamento } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Lançamentos ────────────────────────────────────────────────────────────

export async function getLancamentos(ano: number, mes: number): Promise<Lancamento[]> {
  const inicio = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fim = `${ano}-${String(mes).padStart(2, '0')}-31`

  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .gte('data', inicio)
    .lte('data', fim)
    .order('data', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAllLancamentos(): Promise<Lancamento[]> {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .order('data', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function inserirLancamento(
  lancamento: Omit<Lancamento, 'id' | 'created_at'>
): Promise<Lancamento> {
  const { data, error } = await supabase
    .from('lancamentos')
    .insert([lancamento])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function atualizarLancamento(
  id: string,
  lancamento: Partial<Omit<Lancamento, 'id' | 'created_at'>>
): Promise<Lancamento> {
  const { data, error } = await supabase
    .from('lancamentos')
    .update(lancamento)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletarLancamento(id: string): Promise<void> {
  const { error } = await supabase
    .from('lancamentos')
    .delete()
    .eq('id', id)

  if (error) throw error
}
