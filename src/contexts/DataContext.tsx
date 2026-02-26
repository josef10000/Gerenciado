import React, { createContext, useContext, useState, useEffect } from 'react';
import { Client, Property, Booking, Transaction } from '../types';

interface PaymentLink {
  id: string;
  name: string;
  url: string;
}

interface PixKey {
  id: string;
  key: string;
}

interface SettingsData {
  pixKeys: PixKey[];
  paymentLinks: PaymentLink[];
}

interface DataContextType {
  clients: Client[];
  properties: Property[];
  bookings: Booking[];
  transactions: Transaction[];
  settings: SettingsData;
  addClient: (client: Omit<Client, 'id' | 'userId' | 'createdAt'>) => Client;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addProperty: (property: Omit<Property, 'id' | 'userId' | 'createdAt'>) => void;
  updateProperty: (id: string, property: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'userId' | 'createdAt'>) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  updateSettings: (newSettings: SettingsData) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('app_clients');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('app_properties');
    return saved ? JSON.parse(saved) : [];
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('app_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('app_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<SettingsData>(() => {
    const saved = localStorage.getItem('app_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.pixKey && !parsed.pixKeys) {
        parsed.pixKeys = [{ id: Math.random().toString(36).substr(2, 9), key: parsed.pixKey }];
        delete parsed.pixKey;
      }
      if (!parsed.pixKeys) parsed.pixKeys = [];
      if (!parsed.paymentLinks) parsed.paymentLinks = [];
      return parsed;
    }
    return { pixKeys: [], paymentLinks: [] };
  });

  useEffect(() => {
    localStorage.setItem('app_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('app_properties', JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem('app_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('app_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('app_settings', JSON.stringify(settings));
  }, [settings]);

  const addClient = (clientData: Omit<Client, 'id' | 'userId' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-123',
      createdAt: Date.now(),
    };
    setClients([...clients, newClient]);
    return newClient;
  };

  const updateClient = (id: string, clientData: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...clientData } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const addProperty = (propertyData: Omit<Property, 'id' | 'userId' | 'createdAt'>) => {
    const newProperty: Property = {
      ...propertyData,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-123',
      createdAt: Date.now(),
    };
    setProperties([...properties, newProperty]);
  };

  const updateProperty = (id: string, propertyData: Partial<Property>) => {
    setProperties(properties.map(p => p.id === id ? { ...p, ...propertyData } : p));
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id));
  };

  const addBooking = (bookingData: Omit<Booking, 'id' | 'userId' | 'createdAt'>) => {
    const newBooking: Booking = {
      ...bookingData,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-123',
      createdAt: Date.now(),
    };
    setBookings([...bookings, newBooking]);
  };

  const updateBooking = (id: string, bookingData: Partial<Booking>) => {
    setBookings(bookings.map(b => b.id === id ? { ...b, ...bookingData } : b));
  };

  const deleteBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const addTransaction = (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Math.random().toString(36).substr(2, 9),
      userId: 'mock-user-123',
      createdAt: Date.now(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const updateTransaction = (id: string, transactionData: Partial<Transaction>) => {
    setTransactions(transactions.map(t => t.id === id ? { ...t, ...transactionData } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateSettings = (newSettings: SettingsData) => {
    setSettings(newSettings);
  };

  return (
    <DataContext.Provider value={{ 
      clients, properties, bookings, transactions, settings, 
      addClient, updateClient, deleteClient,
      addProperty, updateProperty, deleteProperty,
      addBooking, updateBooking, deleteBooking,
      addTransaction, updateTransaction, deleteTransaction,
      updateSettings 
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
