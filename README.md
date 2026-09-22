# Brasa Fluxo — versão pronta para uso local

Sistema de gestão de ateliê com dados salvos no próprio navegador (localStorage). Não exige Supabase, banco externo ou configuração de servidor para começar a usar.

## O que já está funcionando

- Dashboard com indicadores
- Clientes
- Produtos, preços, custos e estoque
- Entradas e saídas de estoque
- Alertas de estoque mínimo
- Orçamentos com vários itens
- Conversão de orçamento em pedido
- Pedidos com status e data de entrega
- Quadro de produção
- Registro de pagamento e saldo a receber
- Calendário de entregas
- Busca global
- Configurações do ateliê
- Persistência automática no navegador
- Layout responsivo para computador e celular

## Como executar

Requer Node.js 20+ ou Bun.

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado pelo Vite (normalmente `http://localhost:5173`).

### Windows

Também é possível executar:

```text
INICIAR-BRASA-FLUXO.bat
```

O arquivo instala as dependências e inicia o sistema.

## Importante sobre os dados

Esta versão foi preparada para funcionar imediatamente sem serviço externo. Os dados ficam no navegador do computador em que o sistema é usado. Para usar em vários computadores ou fazer backup centralizado, será necessário conectar um banco/Supabase em uma etapa posterior.

Para apagar os dados locais e voltar ao estado inicial, use **Configurações → Apagar dados e voltar ao exemplo**.
