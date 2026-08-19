import "server-only";

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}

function message(input: { title: string; greeting: string; body: string; actionLabel?: string; actionUrl?: string; footer?: string }) {
  const action = input.actionLabel && input.actionUrl
    ? `<p style="margin:28px 0"><a href="${escapeHtml(input.actionUrl)}" style="background:#17241f;color:#fff;padding:12px 18px;text-decoration:none;font-weight:600">${escapeHtml(input.actionLabel)}</a></p>`
    : "";
  const html = `<!doctype html><html><body style="margin:0;background:#f4f6f5;color:#17241f;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="background:#fff;border:1px solid #dfe5e2;padding:28px"><p style="font-size:12px;font-weight:700;text-transform:uppercase">TeachX Guru</p><h1 style="font-size:24px">${escapeHtml(input.title)}</h1><p>${escapeHtml(input.greeting)}</p><p style="line-height:1.6">${escapeHtml(input.body)}</p>${action}<p style="font-size:13px;color:#68736e">${escapeHtml(input.footer || "TeachX support will never ask for your password or payment credentials by email.")}</p></div></div></body></html>`;
  const text = [`TeachX Guru`, input.title, input.greeting, input.body, input.actionUrl ? `${input.actionLabel}: ${input.actionUrl}` : "", input.footer || "TeachX support will never ask for your password or payment credentials by email."].filter(Boolean).join("\n\n");
  return { html, text };
}

export const emailTemplates = {
  passwordReset(name: string, url: string) {
    return { subject: "Reset your TeachX password", ...message({ title: "Reset your password", greeting: `Hello ${name},`, body: "A password reset was requested for your account. This link expires in 30 minutes. Ignore this email if you did not request it.", actionLabel: "Reset password", actionUrl: url }) };
  },
  verifyEmail(name: string, url: string) {
    return { subject: "Verify your TeachX email", ...message({ title: "Verify your email", greeting: `Hello ${name},`, body: "Confirm this email address to complete your TeachX account security setup. This link expires in 24 hours.", actionLabel: "Verify email", actionUrl: url }) };
  },
  welcome(name: string) {
    return { subject: "Welcome to TeachX Guru", ...message({ title: "Your TeachX account is verified", greeting: `Welcome ${name},`, body: "Your email is verified and your workspace is ready. You can now create, teach, learn, and manage your account with verified recovery access.", actionLabel: "Open TeachX", actionUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "https://teachx.guru" }) };
  },
  payment(name: string, orderId: string, amount: string, url: string) {
    return { subject: "TeachX payment confirmed", ...message({ title: "Payment confirmed", greeting: `Hello ${name},`, body: `We verified your payment of ${amount}. Order reference: ${orderId}. Your purchased access is active.`, actionLabel: "View order", actionUrl: url }) };
  },
  refund(name: string, orderId: string, amount: string, url: string) {
    return { subject: "TeachX refund confirmed", ...message({ title: "Refund confirmed", greeting: `Hello ${name},`, body: `Your full refund of ${amount} was confirmed. Order reference: ${orderId}. Purchased access and credits have been reversed.`, actionLabel: "View order", actionUrl: url }) };
  }
};
