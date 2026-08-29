"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const teacherRoles = ["ACADEMIC_HEAD", "ACADEMIC_FACULTY", "PHYSICAL_TRAINER", "PART_TIME_TUTOR"];
const licenses = ["INSTITUTION_PERSONAL", "PERSONAL", "CLASSROOM"];
const teachingCurrencies = new Set(["INR", "AED", "SAR", "QAR", "OMR"]);
const happyNotesCategories = new Set(["Education", "Personal Growth", "Health", "Wealth", "Happiness", "Leadership", "Career", "Psychology", "Productivity", "Life Skills"]);

function value(formData: FormData, key: string) { return String(formData.get(key) ?? "").trim(); }
function list(formData: FormData, key: string) { return value(formData, key).split(",").map((item) => item.trim()).filter(Boolean).slice(0, 30); }
function selected(formData: FormData, key: string) { return formData.getAll(key).map(String).map((item) => item.trim()).filter(Boolean).slice(0, 20); }
function rate(formData: FormData, key: string) { const amount = Number(value(formData, key)); return Number.isFinite(amount) && amount >= 0 && amount <= 10_000_000 ? amount : 0; }
function object(input: unknown) { return input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {}; }
function safeUrl(input: string) {
  if (!input) return "";
  if (/^\/api\/storage\/objects\/[A-Za-z0-9-]+\/download$/.test(input)) return input;
  try { const url = new URL(input); return ["http:", "https:"].includes(url.protocol) && input.length <= 2048 ? input : ""; } catch { return ""; }
}
function safeHttps(input?: string | null) {
  if (!input) return false;
  try { return new URL(input).protocol === "https:" && input.length <= 2048; } catch { return false; }
}
function refresh() {
  revalidatePath("/teacher/business", "layout");
  revalidatePath("/teacher/life/earn-more");
  revalidatePath("/teacher/resources");
  revalidatePath("/student/marketplace");
  revalidatePath("/marketplace");
}

async function currentTeacher() {
  const session = await auth();
  if (!session?.user.id || !session.user.institutionId) throw new Error("Teacher business access is required.");
  const teacher = await prisma.user.findFirst({
    where: { id: session.user.id, institutionId: session.user.institutionId, status: "ACTIVE", roles: { some: { role: { key: { in: teacherRoles } } } } },
    select: { id: true, name: true, institutionId: true, institution: { select: { currency: true } } }
  });
  if (!teacher?.institutionId) throw new Error("Teacher business access is required.");
  return { id: teacher.id, name: teacher.name, institutionId: teacher.institutionId, currency: teacher.institution?.currency ?? "INR" };
}

async function businessResource(teacher: Awaited<ReturnType<typeof currentTeacher>>, id: string) {
  if (!id) return null;
  return prisma.contentItem.findFirst({
    where: { id, institutionId: teacher.institutionId, createdById: teacher.id },
    include: { marketplaceListing: true, _count: { select: { commerceOrderItems: true, marketplaceEntitlements: true } } }
  });
}

async function businessActivity(teacher: Awaited<ReturnType<typeof currentTeacher>>, title: string, entityId?: string) {
  await prisma.activity.create({
    data: { institutionId: teacher.institutionId, actorId: teacher.id, type: "CONTENT", title, entity: "TeacherBusiness", entityId, link: "/teacher/business/home", metadata: { businessType: "TEACHER_BUSINESS" } }
  });
}

