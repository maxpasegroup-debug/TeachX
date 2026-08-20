import crypto from "node:crypto";

import Redis from "ioredis";
import { NextResponse } from "next/server";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const globalForSecurity = globalThis as unknown as { rateLimitRedis?: Redis };
const RATE_LIMIT_SCRIPT = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return {current, ttl}
`;

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  if (!globalForSecurity.rateLimitRedis) {
    const redis = new Redis(process.env.REDIS_URL, {
      connectTimeout: 2_000,
      enableOfflineQueue: false,
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });
    redis.on("error", () => undefined);
    globalForSecurity.rateLimitRedis = redis;
  }
  return globalForSecurity.rateLimitRedis;
}

function hashedKey(key: string) {
  return `teachx:rate-limit:${crypto.createHash("sha256").update(key).digest("hex")}`;
}

function rateLimitResponse(retryAfterSeconds: number, limit: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, retryAfterSeconds)),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0"
      }
    }
  );
}

function unavailableResponse() {
  return NextResponse.json({ error: "Request protection is temporarily unavailable." }, { status: 503, headers: { "Retry-After": "5" } });
}

function memoryRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  if (buckets.size > 5_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return rateLimitResponse(Math.ceil((bucket.resetAt - now) / 1000), limit);
  }
  return null;
}

export async function rateLimit(key: string, limit = 30, windowMs = 60_000) {
  const redis = getRedis();
  if (!redis) {
    return process.env.NODE_ENV === "production" ? unavailableResponse() : memoryRateLimit(hashedKey(key), limit, windowMs);
  }

  try {
    if (redis.status === "wait") await redis.connect();
    const redisKey = hashedKey(key);
    const result = await redis.eval(RATE_LIMIT_SCRIPT, 1, redisKey, windowMs) as [number, number];
    const [count, ttl] = result.map(Number);
    if (count > limit) {
      return rateLimitResponse(Math.ceil(Math.max(ttl, 1) / 1000), limit);
    }
    return null;
  } catch {
    return process.env.NODE_ENV === "production" ? unavailableResponse() : memoryRateLimit(hashedKey(key), limit, windowMs);
  }
}

export function secureSecretMatch(candidate: unknown, configured: string | undefined) {
  if (typeof candidate !== "string" || !configured || configured.length < 32) return false;
  const candidateHash = crypto.createHash("sha256").update(candidate).digest();
  const configuredHash = crypto.createHash("sha256").update(configured).digest();
  return crypto.timingSafeEqual(candidateHash, configuredHash);
}

export function getClientKey(request: Request, fallback: string) {
  return request.headers.get("cf-connecting-ip")?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || fallback;
}
