import { expect, test, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { spawnSync } from "node:child_process";

const qaDatabaseUrl = process.env.QA_DATABASE_URL || process.env.QA001_DATABASE_URL;
const enabled = Boolean(qaDatabaseUrl && process.env.QA_DATABASE_CONFIRM === "TEACHX_QA_ONLY" && process.env.QA_ALLOW_DATABASE_WRITES === "true");

function makeFixture(projectName: string) {
  const suffix = projectName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return {
    tenantA: `qa001-${suffix}-tenant-a`,
    tenantB: `qa001-${suffix}-tenant-b`,
    teacherA: `qa001-${suffix}-teacher-a`,
    teacherB: `qa001-${suffix}-teacher-b`,
    teacherNoInstitution: `qa001-${suffix}-teacher-no-institution`,
    emailA: `qa001-${suffix}-teacher-a@teachx.invalid`,
    emailB: `qa001-${suffix}-teacher-b@teachx.invalid`,
    emailNoInstitution: `qa001-${suffix}-teacher-no-institution@teachx.invalid`,
    password: "QA001-Only-Password-938271",
    secretA: "TENANT_A_SECRET_938271",
    secretB: "TENANT_B_SECRET_746281"
  } as const;
}

let fixture = makeFixture("uninitialized");

let prisma: PrismaClient;

function verifyQaDatabaseGuard() {
  const result = spawnSync(process.execPath, ["scripts/qa-database.mjs", "verify"], {
    cwd: process.cwd(),
    env: process.env,
    encoding: "utf8"
  });
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "QA database safety verification failed.");
}

async function cleanup() {
  await prisma.user.deleteMany({
    where: { id: { in: [fixture.teacherA, fixture.teacherB, fixture.teacherNoInstitution] } }
  });
  await prisma.institution.deleteMany({
    where: { id: { in: [fixture.tenantA, fixture.tenantB] } }
  });
}

async function seed() {
  await cleanup();
  const passwordHash = await bcrypt.hash(fixture.password, 4);
  const role = await prisma.role.upsert({
    where: { key: "ACADEMIC_FACULTY" },
    update: {},
    create: { key: "ACADEMIC_FACULTY", name: "Academic Faculty" }
  });

  await prisma.institution.createMany({
    data: [
      { id: fixture.tenantA, name: "QA-001 Tenant A" },
      { id: fixture.tenantB, name: "QA-001 Tenant B" }
    ]
  });
  await prisma.user.create({
    data: {
      id: fixture.teacherA,
      institutionId: fixture.tenantA,
      name: "QA-001 Teacher A",
      email: fixture.emailA,
      userType: "teacher",
      passwordHash,
      roles: { create: { roleId: role.id } }
    }
  });
  await prisma.user.create({
    data: {
      id: fixture.teacherNoInstitution,
      institutionId: null,
      name: "QA-001 Teacher Without Institution",
      email: fixture.emailNoInstitution,
      userType: "teacher",
      passwordHash,
      roles: { create: { roleId: role.id } }
    }
  });
  await prisma.user.create({
    data: {
      id: fixture.teacherB,
      institutionId: fixture.tenantB,
      name: "QA-001 Teacher B",
      email: fixture.emailB,
      userType: "teacher",
      passwordHash,
      roles: { create: { roleId: role.id } }
    }
  });

  await prisma.notification.createMany({
    data: [
      { id: `${fixture.teacherA}-title`, institutionId: fixture.tenantA, userId: fixture.teacherA, title: fixture.secretA, body: "Teacher A title evidence" },
      { id: `${fixture.teacherA}-body`, institutionId: fixture.tenantA, userId: fixture.teacherA, title: "Teacher A body evidence", body: `Body marker ${fixture.secretA}_BODY` },
      { id: `${fixture.teacherA}-meta`, institutionId: fixture.tenantA, userId: fixture.teacherA, title: "Teacher A metadata evidence", metadata: { marker: `${fixture.secretA}_META` } },
      { id: `${fixture.teacherA}-tenant`, institutionId: fixture.tenantA, userId: null, title: "Tenant A broadcast", body: "Authorized tenant-wide notice" },
      { id: `${fixture.teacherB}-title`, institutionId: fixture.tenantB, userId: fixture.teacherB, title: fixture.secretB, body: "Teacher B title evidence" },
      { id: `${fixture.teacherB}-body`, institutionId: fixture.tenantB, userId: fixture.teacherB, title: "Teacher B body evidence", body: `Body marker ${fixture.secretB}_BODY` },
      { id: `${fixture.teacherB}-meta`, institutionId: fixture.tenantB, userId: fixture.teacherB, title: "Teacher B metadata evidence", metadata: { marker: `${fixture.secretB}_META` } },
      { id: `${fixture.teacherB}-tenant`, institutionId: fixture.tenantB, userId: null, title: "Tenant B broadcast", body: "Foreign tenant-wide notice" },
      { id: `${fixture.teacherB}-archived`, institutionId: fixture.tenantB, userId: fixture.teacherB, title: `${fixture.secretB}_ARCHIVED`, status: "ARCHIVED" },
      { id: `${fixture.teacherNoInstitution}-title`, institutionId: null, userId: fixture.teacherNoInstitution, title: "NO_INSTITUTION_OWN_552211", body: "Personal notification" }
    ]
  });
}