export async function saveBusinessProfileAction(formData: FormData) {
  const teacher = await currentTeacher();
  const existing = await prisma.teacherProfile.findFirst({ where: { userId: teacher.id, user: { institutionId: teacher.institutionId } }, select: { availability: true } });
  const previous = object(existing?.availability);
  const availability = {
    ...previous,
    summary: value(formData, "availability").slice(0, 1000), skills: list(formData, "skills"), interests: list(formData, "interests"),
    website: safeUrl(value(formData, "website")), contactPreferences: value(formData, "contactPreferences").slice(0, 500)
  };
  const coverUrl = safeUrl(value(formData, "coverUrl"));
  const years = Math.min(80, Math.max(0, Number(value(formData, "experienceYears")) || 0));
  await prisma.$transaction([
    prisma.profile.upsert({
      where: { userId: teacher.id },
      // Profile photos are written by the verified private-storage upload
      // flow. Never overwrite that URL with an out-of-date form field.
      update: { title: value(formData, "qualification").slice(0, 180) || null, bio: value(formData, "bio").slice(0, 4000) || null },
      create: { userId: teacher.id, title: value(formData, "qualification").slice(0, 180) || undefined, bio: value(formData, "bio").slice(0, 4000) || undefined }
    }),
    prisma.teacherProfile.upsert({
      where: { userId: teacher.id },
      update: {
        coverUrl: coverUrl || null, headline: value(formData, "headline").slice(0, 180) || null,
        bio: value(formData, "bio").slice(0, 4000) || null, qualification: value(formData, "qualification").slice(0, 180) || null,
        experienceYears: years || null, certificates: list(formData, "certifications"), achievements: list(formData, "achievements"),
        subjects: list(formData, "subjects"), classes: list(formData, "grades"), boards: list(formData, "boards"), languages: list(formData, "languages"),
        teachingMode: value(formData, "teachingMode").slice(0, 80) || null, teachingStyle: value(formData, "teachingStyle").slice(0, 1000) || null,
        location: value(formData, "location").slice(0, 180) || null, availability, isMarketplaceListed: formData.get("public") === "on"
      },
      create: {
        userId: teacher.id, coverUrl: coverUrl || undefined, headline: value(formData, "headline").slice(0, 180) || undefined,
        bio: value(formData, "bio").slice(0, 4000) || undefined, qualification: value(formData, "qualification").slice(0, 180) || undefined,
        experienceYears: years || undefined, certificates: list(formData, "certifications"), achievements: list(formData, "achievements"),
        subjects: list(formData, "subjects"), classes: list(formData, "grades"), boards: list(formData, "boards"), languages: list(formData, "languages"),
        teachingMode: value(formData, "teachingMode").slice(0, 80) || undefined, teachingStyle: value(formData, "teachingStyle").slice(0, 1000) || undefined,
        location: value(formData, "location").slice(0, 180) || undefined, availability, isMarketplaceListed: formData.get("public") === "on"
      }
    })
  ]);
  await businessActivity(teacher, "Professional profile updated");
  refresh();
  return { ok: true, message: "Your professional profile was saved successfully." };
}

const earningServiceTypes = new Set(["MENTOR", "TRAIN"]);
const legacyEarningServiceTypes = new Set(["TEACH", "MENTOR", "TRAIN"]);
const earningServiceStatuses = new Set(["DRAFT", "PUBLISHED"]);

async function ownedEarningService(teacher: Awaited<ReturnType<typeof currentTeacher>>, id: string) {
  if (!id) return null;
  return prisma.teacherEarningService.findFirst({ where: { id, institutionId: teacher.institutionId, teacherId: teacher.id } });
}

const supportedAvailabilityTimeZones = new Set(["Asia/Kolkata", "Asia/Dubai", "Asia/Riyadh", "Asia/Qatar", "Asia/Muscat", "UTC"]);
const supportedSessionDurations = new Set([15, 30, 45, 60, 90, 120, 180, 240]);
const clock = /^([01]\d|2[0-3]):[0-5]\d$/;
const isoDate = /^\d{4}-\d{2}-\d{2}$/;

function availabilityRules(formData: FormData) {
  const rules: { weekday: number; startTime: string; endTime: string }[] = [];
  for (let weekday = 0; weekday < 7; weekday += 1) {
    if (value(formData, `day-${weekday}-enabled`) !== "true") continue;
    const startTime = value(formData, `day-${weekday}-start`);
    const endTime = value(formData, `day-${weekday}-end`);
    if (!clock.test(startTime) || !clock.test(endTime) || startTime >= endTime) throw new Error("Each available day needs a valid start time before its end time.");
    rules.push({ weekday, startTime, endTime });
  }
  return rules;
}

function unavailableDates(formData: FormData) {
  const seen = new Set<string>();
  return value(formData, "unavailableDates").split(",").map((item) => item.trim()).filter(Boolean).slice(0, 90).map((date) => {
    const parsed = new Date(`${date}T00:00:00.000Z`);
    if (!isoDate.test(date) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date || seen.has(date)) throw new Error("Unavailable dates must be unique dates in YYYY-MM-DD format.");
    seen.add(date);
    return { date: parsed };
  });
}

