import { prisma } from "@/lib/db";
import { getResourceMetadata } from "@/services/learning-marketplace-service";

export async function getMarketXData(input: { userId?: string; institutionId?: string | null }) {
  const scope = input.institutionId ? { institutionId: input.institutionId } : {};
  const [listings, creatorItems, creatorSales, entitlements, cart, wishlist, reviews, usage] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where: { status: "ACTIVE", contentItem: { status: "PUBLISHED", visibility: "PUBLIC", ...scope } },
      include: { contentItem: { include: { course: true, subject: true, createdBy: { include: { profile: true, teacherProfile: true } }, analytics: true, downloads: true } }, reviews: { where: { status: "APPROVED" }, select: { rating: true } } },
      orderBy: { updatedAt: "desc" }, take: 120
    }),
    input.userId ? prisma.contentItem.findMany({ where: { createdById: input.userId, ...scope }, include: { analytics: true, downloads: true }, orderBy: { updatedAt: "desc" }, take: 100 }) : [],
    input.userId ? prisma.commerceOrderItem.findMany({ where: { sellerId: input.userId }, include: { order: { select: { status: true } } }, orderBy: { createdAt: "desc" }, take: 200 }) : [],
    input.userId ? prisma.marketplaceEntitlement.findMany({ where: { userId: input.userId, status: "ACTIVE", contentItem: scope }, include: { contentItem: { select: { title: true, type: true } } }, orderBy: { acquiredAt: "desc" }, take: 30 }) : [],
    input.userId ? prisma.marketplaceCart.findUnique({ where: { userId: input.userId }, include: { items: { include: { listing: { include: { contentItem: { select: { title: true } } } } } } } }) : null,
    input.userId ? prisma.marketplaceWishlistCollection.findMany({ where: { userId: input.userId }, include: { items: true }, take: 12 }) : [],
    input.userId ? prisma.marketplaceBuyerReview.findMany({ where: { buyerId: input.userId }, include: { listing: { include: { contentItem: { select: { title: true } } } } }, orderBy: { updatedAt: "desc" }, take: 20 }) : [],
    input.userId ? prisma.aIUsage.aggregate({ where: { userId: input.userId }, _sum: { totalTokens: true }, _count: true }) : { _sum: { totalTokens: 0 }, _count: 0 }
  ]);

  const products = listings.map((listing) => {
    const item = listing.contentItem;
    const metadata = getResourceMetadata(item);
    const rating = listing.reviews.length ? Math.round(listing.reviews.reduce((total, review) => total + review.rating, 0) / listing.reviews.length * 10) / 10 : null;
    return { id: listing.id, title: item.title, description: item.description ?? "No description supplied.", type: metadata.resourceType ?? item.type.replaceAll("_", " "), category: metadata.category ?? "Learning resource", creator: item.createdBy?.name ?? "Institution creator", price: Number(listing.price), currency: listing.currency, rating, reviews: listing.reviews.length, views: item.analytics?.views ?? 0, downloads: item.downloads.length, updatedAt: listing.updatedAt.toISOString(), href: `/resources/${item.id}` };
  });
  const paidSales = creatorSales.filter((sale) => ["PAID", "FULFILLED"].includes(sale.order.status));
  const revenue = paidSales.reduce((total, sale) => total + Number(sale.total), 0);
  const categories = [...new Set(products.map((product) => product.category))].sort();
  return {
    products, categories,
    collections: { featured: products.slice(0, 6), trending: [...products].sort((a, b) => b.views - a.views).slice(0, 6), newest: products.slice(0, 6), topSelling: [...products].sort((a, b) => b.downloads - a.downloads).slice(0, 6), recommended: [...products].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 6) },
    creator: { products: creatorItems.length, published: creatorItems.filter((item) => item.status === "PUBLISHED").length, views: creatorItems.reduce((total, item) => total + (item.analytics?.views ?? 0), 0), downloads: creatorItems.reduce((total, item) => total + item.downloads.length, 0), orders: creatorSales.length, revenue, hasStore: creatorItems.length > 0 },
    buyer: { entitlements: entitlements.map((item) => ({ id: item.id, title: item.contentItem.title, type: item.contentItem.type, acquiredAt: item.acquiredAt.toISOString() })), cartCount: cart?.items.length ?? 0, wishlistCount: wishlist.reduce((total, collection) => total + collection.items.length, 0), reviews: reviews.map((review) => ({ id: review.id, title: review.listing.contentItem.title, rating: review.rating, status: review.status })) },
    ai: { requests: usage._count, tokens: usage._sum.totalTokens ?? 0, suggestions: products.length ? ["Use the strongest search terms from your best-viewed product in its next listing.", "Bundle complementary formats to improve resource discovery.", "Review description clarity before publishing premium resources."] : ["Publish a first resource to unlock evidence-based creator suggestions."] },
    readiness: ["Store branding, followers, and creator reputation await existing profile data; no parallel records are created.", "Checkout, licenses, invoices, carts, entitlements, and downloads use the existing marketplace commerce workflows."]
  };
}
