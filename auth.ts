import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/db";
import type { RoleKey } from "@/lib/constants/roles";
import { normalizePhoneNumber } from "@/lib/auth/phone";
import { getClientKey, rateLimit } from "@/lib/security";

const staffLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const teacherPinSchema = z.object({
  phone: z.string().min(8),
  pin: z.string().regex(/^\d{6}$/)
});

const userRelations = {
  profile: true,
  roles: { include: { role: true } }
} as const;

function sessionUser(user: {
  id: string;
  name: string;
  email: string;
  institutionId: string | null;
  authSessionVersion: number;
  profile: { avatarUrl: string | null } | null;
  roles: Array<{ role: { key: string } }>;
}, authMethod: "phone-pin" | "password") {
  return {
    id: user.id,
    name: user.name,
    email: user.email.endsWith("@accounts.teachx.invalid") ? null : user.email,
    image: user.profile?.avatarUrl,
    institutionId: user.institutionId,
    roles: user.roles.map(({ role }) => role.key as RoleKey),
    authMethod,
    authSessionVersion: user.authSessionVersion
  };
}

export const authConfig = {
  // Railway serves the same application through TeachX and LearnX. Trust the
  // reverse proxy host while redirects remain restricted by the callback below.
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === "production" ? "__Secure-authjs.session-token" : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  providers: [
    Credentials({
      id: "teacher-pin",
      name: "Teacher mobile and PIN",
      credentials: {
        phone: { label: "Mobile number", type: "tel" },
        pin: { label: "PIN", type: "password" }
      },
      async authorize(credentials, request) {
        const parsed = teacherPinSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const phoneE164 = normalizePhoneNumber(parsed.data.phone);
        if (!phoneE164) return null;
        const limited = await rateLimit(`teacher-pin:${getClientKey(request, phoneE164)}`, 10, 60_000);
        if (limited) return null;

        const user = await prisma.user.findUnique({ where: { phoneE164 }, include: userRelations });
        if (!user?.pinHash || user.status !== "ACTIVE" || user.userType !== "teacher") return null;
        if (user.pinLockedUntil && user.pinLockedUntil > new Date()) return null;

        const validPin = await bcrypt.compare(parsed.data.pin, user.pinHash);
        if (!validPin) {
          const nextAttempts = user.pinFailedAttempts + 1;
          await prisma.user.update({
            where: { id: user.id },
            data: {
              pinFailedAttempts: nextAttempts,
              pinLockedUntil: nextAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null
            }
          });
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), pinFailedAttempts: 0, pinLockedUntil: null }
        });
        return sessionUser(user, "phone-pin");
      }
    }),
    Credentials({
      id: "staff-credentials",
      name: "Legacy and staff email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, request) {
        const parsed = staffLoginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const limited = await rateLimit(`staff-login:${getClientKey(request, parsed.data.email.toLowerCase())}`, 10, 60_000);
        if (limited) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
          include: userRelations
        });

        if (!user?.passwordHash || user.status !== "ACTIVE") return null;

        const validPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);
        if (!validPassword) return null;

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        return sessionUser(user, "password");
      }
    })
  ],
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;

      try {
        const target = new URL(url);
        const allowedOrigins = new Set([
          new URL(baseUrl).origin,
          "https://teachx.guru",
          "https://www.teachx.guru",
          "https://learnx.guru",
          "https://www.learnx.guru"
        ]);

        return allowedOrigins.has(target.origin) ? target.toString() : baseUrl;
      } catch {
        return baseUrl;
      }
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.institutionId = user.institutionId;
        token.roles = user.roles;
        token.authMethod = user.authMethod;
        token.authSessionVersion = user.authSessionVersion;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.institutionId = token.institutionId;
        session.user.roles = token.roles;
      }

      return session;
    }
  }
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