export async function saveTeacherAvailabilityAction(formData: FormData) {
  const teacher = await currentTeacher();
  const timeZone = value(formData, "timeZone");
  const durations = value(formData, "sessionDurations").split(",").map((item) => Number(item.trim())).filter((item) => Number.isInteger(item) && supportedSessionDurations.has(item));
  const uniqueDurations = [...new Set(durations)].sort((a, b) => a - b);
  const bufferMinutes = Number(value(formData, "bufferMinutes"));
  const maxSessionsPerDay = Number(value(formData, "maxSessionsPerDay"));
  if (!supportedAvailabilityTimeZones.has(timeZone)) throw new Error("Choose a supported time zone.");
  if (!uniqueDurations.length) throw new Error("Choose at least one supported session duration.");
  if (!Number.isInteger(bufferMinutes) || bufferMinutes < 0 || bufferMinutes > 120) throw new Error("Buffer time must be between 0 and 120 minutes.");
  if (!Number.isInteger(maxSessionsPerDay) || maxSessionsPerDay < 1 || maxSessionsPerDay > 24) throw new Error("Maximum sessions per day must be between 1 and 24.");
  const rules = availabilityRules(formData);
  const dates = unavailableDates(formData);
  const availability = await prisma.teacherAvailability.upsert({
    where: { institutionId_teacherId: { institutionId: teacher.institutionId, teacherId: teacher.id } },
    update: { timeZone, sessionDurations: uniqueDurations, bufferMinutes, maxSessionsPerDay },
    create: { institutionId: teacher.institutionId, teacherId: teacher.id, timeZone, sessionDurations: uniqueDurations, bufferMinutes, maxSessionsPerDay },
    select: { id: true }
  });
  await prisma.$transaction([
    prisma.teacherAvailabilityWeeklyRule.deleteMany({ where: { availabilityId: availability.id, availability: { institutionId: teacher.institutionId, teacherId: teacher.id } } }),
    prisma.teacherAvailabilityUnavailableDate.deleteMany({ where: { availabilityId: availability.id, availability: { institutionId: teacher.institutionId, teacherId: teacher.id } } }),
    ...(rules.length ? [prisma.teacherAvailabilityWeeklyRule.createMany({ data: rules.map((rule) => ({ ...rule, availabilityId: availability.id })) })] : []),
    ...(dates.length ? [prisma.teacherAvailabilityUnavailableDate.createMany({ data: dates.map((item) => ({ ...item, availabilityId: availability.id })) })] : [])
  ]);
  await businessActivity(teacher, "Structured availability updated", availability.id);
  refresh();
  return { ok: true, message: "Your availability was saved successfully. Booking and payment are not enabled yet." };
}

export async function saveOneToOneTeachingAction(formData: FormData) {
  const teacher = await currentTeacher();
  const existing = await prisma.teacherProfile.findFirst({
    where: { userId: teacher.id, user: { institutionId: teacher.institutionId } },
    select: { availability: true }
  });
  const previous = object(existing?.availability);
  const qualification = value(formData, "qualification").slice(0, 180);
  const experienceYears = Math.min(80, Math.max(0, Number(value(formData, "experienceYears")) || 0));
  const skills = list(formData, "skills");
  const subjects = list(formData, "subjects");
  const classes = list(formData, "classes");
  const languages = list(formData, "languages");
  const teachingFormats = selected(formData, "teachingFormats");
  const availabilitySummary = value(formData, "availability").slice(0, 1000);
  const pricingCurrency = teachingCurrencies.has(value(formData, "pricingCurrency")) ? value(formData, "pricingCurrency") : "INR";
  const hourlyRate = rate(formData, "hourlyRate");
  const weeklyRate = rate(formData, "weeklyRate");
  const monthlyRate = rate(formData, "monthlyRate");
  const customPricing = value(formData, "customPricing").slice(0, 500);
  const intent = value(formData, "intent");
  const profile = await prisma.profile.findUnique({ where: { userId: teacher.id }, select: { avatarUrl: true } });
  const missing = [
    !profile?.avatarUrl && "photo", !qualification && "qualification", !experienceYears && "experience",
    !skills.length && !subjects.length && "expertise", !classes.length && "teaching levels", !languages.length && "languages",
    !teachingFormats.length && "teaching format", !availabilitySummary && "availability",
    !hourlyRate && !weeklyRate && !monthlyRate && !customPricing && "pricing"
  ].filter(Boolean) as string[];
  const activate = intent === "activate" && missing.length === 0;
  const availability = { ...previous, skills, teachingFormats, summary: availabilitySummary, pricingCurrency, customPricing };
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    update: { qualification: qualification || null, experienceYears: experienceYears || null, subjects, classes, languages, teachingMode: teachingFormats.join(", ") || null, hourlyRate, weeklyRate, monthlyRate, availability, onboardingStep: activate ? "one-to-one-active" : "one-to-one-draft", isMarketplaceListed: activate },
    create: { userId: teacher.id, qualification: qualification || undefined, experienceYears: experienceYears || undefined, subjects, classes, languages, teachingMode: teachingFormats.join(", ") || undefined, hourlyRate, weeklyRate, monthlyRate, availability, onboardingStep: activate ? "one-to-one-active" : "one-to-one-draft", isMarketplaceListed: activate }
  });
  await businessActivity(teacher, activate ? "1:1 teaching profile activated" : `1:1 teaching profile saved${intent === "activate" && missing.length ? `; missing ${missing.join(", ")}` : ""}`);
  refresh();
  if (intent === "activate" && missing.length) {
    return {
      ok: false,
      message: `Your profile was saved as a draft. Add ${missing.join(", ")} before activating it.`
    };
  }
  return {
    ok: true,
    message: activate ? "Your Teach 1:1 profile is active and ready for discovery." : "Your Teach 1:1 profile draft was saved successfully."
  };
}

