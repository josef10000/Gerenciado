export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Property {
  id: string;
  userId: string;
  name: string;
  address: string;
  type: 'house' | 'apartment' | 'other';
  pricePerNight: number;
  createdAt: number;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
  createdAt: number;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  clientId: string;
  startDate: number; // timestamp
  endDate: number; // timestamp
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  createdAt: number;
}

export interface Transaction {
  id: string;
  userId: string;
  bookingId?: string;
  type: 'income' | 'expense';
  amount: number;
  date: number; // timestamp
  description: string;
  category: string;
  createdAt: number;
}
