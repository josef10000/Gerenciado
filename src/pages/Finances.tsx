import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Wallet, Plus, Search, Filter, TrendingUp, TrendingDown, DollarSign, X, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { Transaction } from '../types';

export default function Finances() {
  const { bookings, transactions, addTransaction, updateTransaction, deleteTransaction, properties, clients } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  const now = Date.now();
  
  // Bookings that have ended are considered completed revenue
  const completedBookings = bookings.filter(b => b.status === 'confirmed' && b.endDate < now);
  // Bookings that are currently active or in the future
  const pendingBookings = bookings.filter(b => b.status === 'confirmed' && b.endDate >= now);

  const bookingsRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const manualIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalRevenue = bookingsRevenue + manualIncome;

  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const pendingRevenue = pendingBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const balance = totalRevenue - totalExpenses;

  const stats = [
    { name: 'Saldo Total', value: `R$ ${balance.toFixed(2)}`, icon: Wallet, change: '', changeType: 'neutral' },
    { name: 'Receita Total', value: `R$ ${totalRevenue.toFixed(2)}`, icon: TrendingUp, change: '', changeType: 'positive' },
    { name: 'Despesas Totais', value: `R$ ${totalExpenses.toFixed(2)}`, icon: TrendingDown, change: '', changeType: 'negative' },
    { name: 'A Receber (Reservas)', value: `R$ ${pendingRevenue.toFixed(2)}`, icon: DollarSign, change: '', changeType: 'neutral' },
  ];

  const handleOpenAdd = () => {
    setFormData({
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleOpenEdit = (t: Transaction) => {
    setFormData({
      amount: t.amount.toString(),
      description: t.description,
      date: new Date(t.date).toISOString().split('T')[0],
    });
    setEditingId(t.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description || !formData.date) return;

    const data = {
      amount: parseFloat(formData.amount),
      type: 'expense' as const,
      description: formData.description,
      date: new Date(formData.date).getTime(),
      status: 'completed' as const,
    };

    if (editingId) {
      updateTransaction(editingId, data);
    } else {
      addTransaction(data);
    }
    setIsAdding(false);
  };

  const combinedList = [
    ...transactions.map(t => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: t.amount,
      date: t.date,
      isBooking: false,
      original: t
    })),
    ...completedBookings.map(b => {
      const property = properties.find(p => p.id === b.propertyId);
      const client = clients.find(c => c.id === b.clientId);
      return {
        id: b.id,
        type: 'income' as const,
        description: `Reserva: ${property?.name || 'Propriedade'} (${client?.name || 'Cliente'})`,
        amount: b.totalAmount,
        date: b.endDate,
        isBooking: true,
        original: null
      };
    })
  ].sort((a, b) => b.date - a.date);

  const filteredList = combinedList.filter(item => item.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Finanças</h1>
          <p className="mt-2 text-sm text-gray-400">
            Acompanhe suas receitas (geradas automaticamente pelas reservas) e despesas.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Despesa
          </button>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">
                {editingId ? 'Editar Despesa' : 'Nova Despesa'}
              </h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Descrição</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Ex: Conta de Luz, Limpeza..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Valor (R$)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={formData.amount}
                  onChange={e => setFormData({...formData, amount: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300">Data</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 px-3"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className={`h-6 w-6 ${
                    item.name === 'Despesas Totais' ? 'text-red-400' : 
                    item.name === 'A Receber (Reservas)' ? 'text-yellow-400' :
                    'text-indigo-400'
                  }`} aria-hidden="true" />
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

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md bg-gray-800 border-gray-700 text-white pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2 border"
            placeholder="Buscar transações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-gray-800 shadow-sm ring-1 ring-white/10 rounded-lg overflow-hidden">
        {filteredList.length > 0 ? (
          <ul className="divide-y divide-gray-700">
            {filteredList.map(t => (
              <li key={t.id} className="p-4 hover:bg-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      t.type === 'income' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'
                    }`}>
                      {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{t.description}</p>
                        {t.isBooking && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-900/50 text-indigo-300">
                            Automático
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-medium ${
                      t.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                    </span>
                    {!t.isBooking && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(t.original as Transaction)}
                          className="p-1.5 text-gray-400 hover:text-white rounded-md hover:bg-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
                              deleteTransaction(t.id);
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 rounded-md hover:bg-gray-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Wallet className="w-12 h-12 mb-4 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-200">Nenhuma transação encontrada</h3>
            <p className="mt-1 text-sm text-gray-400">Suas reservas finalizadas aparecerão aqui automaticamente.</p>
          </div>
        )}
      </div>
    </div>
  );
}