export async function saveEarningServiceAction(formData: FormData) {
  const teacher = await currentTeacher();
  const id = value(formData, "id");
  const type = value(formData, "type");
  const title = value(formData, "title").slice(0, 180);
  const existing = id ? await ownedEarningService(teacher, id) : null;
  if (id && !existing) throw new Error("That service is unavailable.");
  if (!(id ? legacyEarningServiceTypes : earningServiceTypes).has(type) || title.length < 3) throw new Error("Choose a service type and enter a title of at least 3 characters.");
  const currency = teachingCurrencies.has(value(formData, "currency")) ? value(formData, "currency") : teacher.currency.toUpperCase() || "INR";
  const payload = {
    type, title, currency,
    description: value(formData, "description").slice(0, 4000) || null,
    expertise: list(formData, "expertise"),
    availability: value(formData, "availability").slice(0, 1000) || null
  };
  if (existing) {
    await prisma.teacherEarningService.updateMany({ where: { id: existing.id, institutionId: teacher.institutionId, teacherId: teacher.id }, data: payload });
    await businessActivity(teacher, `Updated ${type.toLowerCase()} service: ${title}`, existing.id);
  } else {
    const service = await prisma.teacherEarningService.create({ data: { ...payload, institutionId: teacher.institutionId, teacherId: teacher.id } });
    await businessActivity(teacher, `Created ${type.toLowerCase()} service: ${title}`, service.id);
  }
  refresh();
  return { ok: true, message: "Service saved successfully." };
}

export async function setEarningServiceStatusAction(formData: FormData) {
  const teacher = await currentTeacher();
  const service = await ownedEarningService(teacher, value(formData, "id"));
  const status = value(formData, "status");
  if (!service || !earningServiceStatuses.has(status)) throw new Error("That service is unavailable.");
  await prisma.teacherEarningService.updateMany({ where: { id: service.id, institutionId: teacher.institutionId, teacherId: teacher.id }, data: { status } });
  await businessActivity(teacher, `${status === "PUBLISHED" ? "Published" : "Unpublished"} ${service.type.toLowerCase()} service: ${service.title}`, service.id);
  refresh();
  return { ok: true, message: status === "PUBLISHED" ? "Service is live in your Earn More workspace. Checkout remains unavailable until settlement controls are ready." : "Service moved to draft." };
}

export async function deleteEarningServiceAction(formData: FormData) {
  const teacher = await currentTeacher();
  const service = await ownedEarningService(teacher, value(formData, "id"));
  if (!service) throw new Error("That service is unavailable.");
  await prisma.teacherEarningService.deleteMany({ where: { id: service.id, institutionId: teacher.institutionId, teacherId: teacher.id } });
  await businessActivity(teacher, `Deleted ${service.type.toLowerCase()} service: ${service.title}`);
  refresh();
  return { ok: true, message: "Service deleted." };
}

