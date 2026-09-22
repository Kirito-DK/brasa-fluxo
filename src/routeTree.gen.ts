/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AuthenticatedRouteRouteImport } from './routes/_authenticated/route'
import { Route as PainelImport } from './routes/_authenticated/painel'
import { Route as ClientesImport } from './routes/_authenticated/clientes'
import { Route as EstoqueImport } from './routes/_authenticated/estoque'
import { Route as OrcamentosImport } from './routes/_authenticated/orcamentos'
import { Route as PedidosImport } from './routes/_authenticated/pedidos'
import { Route as ProducaoImport } from './routes/_authenticated/producao'
import { Route as ProdutosImport } from './routes/_authenticated/produtos'
import { Route as FinanceiroImport } from './routes/_authenticated/financeiro'
import { Route as CalendarioImport } from './routes/_authenticated/calendario'
import { Route as ConfigImport } from './routes/_authenticated/configuracoes'
import { Route as BuscaImport } from './routes/busca'
const IndexRoute=IndexRouteImport.update({id:'/',path:'/',getParentRoute:()=>rootRouteImport} as any)
const AuthenticatedRoute=AuthenticatedRouteRouteImport.update({id:'/_authenticated',getParentRoute:()=>rootRouteImport} as any)
const PainelRoute=PainelImport.update({id:'/_authenticated/painel',path:'/painel',getParentRoute:()=>AuthenticatedRoute} as any)
const ClientesRoute=ClientesImport.update({id:'/_authenticated/clientes',path:'/clientes',getParentRoute:()=>AuthenticatedRoute} as any)
const EstoqueRoute=EstoqueImport.update({id:'/_authenticated/estoque',path:'/estoque',getParentRoute:()=>AuthenticatedRoute} as any)
const OrcamentosRoute=OrcamentosImport.update({id:'/_authenticated/orcamentos',path:'/orcamentos',getParentRoute:()=>AuthenticatedRoute} as any)
const PedidosRoute=PedidosImport.update({id:'/_authenticated/pedidos',path:'/pedidos',getParentRoute:()=>AuthenticatedRoute} as any)
const ProducaoRoute=ProducaoImport.update({id:'/_authenticated/producao',path:'/producao',getParentRoute:()=>AuthenticatedRoute} as any)
const ProdutosRoute=ProdutosImport.update({id:'/_authenticated/produtos',path:'/produtos',getParentRoute:()=>AuthenticatedRoute} as any)
const FinanceiroRoute=FinanceiroImport.update({id:'/_authenticated/financeiro',path:'/financeiro',getParentRoute:()=>AuthenticatedRoute} as any)
const CalendarioRoute=CalendarioImport.update({id:'/_authenticated/calendario',path:'/calendario',getParentRoute:()=>AuthenticatedRoute} as any)
const ConfigRoute=ConfigImport.update({id:'/_authenticated/configuracoes',path:'/configuracoes',getParentRoute:()=>AuthenticatedRoute} as any)
const BuscaRoute=BuscaImport.update({id:'/busca',path:'/busca',getParentRoute:()=>rootRouteImport} as any)
const children={PainelRoute,ClientesRoute,EstoqueRoute,OrcamentosRoute,PedidosRoute,ProducaoRoute,ProdutosRoute,FinanceiroRoute,CalendarioRoute,ConfigRoute}
const AuthenticatedRouteWithChildren=AuthenticatedRoute._addFileChildren(children)
export const routeTree=rootRouteImport._addFileChildren({IndexRoute,AuthenticatedRoute:AuthenticatedRouteWithChildren,BuscaRoute})._addFileTypes<any>()
