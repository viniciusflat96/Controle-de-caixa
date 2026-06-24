import React, { useState, useMemo } from 'react';
import { Search, HelpCircle, ArrowRight, Package, Users, ClipboardList, BookOpen, CreditCard } from 'lucide-react';

interface AssistanceProps {
  onNavigate: (tab: 'livro-caixa' | 'ordens-servico' | 'produtos' | 'clientes' | 'peliculas' | 'vendedores' | 'resumo' | 'sincronizacao') => void;
  triggerClick: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  targetTab?: 'livro-caixa' | 'ordens-servico' | 'produtos' | 'clientes' | 'peliculas' | 'vendedores' | 'resumo' | 'sincronizacao';
  icon: React.ReactNode;
}

export default function Assistance({ onNavigate, triggerClick }: AssistanceProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'Como eu cadastro produtos ou mercadorias?',
      answer: 'Você pode cadastrar e gerenciar seu estoque acessando a aba de Estoque & Produtos. Lá você define nome, quantidade e preço. Se o estoque chegar a 1, o sistema avisará em vermelho.',
      targetTab: 'produtos',
      icon: <Package className="h-5 w-5 text-indigo-500" />
    },
    {
      id: '2',
      question: 'Como eu cadastro clientes?',
      answer: 'Acesse a aba de Clientes no menu lateral. Você poderá preencher Nome, Telefone, e dados opcionais como CPF, Endereço e Data de Nascimento (para lembretes de aniversário).',
      targetTab: 'clientes',
      icon: <Users className="h-5 w-5 text-emerald-500" />
    },
    {
      id: '3',
      question: 'Como gerar uma Ordem de Serviço (OS)?',
      answer: 'Para dar entrada em um aparelho de cliente, vá até Ordens de Serviço e clique em "Nova Ordem de Serviço". Preencha os dados do cliente e do equipamento (marca, tipo, senhas).',
      targetTab: 'ordens-servico',
      icon: <ClipboardList className="h-5 w-5 text-blue-500" />
    },
    {
      id: '4',
      question: 'Como vejo as vendas do dia?',
      answer: 'A aba principal (Livro Caixa) exibe as vendas. Você pode usar o carrossel no topo para navegar entre os dias do mês selecionado.',
      targetTab: 'livro-caixa',
      icon: <BookOpen className="h-5 w-5 text-rose-500" />
    },
    {
      id: '5',
      question: 'Como adicionar vendedores e formas de pagamento?',
      answer: 'Na aba "Vendedores e Ajustes" você pode gerenciar sua equipe. As formas de pagamento são padrão do sistema (Dinheiro, Pix, Cartões).',
      targetTab: 'vendedores',
      icon: <CreditCard className="h-5 w-5 text-purple-500" />
    }
  ];

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return faqs;
    const q = searchQuery.toLowerCase();
    return faqs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
  }, [searchQuery, faqs]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-10">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-sm overflow-hidden text-white p-6 sm:p-10 relative">
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 flex items-center gap-2">
            <HelpCircle className="h-8 w-8" /> Central de Ajuda
          </h2>
          <p className="text-emerald-100 mb-6 max-w-xl">
            Pesquise por dúvidas comuns ou descubra como utilizar as ferramentas do sistema para gerenciar sua assistência técnica.
          </p>
          
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Ex: Como cadastrar clientes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm text-slate-800 border-none rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-500/30 bg-white placeholder-slate-400"
            />
          </div>
        </div>
        <div className="absolute -bottom-10 -right-10 opacity-10">
          <HelpCircle className="w-64 h-64" />
        </div>
      </div>

      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 font-medium">Nenhum resultado encontrado para "{searchQuery}".</p>
          </div>
        ) : (
          filteredFaqs.map(faq => (
            <div key={faq.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:border-emerald-200 transition-colors">
              <div className="flex gap-4">
                <div className="h-10 w-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 border border-slate-100">
                  {faq.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-base mb-1.5">{faq.question}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{faq.answer}</p>
                  
                  {faq.targetTab && (
                    <button
                      onClick={() => { triggerClick(); onNavigate(faq.targetTab!); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-md text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Ir para {faq.targetTab.replace('-', ' ')} <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