export async function saveEarningServicePlanAction(formData: FormData) {
  const teacher = await currentTeacher();
  const service = await ownedEarningService(teacher, value(formData, "serviceId"));
  const id = value(formData, "id");
  const name = value(formData, "name").slice(0, 180);
  const price = rate(formData, "price");
  if (!service || name.length < 3) throw new Error("Choose a service and enter a plan name of at least 3 characters.");
  const payload = { name, price, currency: teachingCurrencies.has(value(formData, "currency")) ? value(formData, "currency") : service.currency, description: value(formData, "description").slice(0, 2000) || null, duration: value(formData, "duration").slice(0, 120) || null, sessions: Math.min(1000, Math.max(0, Number(value(formData, "sessions")) || 0)) || null };
  if (id) {
    const plan = await prisma.teacherEarningServicePlan.findFirst({ where: { id, serviceId: service.id, service: { institutionId: teacher.institutionId, teacherId: teacher.id } } });
    if (!plan) throw new Error("That plan is unavailable.");
    await prisma.teacherEarningServicePlan.update({ where: { id: plan.id }, data: payload });
  } else await prisma.teacherEarningServicePlan.create({ data: { ...payload, serviceId: service.id } });
  await businessActivity(teacher, `${id ? "Updated" : "Added"} plan for ${service.title}`, service.id);
  refresh();
  return { ok: true, message: "Plan saved successfully." };
}

export async function deleteEarningServicePlanAction(formData: FormData) {
  const teacher = await currentTeacher();
  const plan = await prisma.teacherEarningServicePlan.findFirst({ where: { id: value(formData, "id"), service: { institutionId: teacher.institutionId, teacherId: teacher.id } }, include: { service: true } });
  if (!plan) throw new Error("That plan is unavailable.");
  await prisma.teacherEarningServicePlan.delete({ where: { id: plan.id } });
  await businessActivity(teacher, `Removed plan from ${plan.service.title}`, plan.serviceId);
  refresh();
  return { ok: true, message: "Plan deleted." };
}

export async function submitHappyNotesAction(formData: FormData) {
  const teacher = await currentTeacher();
  const category = value(formData, "category");
  const title = value(formData, "title").slice(0, 180);
  const content = value(formData, "content").slice(0, 20_000);
  if (!happyNotesCategories.has(category) || title.length < 3 || content.length < 50) return;
  await prisma.userPreference.create({
    data: { userId: teacher.id, key: `happy-notes-submission:${crypto.randomUUID()}`, value: { category, title, content, status: "READY_FOR_HANDOFF", boundary: "HAPPY_NOTES", submittedAt: new Date().toISOString() } }
  });
  await businessActivity(teacher, `Happy Notes submission prepared: ${title}`);
  refresh();
}

export async function savePortfolioItemAction(formData: FormData) {
  const teacher = await currentTeacher();
  const id = value(formData, "id");
  const title = value(formData, "title").slice(0, 180);
  if (!title) return;
  const payload = {
    title, type: value(formData, "type").slice(0, 80), description: value(formData, "description").slice(0, 3000),
    url: safeUrl(value(formData, "url")), thumbnail: safeUrl(value(formData, "thumbnail")), public: formData.get("public") === "on"
  };
  if (id) await prisma.userPreference.updateMany({ where: { id, userId: teacher.id, key: { startsWith: "teacher-portfolio:" } }, data: { value: payload } });
  else await prisma.userPreference.create({ data: { userId: teacher.id, key: `teacher-portfolio:${crypto.randomUUID()}`, value: payload } });
  await businessActivity(teacher, `${id ? "Updated" : "Added"} portfolio item: ${title}`);
  refresh();
}

export async function deletePortfolioItemAction(formData: FormData) {
  const teacher = await currentTeacher();
  await prisma.userPreference.deleteMany({ where: { id: value(formData, "id"), userId: teacher.id, key: { startsWith: "teacher-portfolio:" } } });
  refresh();
}

