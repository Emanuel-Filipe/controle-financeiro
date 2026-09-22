-- =====================================================
-- Schema do Controle Financeiro Familiar
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Tabela principal de lançamentos
create table if not exists public.lancamentos (
  id            uuid primary key default gen_random_uuid(),
  data          date not null,
  descricao     text not null,
  tipo          text not null check (tipo in ('Receita', 'Despesa')),
  categoria     text not null,
  forma_pagamento text not null,
  valor         numeric(12, 2) not null check (valor > 0),
  status        text not null check (status in ('Pago', 'Pendente', 'Recebido', 'Previsto')),
  observacao    text,
  created_at    timestamptz default now()
);

-- Coluna de comprovante (URL do arquivo no Supabase Storage)
alter table public.lancamentos add column if not exists comprovante_url text;

-- Índices para performance nas consultas por data
create index if not exists idx_lancamentos_data on public.lancamentos (data);
create index if not exists idx_lancamentos_tipo on public.lancamentos (tipo);

-- Row Level Security: desabilitado pois o app usa senha única própria
-- Se quiser habilitar RLS no futuro, adicione políticas aqui
alter table public.lancamentos disable row level security;

-- Permissões para o anon key (acesso público controlado pelo app)
grant select, insert, update, delete on public.lancamentos to anon;
grant usage on schema public to anon;

-- Política de acesso ao Storage (bucket: comprovantes)
-- Execute após criar o bucket no Supabase Storage
create policy "allow_anon_all" on storage.objects
for all to anon
using (bucket_id = 'comprovantes')
with check (bucket_id = 'comprovantes');
