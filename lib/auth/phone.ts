import "server-only";

import crypto from "node:crypto";
import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

const blockedPins = new Set([
  "000000", "111111", "123123", "123456", "222222", "333333", "444444",
  "555555", "654321", "666666", "777777", "888888", "999999"
]);

export function normalizePhoneNumber(value: string, country?: string) {
  const input = value.replace(/[\s()-]/g, "").trim();
  const region = country?.toUpperCase() as CountryCode | undefined;
  const phone = parsePhoneNumberFromString(input, region);
  if (!phone?.isValid()) return null;
  return phone.number;
}

export function maskPhoneNumber(phoneE164: string) {
  const visible = phoneE164.slice(-4);
  return `${phoneE164.slice(0, Math.min(3, phoneE164.length - 4))}${"*".repeat(Math.max(4, phoneE164.length - visible.length - 3))}${visible}`;
}

export function validatePin(pin: string) {
  if (!/^\d{6}$/.test(pin)) return "Use exactly 6 numbers for your PIN.";
  if (blockedPins.has(pin)) return "Choose a PIN that is harder to guess.";
  return null;
}

export function phoneAuthDigest(value: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is required for phone authentication.");
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function secureDigestMatch(candidate: string, expected: string) {
  const left = Buffer.from(candidate, "hex");
  const right = Buffer.from(expected, "hex");
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
