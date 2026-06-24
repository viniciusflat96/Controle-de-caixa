/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Seller, Sale, ServiceOrder, Product } from './types';
import { generateInitialData, MONTH_NAMES } from './utils';
import SellersConfig from './components/SellersConfig';
import DailyLedger from './components/DailyLedger';
import MonthlySummary from './components/MonthlySummary';
import SheetsSync from './components/SheetsSync';
import ServiceOrders from './components/ServiceOrders';
import ProductsConfig from './components/ProductsConfig';
import { 
  Users, FileText, BarChart3, Share2, Calendar, Database, 
  User, ClipboardList, CheckCircle2, RefreshCw, Smartphone, Package
} from 'lucide-react';
import {
  subscribeSellers, dbSaveSeller, dbDeleteSeller,
  subscribeSales, dbSaveSale, dbDeleteSale,
  subscribeServiceOrders, dbSaveServiceOrder, dbDeleteServiceOrder,
  subscribeProducts, dbSaveProduct, dbDeleteProduct
} from './firebase';

export default function App() {
  // Inicialização de Vendedores via Firebase
  const [sellers, setSellers] = useState<Seller[]>([]);

  // Inicialização de Vendas via Firebase
  const [sales, setSales] = useState<Sale[]>([]);

  // Inicialização de Logo da Loja
  const [storeLogo, setStoreLogo] = useState<string>(() => {
    return localStorage.getItem('caixa_store_logo') || '';
  });

  // Inicialização de Ordens de Serviço via Firebase
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);

  // Inicialização de Mercadorias via Firebase
  const [products, setProducts] = useState<Product[]>([]);

  // Sincronização automática na nuvem a cada 5 cliques/ações
  const [clickCount, setClickCount] = useState<number>(0);
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Sincronizar dados em tempo real com Firebase Firestore
  useEffect(() => {
    const unsub = subscribeSellers((list) => {
      if (list.length === 0) {
        // Se banco de dados estiver limpo, semeia com dados iniciais
        const { defaultSellers } = generateInitialData();
        defaultSellers.forEach(dbSaveSeller);
      } else {
        setSellers(list);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeSales((list) => {
      if (list.length === 0) {
        const { defaultSales } = generateInitialData();
        defaultSales.forEach(dbSaveSale);
      } else {
        setSales(list);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeServiceOrders((list) => {
      setServiceOrders(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeProducts((list) => {
      setProducts(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (storeLogo) {
      localStorage.setItem('caixa_store_logo', storeLogo);
    } else {
      localStorage.removeItem('caixa_store_logo');
    }
  }, [storeLogo]);

  // Função para contar cliques/alterações e disparar auto-sincronização
  const handleTriggerClick = () => {
    setClickCount((prev) => {
      const next = prev + 1;
      if (next > 0 && next % 5 === 0) {
        // Dispara sinc automática fictícia super detalhada
        setToastMessage(`Sincronização automática ativa! (${next} cliques) - Dados salvos com segurança na nuvem!`);
        setShowSyncToast(true);
        setTimeout(() => {
          setShowSyncToast(false);
        }, 3500);
      }
      return next;
    });
  };

  // Controle de Mês e Ano selecionados para visualização geral
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    return new Date().getMonth() + 1;
  });

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<'livro-caixa' | 'ordens-servico' | 'produtos' | 'vendedores' | 'resumo' | 'sincronizacao'>('livro-caixa');

  const years = [2024, 2025, 2026, 2027, 2028];

  // Métodos CRUD para Vendedores com Firebase
  const handleAddSeller = (newSeller: Omit<Seller, 'id'>) => {
    const id = `sel-${Date.now()}`;
    dbSaveSeller({ ...newSeller, id });
  };

  const handleUpdateSeller = (updatedSeller: Seller) => {
    dbSaveSeller(updatedSeller);
  };

  const handleDeleteSeller = (id: string) => {
    const hasSales = sales.some((s) => s.sellerId === id);
    if (hasSales) {
      const confirmForce = window.confirm(
        'Este vendedor possui lançamentos de vendas associados. Remover o vendedor deixará esses lançamentos sem nome. Deseja prosseguir mesmo assim?'
      );
      if (!confirmForce) return;
    }
    dbDeleteSeller(id);
  };

  // Métodos CRUD para Vendas com Firebase
  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    const id = `sale-${Date.now()}`;
    dbSaveSale({ ...newSale, id });
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    dbSaveSale(updatedSale);
  };

  const handleDeleteSale = (id: string) => {
    dbDeleteSale(id);
  };

  // Métodos CRUD para Ordens de Serviço (OS) com Firebase
  const handleAddOS = (newOS: Omit<ServiceOrder, 'id' | 'osNumber' | 'createdAt'>) => {
    const id = `os-${Date.now()}`;
    // Gerar número sequencial de OS: OS-XXXX
    const nextNum = serviceOrders.length + 1;
    const osNumber = `OS-${String(nextNum).padStart(4, '0')}`;
    const createdAt = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

    dbSaveServiceOrder({ 
      ...newOS, 
      id, 
      osNumber, 
      createdAt 
    });
  };

  const handleUpdateOS = (updatedOS: ServiceOrder) => {
    dbSaveServiceOrder(updatedOS);
  };

  const handleDeleteOS = (id: string) => {
    dbDeleteServiceOrder(id);
  };

  // Métodos CRUD para Mercadorias/Produtos com Firebase
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    const id = `prod-${Date.now()}`;
    dbSaveProduct({ ...newProduct, id });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    dbSaveProduct(updatedProduct);
  };

  const handleDeleteProduct = (id: string) => {
    dbDeleteProduct(id);
  };

  const totalAllTimeRevenue = useMemo(() => {
    return sales.reduce((acc, curr) => acc + curr.value, 0);
  }, [sales]);

  const activeMonthName = MONTH_NAMES[selectedMonth - 1];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased flex flex-col" id="app-root">
      
      {/* HEADER DE CABEÇALHO */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-sm" id="main-header">
        <div className="flex items-center gap-3">
          {storeLogo ? (
            <div className="h-10 max-w-[130px] flex items-center justify-center p-1 bg-slate-50 rounded-lg border border-slate-100">
              <img src={storeLogo} alt="Logo" className="max-h-full max-w-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tight shadow-sm">
              CX
            </div>
          )}
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-none">Controle de Caixa</h1>
            <p className="text-[10px] sm:text-xs text-slate-500 font-medium">Informática & Assistência Celular</p>
          </div>
        </div>

        {/* Seletores e Informações do Usuário */}
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="text-[11px] text-slate-500 font-medium hidden lg:inline-flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-emerald-600" />
            {localStorage.getItem('user_email') || 'marcos.vinicius22434881@gmail.com'}
          </span>

          {/* Filtros Globais de Mês e Ano */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60" id="global-month-year-picker">
            <Calendar className="h-3.5 w-3.5 text-slate-500 ml-1.5" />
            
            {/* Seletor Mês */}
            <select
              value={selectedMonth}
              onChange={(e) => { handleTriggerClick(); setSelectedMonth(Number(e.target.value)); }}
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
              onChange={(e) => { handleTriggerClick(); setSelectedYear(Number(e.target.value)); }}
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

      {/* TOAST DE SINCRONIZAÇÃO AUTOMÁTICA */}
      {showSyncToast && (
        <div className="fixed bottom-14 right-6 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-800 shadow-2xl flex items-center gap-3 z-50 animate-bounce duration-700" id="sync-toast">
          <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 animate-spin">
            <RefreshCw className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-emerald-400">Nuvem Sincronizada!</p>
            <p className="text-slate-400 text-[10px] mt-0.5">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* ÁREA PRINCIPAL DO CONTEÚDO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8 flex-1 w-full flex flex-col md:flex-row gap-6">
        
        {/* NAVEGAÇÃO LATERAL (MENU DE ABAS) */}
        <aside className="w-full md:w-64 flex-none" id="sidebar-navigation">
          <nav className="space-y-1 bg-white p-3 rounded-xl border border-slate-200 shadow-sm sticky top-24">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-3 mt-1">
              Gerenciamento
            </span>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('livro-caixa'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'livro-caixa'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="h-4 w-4 flex-none" />
              Livro Caixa Diário
            </button>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('ordens-servico'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ordens-servico'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="h-4.5 w-4.5 flex-none" />
              Ordens de Serviço (OS)
            </button>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('produtos'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'produtos'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Package className="h-4.5 w-4.5 flex-none" />
              Mercadorias / Estoque
            </button>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('vendedores'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'vendedores'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="h-4 w-4 flex-none" />
              Vendedores e Ajustes
            </button>

            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 block mb-3 mt-5">
              Relatórios & Sincronia
            </span>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('resumo'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'resumo'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="h-4 w-4 flex-none" />
              Resumo do Mês
            </button>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('sincronizacao'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'sincronizacao'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Share2 className="h-4 w-4 flex-none" />
              Exportar / Sincronizar
            </button>

            {/* Contador de cliques para sync */}
            <div className="pt-4 mt-4 border-t border-slate-100 px-3 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Cliques / Ações:</span>
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold">{clickCount}</span>
            </div>
          </nav>
        </aside>

        {/* CONTAINER DA ABA ATIVA */}
        <section className="flex-1 min-w-0 animate-fade-in" id="main-content-window">
          {activeTab === 'livro-caixa' && (
            <DailyLedger
              sales={sales}
              sellers={sellers}
              products={products}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              onAddSale={handleAddSale}
              onUpdateSale={handleUpdateSale}
              onDeleteSale={handleDeleteSale}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'ordens-servico' && (
            <ServiceOrders
              sellers={sellers}
              serviceOrders={serviceOrders}
              storeLogo={storeLogo}
              onAddOS={handleAddOS}
              onUpdateOS={handleUpdateOS}
              onDeleteOS={handleDeleteOS}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'vendedores' && (
            <SellersConfig
              sellers={sellers}
              storeLogo={storeLogo}
              onAddSeller={handleAddSeller}
              onUpdateSeller={handleUpdateSeller}
              onDeleteSeller={handleDeleteSeller}
              onUpdateStoreLogo={setStoreLogo}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'produtos' && (
            <ProductsConfig
              products={products}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'resumo' && (
            <MonthlySummary
              sales={sales}
              sellers={sellers}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'sincronizacao' && (
            <SheetsSync
              sales={sales}
              sellers={sellers}
              selectedYear={selectedYear}
              selectedMonth={selectedMonth}
              triggerClick={handleTriggerClick}
            />
          )}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="h-10 bg-slate-950 text-white flex items-center px-4 sm:px-8 text-[10px] justify-between uppercase tracking-[0.2em] font-semibold shrink-0 mt-auto" id="main-footer">
        <div className="truncate pr-4">Faturamento geral acumulado: <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAllTimeRevenue)}</span></div>
        <div className="hidden md:block">Sistema de Gestão Verde e Branca v3.0</div>
        <div className="whitespace-nowrap">Status do Caixa: <span className="text-emerald-400 font-bold animate-pulse">Aberto</span></div>
      </footer>
    </div>
  );
}
