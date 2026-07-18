import { auth } from "@/auth";
import { LearningMarketplaceHome } from "@/features/learning-marketplace/components/learning-marketplace-components";
import { getLearningMarketplaceFacets, getLearningMarketplaceHome, getLearningResources } from "@/services/learning-marketplace-service";

type ResourceSearchParams = {
  q?: string;
  category?: string;
  subject?: string;
  className?: string;
  board?: string;
  language?: string;
  priceType?: string;
  teacher?: string;
  sort?: string;
};

export default async function ResourcesPage({ searchParams }: { searchParams: Promise<ResourceSearchParams> }) {
  const [session, params] = await Promise.all([auth(), searchParams]);
  const institutionId = session?.user.institutionId;
  const [resources, facets, home] = await Promise.all([
    getLearningResources({
      query: params.q,
      category: params.category,
      subject: params.subject,
      className: params.className,
      board: params.board,
      language: params.language,
      priceType: params.priceType,
      teacher: params.teacher,
      sort: params.sort,
      institutionId
    }),
    getLearningMarketplaceFacets(institutionId),
    getLearningMarketplaceHome(session?.user.id, institutionId)
  ]);

  return <LearningMarketplaceHome data={home} facets={facets} resources={resources} />;
}
