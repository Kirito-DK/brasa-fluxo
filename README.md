# Artesão Organizado

Crie uma aplicação web responsiva, em português do Brasil, para gerenciamento interno de uma pequena empresa de produtos artesanais personalizados.

A aplicação será usada pela proprietária, que trabalha sozinha.

A empresa produz principalmente:

Velas personalizadas

Peças de gesso personalizadas

Kits que podem combinar velas, gesso e outros componentes

Os pedidos chegam principalmente pelo WhatsApp e Instagram.

A aplicação NÃO será uma loja virtual pública e NÃO terá área de cliente. É um sistema interno para organizar orçamento, pedidos, produção, estoque, custos, pagamentos e entregas.

O objetivo principal é impedir que pedidos sejam esquecidos, facilitar a produção, controlar os materiais e calcular automaticamente os custos e preços dos produtos.

1. FLUXO PRINCIPAL

O sistema deve seguir este fluxo:

CONTATO DO CLIENTE

→ ORÇAMENTO

→ ORÇAMENTO ENVIADO

→ AGUARDANDO APROVAÇÃO

→ APROVADO

→ CONVERTIDO EM PEDIDO

→ PRODUÇÃO

→ PRONTO

→ AGUARDANDO PAGAMENTO

→ PAGO

→ ENTREGUE

Também permitir cancelamento em qualquer etapa apropriada.

Um orçamento aprovado deve poder ser convertido em pedido com um clique.

Ao converter, todos os dados do orçamento devem ser preservados e copiados para o pedido.

Não exigir que a proprietária cadastre novamente os produtos.

2. DASHBOARD

Criar uma página inicial clara e simples.

Mostrar:

Orçamentos aguardando resposta

Pedidos novos

Pedidos em produção

Pedidos próximos do prazo

Pedidos atrasados

Pedidos prontos

Pedidos aguardando pagamento

Entregas previstas para hoje

Valor total de pedidos em aberto

Valor recebido

Valor pendente

Criar uma seção "O que preciso fazer hoje".

Nessa seção mostrar:

Pedidos que precisam ser produzidos

Pedidos próximos do prazo

Pedidos atrasados

Pagamentos pendentes

Materiais abaixo do estoque mínimo

O dashboard deve priorizar informações acionáveis e não excesso de gráficos.

3. CLIENTES

Criar cadastro de clientes.

Campos:

Nome

WhatsApp

Instagram

Endereço

Observações

Cada cliente deve possuir histórico de:

Orçamentos

Pedidos

Valores pagos

Valores pendentes

Ao criar um novo orçamento, permitir selecionar um cliente existente ou cadastrar um novo.

Se o WhatsApp já existir, mostrar o cliente existente.

4. ORÇAMENTOS

Criar uma área exclusiva para orçamentos.

Cada orçamento deve possuir:

Número automático

Cliente

Data

Canal de origem

Data desejada para entrega

Produtos

Quantidades

Personalizações

Valor total

Observações

Status

Canais:

WhatsApp

Instagram

Outro

Status:

Novo

Orçamento em preparação

Enviado

Aguardando aprovação

Aprovado

Recusado

Expirado

Convertido em pedido

5. ITENS PERSONALIZADOS

Um orçamento pode ter vários itens.

Cada item deve permitir escolher uma categoria:

Vela

Gesso

Kit

Outro

O formulário deve mostrar campos diferentes dependendo da categoria.

6. VELAS

Para uma vela, permitir cadastrar:

Produto/modelo

Formato

Cor

Essência

Tamanho/peso

Quantidade

Personalização

Texto

Observações

Foto/referência

Exemplo:

Vela:

Formato: Coração

Cor: Rosa

Essência: Baunilha

Peso: 80g

Quantidade: 30

Personalização: "Maria - 15 anos"

IMPORTANTE:

Um mesmo pedido pode ter várias combinações diferentes de vela.

Exemplo:

Item 1:

30 velas coração, rosa, baunilha.

Item 2:

20 velas flor, lilás, lavanda.

