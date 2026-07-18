import { prisma } from "@/lib/db";

export async function getCalendarSummary(institutionId?: string | null) {
  if (!institutionId) {
    return {
      upcomingHolidays: [],
      upcomingEvents: []
    };
  }

  const today = new Date();
  const [upcomingHolidays, upcomingEvents] = await Promise.all([
    prisma.plannerEvent.findMany({
      where: {
        institutionId,
        startsAt: { gte: today },
        type: { in: ["HOLIDAY", "SPECIAL_HOLIDAY"] }
      },
      orderBy: { startsAt: "asc" },
      take: 5
    }),
    prisma.plannerEvent.findMany({
      where: {
        institutionId,
        startsAt: { gte: today },
        type: "EVENT"
      },
      orderBy: { startsAt: "asc" },
      take: 5
    })
  ]);

  return { upcomingHolidays, upcomingEvents };
}
