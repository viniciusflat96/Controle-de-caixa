/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Sale, Seller, SaleCategory, PaymentMethod, Product, Client } from '../types';
import { getDaysInMonth, formatDateDisplay, getWeekdayName, formatCurrency } from '../utils';
import { 
  Plus, Trash2, Calendar, FileText, Filter, Search, 
  ChevronLeft, ChevronRight, Edit3, X, Check, ArrowUpRight, ArrowRight, Package, Gift
} from 'lucide-react';

interface DailyLedgerProps {
  sales: Sale[];
  sellers: Seller[];
  products: Product[];
  clients: Client[];
  selectedYear: number;
  selectedMonth: number; // 1-indexed
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onUpdateSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  triggerClick: () => void;
}

export default function DailyLedger({
  sales,
  sellers,
  products,
  clients,
  selectedYear,
  selectedMonth,
  onAddSale,
  onUpdateSale,
  onDeleteSale,
  onAddProduct,
  onUpdateProduct,
  triggerClick,
}: DailyLedgerProps) {
  // Lista de dias do mês selecionado
  const days = useMemo(() => getDaysInMonth(selectedYear, selectedMonth), [selectedYear, selectedMonth]);
  
  // Dia atualmente selecionado (padrão: dia atual do sistema ou o dia 1 do mês selecionado)
  const todayISO = useMemo(() => {
    const today = new Date();
    const dayStr = String(today.getDate()).padStart(2, '0');
    const monthStr = String(selectedMonth).padStart(2, '0');
    const targetISO = `${selectedYear}-${monthStr}-${dayStr}`;
    return days.includes(targetISO) ? targetISO : days[0];
  }, [days, selectedYear, selectedMonth]);

  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [viewAllDays, setViewAllDays] = useState<boolean>(false);

  // Estados do formulário de nova venda
  const [sellerId, setSellerId] = useState('');
  const [category, setCategory] = useState<SaleCategory>('Serviço Informática');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');

  // Estados para integração com Mercadorias (Autocomplete e Quick Register)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false);
  
  // Modal de cadastro rápido de mercadoria
  const [isQuickRegOpen, setIsQuickRegOpen] = useState(false);
  const [quickRegName, setQuickRegName] = useState('');
  const [quickRegPrice, setQuickRegPrice] = useState('');
  const [quickRegStock, setQuickRegStock] = useState<number | ''>('');

  const matchingProducts = useMemo(() => {
    if (!description.trim()) return [];
    return products.filter((p) => p.name.toLowerCase().includes(description.toLowerCase()));
  }, [products, description]);

  const exactMatchExists = useMemo(() => {
    return products.some((p) => p.name.toLowerCase() === description.trim().toLowerCase());
  }, [products, description]);

  // Estados de edição inline
  const [editingSaleId, setEditingSaleId] = useState<string | null>(null);
  const [editSellerId, setEditSellerId] = useState('');
  const [editCategory, setEditCategory] = useState<SaleCategory>('Serviço Informática');
  const [editDescription, setEditDescription] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editPaymentMethod, setEditPaymentMethod] = useState<PaymentMethod>('Pix');
  const [editDate, setEditDate] = useState('');

  // Estados de busca e filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeller, setFilterSeller] = useState('todos');
  const [filterCategory, setFilterCategory] = useState('todas');
  const [filterPayment, setFilterPayment] = useState('todos');

  // Categorias e formas de pagamento fixas
  const categories: SaleCategory[] = ['Serviço Informática', 'Serviço Celular', 'Serviço Externo', 'Outros'];
  const paymentMethods: PaymentMethod[] = ['Dinheiro', 'Pix', 'Cartão de Crédito', 'Cartão de Débito', 'Outro'];

  // Aniversariantes da semana
  const upcomingBirthdays = useMemo(() => {
    if (!clients) return [];
    const today = new Date();
    today.setHours(0,0,0,0);
    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);

    return clients.filter(c => {
      if (!c.birthDate) return false;
      const bDate = new Date(c.birthDate);
      bDate.setUTCHours(12, 0, 0, 0); // avoid tz shift
      
      const bMonth = bDate.getUTCMonth();
      const bDay = bDate.getUTCDate();
      
      const nextBirthdayThisYear = new Date(today.getFullYear(), bMonth, bDay);
      if (nextBirthdayThisYear < today) {
        nextBirthdayThisYear.setFullYear(today.getFullYear() + 1);
      }
      return nextBirthdayThisYear >= today && nextBirthdayThisYear <= in7Days;
    }).map(c => {
      const bDate = new Date(c.birthDate!);
      bDate.setUTCHours(12, 0, 0, 0);
      return {
        ...c,
        bDateObj: new Date(today.getFullYear(), bDate.getUTCMonth(), bDate.getUTCDate())
      };
    }).sort((a, b) => a.bDateObj.getTime() - b.bDateObj.getTime());
  }, [clients]);

  // Totalizar vendas por dia para o calendário-carrossel
  const dayTotals = useMemo(() => {
    const totals: { [date: string]: number } = {};
    sales.forEach((s) => {
      totals[s.date] = (totals[s.date] || 0) + s.value;
    });
    return totals;
  }, [sales]);

  // Filtrar vendas a serem exibidas
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      // 1. Filtro de data (se não for "Ver todos os dias")
      if (!viewAllDays && s.date !== selectedDate) return false;
      
      // 2. Filtro por mês/ano ativo (no caso de ver todos os dias, as vendas já estão pré-filtradas no App.tsx para o mês correto, mas garantimos aqui)
      const parts = s.date.split('-');
      if (Number(parts[0]) !== selectedYear || Number(parts[1]) !== selectedMonth) return false;

      // 3. Filtro de busca textual
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const sellerName = sellers.find(sel => sel.id === s.sellerId)?.name.toLowerCase() || '';
        const matchDesc = s.description.toLowerCase().includes(query);
        const matchSeller = sellerName.includes(query);
        const matchCategory = s.category.toLowerCase().includes(query);
        const matchPayment = s.paymentMethod.toLowerCase().includes(query);
        if (!matchDesc && !matchSeller && !matchCategory && !matchPayment) return false;
      }

      // 4. Filtro de vendedor
      if (filterSeller !== 'todos' && s.sellerId !== filterSeller) return false;

      // 5. Filtro de categoria
      if (filterCategory !== 'todas' && s.category !== filterCategory) return false;

      // 6. Filtro de pagamento
      if (filterPayment !== 'todos' && s.paymentMethod !== filterPayment) return false;

      return true;
    });
  }, [sales, selectedDate, viewAllDays, selectedYear, selectedMonth, searchQuery, filterSeller, filterCategory, filterPayment, sellers]);

  // Valor total das vendas listadas
  const totalListedValue = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + curr.value, 0);
  }, [filteredSales]);

  // Função para cadastrar venda
  const handleAddSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerId) {
      alert('Por favor, selecione um vendedor.');
      return;
    }
    if (!description.trim()) {
      alert('Por favor, insira uma descrição.');
      return;
    }
    const numPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) {
      alert('Por favor, insira um preço válido.');
      return;
    }

    onAddSale({
      date: selectedDate,
      sellerId,
      category,
      description: description.trim(),
      price: numPrice,
      quantity,
      value: numPrice * quantity,
      paymentMethod,
    });

    // Verificar se a venda corresponde a uma mercadoria cadastrada para atualizar o estoque
    const matchingProduct = products.find(
      (p) => p.name.toLowerCase() === description.trim().toLowerCase()
    );
    if (matchingProduct) {
      const updatedStock = Math.max(0, matchingProduct.stockQuantity - quantity);
      onUpdateProduct({
        ...matchingProduct,
        stockQuantity: updatedStock
      });
    }

    // Resetar campos (mantendo vendedor e forma de pagamento para agilizar novos lançamentos)
    setDescription('');
    setPrice('');
    setQuantity(1);
    setSelectedProductId(null);
  };

  // Função para carregar dados na edição inline
  const startEditSale = (sale: Sale) => {
    setEditingSaleId(sale.id);
    setEditSellerId(sale.sellerId);
    setEditCategory(sale.category);
    setEditDescription(sale.description);
    setEditPrice(String(sale.price));
    setEditQuantity(sale.quantity);
    setEditPaymentMethod(sale.paymentMethod);
    setEditDate(sale.date);
  };

  // Salvar edição inline
  const handleSaveEditSale = () => {
    if (!editSellerId || !editDescription.trim() || !editingSaleId) return;
    const numPrice = parseFloat(editPrice.replace(',', '.'));
    if (isNaN(numPrice) || numPrice <= 0) return;

    onUpdateSale({
      id: editingSaleId,
      date: editDate,
      sellerId: editSellerId,
      category: editCategory,
      description: editDescription.trim(),
      price: numPrice,
      quantity: editQuantity,
      value: numPrice * editQuantity,
      paymentMethod: editPaymentMethod,
    });

    setEditingSaleId(null);
  };

  // Retroceder ou avançar dia
  const handlePrevDay = () => {
    const idx = days.indexOf(selectedDate);
    if (idx > 0) {
      setSelectedDate(days[idx - 1]);
      setViewAllDays(false);
    }
  };

  const handleNextDay = () => {
    const idx = days.indexOf(selectedDate);
    if (idx < days.length - 1) {
      setSelectedDate(days[idx + 1]);
      setViewAllDays(false);
    }
  };

  // Dynamic badge colors for sellers to match the Geometric Balance design spec
  const getSellerBadgeStyle = (id: string) => {
    const idx = sellers.findIndex(s => s.id === id);
    if (idx === -1) return 'bg-slate-50 text-slate-600 border border-slate-100';
    if (idx % 3 === 0) return 'bg-blue-50 text-blue-700 border border-blue-100/80';
    if (idx % 3 === 1) return 'bg-emerald-50 text-emerald-700 border border-emerald-100/80';
    return 'bg-purple-50 text-purple-700 border border-purple-100/80';
  };

  return (
    <div className="space-y-6" id="daily-ledger-container">
      {/* AVISO DE ANIVERSARIANTES */}
      {upcomingBirthdays.length > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-sm animate-fade-in flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-800">Lembrete de Aniversários (Próximos 7 dias)</h4>
              <ul className="mt-2 space-y-1">
                {upcomingBirthdays.map(c => (
                  <li key={c.id} className="text-xs text-amber-700">
                    <span className="font-semibold">{c.name}</span> - {c.bDateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    {c.phone ? ` (Cel: ${c.phone})` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 1. SELETOR DE DIAS (CALENDÁRIO HORIZONTAL) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm" id="calendar-carousel">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Dias do Mês ({days.length} dias)
            </h3>
          </div>
          <button
            onClick={() => {
              triggerClick();
              setViewAllDays(!viewAllDays);
            }}
            id="view-all-days-btn"
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
              viewAllDays
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80'
            }`}
          >
            {viewAllDays ? 'Visualizando Mês Completo' : 'Visualizar Mês Completo'}
          </button>
        </div>

        {/* Listagem horizontal com scroll */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              triggerClick();
              handlePrevDay();
            }}
            disabled={days.indexOf(selectedDate) === 0}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
            title="Dia Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex-1 flex gap-2 overflow-x-auto py-1 scrollbar-thin scrollbar-thumb-slate-200" id="horizontal-days-list">
            {days.map((dateStr) => {
              const isActive = selectedDate === dateStr && !viewAllDays;
              const hasSales = dayTotals[dateStr] > 0;
              const dayNum = formatDateDisplay(dateStr, true);
              const wDay = getWeekdayName(dateStr);
              const isWeekend = wDay === 'Sáb' || wDay === 'Dom';

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    triggerClick();
                    setSelectedDate(dateStr);
                    setViewAllDays(false);
                  }}
                  className={`flex-none flex flex-col items-center justify-between w-14 py-2 border rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/10 scale-105'
                      : isWeekend
                      ? 'bg-slate-50/50 border-slate-100 hover:border-slate-300 text-slate-500'
                      : 'bg-white border-slate-200 hover:border-emerald-400 text-slate-700'
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {wDay}
                  </span>
                  <span className="text-base font-bold tracking-tight">{dayNum}</span>
                  
                  {/* Ponto indicador de venda ou valor */}
                  <div className="h-1.5 mt-1 flex justify-center items-center">
                    {hasSales ? (
                      <span
                        className={`block h-1.5 w-1.5 rounded-full ${
                          isActive ? 'bg-white' : 'bg-emerald-500'
                        }`}
                        title={formatCurrency(dayTotals[dateStr])}
                      ></span>
                    ) : (
                      <span className="block h-1 w-1 bg-transparent"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              triggerClick();
              handleNextDay();
            }}
            disabled={days.indexOf(selectedDate) === days.length - 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-all"
            title="Próximo Dia"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 2. FORMULÁRIO DE LANÇAMENTO (ESQUERDA) */}
        {!viewAllDays ? (
          <div className="xl:col-span-1 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 h-fit" id="new-sale-form-card">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="h-4 w-4 text-emerald-600" />
                Lançar na Caixa
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100/50 px-2 py-0.5 rounded">
                Dia {formatDateDisplay(selectedDate, true)}
              </span>
            </div>

            {sellers.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-100">
                Atenção: Você precisa cadastrar pelo menos um vendedor na aba <strong>Vendedores</strong> antes de lançar vendas.
              </div>
            ) : (
              <form onSubmit={handleAddSaleSubmit} className="space-y-3.5">
                {/* Vendedor */}
                <div>
                  <label htmlFor="sale-seller" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Vendedor *
                  </label>
                  <select
                    id="sale-seller"
                    required
                    value={sellerId}
                    onChange={(e) => setSellerId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                  >
                    <option value="">Selecione o vendedor</option>
                    {sellers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.commissionPercent}%)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categoria do Serviço/Venda */}
                <div>
                  <label htmlFor="sale-category" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Tipo de Venda / Serviço *
                  </label>
                  <select
                    id="sale-category"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as SaleCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descrição do Item */}
                <div className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor="sale-desc" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Descrição Detalhada do Item / Serviço *
                    </label>
                    {description.trim().length > 1 && !exactMatchExists && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuickRegName(description.trim());
                          setQuickRegPrice('');
                          setQuickRegStock('');
                          setIsQuickRegOpen(true);
                        }}
                        title="Cadastrar esta mercadoria"
                        className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 transition-all cursor-pointer bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 animate-pulse"
                      >
                        <ArrowUpRight className="h-3 w-3" /> Cadastrar Mercadoria
                      </button>
                    )}
                  </div>
                  
                  <div className="relative">
                    <textarea
                      id="sale-desc"
                      required
                      rows={3}
                      placeholder="Comece a digitar o nome da mercadoria ou digite o serviço..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        setShowAutocomplete(true);
                      }}
                      onFocus={() => setShowAutocomplete(true)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white resize-none"
                    />
                    
                    {/* Autocomplete Dropdown */}
                    {showAutocomplete && matchingProducts.length > 0 && (
                      <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto z-50 divide-y divide-slate-100">
                        {matchingProducts.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setDescription(p.name);
                              setPrice(p.price.toString().replace('.', ','));
                              setCategory('Outros'); // Default category for physical products, or let user adjust
                              setSelectedProductId(p.id);
                              setShowAutocomplete(false);
                            }}
                            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs cursor-pointer"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{p.name}</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Estoque: <span className={`font-extrabold ${p.stockQuantity === 1 ? 'text-red-500' : p.stockQuantity === 0 ? 'text-slate-400' : 'text-slate-600'}`}>{p.stockQuantity} un</span>
                              </span>
                            </div>
                            <span className="font-bold text-emerald-600 font-mono">
                              {formatCurrency(p.price)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Autocompleta se o produto estiver cadastrado. Setinha no canto permite cadastrar novo instantaneamente.
                  </span>
                </div>

                {/* Preço Unitário e Quantidade */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="sale-price" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Preço Unitário (R$) *
                    </label>
                    <input
                      id="sale-price"
                      type="text"
                      required
                      placeholder="0,00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor="sale-qty" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Quantidade
                    </label>
                    <input
                      id="sale-qty"
                      type="number"
                      required
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div>
                  <label htmlFor="sale-payment" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    id="sale-payment"
                    required
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                  >
                    {paymentMethods.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mostrador de total provisório */}
                {price && !isNaN(parseFloat(price.replace(',', '.'))) && (
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex justify-between items-center text-xs">
                    <span className="text-slate-500">Valor Calculado:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {formatCurrency(parseFloat(price.replace(',', '.')) * quantity)}
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  id="submit-sale-btn"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Lançar Venda
                </button>
              </form>
            )}
          </div>
        ) : null}

        {/* 3. LISTAGEM DE LANÇAMENTOS (DIREITA) */}
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${
          viewAllDays ? 'xl:col-span-4' : 'xl:col-span-3'
        }`} id="sales-list-card">
          
          {/* Cabeçalho da Lista + Filtros */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-700 tracking-tight flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  {viewAllDays ? 'Lançamentos do Mês Completo' : `Lançamentos do dia ${formatDateDisplay(selectedDate)}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mostrando {filteredSales.length} {filteredSales.length === 1 ? 'venda' : 'vendas'} | Total: <span className="font-bold text-emerald-600 font-mono">{formatCurrency(totalListedValue)}</span>
                </p>
              </div>

              {/* Caixa de Busca Rápida */}
              <div className="relative w-full sm:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  placeholder="Filtrar lançamentos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded outline-none bg-white focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Filtros rápidos colapsáveis */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Filter className="h-3 w-3 text-slate-400" /> Filtros:
              </span>

              {/* Filtro Vendedor */}
              <select
                value={filterSeller}
                onChange={(e) => { triggerClick(); setFilterSeller(e.target.value); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Vendedor: Todos</option>
                {sellers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              {/* Filtro Categoria */}
              <select
                value={filterCategory}
                onChange={(e) => { triggerClick(); setFilterCategory(e.target.value); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="todas">Categoria: Todas</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              {/* Filtro Pagamento */}
              <select
                value={filterPayment}
                onChange={(e) => { triggerClick(); setFilterPayment(e.target.value); }}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="todos">Pagamento: Todos</option>
                {paymentMethods.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>

              {/* Limpar Filtros se ativos */}
              {(filterSeller !== 'todos' || filterCategory !== 'todas' || filterPayment !== 'todos' || searchQuery) && (
                <button
                  onClick={() => {
                    setFilterSeller('todos');
                    setFilterCategory('todas');
                    setFilterPayment('todos');
                    setSearchQuery('');
                  }}
                  className="text-rose-600 hover:underline font-semibold text-[11px] cursor-pointer"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Tabela de Lançamentos */}
          <div className="flex-1 overflow-x-auto">
            {filteredSales.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Nenhum lançamento encontrado para os filtros ativos.
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[10px] font-bold text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                  <tr>
                    {viewAllDays && <th className="px-4 py-3 w-16">Dia</th>}
                    <th className="px-4 py-3 w-28">Vendedor</th>
                    <th className="px-4 py-3 w-32">Tipo de Serviço</th>
                    <th className="px-4 py-3">Descrição do Item</th>
                    <th className="px-4 py-3 w-24 text-right">Preço</th>
                    <th className="px-4 py-3 w-12 text-center">Qtd</th>
                    <th className="px-4 py-3 w-24 text-right">Total</th>
                    <th className="px-4 py-3 w-28">Pagamento</th>
                    <th className="px-4 py-3 w-20 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredSales.map((sale) => {
                    const isEditing = editingSaleId === sale.id;
                    const sellerName = sellers.find(s => s.id === sale.sellerId)?.name || 'Desconhecido';

                    return (
                      <tr key={sale.id} className="hover:bg-slate-50/40 transition-colors">
                        {/* Data (somente em visualização mensal) */}
                        {viewAllDays && (
                          <td className="px-4 py-2 font-mono text-slate-400 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="px-1.5 py-0.5 border border-slate-200 rounded text-xs bg-white"
                              />
                            ) : (
                              formatDateDisplay(sale.date, true)
                            )}
                          </td>
                        )}

                        {/* Vendedor */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          {isEditing ? (
                            <select
                              value={editSellerId}
                              onChange={(e) => setEditSellerId(e.target.value)}
                              className="px-1 py-0.5 border border-slate-200 rounded text-xs bg-white"
                            >
                              {sellers.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-tight ${getSellerBadgeStyle(sale.sellerId)}`}>
                              {sellerName}
                            </span>
                          )}
                        </td>

                        {/* Categoria */}
                        <td className="px-4 py-2 whitespace-nowrap text-slate-600">
                          {isEditing ? (
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value as SaleCategory)}
                              className="px-1 py-0.5 border border-slate-200 rounded text-xs bg-white"
                            >
                              {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          ) : (
                            sale.category
                          )}
                        </td>

                        {/* Descrição */}
                        <td className="px-4 py-2 font-normal text-slate-900 max-w-xs truncate">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full px-1.5 py-0.5 border border-slate-200 rounded text-xs bg-white"
                            />
                          ) : (
                            sale.description
                          )}
                        </td>

                        {/* Preço Unitário */}
                        <td className="px-4 py-2 text-right whitespace-nowrap font-mono text-slate-600">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editPrice}
                              onChange={(e) => setEditPrice(e.target.value)}
                              className="w-16 px-1.5 py-0.5 border border-slate-200 rounded text-xs text-right bg-white"
                            />
                          ) : (
                            formatCurrency(sale.price)
                          )}
                        </td>

                        {/* Quantidade */}
                        <td className="px-4 py-2 text-center whitespace-nowrap font-semibold text-slate-500">
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(Number(e.target.value))}
                              className="w-12 px-1 py-0.5 border border-slate-200 rounded text-xs text-center bg-white"
                            />
                          ) : (
                            sale.quantity
                          )}
                        </td>

                        {/* Total Venda */}
                        <td className="px-4 py-2 text-right whitespace-nowrap font-semibold text-slate-900 font-mono">
                          {isEditing ? (
                            formatCurrency((parseFloat(editPrice.replace(',', '.')) || 0) * editQuantity)
                          ) : (
                            formatCurrency(sale.value)
                          )}
                        </td>

                        {/* Forma Pagamento */}
                        <td className="px-4 py-2 whitespace-nowrap">
                          {isEditing ? (
                            <select
                              value={editPaymentMethod}
                              onChange={(e) => setEditPaymentMethod(e.target.value as PaymentMethod)}
                              className="px-1 py-0.5 border border-slate-200 rounded text-xs bg-white"
                            >
                              {paymentMethods.map((pm) => (
                                <option key={pm} value={pm}>
                                  {pm}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="px-2 py-0.5 border border-slate-200 rounded text-[10px] uppercase font-medium bg-slate-50/50 text-slate-600">
                              {sale.paymentMethod}
                            </span>
                          )}
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={handleSaveEditSale}
                                  title="Salvar"
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => setEditingSaleId(null)}
                                  title="Cancelar"
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    triggerClick();
                                    startEditSale(sale);
                                  }}
                                  title="Editar Lançamento"
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm('Excluir este lançamento de venda do livro caixa?')) {
                                      triggerClick();
                                      onDeleteSale(sale.id);
                                    }
                                  }}
                                  title="Excluir Lançamento"
                                  className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Subtotal Footer da Tabela */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs font-semibold text-slate-500">
            <div className="flex gap-4">
              <span>Lançamentos: {filteredSales.length}</span>
              <span>Itens Vendidos: {filteredSales.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
            </div>
            <div className="text-emerald-600 text-sm font-bold font-mono">
              Subtotal: {formatCurrency(totalListedValue)}
            </div>
          </div>

        </div>
      </div>

      {/* QUICK PRODUCT REGISTER MODAL */}
      {isQuickRegOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
            <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="h-4.5 w-4.5" />
                Cadastrar Nova Mercadoria Instantaneamente
              </h3>
              <button 
                type="button"
                onClick={() => setIsQuickRegOpen(false)}
                className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                triggerClick();
                if (!quickRegName.trim()) return;
                const parsedPrice = parseFloat(quickRegPrice.replace(',', '.')) || 0;
                const parsedStock = Number(quickRegStock) || 0;

                onAddProduct({
                  name: quickRegName.trim(),
                  stockQuantity: parsedStock,
                  price: parsedPrice,
                });

                // Auto-fill form in DailyLedger
                setDescription(quickRegName.trim());
                setPrice(quickRegPrice);
                setCategory('Outros');

                setIsQuickRegOpen(false);
              }}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Nome da Mercadoria
                </label>
                <input
                  type="text"
                  required
                  value={quickRegName}
                  onChange={(e) => setQuickRegName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Preço de Venda (R$)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0,00"
                    value={quickRegPrice}
                    onChange={(e) => setQuickRegPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Qtd em Estoque Inicial
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="0"
                    value={quickRegStock}
                    onChange={(e) => setQuickRegStock(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-emerald-500 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickRegOpen(false)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-600 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <Check className="h-4 w-4" /> Salvar & Selecionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