Cada combinação deve ser um item independente.

7. GESSO

Para peças de gesso, permitir:

Produto/modelo

Formato

Cor

Tamanho

Quantidade

Personalização

Observações

Foto/referência

Exemplo:

30 peças de gesso:

Formato: Anjo

Cor: Branco

Tamanho: 8 cm

Também permitir várias combinações de gesso dentro do mesmo pedido.

8. KITS

Criar um sistema de composição de kits.

Um kit não deve ser tratado simplesmente como um produto único.

Um kit pode ser composto por:

Velas

Gesso

Embalagem

Etiqueta

Fita

Outros produtos

Exemplo:

KIT LEMBRANCINHA:

1 vela

1 peça de gesso

1 embalagem

1 etiqueta

Quantidade: 50 kits.

O sistema deve entender que isso representa:

50 velas

50 peças de gesso

50 embalagens

50 etiquetas.

Permitir criar modelos de kits reutilizáveis.

Ao adicionar um kit a um pedido, permitir ajustar os detalhes personalizados quando necessário.

9. PRODUTOS

Criar cadastro de produtos e modelos.

Categorias:

Velas

Gesso

Kits

Outros

Cada produto deve poder possuir uma ficha técnica.

Não criar um cadastro separado para cada combinação possível de cor e essência.

As variações devem ser escolhidas no momento do orçamento/pedido.

10. MATERIAIS E ESTOQUE

Criar controle de estoque de matérias-primas.

Exemplos:

Cera

Essências

Pavios

Corantes

Gesso

Pigmentos

Recipientes

Tampas

Etiquetas

Caixas

Sacolas

Fitas

Outros

Cada material deve possuir:

Nome

Categoria

Unidade de medida

Quantidade atual

Estoque mínimo

Custo atual

Fornecedor

Observações

Unidades possíveis:

g

kg

ml

litro

unidade

metro

11. CUSTOS DOS MATERIAIS

Esta é uma parte extremamente importante.

A proprietária NÃO deve precisar digitar os custos dos materiais em cada orçamento.

O custo deve ser cadastrado uma vez no cadastro do material.

Exemplo:

Cera:

Compra: 5 kg

Valor pago: R$ 100

Custo por grama: R$ 0,02

Essência:

Compra: 1 litro

Valor pago: R$ 80

Custo por ml: R$ 0,08

Pavio:

Compra: 100 unidades

Valor pago: R$ 20

Custo por unidade: R$ 0,20

O sistema deve calcular automaticamente o custo unitário com base na quantidade comprada e no valor pago.

12. HISTÓRICO DE CUSTOS

NUNCA alterar silenciosamente o custo utilizado em pedidos antigos.

Quando um material tiver reajuste de preço, criar uma nova versão do custo.

Exemplo:

Cera:

01/09:

R$ 0,020 por grama

01/10:

R$ 0,025 por grama

Orçamentos e pedidos novos utilizam o custo vigente.

Pedidos antigos continuam mostrando o custo utilizado no momento em que foram calculados.

Criar histórico de alterações de custos.

13. FICHA TÉCNICA / RECEITA

Criar receitas para os produtos.

Exemplo:

VELA CORAÇÃO 80G

Cera: 75g

Essência: 8ml

Pavio: 1 unidade

Corante: quantidade definida

Embalagem: 1 unidade

Etiqueta: 1 unidade

O sistema deve calcular automaticamente o custo de produção do produto.

Criar receitas diferentes para diferentes modelos de produtos.

14. CÁLCULO AUTOMÁTICO DE CUSTO

Quando um produto for adicionado a um orçamento, o sistema deve calcular:

Quantidade de produto

×

materiais necessários

×

custo atual dos materiais

Resultado:

Custo dos materiais do item.

Para um pedido com vários produtos, somar os custos.

Para kits, calcular o custo de todos os componentes.

Mostrar internamente:

Custo de materiais

Outros custos cadastrados

Custo total

Preço de venda

Lucro estimado

O custo interno NÃO deve ser exibido ao cliente.

