/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Seller, Sale, SaleCategory, PaymentMethod } from './types';

// Formatar valor para Real Brasileiro (BRL)
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Obter todos os dias do mês no formato YYYY-MM-DD
export function getDaysInMonth(year: number, month: number): string[] {
  // month é 1-indexed (1-12)
  const date = new Date(year, month - 1, 1);
  const days: string[] = [];
  while (date.getMonth() === month - 1) {
    const dayStr = String(date.getDate()).padStart(2, '0');
    const monthStr = String(month).padStart(2, '0');
    days.push(`${year}-${monthStr}-${dayStr}`);
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Formatar data ISO para exibição (DD/MM/YYYY ou apenas DD)
export function formatDateDisplay(dateStr: string, short = false): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return short ? day : `${day}/${month}/${year}`;
}

// Obter o nome do dia da semana (Seg, Ter, etc.)
export function getWeekdayName(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00'); // evitar fuso horário descarrilar o dia
  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  return weekdays[date.getDay()];
}

// Obter os nomes dos meses em português
export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

// Gerar dados iniciais/demonstrativos
export function generateInitialData() {
  const defaultSellers: Seller[] = [
    { id: 'sel-1', name: 'Marcos Vinícius', commissionPercent: 10 },
    { id: 'sel-2', name: 'Ana Beatriz', commissionPercent: 8 },
    { id: 'sel-3', name: 'Lucas Silva', commissionPercent: 5 },
  ];

  // Vamos colocar as vendas padrão no mês atual do sistema
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-indexed
  const monthStr = String(month).padStart(2, '0');

  // Criar algumas vendas espalhadas pelo mês
  const defaultSales: Sale[] = [
    {
      id: 'sale-1',
      date: `${year}-${monthStr}-02`,
      sellerId: 'sel-1',
      category: 'Serviço Celular',
      description: 'Troca de Tela iPhone 13 Pro Max',
      price: 850,
      quantity: 1,
      value: 850,
      paymentMethod: 'Pix',
    },
    {
      id: 'sale-2',
      date: `${year}-${monthStr}-02`,
      sellerId: 'sel-2',
      category: 'Serviço Informática',
      description: 'Formatação e Instalação de SSD 480GB',
      price: 280,
      quantity: 1,
      value: 280,
      paymentMethod: 'Cartão de Crédito',
    },
    {
      id: 'sale-3',
      date: `${year}-${monthStr}-05`,
      sellerId: 'sel-3',
      category: 'Serviço Externo',
      description: 'Instalação de Rede Cabeada Comercial',
      price: 1200,
      quantity: 1,
      value: 1200,
      paymentMethod: 'Pix',
    },
    {
      id: 'sale-4',
      date: `${year}-${monthStr}-10`,
      sellerId: 'sel-1',
      category: 'Serviço Informática',
      description: 'Limpeza Preventiva e Pasta Térmica (x2)',
      price: 120,
      quantity: 2,
      value: 240,
      paymentMethod: 'Dinheiro',
    },
    {
      id: 'sale-5',
      date: `${year}-${monthStr}-12`,
      sellerId: 'sel-2',
      category: 'Serviço Celular',
      description: 'Troca de Bateria Samsung S21',
      price: 320,
      quantity: 1,
      value: 320,
      paymentMethod: 'Cartão de Débito',
    },
    {
      id: 'sale-6',
      date: `${year}-${monthStr}-15`,
      sellerId: 'sel-1',
      category: 'Serviço Externo',
      description: 'Configuração de Servidor Local e Backup',
      price: 1500,
      quantity: 1,
      value: 1500,
      paymentMethod: 'Pix',
    },
    {
      id: 'sale-7',
      date: `${year}-${monthStr}-18`,
      sellerId: 'sel-3',
      category: 'Outros',
      description: 'Venda de Roteador Wi-Fi 6 TP-Link',
      price: 450,
      quantity: 1,
      value: 450,
      paymentMethod: 'Cartão de Crédito',
    },
    {
      id: 'sale-8',
      date: `${year}-${monthStr}-20`,
      sellerId: 'sel-2',
      category: 'Serviço Celular',
      description: 'Reparo de Conector de Carga Moto G60',
      price: 180,
      quantity: 1,
      value: 180,
      paymentMethod: 'Pix',
    }
  ];

  return { defaultSellers, defaultSales };
}
