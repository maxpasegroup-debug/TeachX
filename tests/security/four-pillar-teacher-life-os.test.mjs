import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("teacher Home makes the four pillars the clear front door", () => {
  const home = read("features/teachx/components/operating-dashboard.tsx");
  for (const label of ["Save Time", "Earn More", "Learn More", "Enjoy More"]) assert.ok(home.includes(label));
  for (const route of ["/teacher/life/save-time", "/teacher/life/earn-more", "/teacher/life/learn-more", "/teacher/life/enjoy-more"]) assert.ok(home.includes(route));
  assert.match(home, /Teach better\. Work smarter\. Grow\. Live better\./);
  assert.match(home, /\/teacher-life-os-home\.webp/);
  assert.match(home, /aiCreditsRemaining/);
  assert.match(home, /href="\/tara"/);
});

test("primary teacher navigation is pillar-first and remains concise", () => {
  const navigation = read("lib/constants/navigation.ts");
  const teacherBlock = navigation.match(/teacher: \[([\s\S]*?)\n  \],\n  student:/)?.[1] ?? "";
  for (const label of ["Home", "Save Time", "Earn More", "Learn More", "Enjoy More", "TARA", "Notifications", "Profile", "Settings"]) assert.ok(teacherBlock.includes(`label: "${label}"`));
  assert.ok((teacherBlock.match(/\{ label:/g) ?? []).length <= 10);
  assert.doesNotMatch(teacherBlock, /label: "AI Studio"|label: "Resources"|label: "Planner"/);
});

test("Save Time categorizes every required facility over canonical routes", () => {
  const page = read("features/teacher-life/components/teacher-life-page.tsx");
  for (const group of ["Teach & Plan", "Create", "Communicate", "Organize", "TARA"]) assert.ok(page.includes(group));
  for (const facility of ["Lesson Generator", "Worksheet Generator", "Quiz Generator", "Question Paper Builder", "Assessment Builder", "Rubric Generator", "Homework Generator", "Classroom Activity", "Presentation / PPT", "Certificate Generator", "Report / Comment Generator", "Parent Communication", "Messages", "Announcements", "Attendance", "Calendar", "Documents"]) assert.ok(page.includes(facility));
  for (const route of ["/teacher/workspace/classrooms", "/teacher/workspace/lessons", "/teacher/workspace/planner", "/teacher/resources", "/teacher/community/messages", "/teacher/ai-studio/create/"]) assert.ok(page.includes(route));
  assert.match(page, /Search Save Time tools/);
  assert.match(page, /data\.recentItems/);
});

test("Earn More exposes the existing 1:1, publishing and business journeys", () => {
  const page = read("features/teacher-life/components/teacher-life-page.tsx");
  for (const step of ["Create profile", "Add expertise", "Add experience", "Choose teaching format", "Set availability", "Set pricing", "Preview", "Activate"]) assert.ok(page.includes(step));
  for (const route of ["/teacher/business/one-to-one", "/teacher/business/profile", "/teacher/business/portfolio", "/teacher/business/publishing", "/teacher/business/happy-notes", "/teacher/business/marketplace", "/teacher/business/orders", "/teacher/business/earnings", "/teacher/business/wallet", "/teacher/business/analytics"]) assert.ok(page.includes(route));
  assert.match(page, /Future opportunities/);
  assert.match(page, /only when verified and available/);
});

test("Learn More and Enjoy More use real boundaries and honest empty states", () => {
  const page = read("features/teacher-life/components/teacher-life-page.tsx");
  const service = read("services/teacher-life-service.ts");
  for (const category of ["AI Skills", "Professional Development", "Audiobooks", "Books", "Video Courses", "Webinars"]) assert.ok(page.includes(category));
  for (const category of ["Travel", "Family", "Wellness", "Leisure", "Teacher Experiences", "Special Offers"]) assert.ok(page.includes(category));
  assert.match(page, /Only real published teacher-learning content appears here/);
  assert.match(page, /No offers, partners, prices or bookings are available yet/);
  assert.match(service, /institutionId,[\s\S]*status: "PUBLISHED"/);
  assert.match(service, /getActiveSubscription/);
  assert.doesNotMatch(page, /testimonial|discount|top rated|best seller/i);
});

test("TARA remains one shared intelligence layer across all pillars", () => {
  const page = read("features/teacher-life/components/teacher-life-page.tsx");
  for (const prompt of ["Let TARA plan my day", "Let TARA improve my teaching profile", "Ask TARA what I should learn next", "Ask TARA what is coming"]) assert.ok(page.includes(prompt));
  assert.match(page, /One AI partner/);
  assert.doesNotMatch(read("prisma/schema.prisma"), /model (SaveTimeAI|EarnMoreAI|LearnMoreAI|EnjoyMoreAI) \{/);
});

test("P13 adds no duplicate systems and does not touch sibling products", () => {
  const schema = read("prisma/schema.prisma");
  for (const model of ["Pillar", "TeacherLifeModule", "LearningSubscriptionV2", "EnjoyOffer", "TeacherAIV2"]) assert.doesNotMatch(schema, new RegExp(`model ${model} \\{`));
  assert.ok(fs.existsSync(path.join(root, "public", "teacher-life-os-home.webp")));
});
