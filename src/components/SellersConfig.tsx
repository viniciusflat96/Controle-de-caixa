/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Seller, AppSettings } from '../types';
import { Plus, Trash2, Edit2, Check, X, Users, Award, Image, Upload, Trash, Palette, Smartphone } from 'lucide-react';

interface SellersConfigProps {
  sellers: Seller[];
  storeLogo: string;
  settings?: AppSettings | null;
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onUpdateSeller: (seller: Seller) => void;
  onDeleteSeller: (id: string) => void;
  onUpdateStoreLogo: (logoBase64: string) => void;
  onUpdateSettings: (settings: AppSettings) => void;
  triggerClick: () => void;
}

export default function SellersConfig({
  sellers,
  storeLogo,
  settings,
  onAddSeller,
  onUpdateSeller,
  onDeleteSeller,
  onUpdateStoreLogo,
  onUpdateSettings,
  triggerClick,
}: SellersConfigProps) {
  const [name, setName] = useState('');
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Controle de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState<number>(10);
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();
    if (!name.trim()) return;
    onAddSeller({
      name: name.trim(),
      commissionPercent: Number(commissionPercent),
      phone: phone.trim(),
      email: email.trim(),
    });
    setName('');
    setCommissionPercent(10);
    setPhone('');
    setEmail('');
  };

  const startEdit = (seller: Seller) => {
    triggerClick();
    setEditingId(seller.id);
    setEditName(seller.name);
    setEditCommission(seller.commissionPercent);
    setEditPhone(seller.phone || '');
    setEditEmail(seller.email || '');
  };

  const handleSaveEdit = () => {
    triggerClick();
    if (!editName.trim() || !editingId) return;
    onUpdateSeller({
      id: editingId,
      name: editName.trim(),
      commissionPercent: Number(editCommission),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    });
    setEditingId(null);
  };

  // Processar upload de arquivo para logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    triggerClick();
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      onUpdateStoreLogo(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    triggerClick();
    onUpdateStoreLogo('');
  };

  return (
    <div className="space-y-6" id="sellers-config-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-600" />
            Configurações e Vendedores
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os vendedores da loja, defina as comissões e adicione o logotipo personalizado para as ordens de serviço.
          </p>
        </div>
      </div>

      {/* Grid Superior: Vendedores e Formulário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de cadastro */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4" id="add-seller-form-card">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Plus className="h-4 w-4 text-emerald-500" />
            Novo Vendedor
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="seller-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nome Completo
              </label>
              <input
                id="seller-name"
                type="text"
                required
                placeholder="Ex: Carlos Eduardo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="seller-commission" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Comissão (%)
              </label>
              <div className="relative rounded-lg">
                <input
                  id="seller-commission"
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.5"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(Number(e.target.value))}
                  className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="seller-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                WhatsApp / Telefone
              </label>
              <input
                id="seller-phone"
                type="text"
                placeholder="Ex: (11) 99999-9999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="seller-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                E-mail (para notificações)
              </label>
              <input
                id="seller-email"
                type="email"
                placeholder="Ex: tecnico@loja.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>

            <button
              type="submit"
              id="submit-seller-btn"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Cadastrar Vendedor
            </button>
          </form>
        </div>

        {/* Tabela/Lista de Vendedores */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="sellers-list-card">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-500" />
              Equipe de Vendas ({sellers.length})
            </h3>
          </div>

          {sellers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum vendedor cadastrado. Utilize o formulário ao lado para cadastrar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-slate-600">
                <thead className="bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3">Vendedor</th>
                    <th scope="col" className="px-6 py-3 text-center">Comissão</th>
                    <th scope="col" className="px-6 py-3">Contatos</th>
                    <th scope="col" className="px-6 py-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {sellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="px-6 py-3">
                        {editingId === seller.id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-emerald-500 bg-white"
                          />
                        ) : (
                          <div className="font-bold text-slate-900">{seller.name}</div>
                        )}
                      </td>
                      
                      <td className="px-6 py-3 text-center">
                        {editingId === seller.id ? (
                          <div className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="0.5"
                              value={editCommission}
                              onChange={(e) => setEditCommission(Number(e.target.value))}
                              className="w-16 px-1.5 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-emerald-500 bg-white font-mono"
                            />
                            <span className="text-slate-400 font-mono">%</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100/50 px-2.5 py-0.5 rounded-full text-[11px]">
                            {seller.commissionPercent}%
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-3">
                        {editingId === seller.id ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={editPhone}
                              onChange={(e) => setEditPhone(e.target.value)}
                              placeholder="Telefone"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                            />
                            <input
                              type="text"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              placeholder="E-mail"
                              className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                            />
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-500 space-y-0.5">
                            {seller.phone && <div>{seller.phone}</div>}
                            {seller.email && <div>{seller.email}</div>}
                            {!seller.phone && !seller.email && <span className="text-slate-300">Sem contato</span>}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {editingId === seller.id ? (
                            <>
                              <button
                                onClick={handleSaveEdit}
                                title="Salvar"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                title="Cancelar"
                                className="p-1 text-slate-400 hover:bg-slate-100 rounded transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(seller)}
                                title="Editar"
                                className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Deseja realmente remover o vendedor ${seller.name}?`)) {
                                    triggerClick();
                                    onDeleteSeller(seller.id);
                                  }
                                }}
                                title="Excluir"
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* SEÇÃO: CONFIGURAÇÃO DE LOGO DA LOJA */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Image className="h-4.5 w-4.5 text-emerald-600" />
          Identidade Visual & Logotipo da Loja
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Lado Esquerdo: Upload e instruções */}
          <div className="md:col-span-2 space-y-2.5">
            <p className="text-xs text-slate-600 leading-relaxed">
              Adicione o logotipo oficial da sua assistência técnica para personalizar o cabeçalho superior esquerdo da aplicação e ser impresso de forma automática nas vias de <strong>Ordem de Serviço (OS)</strong> e recibos de garantia dos clientes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border border-emerald-200/50 font-bold py-2 px-3.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs">
                <Upload className="h-3.5 w-3.5" />
                <span>Escolher Imagem Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>

              {storeLogo && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 font-bold py-2 px-3.5 rounded-lg text-xs transition-colors cursor-pointer shadow-xs"
                >
                  <Trash className="h-3.5 w-3.5" />
                  Remover Logo
                </button>
              )}
            </div>
            <div className="text-[10px] text-slate-400">
              Formatos recomendados: PNG ou JPG com fundo transparente ou branco. Proporção retangular horizontal (ex: 300x80px).
            </div>
          </div>

          {/* Lado Direito: Preview da logo atual */}
          <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 flex flex-col items-center justify-center min-h-[120px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Visualização Prévia
            </span>
            {storeLogo ? (
              <div className="bg-white p-2.5 rounded-lg border border-slate-200/50 shadow-inner flex items-center justify-center max-w-full">
                <img
                  src={storeLogo}
                  alt="Logo da loja"
                  className="max-h-[60px] object-contain"
                />
              </div>
            ) : (
              <div className="text-center text-slate-400 py-4">
                <Image className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
                <span className="text-[10.5px] italic">Sem logotipo ativo (usando texto padrão)</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* SEÇÃO: CONFIGURAÇÃO DE CORES DA INTERFACE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Palette className="h-4.5 w-4.5 text-emerald-600" />
          Cores da Interface do Sistema
        </h3>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Personalize a cor principal do sistema para alinhar com a identidade visual da sua assistência.
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'emerald', bg: 'bg-emerald-500', name: 'Esmeralda (Padrão)' },
              { id: 'blue', bg: 'bg-blue-500', name: 'Azul' },
              { id: 'indigo', bg: 'bg-indigo-500', name: 'Índigo' },
              { id: 'violet', bg: 'bg-violet-500', name: 'Violeta' },
              { id: 'rose', bg: 'bg-rose-500', name: 'Rosa' },
              { id: 'amber', bg: 'bg-amber-500', name: 'Âmbar' }
            ].map(theme => {
              const isActive = (settings?.themeColor || 'emerald') === theme.id;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    triggerClick();
                    onUpdateSettings({ 
                      id: 'main', 
                      themeColor: theme.id as AppSettings['themeColor'],
                      deviceTypes: settings?.deviceTypes || []
                    });
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    isActive ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full ${theme.bg} shadow-inner flex items-center justify-center`}>
                    {isActive && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{theme.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SEÇÃO: TIPOS DE EQUIPAMENTOS PARA OS */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-3">
          <Smartphone className="h-4.5 w-4.5 text-emerald-600" />
          Tipos de Aparelhos (Ordem de Serviço)
        </h3>
        
        <div className="space-y-3">
          <p className="text-xs text-slate-600 leading-relaxed">
            Personalize a lista de aparelhos que aparece no formulário de Ordens de Serviço.
          </p>
          <div className="flex flex-wrap gap-2">
            {(settings?.deviceTypes?.length ? settings.deviceTypes : ['Celular', 'Notebook', 'Computador', 'Tablet', 'Console']).map(type => (
              <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                {type}
                <button
                  onClick={() => {
                    const current = settings?.deviceTypes?.length ? settings.deviceTypes : ['Celular', 'Notebook', 'Computador', 'Tablet', 'Console'];
                    const filtered = current.filter(t => t !== type);
                    onUpdateSettings({ 
                      id: 'main', 
                      themeColor: settings?.themeColor || 'emerald',
                      deviceTypes: filtered
                    });
                  }}
                  className="text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remover"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                const newType = window.prompt('Digite o nome do novo tipo de aparelho:');
                if (newType && newType.trim()) {
                  const current = settings?.deviceTypes?.length ? settings.deviceTypes : ['Celular', 'Notebook', 'Computador', 'Tablet', 'Console'];
                  if (!current.includes(newType.trim())) {
                    onUpdateSettings({ 
                      id: 'main', 
                      themeColor: settings?.themeColor || 'emerald',
                      deviceTypes: [...current, newType.trim()]
                    });
                  }
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-200 transition-colors border-dashed"
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

