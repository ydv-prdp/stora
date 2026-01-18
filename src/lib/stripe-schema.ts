import { Timestamp } from 'firebase/firestore';

export interface StripeCustomer {
    customer_id: string; // Document ID (Stripe Customer ID)
    user_id: string;     // Firebase Auth user ID
    email: string;
    name: string;
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface StripePayment {
    payment_id: string;  // Document ID (Stripe Payment ID)
    customer_id: string; // Reference to customers collection
    amount: number;
    currency: string;
    status: string;      // 'succeeded', 'failed', etc.
    created_at: Timestamp;
    updated_at: Timestamp;
}

export interface StripeSubscription {
    subscription_id: string; // Document ID (Stripe Subscription ID)
    customer_id: string;      // Reference to customers collection
    plan: string;             // Stripe plan ID
    status: string;           // 'active', 'canceled'
    created_at: Timestamp;
    updated_at: Timestamp;
    canceled_at?: Timestamp;
    ended_at?: Timestamp;
}

export interface StripeInvoice {
    invoice_id: string;   // Document ID (Stripe Invoice ID)
    customer_id: string;  // Reference to customers collection
    amount: number;
    currency: string;
    status: string;       // 'paid', 'unpaid'
    created_at: Timestamp;
    updated_at: Timestamp;
}
