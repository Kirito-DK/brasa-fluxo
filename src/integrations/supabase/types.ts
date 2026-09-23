export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      clientes: {
        Row: {
          criado_em: string
          demo: boolean
          endereco: string | null
          id: string
          instagram: string | null
          nome: string
          observacoes: string | null
          whatsapp: string | null
        }
        Insert: {
          criado_em?: string
          demo?: boolean
          endereco?: string | null
          id?: string
          instagram?: string | null
          nome: string
          observacoes?: string | null
          whatsapp?: string | null
        }
        Update: {
          criado_em?: string
          demo?: boolean
          endereco?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          observacoes?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          atualizado_em: string
          criado_em: string
          id: string
          nome_empresa: string
          percentual_lucro_padrao: number
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome_empresa?: string
          percentual_lucro_padrao?: number
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          id?: string
          nome_empresa?: string
          percentual_lucro_padrao?: number
        }
        Relationships: []
      }
      custos_materiais: {
        Row: {
          criado_em: string
          custo_unitario: number
          id: string
          material_id: string
          observacao: string | null
          quantidade_comprada: number
          valor_pago: number
          vigente_desde: string
        }
        Insert: {
          criado_em?: string
          custo_unitario?: number
          id?: string
          material_id: string
          observacao?: string | null
          quantidade_comprada?: number
          valor_pago?: number
          vigente_desde?: string
        }
        Update: {
          criado_em?: string
          custo_unitario?: number
          id?: string
          material_id?: string
          observacao?: string | null
          quantidade_comprada?: number
          valor_pago?: number
          vigente_desde?: string
        }
        Relationships: [
          {
            foreignKeyName: "custos_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_pedidos: {
        Row: {
          criado_em: string
          detalhe: string | null
          evento: string
          id: string
          orcamento_id: string | null
          pedido_id: string | null
        }
        Insert: {
          criado_em?: string
          detalhe?: string | null
          evento: string
          id?: string
          orcamento_id?: string | null
          pedido_id?: string | null
        }
        Update: {
          criado_em?: string
          detalhe?: string | null
          evento?: string
          id?: string
          orcamento_id?: string | null
          pedido_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_pedidos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_pedidos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      kit_componentes: {
        Row: {
          descricao: string
          id: string
          kit_id: string
          material_id: string | null
          produto_id: string | null
          quantidade: number
        }
        Insert: {
          descricao: string
          id?: string
          kit_id: string
          material_id?: string | null
          produto_id?: string | null
          quantidade?: number
        }
        Update: {
          descricao?: string
          id?: string
          kit_id?: string
          material_id?: string | null
          produto_id?: string | null
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "kit_componentes_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_componentes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kit_componentes_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      kits: {
        Row: {
          criado_em: string
          demo: boolean
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          criado_em?: string
          demo?: boolean
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          criado_em?: string
          demo?: boolean
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      materiais: {
        Row: {
          categoria: string
          criado_em: string
          custo_unitario: number
          demo: boolean
          estoque_minimo: number
          fornecedor: string | null
          id: string
          nome: string
          observacoes: string | null
          quantidade_atual: number
          unidade: string
        }
        Insert: {
          categoria?: string
          criado_em?: string
          custo_unitario?: number
          demo?: boolean
          estoque_minimo?: number
          fornecedor?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          quantidade_atual?: number
          unidade?: string
        }
        Update: {
          categoria?: string
          criado_em?: string
          custo_unitario?: number
          demo?: boolean
          estoque_minimo?: number
          fornecedor?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          quantidade_atual?: number
          unidade?: string
        }
        Relationships: []
      }
      movimentacoes_estoque: {
        Row: {
          criado_em: string
          id: string
          material_id: string
          observacao: string | null
          pedido_id: string | null
          quantidade: number
          tipo: string
        }
        Insert: {
          criado_em?: string
          id?: string
          material_id: string
          observacao?: string | null
          pedido_id?: string | null
          quantidade?: number
          tipo?: string
        }
        Update: {
          criado_em?: string
          id?: string
          material_id?: string
          observacao?: string | null
          pedido_id?: string | null
          quantidade?: number
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_itens: {
        Row: {
          categoria: string
          cor: string | null
          criado_em: string
          custo_total: number
          custo_unitario: number
          descricao: string
          essencia: string | null
          formato: string | null
          foto_url: string | null
          id: string
          kit_id: string | null
          observacoes: string | null
          orcamento_id: string
          personalizacao: string | null
          produto_id: string | null
          quantidade: number
          tamanho: string | null
          texto: string | null
        }
        Insert: {
          categoria?: string
          cor?: string | null
          criado_em?: string
          custo_total?: number
          custo_unitario?: number
          descricao?: string
          essencia?: string | null
          formato?: string | null
          foto_url?: string | null
          id?: string
          kit_id?: string | null
          observacoes?: string | null
          orcamento_id: string
          personalizacao?: string | null
          produto_id?: string | null
          quantidade?: number
          tamanho?: string | null
          texto?: string | null
        }
        Update: {
          categoria?: string
          cor?: string | null
          criado_em?: string
          custo_total?: number
          custo_unitario?: number
          descricao?: string
          essencia?: string | null
          formato?: string | null
          foto_url?: string | null
          id?: string
          kit_id?: string | null
          observacoes?: string | null
          orcamento_id?: string
          personalizacao?: string | null
          produto_id?: string | null
          quantidade?: number
          tamanho?: string | null
          texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamento_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          canal: string
          cliente_id: string | null
          criado_em: string
          custo_materiais: number
          custo_total: number
          data: string
          data_entrega_desejada: string | null
          demo: boolean
          id: string
          numero: number
          observacoes: string | null
          outros_custos_valor: number
          percentual_lucro: number
          preco_final: number
          preco_manual: boolean
          preco_sugerido: number
          status: string
        }
        Insert: {
          canal?: string
          cliente_id?: string | null
          criado_em?: string
          custo_materiais?: number
          custo_total?: number
          data?: string
          data_entrega_desejada?: string | null
          demo?: boolean
          id?: string
          numero?: number
          observacoes?: string | null
          outros_custos_valor?: number
          percentual_lucro?: number
          preco_final?: number
          preco_manual?: boolean
          preco_sugerido?: number
          status?: string
        }
        Update: {
          canal?: string
          cliente_id?: string | null
          criado_em?: string
          custo_materiais?: number
          custo_total?: number
          data?: string
          data_entrega_desejada?: string | null
          demo?: boolean
          id?: string
          numero?: number
          observacoes?: string | null
          outros_custos_valor?: number
          percentual_lucro?: number
          preco_final?: number
          preco_manual?: boolean
          preco_sugerido?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      outros_custos: {
        Row: {
          criado_em: string
          id: string
          no_custo_interno: boolean
          nome: string
          repassado_cliente: boolean
          tipo: string
          valor: number
        }
        Insert: {
          criado_em?: string
          id?: string
          no_custo_interno?: boolean
          nome: string
          repassado_cliente?: boolean
          tipo?: string
          valor?: number
        }
        Update: {
          criado_em?: string
          id?: string
          no_custo_interno?: boolean
          nome?: string
          repassado_cliente?: boolean
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          criado_em: string
          data: string
          forma: string | null
          id: string
          observacao: string | null
          pedido_id: string
          valor: number
        }
        Insert: {
          criado_em?: string
          data?: string
          forma?: string | null
          id?: string
          observacao?: string | null
          pedido_id: string
          valor?: number
        }
        Update: {
          criado_em?: string
          data?: string
          forma?: string | null
          id?: string
          observacao?: string | null
          pedido_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_checklist: {
        Row: {
          concluido: boolean
          concluido_em: string | null
          etapa: string
          id: string
          ordem: number
          pedido_id: string
        }
        Insert: {
          concluido?: boolean
          concluido_em?: string | null
          etapa: string
          id?: string
          ordem?: number
          pedido_id: string
        }
        Update: {
          concluido?: boolean
          concluido_em?: string | null
          etapa?: string
          id?: string
          ordem?: number
          pedido_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pedido_checklist_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedido_itens: {
        Row: {
          categoria: string
          cor: string | null
          criado_em: string
          custo_total: number
          custo_unitario: number
          descricao: string
          essencia: string | null
          formato: string | null
          foto_url: string | null
          id: string
          kit_id: string | null
          observacoes: string | null
          pedido_id: string
          personalizacao: string | null
          produto_id: string | null
          quantidade: number
          quantidade_produzida: number
          status_producao: string
          tamanho: string | null
          texto: string | null
        }
        Insert: {
          categoria?: string
          cor?: string | null
          criado_em?: string
          custo_total?: number
          custo_unitario?: number
          descricao?: string
          essencia?: string | null
          formato?: string | null
          foto_url?: string | null
          id?: string
          kit_id?: string | null
          observacoes?: string | null
          pedido_id: string
          personalizacao?: string | null
          produto_id?: string | null
          quantidade?: number
          quantidade_produzida?: number
          status_producao?: string
          tamanho?: string | null
          texto?: string | null
        }
        Update: {
          categoria?: string
          cor?: string | null
          criado_em?: string
          custo_total?: number
          custo_unitario?: number
          descricao?: string
          essencia?: string | null
          formato?: string | null
          foto_url?: string | null
          id?: string
          kit_id?: string | null
          observacoes?: string | null
          pedido_id?: string
          personalizacao?: string | null
          produto_id?: string | null
          quantidade?: number
          quantidade_produzida?: number
          status_producao?: string
          tamanho?: string | null
          texto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pedido_itens_kit_id_fkey"
            columns: ["kit_id"]
            isOneToOne: false
            referencedRelation: "kits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedido_itens_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos: {
        Row: {
          canal: string
          cliente_id: string | null
          criado_em: string
          custo_materiais: number
          custo_total: number
          data: string
          data_entrega: string | null
          demo: boolean
          entrega_observacao: string | null
          entregue_em: string | null
          estoque_baixado: boolean
          forma_pagamento: string | null
          id: string
          numero: number
          observacoes: string | null
          orcamento_id: string | null
          status: string
          valor_total: number
        }
        Insert: {
          canal?: string
          cliente_id?: string | null
          criado_em?: string
          custo_materiais?: number
          custo_total?: number
          data?: string
          data_entrega?: string | null
          demo?: boolean
          entrega_observacao?: string | null
          entregue_em?: string | null
          estoque_baixado?: boolean
          forma_pagamento?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          orcamento_id?: string | null
          status?: string
          valor_total?: number
        }
        Update: {
          canal?: string
          cliente_id?: string | null
          criado_em?: string
          custo_materiais?: number
          custo_total?: number
          data?: string
          data_entrega?: string | null
          demo?: boolean
          entrega_observacao?: string | null
          entregue_em?: string | null
          estoque_baixado?: boolean
          forma_pagamento?: string | null
          id?: string
          numero?: number
          observacoes?: string | null
          orcamento_id?: string | null
          status?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria: string
          criado_em: string
          demo: boolean
          descricao: string | null
          ficha_tecnica: string | null
          id: string
          nome: string
          preco_venda: number
        }
        Insert: {
          ativo?: boolean
          categoria?: string
          criado_em?: string
          demo?: boolean
          descricao?: string | null
          ficha_tecnica?: string | null
          id?: string
          nome: string
          preco_venda?: number
        }
        Update: {
          ativo?: boolean
          categoria?: string
          criado_em?: string
          demo?: boolean
          descricao?: string | null
          ficha_tecnica?: string | null
          id?: string
          nome?: string
          preco_venda?: number
        }
        Relationships: []
      }
      receita_materiais: {
        Row: {
          id: string
          material_id: string
          quantidade: number
          receita_id: string
        }
        Insert: {
          id?: string
          material_id: string
          quantidade?: number
          receita_id: string
        }
        Update: {
          id?: string
          material_id?: string
          quantidade?: number
          receita_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receita_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materiais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receita_materiais_receita_id_fkey"
            columns: ["receita_id"]
            isOneToOne: false
            referencedRelation: "receitas"
            referencedColumns: ["id"]
          },
        ]
      }
      receitas: {
        Row: {
          criado_em: string
          id: string
          nome: string
          produto_id: string
          rendimento: number
        }
        Insert: {
          criado_em?: string
          id?: string
          nome?: string
          produto_id: string
          rendimento?: number
        }
        Update: {
          criado_em?: string
          id?: string
          nome?: string
          produto_id?: string
          rendimento?: number
        }
        Relationships: [
          {
            foreignKeyName: "receitas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
