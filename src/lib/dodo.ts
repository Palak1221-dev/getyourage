import DodoPayments from 'dodopayments';

let client: DodoPayments | null = null;

function getClient(): DodoPayments {
  if (!client) {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    if (!apiKey) {
      throw new Error('DODO_PAYMENTS_API_KEY environment variable is not set');
    }
    const dodoEnv = process.env.DODO_ENV;
    if (!dodoEnv) {
      throw new Error('DODO_ENV environment variable is not set. Set to "live" for production or "test" for development/preview.');
    }
    client = new DodoPayments({
      bearerToken: apiKey,
      environment: dodoEnv === 'live' ? 'live_mode' : 'test_mode',
    });
  }
  return client;
}

export interface CreateCheckoutParams {
  productId: string;
  quantity: number;
  customerEmail: string;
  customerName?: string;
  metadata?: Record<string, string>;
  returnUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
  sessionId: string;
}

export async function createCheckoutSession(params: CreateCheckoutParams): Promise<CheckoutResult> {
  const dodo = getClient();
  const session = await dodo.checkoutSessions.create({
    product_cart: [
      {
        product_id: params.productId,
        quantity: params.quantity,
      },
    ],
    customer: {
      email: params.customerEmail,
      name: params.customerName || '',
    },
    return_url: params.returnUrl,
    cancel_url: params.cancelUrl,
    metadata: params.metadata || {},
  });
  return {
    checkoutUrl: session.checkout_url,
    sessionId: session.session_id,
  };
}

export interface VerifyPaymentResult {
  verified: boolean;
  paymentId: string;
  status: string;
  customerEmail: string;
  amount: number;
  currency: string;
}

export async function verifyPayment(paymentId: string): Promise<VerifyPaymentResult> {
  const dodo = getClient();
  const payment = await dodo.payments.retrieve(paymentId);
  return {
    verified: payment.status === 'succeeded',
    paymentId: payment.payment_id,
    status: payment.status,
    customerEmail: payment.customer?.email || '',
    amount: payment.total_amount,
    currency: payment.currency,
  };
}

export async function getCheckoutSession(sessionId: string) {
  const dodo = getClient();
  return dodo.checkoutSessions.retrieve(sessionId);
}