15. PRECIFICAÇÃO

A proprietária trabalha com:

CUSTO TOTAL

+

PERCENTUAL DE LUCRO DESEJADO

PREÇO DE VENDA

Criar uma configuração de percentual padrão.

Exemplo:

Custo total: R$ 100

Percentual configurado: 50%

Calcular o preço de acordo com a regra de precificação configurada.

IMPORTANTE:

Permitir alterar o percentual padrão nas configurações.

Também permitir alterar manualmente o preço final de um orçamento específico.

Quando o preço for alterado manualmente, mostrar claramente que o preço foi ajustado manualmente.

Mostrar:

Custo interno

Percentual configurado

Preço sugerido

Preço final

Lucro estimado

Somente informações comerciais necessárias devem ser mostradas na tela do cliente; o custo interno deve permanecer privado.

16. OUTROS CUSTOS

Permitir cadastrar custos adicionais que podem fazer parte do cálculo.

Exemplos:

Mão de obra

Embalagem

Taxa

Frete

Personalização

Outros

Permitir definir se determinado custo:

Faz parte do custo interno

É repassado ao cliente

É incluído no preço final

17. PEDIDOS

Quando um orçamento for aprovado, criar o pedido automaticamente.

Cada pedido deve possuir:

Número

Cliente

Data

Data de entrega

Canal de origem

Itens

Personalizações

Valor total

Valor pago

Valor pendente

Forma de pagamento

Status

Observações

Status:

Confirmado

Aguardando produção

Em produção

Pronto

Aguardando pagamento

Pago

Entregue

Cancelado

18. PRODUÇÃO

Criar uma área específica para produção.

Mostrar os pedidos em uma visão Kanban:

AGUARDANDO PRODUÇÃO

→ EM PRODUÇÃO

→ PRONTO

→ ENTREGUE

Cada pedido deve mostrar:

Número

Cliente

Data de entrega

Produtos

Quantidades

Prioridade

Situação do prazo

Dentro de cada pedido, acompanhar cada item separadamente.

Exemplo:

Pedido #105:

Vela coração:

30 unidades

Produzidas: 30

Status: Pronto

Gesso anjo:

30 unidades

Produzidas: 18

Status: Em produção

Kit:

30 unidades

Montados: 0

Status: Aguardando

Permitir informar quantidade produzida.

19. CHECKLIST DE PRODUÇÃO

Cada pedido deve ter checklist:

Materiais separados

Produção realizada

Acabamento

Personalização

Embalagem

Conferência

Pedido pronto

Permitir marcar cada etapa.

20. CONSUMO DE ESTOQUE

Ao produzir um produto, o sistema deve conseguir calcular o consumo dos materiais baseado na ficha técnica.

Exemplo:

Pedido:

30 velas.

Ficha técnica:

75g de cera por vela.

Consumo:

2.250g de cera.

O sistema deve permitir confirmar o consumo antes de dar baixa no estoque.

Não realizar baixas automáticas irreversíveis sem confirmação.

21. ALERTAS DE ESTOQUE

Quando um material ficar abaixo do estoque mínimo, mostrar alerta no dashboard.

Exemplo:

⚠️ Cera abaixo do estoque mínimo.

Criar uma lista de materiais que precisam ser comprados.

22. PAGAMENTOS

Controlar:

Valor total

Valor pago

Valor pendente

Data do pagamento

Forma de pagamento

Observação

Permitir registrar pagamentos parciais.

Exemplo:

Pedido:

R$ 500

Pagamento 1:

R$ 200

Pagamento 2:

R$ 300

Mostrar:

Pago: R$ 500

Restante: R$ 0

Não obrigar que o pagamento aconteça antes da produção, pois atualmente o fluxo da empresa é:

Orçamento aprovado

→ Produção

→ Cliente paga

→ Entrega.

23. ENTREGA

Quando o pedido estiver pronto e o pagamento estiver confirmado, permitir marcar como:

ENTREGUE

Registrar:

Data da entrega

Observação

Pedidos entregues permanecem no histórico.

