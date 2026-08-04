import { redirect } from "next/navigation";

export default async function ParentXPage({ searchParams }: { searchParams: Promise<{ childId?: string }> }) {
  const { childId } = await searchParams;
  redirect(childId ? `/parent?childId=${encodeURIComponent(childId)}` : "/parent");
}
