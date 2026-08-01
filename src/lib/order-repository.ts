import { getSupabase } from './supabase';
import { generateOrderId } from './order-access';
import type { Order, OrderItem } from './orders';

// ── Database Row Shape ──

interface OrderRow {
  id: string;
  dodo_checkout_session_id: string;
  dodo_payment_id: string | null;
  customer_email: string;
  customer_name: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  license_key: string | null;
  download_url: string | null;
  items: OrderItem[];
}

// ── Row ↔ Model Mappers ──

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    dodoCheckoutSessionId: row.dodo_checkout_session_id,
    dodoPaymentId: row.dodo_payment_id ?? undefined,
    customerEmail: row.customer_email,
    customerName: row.customer_name,
    amount: row.amount,
    currency: row.currency,
    status: row.status as Order['status'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    licenseKey: row.license_key ?? undefined,
    downloadUrl: row.download_url ?? undefined,
    items: row.items ?? [],
  };
}

function orderToRow(order: Order): Omit<OrderRow, 'created_at' | 'updated_at'> {
  return {
    id: order.id,
    dodo_checkout_session_id: order.dodoCheckoutSessionId,
    dodo_payment_id: order.dodoPaymentId ?? null,
    customer_email: order.customerEmail,
    customer_name: order.customerName,
    amount: order.amount,
    currency: order.currency,
    status: order.status,
    license_key: order.licenseKey ?? null,
    download_url: order.downloadUrl ?? null,
    items: order.items,
  };
}

// ── Repository Interface ──

export interface OrderRepository {
  create(sessionId: string, email: string, name: string, items: OrderItem[], amount: number, currency: string): Promise<Order>;
  get(orderId: string): Promise<Order | null>;
  getByCheckoutSessionId(sessionId: string): Promise<Order | null>;
  getByPaymentId(paymentId: string): Promise<Order | null>;
  updateStatus(orderId: string, status: Order['status'], extra?: Partial<Order>): Promise<Order | null>;
  getByEmail(email: string): Promise<Order[]>;
  getAll(): Promise<Order[]>;
}

// ── Supabase Implementation ──

export class SupabaseOrderRepository implements OrderRepository {
  private get db() {
    return getSupabase();
  }

  async create(sessionId: string, email: string, name: string, items: OrderItem[], amount: number, currency: string): Promise<Order> {
    const id = generateOrderId();
    const now = new Date().toISOString();

    const order: Order = {
      id,
      dodoCheckoutSessionId: sessionId,
      customerEmail: email,
      customerName: name,
      items,
      amount,
      currency,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const row = orderToRow(order);

    const { error } = await this.db
      .from('orders')
      .insert({
        ...row,
        created_at: now,
        updated_at: now,
      })
      .single();

    if (error) {
      console.error('[SupabaseOrderRepository] Insert error:', JSON.stringify({ message: error.message, details: (error as any).details, hint: (error as any).hint, code: (error as any).code }));
      throw new Error(`Failed to create order: ${error.message}`);
    }
    return order;
  }

  async get(orderId: string): Promise<Order | null> {
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] get error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to get order: ${error.message}`);
    }
    return data ? rowToOrder(data) : null;
  }

  async getByCheckoutSessionId(sessionId: string): Promise<Order | null> {
    if (!sessionId) return null;
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .eq('dodo_checkout_session_id', sessionId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] getByCheckoutSessionId error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to get order by session: ${error.message}`);
    }
    return data ? rowToOrder(data) : null;
  }

  async getByPaymentId(paymentId: string): Promise<Order | null> {
    if (!paymentId) return null;
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .eq('dodo_payment_id', paymentId)
      .maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] getByPaymentId error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to get order by payment: ${error.message}`);
    }
    return data ? rowToOrder(data) : null;
  }

  async updateStatus(orderId: string, status: Order['status'], extra?: Partial<Order>): Promise<Order | null> {
    const now = new Date().toISOString();

    const updates: Record<string, any> = {
      status,
      updated_at: now,
    };

    if (extra) {
      if (extra.dodoPaymentId !== undefined) updates.dodo_payment_id = extra.dodoPaymentId;
      if (extra.downloadUrl !== undefined) updates.download_url = extra.downloadUrl;
      if (extra.licenseKey !== undefined) updates.license_key = extra.licenseKey;
    }

    const { data, error } = await this.db
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('[SupabaseOrderRepository] updateStatus error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to update order: ${error.message}`);
    }
    return data ? rowToOrder(data) : null;
  }

  async getByEmail(email: string): Promise<Order[]> {
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseOrderRepository] getByEmail error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to get orders by email: ${error.message}`);
    }
    return (data || []).map(rowToOrder);
  }

  async getAll(): Promise<Order[]> {
    const { data, error } = await this.db
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseOrderRepository] getAll error:', JSON.stringify({ message: error.message, details: (error as any).details }));
      throw new Error(`Failed to get all orders: ${error.message}`);
    }
    return (data || []).map(rowToOrder);
  }
}