export async function saveMarketplaceProductAction(formData: FormData) {
  const teacher = await currentTeacher();
  const item = await businessResource(teacher, value(formData, "id"));
  if (!item || item.status !== "PUBLISHED") return;
  const price = Number(value(formData, "price"));
  if (!Number.isFinite(price) || price < 0 || price > 10_000_000) return;
  const currentMetadata = object(item.aiReadyNotes);
  const currency = teacher.currency.toUpperCase();
  if (!new Set(["INR", "USD", "EUR", "GBP"]).has(currency)) return;
  const license = licenses.includes(value(formData, "license")) ? value(formData, "license") : "INSTITUTION_PERSONAL";
  const purchaseEnabled = formData.get("purchaseEnabled") === "on" && safeHttps(item.fileUrl);
  const previousPrice = item.marketplaceListing && Number(item.marketplaceListing.price) !== price ? item.marketplaceListing.price : item.marketplaceListing?.previousPrice;
  await prisma.$transaction([
    prisma.contentItem.updateMany({
      where: { id: item.id, institutionId: teacher.institutionId, createdById: teacher.id },
      data: {
        title: value(formData, "title").slice(0, 180) || item.title,
        description: value(formData, "description").slice(0, 4000) || item.description,
        aiReadyNotes: {
          ...currentMetadata, category: value(formData, "category").slice(0, 100), tags: list(formData, "tags"),
          preview: value(formData, "preview").slice(0, 2000), coverImage: safeUrl(value(formData, "thumbnail"))
        }
      }
    }),
    prisma.marketplaceListing.upsert({
      where: { contentItemId: item.id },
      update: { status: "ACTIVE", price, previousPrice, currency, license, purchaseEnabled },
      create: { contentItemId: item.id, status: "ACTIVE", price, currency, license, purchaseEnabled }
    })
  ]);
  await businessActivity(teacher, `Marketplace product updated: ${item.title}`, item.id);
  refresh();
}

export async function setBusinessResourceStatusAction(formData: FormData) {
  const teacher = await currentTeacher();
  const item = await businessResource(teacher, value(formData, "id"));
  const status = value(formData, "status");
  if (!item || !["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)) return;
  if (status === "PUBLISHED") {
    const currency = teacher.currency.toUpperCase();
    if (!new Set(["INR", "USD", "EUR", "GBP"]).has(currency)) return;
    await prisma.$transaction([
      prisma.contentItem.updateMany({ where: { id: item.id, institutionId: teacher.institutionId, createdById: teacher.id }, data: { status: "PUBLISHED", visibility: "PUBLIC", publishedAt: new Date() } }),
      prisma.marketplaceListing.upsert({
        where: { contentItemId: item.id },
        update: { status: "ACTIVE", purchaseEnabled: safeHttps(item.fileUrl) },
        create: { contentItemId: item.id, status: "ACTIVE", price: 0, currency, purchaseEnabled: safeHttps(item.fileUrl) }
      })
    ]);
  } else {
    await prisma.$transaction([
      prisma.contentItem.updateMany({ where: { id: item.id, institutionId: teacher.institutionId, createdById: teacher.id }, data: { status: status as "DRAFT" | "ARCHIVED", visibility: "PRIVATE" } }),
      prisma.marketplaceListing.updateMany({ where: { contentItemId: item.id, contentItem: { institutionId: teacher.institutionId, createdById: teacher.id } }, data: { status: "INACTIVE", purchaseEnabled: false } })
    ]);
  }
  await businessActivity(teacher, `${status === "PUBLISHED" ? "Published" : status === "ARCHIVED" ? "Archived" : "Moved to draft"}: ${item.title}`, item.id);
  refresh();
}

export async function deleteBusinessResourceAction(formData: FormData) {
  const teacher = await currentTeacher();
  const item = await businessResource(teacher, value(formData, "id"));
  if (!item || item.status !== "DRAFT" || item._count.commerceOrderItems > 0 || item._count.marketplaceEntitlements > 0) return;
  await prisma.contentItem.deleteMany({ where: { id: item.id, institutionId: teacher.institutionId, createdById: teacher.id, status: "DRAFT" } });
  refresh();
}

export async function setSubscriptionRenewalAction(formData: FormData) {
  const teacher = await currentTeacher();
  await prisma.userSubscription.updateMany({
    where: { id: value(formData, "id"), userId: teacher.id, institutionId: teacher.institutionId, plan: { audience: "TEACHER" } },
    data: { cancelAtPeriodEnd: value(formData, "cancel") === "true" }
  });
  refresh();
}
