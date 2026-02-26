import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Building, Users, CalendarDays, TrendingUp, DollarSign } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { clients, properties, bookings } = useData();

  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;

  const stats = [
    { name: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: DollarSign, change: '', changeType: 'neutral' },
    { name: 'Reservas Ativas', value: activeBookings.toString(), icon: CalendarDays, change: '', changeType: 'neutral' },
    { name: 'Total de Clientes', value: clients.length.toString(), icon: Users, change: '', changeType: 'neutral' },
    { name: 'Propriedades', value: properties.length.toString(), icon: Building, change: '', changeType: 'neutral' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-100">
          Bem-vindo de volta, {user?.displayName?.split(' ')[0] || 'Usuário'}!
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-indigo-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-100">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 shadow-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Reservas Recentes</h2>
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.slice(0, 5).map(booking => {
                const client = clients.find(c => c.id === booking.clientId);
                const property = properties.find(p => p.id === booking.propertyId);
                return (
                  <div key={booking.id} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-200">{client?.name || 'Cliente Desconhecido'}</p>
                      <p className="text-xs text-gray-400">{property?.name || 'Propriedade Desconhecida'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-indigo-400">R$ {booking.totalAmount}</p>
                      <p className="text-xs text-gray-400">{new Date(booking.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <CalendarDays className="w-12 h-12 mb-2 text-gray-600" />
              <p>Nenhuma reserva recente encontrada.</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 shadow-sm rounded-xl border border-gray-700 p-6">
          <h2 className="text-lg font-medium text-gray-100 mb-4">Visão Geral Financeira</h2>
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <TrendingUp className="w-12 h-12 mb-2 text-gray-600" />
            <p>Nenhum dado financeiro disponível ainda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
