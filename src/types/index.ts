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

export interface Category {
  id: string;
  name: string;
  type: 'printing' | 'office' | 'school' | 'merchandise';
}

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  priceLabel?: string;
  unit?: string | null;
  category: string;
  categoryId?: string;
  iconName: string;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  unit?: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  stock: number;
  imageUrl: string;
  barcode?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'printing' | 'ready' | 'completed' | 'cancelled';

export type BookingStatus = 'pending' | 'reviewing' | 'approved' | 'in_production' | 'ready' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  email: string;
  phone: string;
  serviceType: string;
  projectTitle: string;
  description: string;
  quantity: number;
  preferredDate: string;
  budget: number;
  status: BookingStatus;
  adminNote?: string;
  createdAt: any;
  updatedAt?: any;
}

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
  itemType?: 'product' | 'service';
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
