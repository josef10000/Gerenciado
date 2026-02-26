import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Building, Plus, Search, X, CalendarDays, User, Edit2, Trash2 } from 'lucide-react';
import { Property } from '../types';

export default function Properties() {
  const { properties, addProperty, updateProperty, deleteProperty, bookings, clients } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newProperty, setNewProperty] = useState({ name: '', address: '', type: 'house' as const, pricePerNight: 0 });

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewProperty({ name: '', address: '', type: 'house', pricePerNight: 0 });
    setIsAdding(true);
  };

  const handleOpenEdit = (property: Property) => {
    setEditingId(property.id);
    setNewProperty({ 
      name: property.name, 
      address: property.address, 
      type: property.type as 'house' | 'apartment' | 'other', 
      pricePerNight: property.pricePerNight 
    });
    setIsAdding(true);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProperty.name) return;
    
    if (editingId) {
      updateProperty(editingId, newProperty);
    } else {
      addProperty(newProperty);
    }
    
    setIsAdding(false);
  };

  const filteredProperties = properties.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelevantBooking = (propertyId: string) => {
    const now = Date.now();
    const propertyBookings = bookings.filter(b => b.propertyId === propertyId && b.status === 'confirmed');
    
    // Check for currently active booking
    const active = propertyBookings.find(b => b.startDate <= now && b.endDate >= now);
    if (active) return { booking: active, status: 'active' };

    // Check for next upcoming booking
    const upcoming = propertyBookings
      .filter(b => b.startDate > now)
      .sort((a, b) => a.startDate - b.startDate)[0];
    
    if (upcoming) return { booking: upcoming, status: 'upcoming' };

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Propriedades</h1>
          <p className="mt-2 text-sm text-gray-400">
            Uma lista de todas as suas propriedades, incluindo status de aluguel atual.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Propriedade
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Editar Propriedade' : 'Nova Propriedade'}</h2>
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
                  value={newProperty.name}
                  onChange={e => setNewProperty({...newProperty, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Endereço</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newProperty.address}
                  onChange={e => setNewProperty({...newProperty, address: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Tipo</label>
                <select
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newProperty.type}
                  onChange={e => setNewProperty({...newProperty, type: e.target.value as any})}
                >
                  <option value="house">Casa</option>
                  <option value="apartment">Apartamento</option>
                  <option value="other">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Preço por Noite (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={newProperty.pricePerNight}
                  onChange={e => setNewProperty({...newProperty, pricePerNight: parseFloat(e.target.value) || 0})}
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
            placeholder="Buscar propriedades..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.length > 0 ? (
          filteredProperties.map(property => {
            const relevantBookingInfo = getRelevantBooking(property.id);
            const activeBooking = relevantBookingInfo?.booking;
            const status = relevantBookingInfo?.status;
            const client = activeBooking ? clients.find(c => c.id === activeBooking.clientId) : null;

            return (
              <div key={property.id} className="bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden flex flex-col">
                <div className="p-5 flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{property.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        status === 'active' ? 'bg-red-900/50 text-red-400' : 
                        status === 'upcoming' ? 'bg-yellow-900/50 text-yellow-400' : 
                        'bg-green-900/50 text-green-400'
                      }`}>
                        {status === 'active' ? 'Alugada Agora' : 
                         status === 'upcoming' ? 'Reservada' : 
                         'Disponível'}
                      </span>
                      <button
                        onClick={() => handleOpenEdit(property)}
                        className="p-1 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta propriedade?')) {
                            deleteProperty(property.id);
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-600"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">{property.address}</p>
                  <p className="text-lg font-medium text-indigo-400 mb-4">R$ {property.pricePerNight} <span className="text-sm text-gray-500">/ noite</span></p>

                  {activeBooking && client && (
                    <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
                      <div className="flex items-start">
                        <User className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-200">{client.name}</p>
                          <p className="text-xs text-gray-400">{client.phone} • {client.email}</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <CalendarDays className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                        <div>
                          <p className="text-xs text-gray-400">
                            {status === 'active' ? 'Alugada de' : 'Reservada de'} {new Date(activeBooking.startDate).toLocaleDateString()} até {new Date(activeBooking.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-medium text-indigo-300 mt-1">
                            Valor Total: R$ {activeBooking.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden">
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Building className="w-12 h-12 mb-4 text-gray-600" />
              <h3 className="text-lg font-medium text-gray-200">Nenhuma propriedade encontrada</h3>
              <p className="mt-1 text-sm text-gray-400">Comece adicionando uma nova propriedade.</p>
              <div className="mt-6">
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Propriedade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
