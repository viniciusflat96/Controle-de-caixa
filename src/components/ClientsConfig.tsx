import React, { useState, useMemo } from 'react';
import { Client } from '../types';
import { Users, Plus, Edit2, Trash2, Check, X, Search, UserCircle2 } from 'lucide-react';

interface ClientsConfigProps {
  clients: Client[];
  onAddClient: (newClient: Omit<Client, 'id'>) => void;
  onUpdateClient: (updatedClient: Client) => void;
  onDeleteClient: (id: string) => void;
  triggerClick: () => void;
}

export default function ClientsConfig({
  clients,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
  triggerClick,
}: ClientsConfigProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Fields for editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.cpf && c.cpf.toLowerCase().includes(q))
      );
    });
  }, [clients, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();

    if (!name.trim() || !phone.trim()) return;

    onAddClient({
      name: name.trim(),
      phone: phone.trim(),
      cpf: cpf.trim() || undefined,
      address: address.trim() || undefined,
      birthDate: birthDate || undefined,
    });

    setName('');
    setPhone('');
    setCpf('');
    setAddress('');
    setBirthDate('');
  };

  const startEdit = (c: Client) => {
    triggerClick();
    setEditingId(c.id);
    setEditName(c.name);
    setEditPhone(c.phone);
    setEditCpf(c.cpf || '');
    setEditAddress(c.address || '');
    setEditBirthDate(c.birthDate || '');
  };

  const cancelEdit = () => {
    triggerClick();
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    triggerClick();
    if (!editName.trim() || !editPhone.trim()) return;

    onUpdateClient({
      id,
      name: editName.trim(),
      phone: editPhone.trim(),
      cpf: editCpf.trim() || undefined,
      address: editAddress.trim() || undefined,
      birthDate: editBirthDate || undefined,
    });

    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10 max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shadow-inner">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Cadastro de Clientes</h2>
              <p className="text-xs text-slate-500">Adicione e gerencie a carteira de clientes</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: João da Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Telefone/WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 11999998888"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                CPF (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: 123.456.789-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Data de Nascimento (Opcional)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Endereço Completo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Rua das Flores, 123 - Centro"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Cadastrar Cliente
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <UserCircle2 className="h-4 w-4 text-slate-400" />
            Clientes Cadastrados ({filteredClients.length})
          </h3>
          
          <div className="w-full sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, cel ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">Nenhum cliente encontrado.</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchQuery ? 'Tente usar outros termos na busca.' : 'Cadastre o primeiro cliente no formulário acima.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nome & Contato</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">CPF & Nasc.</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Endereço</th>
                  <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-3">
                      {editingId === client.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                            placeholder="Nome"
                          />
                          <input
                            type="text"
                            value={editPhone}
                            onChange={(e) => setEditPhone(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                            placeholder="Telefone"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-bold text-xs text-slate-800">{client.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{client.phone}</div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === client.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editCpf}
                            onChange={(e) => setEditCpf(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                            placeholder="CPF"
                          />
                          <input
                            type="date"
                            value={editBirthDate}
                            onChange={(e) => setEditBirthDate(e.target.value)}
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-mono text-[10px] text-slate-600">{client.cpf || '-'}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {client.birthDate ? new Date(client.birthDate).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      {editingId === client.id ? (
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:border-emerald-500"
                          placeholder="Endereço"
                        />
                      ) : (
                        <div className="text-xs text-slate-600 max-w-[200px] truncate" title={client.address}>
                          {client.address || '-'}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {editingId === client.id ? (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => saveEdit(client.id)}
                            className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-colors cursor-pointer"
                            title="Salvar"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors cursor-pointer"
                            title="Cancelar"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEdit(client)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer"
                            title="Editar Cliente"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              triggerClick();
                              if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                                onDeleteClient(client.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Excluir Cliente"
                          >
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
