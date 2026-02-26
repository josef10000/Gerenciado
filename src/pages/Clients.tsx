import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Users, Plus, Search, Filter, X, MessageCircle, CalendarDays, Edit2, Trash2 } from 'lucide-react';
import { Client } from '../types';

export default function Clients() {
  const { clients, addClient, updateClient, deleteClient, bookings, properties } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', notes: '' });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewClient({ name: '', email: '', phone: '', notes: '' });
    setIsAdding(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingId(client.id);
    setNewClient({ name: client.name, email: client.email, phone: client.phone || '', notes: client.notes || '' });
    setIsAdding(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name) return;
    
    if (editingId) {
      updateClient(editingId, newClient);
    } else {
      addClient(newClient);
    }
    
    setIsAdding(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getClientStatus = (clientId: string) => {
    const now = Date.now();
    const clientBookings = bookings.filter(b => b.clientId === clientId && b.status === 'confirmed');
    
    const active = clientBookings.find(b => b.startDate <= now && b.endDate >= now);
    if (active) {
      const property = properties.find(p => p.id === active.propertyId);
      return { status: 'active', booking: active, property };
    }

    const upcoming = clientBookings
      .filter(b => b.startDate > now)
      .sort((a, b) => a.startDate - b.startDate)[0];
    
    if (upcoming) {
      const property = properties.find(p => p.id === upcoming.propertyId);
      return { status: 'upcoming', booking: upcoming, property };
    }

    return null;
  };

  const formatWhatsAppNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Clientes</h1>
          <p className="mt-2 text-sm text-gray-400">
            Uma lista de todos os seus clientes, incluindo nome, e-mail e telefone.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cliente
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Nome</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">E-mail</label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newClient.email}
                  onChange={e => setNewClient({...newClient, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Telefone</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md bg-gray-800 border-gray-700 text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
            placeholder="Buscar clientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden">
        {filteredClients.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {filteredClients.map(client => {
              const statusInfo = getClientStatus(client.id);
              
              return (
                <li key={client.id} className="p-4 hover:bg-gray-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300 font-bold">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-white">{client.name}</p>
                        <p className="text-sm text-gray-400">{client.email} {client.phone && `• ${client.phone}`}</p>
                        
                        {statusInfo && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              statusInfo.status === 'active' ? 'bg-red-900/50 text-red-400' : 'bg-yellow-900/50 text-yellow-400'
                            }`}>
                              <CalendarDays className="w-3 h-3 mr-1" />
                              {statusInfo.status === 'active' ? 'Aluguel em andamento' : 'Reserva futura'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {statusInfo.property?.name} ({new Date(statusInfo.booking.startDate).toLocaleDateString()})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {client.phone && (
                        <div className="flex-shrink-0">
                          <a
                            href={`https://wa.me/${formatWhatsAppNumber(client.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500"
                          >
                            <MessageCircle className="w-4 h-4 mr-1.5" />
                            WhatsApp
                          </a>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(client)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                              deleteClient(client.id);
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-600"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Users className="w-12 h-12 mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-200">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-gray-400">Comece adicionando um novo cliente.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Cliente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
