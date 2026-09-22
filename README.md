# 💰 Controle Financeiro Familiar

App de controle financeiro pessoal para uso exclusivo da família.  
Construído com **Next.js 16**, **Supabase** e **Tailwind CSS**. Deploy gratuito na **Vercel**.

---

## ✅ Funcionalidades

- **Dashboard** — saldo do mês, receitas, despesas e gráfico por categoria
- **Lançamento rápido** — otimizado para celular, salva com poucos toques
- **Histórico** — lista com busca e filtros por tipo e categoria
- **Proteção por senha** — acesso restrito via senha única compartilhada
- **Dados sincronizados** — qualquer alteração aparece em todos os dispositivos em tempo real

---

## 🚀 Como fazer o deploy (passo a passo)

### 1. Criar o banco de dados no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta gratuita
2. Clique em **New Project** e preencha:
   - Nome: `controle-financeiro`
   - Senha do banco: anote em local seguro
   - Região: escolha a mais próxima (ex: South America)
3. Aguarde o projeto ser criado (~1 min)
4. Vá em **SQL Editor** (menu lateral) e cole o conteúdo do arquivo `supabase/schema.sql`
5. Clique em **Run** para criar a tabela
6. Vá em **Project Settings → API** e copie:
   - `Project URL` → será o `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → será o `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### 2. Subir o código no GitHub

1. Acesse [github.com](https://github.com) e crie uma conta (se não tiver)
2. Crie um **novo repositório** (pode ser privado)
3. No terminal, dentro da pasta `controle-financeiro`, execute:

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

### 3. Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e crie uma conta (use o login do GitHub)
2. Clique em **Add New → Project**
3. Selecione o repositório `controle-financeiro`
4. Antes de clicar em Deploy, expanda **Environment Variables** e adicione:

| Nome | Valor |
|------|-------|
| `NEXT_PUBLIC_APP_PASSWORD` | A senha que você e sua esposa usarão para entrar |
| `NEXT_PUBLIC_SUPABASE_URL` | A URL copiada do Supabase (passo 1) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | A chave anon copiada do Supabase (passo 1) |

5. Clique em **Deploy**
6. Após o deploy (~2 min), a Vercel fornece uma URL pública tipo `https://controle-financeiro-xyz.vercel.app`

---

### 4. Usar no celular como app

Para uma experiência de app nativo no celular:

**iPhone (Safari):**
1. Abra a URL no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. Selecione **"Adicionar à Tela de Início"**

**Android (Chrome):**
1. Abra a URL no Chrome
2. Toque no menu (três pontos)
3. Selecione **"Adicionar à tela inicial"**

---

## 🔒 Sobre a segurança

- A senha é armazenada como variável de ambiente na Vercel — nunca fica exposta no código
- A sessão dura **7 dias** — após isso, pede a senha novamente
- O banco Supabase aceita conexões apenas com a chave anon do seu projeto

---

## 💻 Desenvolvimento local

Preencha o arquivo `.env.local` com suas credenciais:

```env
NEXT_PUBLIC_APP_PASSWORD=sua_senha
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave
```

Depois rode:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

---

## 📁 Estrutura do projeto

```
controle-financeiro/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── lancar/page.tsx   # Tela de lançamento
│   ├── historico/page.tsx# Histórico com filtros
│   └── login/page.tsx    # Tela de login
├── components/           # Componentes reutilizáveis
├── context/              # Context de autenticação
├── lib/
│   ├── supabase.ts       # Queries do banco
│   ├── types.ts          # Tipos TypeScript
│   ├── auth.ts           # Lógica de sessão
│   └── utils.ts          # Funções utilitárias
└── supabase/
    └── schema.sql        # Script de criação do banco
```
