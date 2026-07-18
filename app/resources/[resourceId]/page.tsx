import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { ResourceDetailPage } from "@/features/learning-marketplace/components/learning-marketplace-components";
import { userOwnsResource } from "@/services/commerce-service";
import { getLearningResource, getRelatedLearningResources, trackLearningResourceView } from "@/services/learning-marketplace-service";

export default async function ResourceDetailRoute({ params }: { params: Promise<{ resourceId: string }> }) {
  const [{ resourceId }, session] = await Promise.all([params, auth()]);
  const resource = await getLearningResource(resourceId);
  if (!resource) notFound();

  await trackLearningResourceView(resource, session?.user.id);
  const [related, canAccess] = await Promise.all([getRelatedLearningResources(resource), userOwnsResource(session?.user.id, resource.id)]);

  return <ResourceDetailPage canAccess={canAccess} resource={resource} related={related} />;
}
