/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Seller } from '../types';
import { Plus, Trash2, Edit2, Check, X, Users, Award } from 'lucide-react';

interface SellersConfigProps {
  sellers: Seller[];
  onAddSeller: (seller: Omit<Seller, 'id'>) => void;
  onUpdateSeller: (seller: Seller) => void;
  onDeleteSeller: (id: string) => void;
}

export default function SellersConfig({
  sellers,
  onAddSeller,
  onUpdateSeller,
  onDeleteSeller,
}: SellersConfigProps) {
  const [name, setName] = useState('');
  const [commissionPercent, setCommissionPercent] = useState<number>(10);
  
  // Controle de edição inline
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCommission, setEditCommission] = useState<number>(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddSeller({
      name: name.trim(),
      commissionPercent: Number(commissionPercent),
    });
    setName('');
    setCommissionPercent(10);
  };

  const startEdit = (seller: Seller) => {
    setEditingId(seller.id);
    setEditName(seller.name);
    setEditCommission(seller.commissionPercent);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingId) return;
    onUpdateSeller({
      id: editingId,
      name: editName.trim(),
      commissionPercent: Number(editCommission),
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6" id="sellers-config-container">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Configuração de Vendedores
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Cadastre os vendedores da loja e defina suas respectivas porcentagens de comissão de vendas.
          </p>
        </div>
      </div>

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
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white"
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
                  className="w-full pl-3 pr-8 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white font-mono"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-xs">%</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              id="submit-seller-btn"
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" /> Cadastrar Vendedor
            </button>
          </form>
        </div>

        {/* Tabela/Lista de Vendedores */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden" id="sellers-list-card">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-500" />
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
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:border-indigo-500 bg-white"
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
                              className="w-16 px-1.5 py-1 text-xs border border-slate-200 rounded text-center focus:outline-none focus:border-indigo-500 bg-white font-mono"
                            />
                            <span className="text-slate-400 font-mono">%</span>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50/80 border border-indigo-100/50 px-2.5 py-0.5 rounded-full text-[11px]">
                            {seller.commissionPercent}%
                          </span>
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
                                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Deseja realmente remover o vendedor ${seller.name}?`)) {
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
    </div>
  );
}
