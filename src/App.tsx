/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Seller, Sale } from './types';
import { generateInitialData, MONTH_NAMES } from './utils';
import SellersConfig from './components/SellersConfig';
import DailyLedger from './components/DailyLedger';
import MonthlySummary from './components/MonthlySummary';
import SheetsSync from './components/SheetsSync';
import { Users, FileText, BarChart3, Share2, Calendar, Database, User } from 'lucide-react';

export default function App() {
  // Inicialização preguiçosa de Vendedores
  const [sellers, setSellers] = useState<Seller[]>(() => {
    try {
      const saved = localStorage.getItem('caixa_sellers');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler vendedores do localStorage:', e);
    }
    const { defaultSellers } = generateInitialData();
    return defaultSellers;
  });

  // Inicialização preguiçosa de Vendas
  const [sales, setSales] = useState<Sale[]>(() => {
    try {
      const saved = localStorage.getItem('caixa_sales');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler vendas do localStorage:', e);
    }
    const { defaultSales } = generateInitialData();
    return defaultSales;
  });

  // Salvar no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('caixa_sellers', JSON.stringify(sellers));
  }, [sellers]);

  useEffect(() => {
    localStorage.setItem('caixa_sales', JSON.stringify(sales));
  }, [sales]);

  // Controle de Mês e Ano selecionados para visualização geral
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear(); // Ex: 2026
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1; // 1-indexed (Ex: 6 para Junho)
  });

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'livro-caixa' | 'vendedores' | 'resumo' | 'sincronizacao'>('livro-caixa');

  // Geradores de lista de anos (2024 até 2028 para flexibilidade)
  const years = [2024, 2025, 2026, 2027, 2028];

  // Métodos CRUD para Vendedores
  const handleAddSeller = (newSeller: Omit<Seller, 'id'>) => {
    const id = `sel-${Date.now()}`;
    setSellers((prev) => [...prev, { ...newSeller, id }]);
  };

  const handleUpdateSeller = (updatedSeller: Seller) => {
    setSellers((prev) => prev.map((s) => (s.id === updatedSeller.id ? updatedSeller : s)));
  };

  const handleDeleteSeller = (id: string) => {
    // Validar se há vendas cadastradas para este vendedor para alertar o usuário
    const hasSales = sales.some((s) => s.sellerId === id);
    if (hasSales) {
      const confirmForce = window.confirm(
        'Este vendedor possui lançamentos de vendas associados. Remover o vendedor deixará esses lançamentos sem nome. Deseja prosseguir mesmo assim?'
      );
      if (!confirmForce) return;
    }
    setSellers((prev) => prev.filter((s) => s.id !== id));
  };

  // Métodos CRUD para Lançamentos de Vendas
  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    const id = `sale-${Date.now()}`;
    setSales((prev) => [...prev, { ...newSale, id }]);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    setSales((prev) => prev.map((s) => (s.id === updatedSale.id ? updatedSale : s)));
  };

  const handleDeleteSale = (id: string) => {
    setSales((prev) => prev.filter((s) => s.id !== id));
  };

  const totalAllTimeRevenue = React.useMemo(() => {
    return sales.reduce((acc, curr) => acc + curr.value, 0);
  }, [sales]);

  const activeMonthName = MONTH_NAMES[selectedMonth - 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col" id="app-root">
      
      {/* HEADER DE CABEÇALHO */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm" id="main-header">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
            CX
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">Controle de Caixa</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Informática & Assistência Celular</p>
          </div>
        </div>

        {/* Seletores e Informações do Usuário */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[11px] text-slate-500 font-medium hidden lg:inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-indigo-500" />
            {localStorage.getItem('user_email') || 'marcos.vinicius22434881@gmail.com'}
          </span>

          {/* Filtros Globais de Mês e Ano */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60" id="global-month-year-picker">
            <Calendar className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
            
            {/* Seletor Mês */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 focus:outline-none pr-5 cursor-pointer py-0.5"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1} className="bg-white text-slate-800">
                  {name}
                </option>
              ))}
            </select>

            {/* Divisor */}
            <span className="text-slate-300">|</span>

            {/* Seletor Ano */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent border-none text-[11px] font-bold text-slate-700 focus:ring-0 focus:outline-none pr-5 cursor-pointer py-0.5"
            >
              {years.map((yr) => (
                <option key={yr} value={yr} className="bg-white text-slate-800">
                  {yr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DO CONTEÚDO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8 flex-1 w-full flex flex-col md:flex-row gap-6">
        
        {/* NAVEGAÇÃO LATERAL (MENU DE ABAS) */}
        <aside className="w-full md:w-64 flex-none" id="sidebar-navigation">
          <nav className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-3 mt-1">
              Gerenciamento
            </span>

            <button
              onClick={() => setActiveTab('livro-caixa')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'livro-caixa'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 flex-none" />
              Livro Caixa Diário
            </button>

            <button
              onClick={() => setActiveTab('vendedores')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vendedores'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4 flex-none" />
              Vendedores
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-3 mt-5">
              Relatórios & Sincronia
            </span>

            <button
              onClick={() => setActiveTab('resumo')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'resumo'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 flex-none" />
              Resumo do Mês
            </button>

            <button
              onClick={() => setActiveTab('sincronizacao')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sincronizacao'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Share2 className="h-4 w-4 flex-none" />
              Exportar / Sincronizar
            </button>
          </nav>
        </aside>

        {/* CONTAINER DA ABA ATIVA */}
        <section className="flex-1 min-w-0 animate-fade-in" id="main-content-window">
          {activeTab === 'livro-caixa' && (
            <DailyLedger
              sales={sales}
              sellers={sellers}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAddSale={handleAddSale}
              onUpdateSale={handleUpdateSale}
              onDeleteSale={handleDeleteSale}
            />
          )}

          {activeTab === 'vendedores' && (
            <SellersConfig
              sellers={sellers}
              onAddSeller={handleAddSeller}
              onUpdateSeller={handleUpdateSeller}
              onDeleteSeller={handleDeleteSeller}
            />
          )}

          {activeTab === 'resumo' && (
            <MonthlySummary
              sales={sales}
              sellers={sellers}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}

          {activeTab === 'sincronizacao' && (
            <SheetsSync
              sales={sales}
              sellers={sellers}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
            />
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="h-10 bg-slate-900 text-white flex items-center px-4 sm:px-8 text-[10px] justify-between uppercase tracking-[0.2em] font-semibold shrink-0 mt-auto" id="main-footer">
        <div className="truncate pr-4">Faturamento geral acumulado: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAllTimeRevenue)}</div>
        <div className="hidden md:block">Sistema de Gestão Interna v2.4</div>
        <div className="whitespace-nowrap">Status do Caixa: <span className="text-emerald-400">Aberto</span></div>
      </footer>
    </div>
  );
}
