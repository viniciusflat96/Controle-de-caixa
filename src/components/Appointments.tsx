import React, { useState, useMemo } from 'react';
import { Appointment, Client, Seller } from '../types';
import { Calendar as CalendarIcon, Clock, MapPin, User, Plus, Search, Trash2, Bell } from 'lucide-react';
import { formatDateDisplay } from '../utils';

interface AppointmentsProps {
  appointments: Appointment[];
  clients: Client[];
  sellers: Seller[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onDeleteAppointment: (id: string) => void;
  triggerClick: () => void;
}

export default function Appointments({
  appointments,
  clients,
  sellers,
  onAddAppointment,
  onDeleteAppointment,
  triggerClick,
}: AppointmentsProps) {
  const [clientId, setClientId] = useState('');
  const [address, setAddress] = useState('');
  const [service, setService] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerClick();

    if (!clientId || !service || !date || !time) return;

    onAddAppointment({
      clientId,
      address,
      service,
      technicianId,
      date,
      time,
      notified: false
    });

    setClientId('');
    setAddress('');
    setService('');
    setTechnicianId('');
    setDate('');
    setTime('');
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cid = e.target.value;
    setClientId(cid);
    const client = clients.find(c => c.id === cid);
    if (client && client.address) {
      setAddress(client.address);
    }
  };

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    }).filter(app => {
      const q = searchQuery.toLowerCase();
      const clientName = clients.find(c => c.id === app.clientId)?.name || '';
      const techName = sellers.find(s => s.id === app.technicianId)?.name || '';
      return (
        app.service.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q) ||
        techName.toLowerCase().includes(q) ||
        app.address.toLowerCase().includes(q)
      );
    });
  }, [appointments, clients, sellers, searchQuery]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-10">
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <CalendarIcon className="h-5 w-5 text-emerald-600" />
          Agendamento de Serviços
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Cliente *
              </label>
              <select
                required
                value={clientId}
                onChange={handleClientChange}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              >
                <option value="">Selecione um cliente</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Endereço do Serviço (Opcional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ex: Rua das Flores, 123"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Serviço a ser realizado *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Instalação de Câmeras, Configuração de Rede"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Técnico Responsável
              </label>
              <select
                value={technicianId}
                onChange={(e) => setTechnicianId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
              >
                <option value="">Selecione o técnico (Opcional)</option>
                {sellers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Data *
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Horário *
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg text-xs transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" /> Agendar Serviço
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-emerald-600" />
            Agenda ({sortedAppointments.length})
          </h3>
          
          <div className="w-full sm:w-64 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar agendamentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 bg-white"
            />
          </div>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Nenhum agendamento encontrado.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedAppointments.map((app) => {
              const client = clients.find(c => c.id === app.clientId);
              const tech = sellers.find(s => s.id === app.technicianId);
              
              const isPast = new Date(`${app.date}T${app.time}`) < new Date();

              return (
                <div key={app.id} className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${isPast ? 'bg-slate-50/50 opacity-75' : 'hover:bg-slate-50/80'}`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex flex-col items-center justify-center shrink-0 w-16 h-16 ${isPast ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                      <span className="text-[10px] font-bold uppercase">{new Date(app.date).toLocaleDateString('pt-BR', { month: 'short' })}</span>
                      <span className="text-xl font-black leading-none my-0.5">{app.date.split('-')[2]}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">{app.service}</h4>
                      <div className="flex flex-col gap-1 text-xs text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-semibold">{client?.name || 'Cliente Removido'}</span>
                          {client?.phone && <span className="text-slate-400">({client.phone})</span>}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium text-emerald-700">{app.time}</span>
                        </div>
                        {app.address && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {app.address}
                          </div>
                        )}
                        {tech && (
                          <div className="flex items-center gap-1.5 mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded-md border border-slate-200">
                            <span className="font-semibold text-[10px] text-slate-600">Técnico: {tech.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end sm:justify-start gap-2 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                    {!isPast && tech?.phone && (
                      <a
                        href={`https://wa.me/${tech.phone.replace(/\D/g, '')}?text=Olá ${tech.name}, você tem um novo agendamento para o cliente ${client?.name} no dia ${formatDateDisplay(app.date)} às ${app.time}. Serviço: ${app.service}. Endereço: ${app.address || 'Não informado'}.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-200 hover:bg-green-100 transition-colors"
                      >
                        <Bell className="h-3 w-3" /> Notificar Técnico
                      </a>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja cancelar/excluir este agendamento?')) {
                          triggerClick();
                          onDeleteAppointment(app.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir Agendamento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
