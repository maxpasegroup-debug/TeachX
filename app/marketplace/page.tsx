import { MarketplaceHome } from "@/features/marketplace/components/marketplace-components";
import { getMarketplaceFacets, getMarketplaceTeachers } from "@/services/marketplace-service";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ q?: string; subject?: string; mode?: string; language?: string; board?: string }> }) {
  const params = await searchParams;
  const [teachers, facets] = await Promise.all([
    getMarketplaceTeachers({ query: params.q, subject: params.subject, mode: params.mode, language: params.language, board: params.board }),
    getMarketplaceFacets()
  ]);

  return <MarketplaceHome teachers={teachers} facets={facets} />;
}
