import { LockKeyhole } from "lucide-react";

import { PolicyPage } from "@/components/legal/policy-page";

export const metadata = {
  title: "Privacy Policy | TeachX Guru",
  description: "How TeachX Guru collects, uses, protects, and gives teachers control over account, teaching, marketplace, and AI workspace data."
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      badge="Privacy"
      description="We keep teacher data purposeful, limited, and tied to the product experience: account access, AI creation, resources, marketplace workflows, support, and platform safety."
      icon={LockKeyhole}
      title="Privacy Policy"
      updated="19 August 2026"
      sections={[
        {
          title: "What we collect",
          body: "TeachX Guru collects the information needed to run a teacher workspace and improve safety.",
          items: ["Account details such as name, optional email, verified mobile number, password or PIN hash, role, and profile information.", "Verification and security records such as one-time-code delivery status, expiry, failed attempts, account lockouts, and session revocation events. TeachX does not retain the readable SMS code.", "Teacher-created content such as lessons, worksheets, resources, prompts, exports, profile details, and marketplace listings.", "Operational data such as subscription status, orders, invoices, support tickets, notifications, and audit logs.", "AI usage metadata needed for history, credits, troubleshooting, quality, and abuse prevention."]
        },
        {
          title: "How we use data",
          body: "Data is used to provide the service, keep the account secure, support payments and publishing, and improve teacher workflows.",
          items: ["Create and manage teaching resources, AI outputs, libraries, classrooms, and marketplace activity.", "Protect accounts, enforce permissions, investigate misuse, and maintain audit evidence.", "Process subscriptions, checkout orders, invoices, refunds, support, and important product communication.", "Improve the product using aggregate usage patterns without selling teacher personal data."]
        },
        {
          title: "AI data handling",
          body: "Teachers should avoid entering unnecessary student personal data into AI prompts. AI output should be reviewed by the teacher before classroom or marketplace use.",
          items: ["Prompts and outputs may be stored for history, exports, saving to library, quality review, and abuse prevention.", "AI can make mistakes; teachers remain responsible for checking accuracy, age suitability, and local curriculum fit.", "Sensitive student, medical, financial, or identity details should not be placed in prompts unless the institution has approved that use."]
        },
        {
          title: "Sharing and processors",
          body: "We share data only where needed to run the platform, comply with law, or protect users.",
          items: ["Payment providers may process checkout and billing data when payment integration is active.", "Infrastructure, database, email, analytics, and AI service providers may process limited data under operational controls.", "We may disclose data if required by law or to protect the platform, users, teachers, students, or institutions."]
        },
        {
          title: "Your choices",
          body: "Teachers can update profile details, manage saved resources, request account support, and ask for data access or deletion where legally available.",
          items: ["Use the signed-in Privacy Center to download a minimized account snapshot and submit access, export, correction, deletion, restriction, or objection requests.", "Some records, such as invoices, audit logs, safeguarding, fraud, dispute, and compliance evidence, may need to be restricted or retained.", "Marketplace purchases, published resources, and institutional records may follow additional ownership or retention rules."]
        }
      ]}
      footnote="This policy is product guidance for launch readiness and should be reviewed by local counsel before operating in a new jurisdiction."
    />
  );
}
