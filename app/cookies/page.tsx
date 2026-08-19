import { Cookie } from "lucide-react";

import { PolicyPage } from "@/components/legal/policy-page";

export const metadata = {
  title: "Cookie Policy | TeachX Guru",
  description: "How TeachX Guru uses essential cookies, session cookies, preferences, and future analytics or payment cookies."
};

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      badge="Cookies"
      description="TeachX Guru uses cookies and similar storage carefully so teachers can sign in, keep sessions secure, remember preferences, and complete supported checkout flows."
      icon={Cookie}
      title="Cookie Policy"
      updated="17 August 2026"
      sections={[
        {
          title: "Essential cookies",
          body: "Essential cookies are used for authentication, secure sessions, account access, CSRF-style platform protections, and basic app operation. These are required for the service to work."
        },
        {
          title: "Preference storage",
          body: "The app may remember interface choices, install prompts, dashboard preferences, language choices, or device-level convenience settings."
        },
        {
          title: "Payments and analytics",
          body: "When payment or analytics providers are enabled, those providers may use cookies or similar technologies to complete checkout, prevent fraud, reconcile payments, or understand aggregate product usage."
        },
        {
          title: "Teacher choices",
          body: "TeachX provides first-visit choices for functional, analytics, and marketing storage and honors supported Global Privacy Control signals. You can also clear choices in your browser. Blocking essential cookies may prevent login or secure account operation."
        }
      ]}
    />
  );
}
