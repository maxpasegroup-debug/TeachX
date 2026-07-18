import { notFound } from "next/navigation";

import { PublicTeacherProfile } from "@/features/marketplace/components/marketplace-components";
import { getMarketplaceTeacher } from "@/services/marketplace-service";

export default async function PublicTeacherProfilePage({ params }: { params: Promise<{ teacherId: string }> }) {
  const { teacherId } = await params;
  const teacher = await getMarketplaceTeacher(teacherId);
  if (!teacher) notFound();

  return <PublicTeacherProfile teacher={teacher} />;
}
