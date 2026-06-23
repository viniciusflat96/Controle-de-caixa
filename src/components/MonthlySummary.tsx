/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { Sale, Seller, SaleCategory, PaymentMethod } from '../types';
import { formatCurrency, getDaysInMonth, formatDateDisplay, getWeekdayName } from '../utils';
import { TrendingUp, Award, DollarSign, PieChart, Calendar, Briefcase, Percent, CheckCircle2 } from 'lucide-react';

interface MonthlySummaryProps {
  sales: Sale[];
  sellers: Seller[];
  selectedYear: number;
  selectedMonth: number;
}

export default function MonthlySummary({
  sales,
  sellers,
  selectedYear,
  selectedMonth,
}: MonthlySummaryProps) {
  
  // 1. Estatísticas Gerais
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalSalesCount = 0;
    const revenueByDay: { [dayStr: string]: number } = {};
    const salesByDay: { [dayStr: string]: number } = {};
    
    const revenueByPayment: { [method in PaymentMethod]: number } = {
      'Dinheiro': 0,
      'Pix': 0,
      'Cartão de Crédito': 0,
      'Cartão de Débito': 0,
      'Outro': 0,
    };
    
    const revenueByCategory: { [category in SaleCategory]: number } = {
      'Serviço Informática': 0,
      'Serviço Celular': 0,
      'Serviço Externo': 0,
      'Outros': 0,
    };

    const salesBySeller: { [sellerId: string]: number } = {};

    // Filtrar apenas vendas do mês/ano ativo
    const monthSales = sales.filter((s) => {
      const parts = s.date.split('-');
      return Number(parts[0]) === selectedYear && Number(parts[1]) === selectedMonth;
    });

    monthSales.forEach((sale) => {
      totalRevenue += sale.value;
      totalSalesCount += 1;
      
      // Por dia
      revenueByDay[sale.date] = (revenueByDay[sale.date] || 0) + sale.value;
      salesByDay[sale.date] = (salesByDay[sale.date] || 0) + 1;
      
      // Por pagamento
      if (sale.paymentMethod in revenueByPayment) {
        revenueByPayment[sale.paymentMethod] += sale.value;
      } else {
        revenueByPayment['Outro'] += sale.value;
      }

      // Por categoria
      if (sale.category in revenueByCategory) {
        revenueByCategory[sale.category] += sale.value;
      } else {
        revenueByCategory['Outros'] += sale.value;
      }

      // Por vendedor
      salesBySeller[sale.sellerId] = (salesBySeller[sale.sellerId] || 0) + sale.value;
    });

    // Calcular comissões de vendedores atuais
    const commissionList = sellers.map((seller) => {
      const sellerSalesTotal = salesBySeller[seller.id] || 0;
      const commissionValue = (sellerSalesTotal * seller.commissionPercent) / 100;
      return {
        id: seller.id,
        name: seller.name,
        commissionPercent: seller.commissionPercent,
        salesTotal: sellerSalesTotal,
        commission: commissionValue,
      };
    });

    return {
      totalRevenue,
      totalSalesCount,
      ticketMedio: totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0,
      revenueByDay,
      salesByDay,
      revenueByPayment,
      revenueByCategory,
      commissionList,
    };
  }, [sales, sellers, selectedYear, selectedMonth]);

  // Lista de todos os dias do mês para garantir ordenação completa no relatório diário
  const allDaysOfMonth = useMemo(() => {
    return getDaysInMonth(selectedYear, selectedMonth);
  }, [selectedYear, selectedMonth]);

  // Encontrar o maior valor diário para fins de escala no gráfico customizado
  const maxDailyRevenue = useMemo(() => {
    const values = Object.values(stats.revenueByDay) as number[];
    return values.length > 0 ? Math.max(...values, 100) : 100;
  }, [stats.revenueByDay]);

  return (
    <div className="space-y-6" id="monthly-summary-container">
      {/* Título de Cabeçalho */}
      <div className="border-b border-slate-200 pb-5">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          Resumo e Fechamento de Caixa
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Relatórios financeiros consolidados de faturamento, canais de recebimento, comissões e desempenho diário.
        </p>
      </div>

      {/* 1. CARDS DE DESTAQUE */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="stats-dashboard-cards">
        {/* Card Faturamento Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faturamento Geral</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5 font-mono">
              {formatCurrency(stats.totalRevenue)}
            </span>
          </div>
        </div>

        {/* Card Lançamentos */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Lançamentos</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5">
              {stats.totalSalesCount} {stats.totalSalesCount === 1 ? 'venda' : 'vendas'}
            </span>
          </div>
        </div>

        {/* Card Ticket Médio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Ticket Médio</span>
            <span className="text-xl font-bold text-slate-900 tracking-tight block mt-0.5 font-mono">
              {formatCurrency(stats.ticketMedio)}
            </span>
          </div>
        </div>

        {/* Card Melhor Vendedor */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Destaque do Mês</span>
            <span className="text-base font-bold text-slate-900 tracking-tight block mt-1 truncate max-w-[150px]">
              {stats.commissionList.length > 0 
                ? stats.commissionList.reduce((max, c) => (c.salesTotal > max.salesTotal ? c : max), stats.commissionList[0]).salesTotal > 0
                  ? stats.commissionList.reduce((max, c) => (c.salesTotal > max.salesTotal ? c : max), stats.commissionList[0]).name
                  : 'Nenhum'
                : 'Nenhum'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TABELA DE COMISSÃO DE VENDEDORES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="commissions-report-card">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="h-4 w-4 text-emerald-500" />
            Comissão dos Vendedores
          </h3>
          <span className="text-xs text-slate-400 font-semibold">Configurado na aba Vendedores</span>
        </div>

        {stats.commissionList.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhum vendedor cadastrado para cálculo de comissões.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-slate-600">
              <thead className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3">Vendedor</th>
                  <th scope="col" className="px-6 py-3 text-center">Comissão (%)</th>
                  <th scope="col" className="px-6 py-3 text-right">Faturamento Individual (R$)</th>
                  <th scope="col" className="px-6 py-3 text-right text-emerald-700">Comissão Devida (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {stats.commissionList.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{c.name}</td>
                    <td className="px-6 py-3.5 text-center font-medium">
                      <span className="inline-block bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-100/50">
                        {c.commissionPercent}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-mono font-semibold text-slate-900">{formatCurrency(c.salesTotal)}</td>
                    <td className="px-6 py-3.5 text-right font-mono font-bold text-emerald-600">{formatCurrency(c.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Subtotal Total Comissões */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Fechamento Consolidado</span>
          <div className="flex gap-6">
            <div>
              Faturamento Geral: <span className="font-bold text-slate-900 font-mono">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div>
              Total de Comissões: <span className="font-bold text-emerald-600 font-mono">{formatCurrency(stats.commissionList.reduce((acc, curr) => acc + curr.commission, 0))}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PAGAMENTOS E CATEGORIAS (BENTO LAYOUT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Métodos de Recebimento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="payments-report-card">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <PieChart className="h-4 w-4 text-indigo-500" />
            Faturamento por Forma de Pagamento
          </h3>

          <div className="space-y-3.5">
            {Object.keys(stats.revenueByPayment).map((method) => {
              const val = stats.revenueByPayment[method as PaymentMethod];
              const pct = stats.totalRevenue > 0 ? (val / stats.totalRevenue) * 100 : 0;
              
              return (
                <div key={method} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{method}</span>
                    <div className="space-x-1.5 font-mono">
                      <span className="text-slate-900 font-semibold">{formatCurrency(val)}</span>
                      <span className="text-slate-400 text-[10px]">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  {/* Barra de Progresso Customizada */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tipos de Serviços */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="categories-report-card">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            Faturamento por Categoria de Lançamento
          </h3>

          <div className="space-y-3.5">
            {Object.keys(stats.revenueByCategory).map((category) => {
              const val = stats.revenueByCategory[category as SaleCategory];
              const pct = stats.totalRevenue > 0 ? (val / stats.totalRevenue) * 100 : 0;
              
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-700">{category}</span>
                    <div className="space-x-1.5 font-mono">
                      <span className="text-slate-900 font-semibold">{formatCurrency(val)}</span>
                      <span className="text-slate-400 text-[10px]">({pct.toFixed(1)}%)</span>
                    </div>
                  </div>
                  {/* Barra de Progresso Customizada */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        category === 'Serviço Informática'
                          ? 'bg-indigo-500'
                          : category === 'Serviço Celular'
                          ? 'bg-amber-500'
                          : category === 'Serviço Externo'
                          ? 'bg-teal-500'
                          : 'bg-slate-400'
                      }`} 
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. FATURAMENTO DIÁRIO (GRÁFICO + TABELA) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="daily-breakdown-report-card">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-indigo-500" />
            Faturamento Diário Consolidado
          </h3>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total: {allDaysOfMonth.length} dias</span>
        </div>

        {/* Gráfico SVG de Faturamento Diário */}
        {stats.totalRevenue > 0 ? (
          <div className="p-6 border-b border-slate-100 bg-slate-50/30">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Gráfico de Evolução de Caixa (R$)</span>
            
            {/* Gráfico de Barras SVG Nativo */}
            <div className="w-full h-36 flex items-end gap-1.5 overflow-x-auto pb-4 pt-2">
              {allDaysOfMonth.map((dateStr) => {
                const value = stats.revenueByDay[dateStr] || 0;
                const percentage = (value / maxDailyRevenue) * 100;
                const dayNum = formatDateDisplay(dateStr, true);
                const hasSales = value > 0;

                return (
                  <div key={dateStr} className="flex-1 min-w-[22px] flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip Hover */}
                    <div className="absolute bottom-full mb-1.5 bg-slate-900 text-white text-[10px] font-mono py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-md border border-slate-800">
                      Dia {dayNum}: {formatCurrency(value)}
                    </div>
                    
                    {/* Barra */}
                    <div 
                      className={`w-full rounded-t-md transition-all duration-500 ${
                        hasSales 
                          ? 'bg-indigo-600 group-hover:bg-indigo-500 shadow-sm' 
                          : 'bg-slate-100 border-dashed border border-slate-200'
                      }`}
                      style={{ height: `${Math.max(percentage, hasSales ? 5 : 2.5)}%` }}
                    ></div>
                    
                    {/* Rótulo do dia */}
                    <span className="text-[10px] text-slate-400 font-semibold mt-1.5 group-hover:text-indigo-600">
                      {dayNum}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Tabela de Fechamento por Dia */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-600">
            <thead className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-2.5">Dia</th>
                <th scope="col" className="px-6 py-2.5">Dia da Semana</th>
                <th scope="col" className="px-6 py-2.5 text-center">Nº Lançamentos</th>
                <th scope="col" className="px-6 py-2.5 text-right">Total Caixa do Dia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allDaysOfMonth.map((dateStr) => {
                const dayValue = stats.revenueByDay[dateStr] || 0;
                const salesCount = stats.salesByDay[dateStr] || 0;
                const dayNum = formatDateDisplay(dateStr, true);
                const wDay = getWeekdayName(dateStr);
                const isWeekend = wDay === 'Sáb' || wDay === 'Dom';

                return (
                  <tr 
                    key={dateStr} 
                    className={`hover:bg-slate-50/40 transition-colors ${
                      dayValue > 0 ? 'bg-emerald-50/10 font-medium' : isWeekend ? 'bg-slate-50/20 text-slate-400' : ''
                    }`}
                  >
                    <td className="px-6 py-2 font-semibold text-slate-900">Dia {dayNum}</td>
                    <td className="px-6 py-2 text-slate-500">{wDay}</td>
                    <td className="px-6 py-2 text-center font-mono">
                      {salesCount > 0 ? (
                        <span className="inline-block bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded font-bold border border-indigo-100/50">
                          {salesCount}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-6 py-2 text-right font-mono font-bold text-slate-900">
                      {dayValue > 0 ? formatCurrency(dayValue) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Fechamento consolidado do mês */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-bold text-slate-500">
          <span>FECHAMENTO DO MÊS</span>
          <div className="flex gap-6 font-mono">
            <span>{stats.totalSalesCount} lançamentos</span>
            <span className="text-indigo-600 text-sm">{formatCurrency(stats.totalRevenue)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
