import type { RoleKey } from "@/lib/constants/roles";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  institutionId?: string | null;
  roles: RoleKey[];
};
