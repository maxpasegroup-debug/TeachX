import "server-only";

import { captureOperationalError, logEvent } from "@/lib/observability/logger";

type SmsResult = { developmentCode?: string };

function smsBody(code: string) {
  return `Your TeachX verification code is ${code}. It expires in 5 minutes. Do not share this code.`;
}

export async function sendPhoneAuthCode(to: string, code: string): Promise<SmsResult> {
  const provider = (process.env.SMS_PROVIDER || (process.env.NODE_ENV === "production" ? "" : "console")).toLowerCase();

  if (provider === "console" && process.env.NODE_ENV !== "production") {
    logEvent("info", "auth.sms.development_code", { to, code });
    return { developmentCode: code };
  }

  if (provider !== "twilio" || process.env.SMS_LIVE !== "true") {
    throw new Error("Live SMS authentication is not configured.");
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  if (!accountSid || !authToken || (!from && !messagingServiceSid)) {
    throw new Error("Twilio credentials and a sender are required.");
  }

  const body = new URLSearchParams({ To: to, Body: smsBody(code) });
  if (messagingServiceSid) body.set("MessagingServiceSid", messagingServiceSid);
  else body.set("From", from!);

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body,
      signal: AbortSignal.timeout(8_000)
    });
    if (!response.ok) throw new Error(`Twilio rejected the SMS request with status ${response.status}.`);
    logEvent("info", "auth.sms.accepted", { provider: "twilio", destinationSuffix: to.slice(-4) });
    return {};
  } catch (error) {
    captureOperationalError(error, "auth.sms.failed", { provider: "twilio", destinationSuffix: to.slice(-4) });
    throw new Error("We could not send the verification code. Please try again.");
  }
}
