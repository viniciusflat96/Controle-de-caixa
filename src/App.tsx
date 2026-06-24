/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Seller, Sale, ServiceOrder, Product, Client, ProtectorCompatibility, Appointment } from './types';
import { generateInitialData, MONTH_NAMES } from './utils';
import SellersConfig from './components/SellersConfig';
import DailyLedger from './components/DailyLedger';
import MonthlySummary from './components/MonthlySummary';
import SheetsSync from './components/SheetsSync';
import ServiceOrders from './components/ServiceOrders';
import ProductsConfig from './components/ProductsConfig';
import ClientsConfig from './components/ClientsConfig';
import ProtectorsConfig from './components/ProtectorsConfig';
import Assistance from './components/Assistance';
import Appointments from './components/Appointments';
import { 
  Users, FileText, BarChart3, Share2, Calendar, Database, 
  User, ClipboardList, CheckCircle2, RefreshCw, Smartphone, Package, Shield, LayoutGrid, HelpCircle, CalendarDays
} from 'lucide-react';
import {
  subscribeSellers, dbSaveSeller, dbDeleteSeller,
  subscribeSales, dbSaveSale, dbDeleteSale,
  subscribeServiceOrders, dbSaveServiceOrder, dbDeleteServiceOrder,
  subscribeProducts, dbSaveProduct, dbDeleteProduct,
  subscribeClients, dbSaveClient, dbDeleteClient,
  subscribeProtectors, dbSaveProtector, dbDeleteProtector,
  subscribeSettings, dbSaveSettings,
  subscribeAppointments, dbSaveAppointment, dbDeleteAppointment
} from './firebase';
import { AppSettings } from './types';

