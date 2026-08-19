import "server-only";

export function getPaymentConfig() {
  const stripe = Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
  const razorpay = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_WEBHOOK_SECRET);
  const controls = Boolean(
    process.env.PAYMENT_TAX_READY === "true"
      && process.env.PAYMENT_REFUNDS_READY === "true"
      && process.env.PAYMENT_RECONCILIATION_READY === "true"
      && process.env.PAYMENT_PRICES_INCLUDE_TAX === "true"
      && process.env.PAYMENT_MERCHANT_LEGAL_NAME
      && process.env.PAYMENT_MERCHANT_ADDRESS
  );

  return {
    live: process.env.PAYMENTS_LIVE === "true" && controls && (stripe || razorpay),
    stripe,
    razorpay,
    controls,
    taxReady: process.env.PAYMENT_TAX_READY === "true",
    refundsReady: process.env.PAYMENT_REFUNDS_READY === "true",
    reconciliationReady: process.env.PAYMENT_RECONCILIATION_READY === "true"
  };
}

export function minorAmount(value: { toString(): string }) {
  const [whole, fraction = ""] = value.toString().split(".");
  return BigInt(whole) * BigInt(100) + BigInt((fraction + "00").slice(0, 2));
}
