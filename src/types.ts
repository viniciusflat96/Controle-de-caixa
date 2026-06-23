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
