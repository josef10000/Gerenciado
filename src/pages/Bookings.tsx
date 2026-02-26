import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';
import { CalendarDays, Plus, Search, Filter, X, Edit2, Trash2 } from 'lucide-react';
import { Booking } from '../types';

export default function Bookings() {
  const { bookings, properties, clients, addBooking, updateBooking, deleteBooking, addClient } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newBooking, setNewBooking] = useState({
    propertyId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    startDate: '',
    endDate: '',
    totalAmount: 0,
    status: 'confirmed' as const
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewBooking({
      propertyId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      startDate: '',
      endDate: '',
      totalAmount: 0,
      status: 'confirmed'
    });
    setIsAdding(true);
  };

  const handleOpenEdit = (booking: Booking) => {
    const client = clients.find(c => c.id === booking.clientId);
    setEditingId(booking.id);
    setNewBooking({
      propertyId: booking.propertyId,
      clientName: client?.name || '',
      clientEmail: client?.email || '',
      clientPhone: client?.phone || '',
      startDate: new Date(booking.startDate).toISOString().split('T')[0],
      endDate: new Date(booking.endDate).toISOString().split('T')[0],
      totalAmount: booking.totalAmount,
      status: booking.status
    });
    setIsAdding(true);
  };

  useEffect(() => {
    if (newBooking.propertyId && newBooking.startDate && newBooking.endDate && !editingId) {
      const property = properties.find(p => p.id === newBooking.propertyId);
      if (property) {
        const start = new Date(newBooking.startDate).getTime();
        const end = new Date(newBooking.endDate).getTime();
        if (end >= start) {
          const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          const total = Math.max(1, nights) * property.pricePerNight;
          setNewBooking(prev => ({ ...prev, totalAmount: total }));
        }
      }
    }
  }, [newBooking.propertyId, newBooking.startDate, newBooking.endDate, properties, editingId]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.propertyId || !newBooking.clientName || !newBooking.startDate || !newBooking.endDate) return;
    
    // Check if client already exists by name
    let client = clients.find(c => c.name.toLowerCase() === newBooking.clientName.toLowerCase());
    
    if (!client) {
      client = addClient({
        name: newBooking.clientName,
        email: newBooking.clientEmail,
        phone: newBooking.clientPhone,
        notes: ''
      });
    }

    const bookingData = {
      propertyId: newBooking.propertyId,
      clientId: client.id,
      startDate: new Date(newBooking.startDate).getTime(),
      endDate: new Date(newBooking.endDate).getTime(),
      totalAmount: newBooking.totalAmount,
      status: newBooking.status,
    };

    if (editingId) {
      updateBooking(editingId, bookingData);
    } else {
      addBooking(bookingData);
    }
    
    setIsAdding(false);
  };

  const filteredBookings = bookings.filter(b => {
    const client = clients.find(c => c.id === b.clientId);
    const property = properties.find(p => p.id === b.propertyId);
    const searchLower = searchQuery.toLowerCase();
    return (
      client?.name.toLowerCase().includes(searchLower) ||
      property?.name.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Reservas</h1>
          <p className="mt-2 text-sm text-gray-400">
            Uma lista de todas as suas reservas, incluindo nome do cliente, propriedade, datas e status.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Reserva
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Reserva' : 'Nova Reserva'}</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Propriedade</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newBooking.propertyId}
                  onChange={e => setNewBooking({...newBooking, propertyId: e.target.value})}
                >
                  <option value="">Selecione uma propriedade...</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Nome do Cliente</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newBooking.clientName}
                  onChange={e => setNewBooking({...newBooking, clientName: e.target.value})}
                  placeholder="Ex: João Silva"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">E-mail do Cliente</label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    value={newBooking.clientEmail}
                    onChange={e => setNewBooking({...newBooking, clientEmail: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Telefone do Cliente</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    value={newBooking.clientPhone}
                    onChange={e => setNewBooking({...newBooking, clientPhone: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Data de Início</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    value={newBooking.startDate}
                    onChange={e => setNewBooking({...newBooking, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300">Data de Fim</label>
                  <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                    value={newBooking.endDate}
                    onChange={e => setNewBooking({...newBooking, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Valor Total (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newBooking.totalAmount}
                  onChange={e => setNewBooking({...newBooking, totalAmount: parseFloat(e.target.value) || 0})}
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
            placeholder="Buscar reservas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden">
        {filteredBookings.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {filteredBookings.map(booking => {
              const client = clients.find(c => c.id === booking.clientId);
              const property = properties.find(p => p.id === booking.propertyId);
              const isCompleted = booking.endDate < Date.now();
              
              return (
                <li key={booking.id} className="p-4 hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{property?.name || 'Propriedade Deletada'}</p>
                          <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full ${
                            isCompleted ? 'bg-green-900/50 text-green-400' : 'bg-blue-900/50 text-blue-400'
                          }`}>
                            {isCompleted ? 'Finalizada' : 'Confirmada'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">Cliente: {client?.name || 'Cliente Deletado'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-indigo-400">R$ {booking.totalAmount}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(booking)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta reserva?')) {
                              deleteBooking(booking.id);
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
            <CalendarDays className="w-12 h-12 mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-200">Nenhuma reserva encontrada</h3>
            <p className="mt-1 text-sm text-gray-400">Comece criando uma nova reserva.</p>
            <div className="mt-6">
              <button
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Reserva
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
