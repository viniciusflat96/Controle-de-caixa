import React, { useState, useMemo } from 'react';
import { ProtectorCompatibility } from '../types';
import { Smartphone, Plus, Edit2, Trash2, Check, X, Search } from 'lucide-react';

interface ProtectorsConfigProps {
  protectors: ProtectorCompatibility[];
  onAddProtector: (newProtector: Omit<ProtectorCompatibility, 'id'>) => void;
  onUpdateProtector: (updatedProtector: ProtectorCompatibility) => void;
  onDeleteProtector: (id: string) => void;
  triggerClick: () => void;
}

export default function ProtectorsConfig({
  protectors,
  onAddProtector,
  onUpdateProtector,
  onDeleteProtector,
  triggerClick,
}: ProtectorsConfigProps) {
  const [name, setName] = useState('');
  const [modelsInput, setModelsInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [editName, setEditName] = useState('');
  const [editModelsInput, setEditModelsInput] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredProtectors = useMemo(() => {
    return protectors.filter((p) => {
      const q = searchQuery.toLowerCase();
      if (p.name.toLowerCase().includes(q)) return true;
      if (p.compatibleModels.some(m => m.toLowerCase().includes(q))) return true;
      return false;
    });
  }, [protectors, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();

    if (!name.trim() || !modelsInput.trim()) return;

    const models = modelsInput.split(',').map(m => m.trim()).filter(Boolean);

    onAddProtector({
      name: name.trim(),
      compatibleModels: models,
    });

    setName('');
    setModelsInput('');
  };

  const startEdit = (p: ProtectorCompatibility) => {
    triggerClick();
    setEditingId(p.id);
    setEditName(p.name);
    setEditModelsInput(p.compatibleModels.join(', '));
  };

  const cancelEdit = () => {
    triggerClick();
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    triggerClick();
    if (!editName.trim() || !editModelsInput.trim()) return;

    const models = editModelsInput.split(',').map(m => m.trim()).filter(Boolean);

    onUpdateProtector({
      id,
      name: editName.trim(),
      compatibleModels: models,
    });

    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Películas Compatíveis</h2>
              <p className="text-xs text-slate-500">Cadastre e pesquise películas que servem em múltiplos aparelhos</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nome da Película / Modelo Principal *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: iPhone 11 / XR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Modelos Compatíveis (Separe por vírgula) *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: iPhone 11, iPhone XR"
                value={modelsInput}
                onChange={(e) => setModelsInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Cadastrar Compatibilidade
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-slate-400" />
            Lista de Compatibilidades ({filteredProtectors.length})
          </h3>
          
          <div className="w-full sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por modelo ou película..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {filteredProtectors.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Smartphone className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhuma compatibilidade encontrada.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Película / Principal</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aparelhos Compatíveis</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProtectors.map((protector) => (
                  <tr key={protector.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-3">
                      {editingId === protector.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                        />
                      ) : (
                        <div className="font-bold text-xs text-slate-800">{protector.name}</div>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === protector.id ? (
                        <input
                          type="text"
                          value={editModelsInput}
                          onChange={(e) => setEditModelsInput(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {protector.compatibleModels.map((m, i) => (
                            <span key={i} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded-md border border-slate-200">
                              {m}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingId === protector.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => saveEdit(protector.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 bg-slate-100 text-slate-600 rounded-md">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEdit(protector)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md">
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => { if(window.confirm('Excluir?')) onDeleteProtector(protector.id); }} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
