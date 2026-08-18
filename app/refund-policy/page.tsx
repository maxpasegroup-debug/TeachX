import { ReceiptText } from "lucide-react";

import { PolicyPage } from "@/components/legal/policy-page";

export const metadata = {
  title: "Refund and Cancellation Policy | TeachX Guru",
  description: "Refund, cancellation, subscription, order, and invoice policy for TeachX Guru teacher plans and marketplace activity."
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      badge="Billing"
      description="This policy keeps teacher billing simple: free access starts immediately, paid access starts only after payment verification, and refund handling follows clear evidence."
      icon={ReceiptText}
      title="Refund and Cancellation Policy"
      updated="17 August 2026"
      sections={[
        {
          title: "Paid plan activation",
          body: "Paid subscriptions are not activated merely by clicking upgrade. TeachX Guru creates a pending checkout order and activates paid access only after payment is verified."
        },
        {
          title: "Cancellations",
          body: "Teachers can request cancellation of future paid renewal. Access may continue until the end of the paid period unless the plan, gateway, or local rule says otherwise.",
          items: ["Free plans can be used without payment.", "Downgrades may reduce credits, storage, publishing, or marketplace capabilities.", "Institution plans may follow the signed institutional agreement."]
        },
        {
          title: "Refund requests",
          body: "Refunds are reviewed based on payment evidence, account usage, accidental duplicate payments, failed delivery, applicable law, and gateway settlement status.",
          items: ["Approved refunds may take additional time depending on Razorpay, Stripe, bank, card, or wallet processing.", "Used AI credits, downloaded marketplace resources, published creator services, or completed custom work may be non-refundable unless required by law.", "Fraudulent, abusive, or policy-violating activity may be refused or escalated."]
        },
        {
          title: "Invoices and taxes",
          body: "Draft invoices may be created during checkout. Final invoices, GST/tax details, credit notes, and reconciliation are issued through the active billing workflow when payment integration is live."
        }
      ]}
      footnote="For a billing review, include your account email, order ID, payment reference, and a short explanation."
    />
  );
}