async function login(page: Page, email: string) {
  await page.goto("/login/staff?callbackUrl=%2Fcommunication");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(fixture.password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).not.toHaveURL(/\/login\/staff/);
  await page.goto("/communication");
  await expect(page).toHaveURL(/\/communication$/);
}

test.describe.serial("QA-001 real community notification tenant isolation", () => {
  test.skip(!enabled, "Use the guarded npm run test:qa command with a prepared isolated QA database.");

  test.beforeAll(async ({}, workerInfo) => {
    fixture = makeFixture(workerInfo.project.name);
    process.env.DATABASE_URL = qaDatabaseUrl;
    verifyQaDatabaseGuard();
    prisma = new PrismaClient({ datasourceUrl: qaDatabaseUrl });
    await seed();
  });

  test.afterAll(async () => {
    if (!prisma) return;
    await cleanup();
    await prisma.$disconnect();
  });

  test("QA001-01 empty search preserves authenticated user and tenant scope", async ({ page }) => {
    await login(page, fixture.emailA);
    await expect(page.getByLabel("Communication notification center").getByText(fixture.secretA, { exact: true })).toBeVisible();
    await expect(page.getByLabel("Communication notification center").getByText("Tenant A broadcast", { exact: true })).toBeVisible();
    await expect(page.getByText(fixture.secretB, { exact: true })).toHaveCount(0);
  });

  test("QA001-02 partial foreign title search must not cross tenants", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto("/communication?notificationQuery=746281");
    await expect(page.getByText(fixture.secretB, { exact: true })).toHaveCount(0);
  });

  test("QA001-03 exact foreign title search must not cross tenants", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(fixture.secretB)}`);
    await expect(page.getByText(fixture.secretB, { exact: true })).toHaveCount(0);
  });

  test("QA001-04 foreign body search must not cross tenants", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(`${fixture.secretB}_BODY`)}`);
    await expect(page.getByText("Teacher B body evidence", { exact: true })).toHaveCount(0);
  });

  test("QA001-05 notification metadata is not part of notification search", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(`${fixture.secretA}_META`)}`);
    await expect(page.getByLabel("Communication notification center").getByText("Teacher A metadata evidence", { exact: true })).toHaveCount(0);
  });

  test("QA001-06 reverse-direction foreign search must not cross tenants", async ({ page }) => {
    await login(page, fixture.emailB);
    await page.goto("/communication?notificationQuery=938271");
    await expect(page.getByText(fixture.secretA, { exact: true })).toHaveCount(0);
  });

  test("QA001-07 manipulated user and institution IDs cannot replace the authenticated actor", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto(`/communication?userId=${fixture.teacherB}&institutionId=${fixture.tenantB}&notificationQuery=${encodeURIComponent(fixture.secretB)}`);
    await expect(page.getByText(fixture.secretB, { exact: true })).toHaveCount(0);
  });

  test("QA001-08 own and institution-wide searches remain authorized", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(fixture.secretA)}`);
    await expect(page.getByLabel("Communication notification center").getByText(fixture.secretA, { exact: true })).toBeVisible();
    await page.goto("/communication?notificationQuery=Tenant%20A%20broadcast");
    await expect(page.getByLabel("Communication notification center").getByText("Tenant A broadcast", { exact: true })).toBeVisible();
  });

  test("QA001-09 user without institution receives only their own matching notification", async ({ page }) => {
    await login(page, fixture.emailNoInstitution);
    await page.goto("/communication?notificationQuery=NO_INSTITUTION_OWN_552211");
    await expect(page.getByLabel("Communication notification center").getByText("NO_INSTITUTION_OWN_552211", { exact: true })).toBeVisible();
    await page.goto("/communication?notificationQuery=Tenant%20A%20broadcast");
    await expect(page.getByText("Tenant A broadcast", { exact: true })).toHaveCount(0);
  });

  test("QA001-10 archived matching notification is excluded", async ({ page }) => {
    await login(page, fixture.emailB);
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(`${fixture.secretB}_ARCHIVED`)}`);
    await expect(page.getByText(`${fixture.secretB}_ARCHIVED`, { exact: true })).toHaveCount(0);
  });

  test("QA001-11 authenticated search form submits through the secured server query", async ({ page }) => {
    await login(page, fixture.emailA);
    await page.getByPlaceholder("Search notifications").fill(fixture.secretA);
    await page.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(new RegExp(`notificationQuery=${fixture.secretA}`));
    await expect(page.getByLabel("Communication notification center").getByText(fixture.secretA, { exact: true })).toBeVisible();
  });

  test("QA001-12 unauthenticated notification query is rejected by the protected route", async ({ page }) => {
    await page.goto(`/communication?notificationQuery=${encodeURIComponent(fixture.secretA)}`);
    await expect(page).not.toHaveURL(/\/communication/);
    await expect(page.getByText(fixture.secretA, { exact: true })).toHaveCount(0);
  });
});