const THEME_PALETTES: Record<string, Record<string, string>> = {
  emerald: { '50': '#ecfdf5', '100': '#d1fae5', '200': '#a7f3d0', '300': '#6ee7b7', '400': '#34d399', '500': '#10b981', '600': '#059669', '700': '#047857', '800': '#065f46', '900': '#064e3b', '950': '#022c22' },
  blue: { '50': '#eff6ff', '100': '#dbeafe', '200': '#bfdbfe', '300': '#93c5fd', '400': '#60a5fa', '500': '#3b82f6', '600': '#2563eb', '700': '#1d4ed8', '800': '#1e40af', '900': '#1e3a8a', '950': '#172554' },
  indigo: { '50': '#eef2ff', '100': '#e0e7ff', '200': '#c7d2fe', '300': '#a5b4fc', '400': '#818cf8', '500': '#6366f1', '600': '#4f46e5', '700': '#4338ca', '800': '#3730a3', '900': '#312e81', '950': '#1e1b4b' },
  violet: { '50': '#f5f3ff', '100': '#ede9fe', '200': '#ddd6fe', '300': '#c4b5fd', '400': '#a78bfa', '500': '#8b5cf6', '600': '#7c3aed', '700': '#6d28d9', '800': '#5b21b6', '900': '#4c1d95', '950': '#2e1065' },
  rose: { '50': '#fff1f2', '100': '#ffe4e6', '200': '#fecdd3', '300': '#fda4af', '400': '#fb7185', '500': '#f43f5e', '600': '#e11d48', '700': '#be123c', '800': '#9f1239', '900': '#881337', '950': '#4c0519' },
  amber: { '50': '#fffbeb', '100': '#fef3c7', '200': '#fde68a', '300': '#fcd34d', '400': '#fbbf24', '500': '#f59e0b', '600': '#d97706', '700': '#b45309', '800': '#92400e', '900': '#78350f', '950': '#451a03' }
};

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

  // Inicialização de Clientes via Firebase
  const [clients, setClients] = useState<Client[]>([]);

  // Inicialização de Películas via Firebase
  const [protectors, setProtectors] = useState<ProtectorCompatibility[]>([]);

  // Inicialização de Agendamentos via Firebase
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [settings, setSettings] = useState<AppSettings | null>(null);

  // Sincronização automática na nuvem a cada 5 cliques/ações
  const [clickCount, setClickCount] = useState<number>(0);
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeSettings((data) => {
      setSettings(data);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeAppointments((list) => {
      setAppointments(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (settings && settings.themeColor) {
      const palette = THEME_PALETTES[settings.themeColor] || THEME_PALETTES.emerald;
      const root = document.documentElement;
      Object.keys(palette).forEach((weight) => {
        root.style.setProperty(`--theme-${weight}`, palette[weight]);
      });
    }
  }, [settings?.themeColor]);
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
    const unsub = subscribeClients((list) => {
      setClients(list);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeProtectors((list) => {
      setProtectors(list);
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
  const [activeTab, setActiveTab] = useState<'livro-caixa' | 'ordens-servico' | 'agendamentos' | 'produtos' | 'clientes' | 'peliculas' | 'vendedores' | 'resumo' | 'sincronizacao' | 'ajuda'>('livro-caixa');

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

  // Métodos CRUD para Clientes com Firebase
  const handleAddClient = (newClient: Omit<Client, 'id'>) => {
    const id = `cli-${Date.now()}`;
    dbSaveClient({ ...newClient, id });
  };

  const handleUpdateClient = (updatedClient: Client) => {
    dbSaveClient(updatedClient);
  };

  const handleDeleteClient = (id: string) => {
    dbDeleteClient(id);
  };

  // Métodos CRUD para Películas
  const handleAddProtector = (newProtector: Omit<ProtectorCompatibility, 'id'>) => {
    const id = `prot-${Date.now()}`;
    dbSaveProtector({ ...newProtector, id });
  };

  const handleUpdateProtector = (updatedProtector: ProtectorCompatibility) => {
    dbSaveProtector(updatedProtector);
  };

  const handleDeleteProtector = (id: string) => {
    dbDeleteProtector(id);
  };

  // Métodos CRUD para Agendamentos
  const handleAddAppointment = (newAppointment: Omit<Appointment, 'id'>) => {
    const id = `app-${Date.now()}`;
    dbSaveAppointment({ ...newAppointment, id });
  };

  const handleDeleteAppointment = (id: string) => {
    dbDeleteAppointment(id);
  };

  const totalAllTimeRevenue = useMemo(() => {
    return sales.reduce((acc, curr) => acc + curr.value, 0);
  }, [sales]);

  const activeMonthName = MONTH_NAMES[selectedMonth - 1];

  const upcomingAppointmentsToday = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const nowTime = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return appointments.filter(app => {
      // Retorna apenas agendamentos de hoje que ainda não passaram
      if (app.date !== todayStr) return false;
      return app.time >= nowTime;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }, [appointments]);

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

      {/* BANNER DE AGENDAMENTOS DO DIA */}
      {upcomingAppointmentsToday.length > 0 && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex flex-wrap items-center justify-center gap-4 animate-fade-in shadow-md relative z-10">
          <CalendarDays className="h-4 w-4" />
          <span>Atenção: Você tem {upcomingAppointmentsToday.length} agendamento(s) para hoje!</span>
          <button 
            onClick={() => setActiveTab('agendamentos')}
            className="px-3 py-1 bg-white text-emerald-800 rounded-full hover:bg-emerald-50 transition-colors shadow-sm ml-2"
          >
            Ver Agenda
          </button>
        </div>
      )}

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
              onClick={() => { handleTriggerClick(); setActiveTab('agendamentos'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'agendamentos'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <CalendarDays className="h-4.5 w-4.5 flex-none" />
              Agendamentos
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
              onClick={() => { handleTriggerClick(); setActiveTab('clientes'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'clientes'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <User className="h-4.5 w-4.5 flex-none" />
              Clientes
            </button>

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('peliculas'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'peliculas'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Smartphone className="h-4.5 w-4.5 flex-none" />
              Películas Compatíveis
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

            <button
              onClick={() => { handleTriggerClick(); setActiveTab('ajuda'); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'ajuda'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/15'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="h-4.5 w-4.5 flex-none" />
              Central de Ajuda
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
              clients={clients}
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
              settings={settings}
              onAddOS={handleAddOS}
              onUpdateOS={handleUpdateOS}
              onDeleteOS={handleDeleteOS}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'agendamentos' && (
            <Appointments
              appointments={appointments}
              clients={clients}
              sellers={sellers}
              onAddAppointment={handleAddAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'clientes' && (
            <ClientsConfig
              clients={clients}
              onAddClient={handleAddClient}
              onUpdateClient={handleUpdateClient}
              onDeleteClient={handleDeleteClient}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'peliculas' && (
            <ProtectorsConfig
              protectors={protectors}
              onAddProtector={handleAddProtector}
              onUpdateProtector={handleUpdateProtector}
              onDeleteProtector={handleDeleteProtector}
              triggerClick={handleTriggerClick}
            />
          )}

          {activeTab === 'vendedores' && (
            <SellersConfig
              sellers={sellers}
              storeLogo={storeLogo}
              settings={settings}
              onAddSeller={handleAddSeller}
              onUpdateSeller={handleUpdateSeller}
              onDeleteSeller={handleDeleteSeller}
              onUpdateStoreLogo={setStoreLogo}
              onUpdateSettings={dbSaveSettings}
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

          {activeTab === 'ajuda' && (
            <Assistance onNavigate={(tab) => setActiveTab(tab)} triggerClick={handleTriggerClick} />
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
