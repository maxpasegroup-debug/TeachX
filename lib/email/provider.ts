import "server-only";

import { Resend } from "resend";

let client: Resend | undefined;

export function resend() {
  if (!process.env.RESEND_API_KEY) throw new Error("Transactional email is not configured.");
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export function verifyResendWebhook(rawBody: string, headers: Headers) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  const id = headers.get("svix-id");
  const timestamp = headers.get("svix-timestamp");
  const signature = headers.get("svix-signature");
  if (!secret || !id || !timestamp || !signature) throw new Error("Invalid email webhook signature.");
  return resend().webhooks.verify({ payload: rawBody, headers: { id, timestamp, signature }, webhookSecret: secret });
}
