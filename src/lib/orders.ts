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
  dodoPaymentId: string;
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

function getStoragePath(): string {
  const dir = process.env.NODE_ENV === 'production' ? '/tmp' : './data';
  return `${dir}/orders.json`;
}

function readOrders(): Record<string, Order> {
  try {
    const fs = require('fs');
    const path = getStoragePath();
    if (fs.existsSync(path)) {
      const raw = fs.readFileSync(path, 'utf-8');
      return JSON.parse(raw);
    }
  } catch { /* file may not exist yet */ }
  return {};
}

function writeOrders(orders: Record<string, Order>): void {
  try {
    const fs = require('fs');
    const path = getStoragePath();
    const dir = require('path').dirname(path);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(path, JSON.stringify(orders, null, 2), 'utf-8');
  } catch { /* storage may be unavailable */ }
}

export const orderStore = {
  create(dodoPaymentId: string, email: string, name: string, items: OrderItem[], amount: number, currency: string): Order {
    const orders = readOrders();
    const id = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const order: Order = {
      id,
      dodoPaymentId,
      customerEmail: email,
      customerName: name,
      items,
      amount,
      currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders[id] = order;
    writeOrders(orders);
    return order;
  },

  get(orderId: string): Order | null {
    const orders = readOrders();
    return orders[orderId] || null;
  },

  getByPaymentId(dodoPaymentId: string): Order | null {
    const orders = readOrders();
    return Object.values(orders).find(o => o.dodoPaymentId === dodoPaymentId) || null;
  },

  updateStatus(orderId: string, status: Order['status'], extra?: Partial<Order>): Order | null {
    const orders = readOrders();
    const order = orders[orderId];
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    if (extra) Object.assign(order, extra);
    writeOrders(orders);
    return order;
  },

  getAll(): Order[] {
    return Object.values(readOrders()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getByEmail(email: string): Order[] {
    return this.getAll().filter(o => o.customerEmail === email);
  },
};
