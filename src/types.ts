/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Seller {
  id: string;
  name: string;
  commissionPercent: number; // Porcentagem (ex: 5 para 5%)
  phone?: string;
  email?: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  address: string;
  service: string;
  technicianId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  notified?: boolean; // Se a notificação já foi mostrada perto do horário
}


export type SaleCategory = 'Serviço Informática' | 'Serviço Celular' | 'Serviço Externo' | 'Outros';

export type PaymentMethod = 'Dinheiro' | 'Pix' | 'Cartão de Crédito' | 'Cartão de Débito' | 'Outro';

export type OSStatus = 'Nova' | 'Orçamento' | 'Aprovada' | 'Em Reparo' | 'Pronta' | 'Entregue' | 'Sem Conserto';

export interface ServiceOrder {
  id: string;
  osNumber: string; // Ex: OS-0001
  createdAt: string; // Data de criação
  clientId?: string; // Reference to Client ID
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  clientCpf?: string;
  deviceType?: string; // Celular, Computador, etc.
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
  
  // Pedido de Peça
  partRequired?: boolean;
  partName?: string;
  partLink?: string;
  partDeliveryTime?: string;
}

export interface Product {
  id: string;
  name: string;
  stockQuantity: number;
  price: number;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  cpf?: string;
  address?: string;
  birthDate?: string; // YYYY-MM-DD
}

export interface ProtectorCompatibility {
  id: string;
  name: string; // e.g. "iPhone 11 / XR"
  compatibleModels: string[]; // e.g. ["iPhone 11", "iPhone XR"]
}

export interface AppSettings {
  id: string; // always 'main'
  themeColor: 'emerald' | 'blue' | 'indigo' | 'violet' | 'rose' | 'amber';
  deviceTypes: string[];
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
