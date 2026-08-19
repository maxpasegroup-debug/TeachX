import { ShieldCheck } from "lucide-react";

import { PolicyPage } from "@/components/legal/policy-page";

export const metadata = {
  title: "Security | TeachX Guru",
  description: "TeachX Guru security practices for authentication, permissions, headers, audit logs, payments, AI safety, and responsible disclosure."
};

export default function SecurityPage() {
  return (
    <PolicyPage
      badge="Security"
      description="TeachX Guru is built with role-based access, protected app routes, audit evidence, cautious paid access, and privacy-aware teacher workflows."
      icon={ShieldCheck}
      title="Security and Responsible Disclosure"
      updated="17 August 2026"
      sections={[
        {
          title: "Account and route protection",
          body: "Private workspaces require authentication. Role and permission checks protect teacher, student, admin, director, and institution areas."
        },
        {
          title: "Platform safeguards",
          body: "The app uses secure response headers, no-store cache headers for API routes, password and PIN hashing, short-lived one-time SMS codes, retry limits, temporary account lockouts, protected session cookies in production, and audit logs for important actions.",
          items: ["Security headers reduce clickjacking, content sniffing, referrer leakage, and unnecessary browser permissions.", "Payments are designed so paid access is not granted before checkout verification.", "Student and teacher community flows include moderation and rate-limit style controls where supported."]
        },
        {
          title: "Data and AI safety",
          body: "Teachers should avoid unnecessary personal student data in prompts and must review AI output before use. Marketplace and publishing workflows should respect copyright, local laws, and age-appropriate learning standards."
        },
        {
          title: "Report a vulnerability",
          body: "If you discover a security issue, report it privately so it can be investigated before public disclosure.",
          items: ["Email support@teachx.guru with subject 'Security report'.", "Include affected URL, steps to reproduce, impact, screenshots or logs if safe, and your contact details.", "Do not access, modify, delete, or expose data that is not yours while testing."]
        }
      ]}
      footnote="Security statements describe current product controls and launch-readiness intent; independent penetration testing is recommended before large-scale international rollout."
    />
  );
}
