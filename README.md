# Planejamento Lumme

Sistema de gestão de ateliê conectado ao Supabase/Lovable Cloud.

## Dados e login

- Login feito pelo Supabase Auth.
- Sessão permanece ativa após atualizar a página (F5), conforme a sessão do Supabase.
- Clientes, produtos, estoque, orçamentos, pedidos, pagamentos e configurações são gravados no banco do Supabase.
- O `localStorage` é usado somente pelo mecanismo de sessão/preview do Supabase quando necessário; ele não é usado como banco da aplicação.
- Se uma gravação falhar, o sistema mostra o erro em vez de fingir que os dados foram salvos.

## Como executar

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado pelo Vite, normalmente `http://localhost:5173`.

### Windows

Execute:

```text
INICIAR-PLANEJAMENTO-LUMME.bat
```

## Importante

Este projeto deve continuar conectado ao mesmo projeto Supabase/Lovable que já contém as tabelas do sistema. Não apague nem recrie o banco para usar este código.

As variáveis necessárias são:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

No Lovable Cloud, a conexão do Supabase normalmente já fornece essas variáveis.
