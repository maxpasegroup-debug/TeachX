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