24. CALENDÁRIO

Criar calendário de produção e entrega.

Mostrar os pedidos pela data de entrega.

Destacar:

Entregas de hoje

Entregas próximas

Pedidos atrasados

Um pedido é considerado atrasado quando a data de entrega passou e ele ainda não foi entregue ou cancelado.

25. BUSCA

Criar busca global por:

Número do pedido

Nome do cliente

WhatsApp

Instagram

Produto

Criar filtros por:

Status

Período

Canal

Data de entrega

26. HISTÓRICO

Registrar automaticamente eventos importantes:

Orçamento criado

Orçamento enviado

Orçamento aprovado

Orçamento convertido em pedido

Status alterado

Pagamento registrado

Produção iniciada

Produção finalizada

Pedido entregue

Alteração de custo

Alteração de preço

Mostrar data e hora de cada evento.

27. INTERFACE

A aplicação deve ter uma aparência artesanal, elegante e profissional.

Usar uma identidade visual relacionada a velas e produtos artesanais.

Paleta sugerida:

Creme

Bege

Marrom

Terracota

Branco

Tons suaves

Não deixar a interface excessivamente corporativa.

A aplicação precisa funcionar muito bem em celular, tablet e computador.

A navegação deve ser simples porque será utilizada diariamente por uma única pessoa.

Menu principal:

Dashboard

Orçamentos

Pedidos

Produção

Produtos

Estoque

Clientes

Financeiro

Configurações

28. REGRAS IMPORTANTES

Todos os valores devem usar Real brasileiro (R$).

Datas no padrão brasileiro.

Interface totalmente em português do Brasil.

Não apagar pedidos antigos definitivamente.

Pedidos cancelados devem permanecer no histórico.

Custos antigos devem ser preservados.

Alterações de preço devem ser registradas.

O custo interno nunca deve aparecer para clientes.

Pedidos antigos não devem ter seus custos recalculados automaticamente por causa de reajustes futuros.

Confirmar ações destrutivas.

Validar todos os formulários.

Mostrar mensagens claras de sucesso e erro.

Criar estados vazios amigáveis.

Criar dados de exemplo apenas para demonstração e deixar claro que são dados de teste.

Não criar funcionalidades de e-commerce ou login de cliente nesta primeira versão.

29. BANCO DE DADOS

Criar uma estrutura de banco organizada e relacional.

Utilizar entidades/tabelas semelhantes a:

clientes

orcamentos

orcamento_itens

pedidos

pedido_itens

produtos

produto_variacoes

receitas

receita_materiais

materiais

custos_materiais

movimentacoes_estoque

pagamentos

kits

kit_componentes

historico_pedidos

configuracoes

Criar relacionamentos adequados entre as entidades.

O sistema deve preservar histórico e permitir evolução futura.

30. EXPERIÊNCIA PRINCIPAL

A aplicação deve ser construída pensando na seguinte situação:

A proprietária recebe uma mensagem no WhatsApp.

Ela abre o sistema.

Cadastra o cliente.

Cria um orçamento.

Adiciona:

30 velas

Formato: coração

Cor: rosa

Essência: baunilha

Adiciona:

30 peças de gesso

Formato: anjo

Cor: branco

Adiciona:

30 kits de embalagem.

O sistema calcula automaticamente o custo usando as fichas técnicas e os custos cadastrados.

Aplica o percentual de lucro configurado.

Mostra o preço sugerido.

A proprietária ajusta o preço se desejar.

O cliente aprova.

Ela clica em "Converter em pedido".

O pedido entra automaticamente na produção.

O sistema mostra os materiais necessários.

A proprietária produz os itens.

Registra a produção.

O pedido fica pronto.

O cliente paga.

Ela registra o pagamento.

O pedido é marcado como entregue.

Todo o histórico permanece salvo.

Esse fluxo deve ser simples, rápido e exigir o mínimo possível de digitação repetitiva.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://brasa-fluxo.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7ec056f1-5aad-4146-9670-3d01f6a5f578).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
