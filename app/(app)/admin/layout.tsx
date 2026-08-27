import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/current-user";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard>{children}</AdminGuard>;
}

async function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user?.roles.includes("ADMIN")) redirect("/access-denied");

  return <div className="mx-auto w-full max-w-7xl">{children}</div>;
}
