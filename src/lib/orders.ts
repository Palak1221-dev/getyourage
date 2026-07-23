import { SupabaseOrderRepository } from './order-repository';
import type { OrderRepository } from './order-repository';

/**
 * Derive a human-readable product title from order items.
 *
 * Single product → "Study Planner Pro"
 * Bundle       → "Study Planner Pro + 3 more"
 * Empty        → "Personalized Planner" (fallback)
 */
export function formatProductTitle(items: OrderItem[]): string {
  if (!items || items.length === 0) return 'Personalized Planner';
  const first = items[0].productTitle || 'Personalized Planner';
  if (items.length === 1) return first;
  return `${first} + ${items.length - 1} more`;
}

export interface OrderItem {
  productId: string;
  productSlug: string;
  productTitle: string;
  price: number;
  icon: string;
  quantity: number;
}

export interface Order {
  id: string;
  dodoCheckoutSessionId: string;
  dodoPaymentId?: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
  licenseKey?: string;
  downloadUrl?: string;
}

let _repo: OrderRepository | null = null;

function repo(): OrderRepository {
  if (!_repo) {
    _repo = new SupabaseOrderRepository();
  }
  return _repo;
}

export const orderStore = {
  async create(dodoCheckoutSessionId: string, email: string, name: string, items: OrderItem[], amount: number, currency: string): Promise<Order> {
    return repo().create(dodoCheckoutSessionId, email, name, items, amount, currency);
  },

  async get(orderId: string): Promise<Order | null> {
    return repo().get(orderId);
  },

  async getByPaymentId(dodoPaymentId: string): Promise<Order | null> {
    return repo().getByPaymentId(dodoPaymentId);
  },

  async getByCheckoutSessionId(dodoCheckoutSessionId: string): Promise<Order | null> {
    return repo().getByCheckoutSessionId(dodoCheckoutSessionId);
  },

  async updateStatus(orderId: string, status: Order['status'], extra?: Partial<Order>): Promise<Order | null> {
    return repo().updateStatus(orderId, status, extra);
  },

  async getAll(): Promise<Order[]> {
    return repo().getAll();
  },

  async getByEmail(email: string): Promise<Order[]> {
    return repo().getByEmail(email);
  },
};
