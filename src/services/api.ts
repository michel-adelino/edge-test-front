import axios from 'axios';

const API_URL = 'http://localhost:5000';

export interface Guest {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: string;
}

export interface PosOrder {
  _id?: string;
  orderId: string;
  guestId?: string | Guest; // Expanded or ID
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt?: string;
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const guestService = {
  getAll: async () => {
    const response = await api.get<Guest[]>('/guests');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<Guest>(`/guests/${id}`);
    return response.data;
  },
  create: async (guest: Guest) => {
    const response = await api.post<Guest>('/guests', guest);
    return response.data;
  },
  update: async (id: string, guest: Partial<Guest>) => {
    const response = await api.put<Guest>(`/guests/${id}`, guest);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/guests/${id}`);
  },
};

export const orderService = {
  getAll: async () => {
    const response = await api.get<PosOrder[]>('/orders');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get<PosOrder>(`/orders/${id}`);
    return response.data;
  },
  create: async (order: PosOrder) => {
    const response = await api.post<PosOrder>('/orders', order);
    return response.data;
  },
  update: async (id: string, order: Partial<PosOrder>) => {
    const response = await api.put<PosOrder>(`/orders/${id}`, order);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/orders/${id}`);
  },
};

export default api;
