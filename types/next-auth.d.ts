import type { DefaultSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import type { RoleKey } from "@/lib/constants/roles";

declare module "next-auth" {
  interface User {
    institutionId?: string | null;
    roles: RoleKey[];
  }

  interface Session {
    user: {
      id: string;
      institutionId?: string | null;
      roles: RoleKey[];
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    institutionId?: string | null;
    roles: RoleKey[];
  }
}
