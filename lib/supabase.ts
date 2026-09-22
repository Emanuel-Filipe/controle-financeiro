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

// ─── Storage de Comprovantes ─────────────────────────────────────────────────

const BUCKET = 'comprovantes'

export async function uploadComprovante(
  arquivo: File,
  lancamentoId: string
): Promise<string> {
  const ext = arquivo.name.split('.').pop() ?? 'jpg'
  const caminho = `${lancamentoId}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, arquivo, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho)
  return data.publicUrl
}

export async function deletarComprovante(url: string): Promise<void> {
  // Extrai o caminho relativo da URL pública
  const partes = url.split(`/${BUCKET}/`)
  if (partes.length < 2) return
  const caminho = partes[1]

  const { error } = await supabase.storage.from(BUCKET).remove([caminho])
  if (error) throw error
}

export async function getLancamentosComComprovante(): Promise<import('./types').Lancamento[]> {
  const { data, error } = await supabase
    .from('lancamentos')
    .select('*')
    .not('comprovante_url', 'is', null)
    .order('data', { ascending: false })

  if (error) throw error
  return data ?? []
}
