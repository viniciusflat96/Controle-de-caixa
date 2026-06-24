/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Seller {
  id: string;
  name: string;
  commissionPercent: number; // Porcentagem (ex: 5 para 5%)
}

export type SaleCategory = 'Serviço Informática' | 'Serviço Celular' | 'Serviço Externo' | 'Outros';

export type PaymentMethod = 'Dinheiro' | 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Outro';

export type OSStatus = 'Nova' | 'Orçamento' | 'Aprovada' | 'Em Reparo' | 'Pronta' | 'Entregue' | 'Sem Conserto';

export interface ServiceOrder {
  id: string;
  osNumber: string; // Ex: OS-0001
  createdAt: string; // Data de criação
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  clientCpf?: string;
  device: string;
  model: string;
  patternLock?: number[]; // Array dos números de 1 a 9 desenhados no padrão
  textPassword?: string;
  accessories?: string;
  notes?: string;
  defect: string; // Máx 600 caracteres
  budget: string; // Máx 300 caracteres
  whatWasDone: string; // Máx 500 caracteres
  status: OSStatus;
  value: number; // Valor total do serviço
  technicianId?: string; // Vendedor/Técnico responsável
}

export interface Sale {
  id: string;
  date: string; // Formato YYYY-MM-DD
  sellerId: string;
  category: SaleCategory;
  description: string;
  price: number; // Preço unitário
  quantity: number; // Quantidade
  value: number; // Preço * Quantidade (Valor total)
  paymentMethod: PaymentMethod;
}

export interface MonthlyStats {
  totalRevenue: number;
  revenueByDay: { [day: string]: number };
  revenueByPaymentMethod: { [method in PaymentMethod]?: number };
  revenueByCategory: { [category in SaleCategory]?: number };
  commissionBySeller: { [sellerId: string]: { sellerName: string; salesTotal: number; commission: number } };
}
