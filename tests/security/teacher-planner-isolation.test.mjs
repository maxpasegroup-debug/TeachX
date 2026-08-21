import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

test("teacher planner reads a bounded window and only owned or institution-public events", () => {
  const service = read("services/teacher-workspace-service.ts");
  assert.match(service, /startsAt: \{ gte: rangeStart, lt: rangeEnd \}/);
  assert.match(service, /OR: \[\{ createdById: input\.userId \}, \{ createdById: null \}\]/);
  assert.match(service, /take: 500/);
  assert.doesNotMatch(service, /plannerEvent\.findMany\(\{ where: \{ institutionId: input\.institutionId \}/);
});

test("teacher planner mutations enforce tenant and owner boundaries", () => {
  const actions = read("features/teacher-workspace/actions.ts");
  assert.match(actions, /id: parsed\.data\.id, institutionId, createdById: session\.user\.id/);
  assert.match(actions, /createdById: session\.user\.id, type: "EVENT"/);
  assert.match(actions, /institutionId: session\.user\.institutionId!, createdById: session\.user\.id/);
  assert.match(actions, /status: "ACTIVE"/);
});

test("related classes and lessons must belong to the authenticated teacher", () => {
  const actions = read("features/teacher-workspace/actions.ts");
  assert.match(actions, /faculty: \{ some: \{ facultyId: session\.user\.id \} \}/);
  assert.match(actions, /timetableEntries: \{ some: \{ facultyId: session\.user\.id \} \}/);
  assert.match(actions, /institutionId, createdById: session\.user\.id/);
  assert.match(actions, /That lesson is not owned by your teacher workspace/);
});

test("planner extends the existing scheduling record instead of adding a parallel model", () => {
  const schema = read("prisma/schema.prisma");
  assert.match(schema, /model PlannerEvent \{[\s\S]*createdById[\s\S]*kind\s+PlannerItemKind[\s\S]*classroomId[\s\S]*lessonId/);
  assert.doesNotMatch(schema, /model TeacherTask|model TeacherCalendar|model TeacherLessonPlan/);
});

test("planner UI connects calendar sources, task lifecycle, AI, and all four views", () => {
  const component = read("features/teacher-workspace/components/teacher-planner.tsx");
  for (const view of ["day", "week", "month", "agenda"]) assert.match(component, new RegExp(`"${view}"`));
  assert.match(component, /data\.assignments/);
  assert.match(component, /data\.exams/);
  assert.match(component, /data\.timetable/);
  assert.match(component, /setTeacherPlannerItemStatusAction/);
  assert.match(component, /teacher\/ai-studio\/create/);
  assert.match(component, /data\.notifications/);
});
