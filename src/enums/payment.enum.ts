export enum PaymentMethod {
  Stripe = 'stripe',
  Paypal = 'paypal',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
}

export enum PaymentFlow {
  FRONTEND = 'frontend',
  BACKEND = 'backend',   
}