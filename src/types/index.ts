export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date;
}

export interface AdminWhitelist {
  email: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  type: 'printing' | 'office' | 'school' | 'merchandise';
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'printing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  type: 'printing' | 'supply';
  createdAt: any; // Using any for Firestore Timestamps compatibility in components
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'gcash';
  receivedAmount: number;
  change: number;
  adminId: string;
  createdAt: any;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'replied' | 'resolved';
  createdAt: any;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: any;
}

export interface SalesAnalytics {
  totalSales: number;
  dailyRevenue: number;
  ordersCount: number;
  pendingOrders: number;
  customersCount: number;
}
