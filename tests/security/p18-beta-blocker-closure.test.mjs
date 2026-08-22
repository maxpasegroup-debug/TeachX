import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { invitedRosterStudentWhere, ownedPersonalClassroomWhere, rosterEnrollmentWhere } from "../../lib/teacher-tenant-boundary.mjs";

const root = process.cwd();
const read = (path) => readFileSync(join(root, path), "utf8");

const tenantA = { institutionId: "tenant-a", userId: "teacher-a", classroomId: "class-a", batchId: "batch-a", studentId: "student-a" };
const tenantB = { institutionId: "tenant-b", userId: "teacher-b", classroomId: "class-b", batchId: "batch-b", studentId: "student-b" };

function matchesOwnedClassroom(where, row) {
  return where.id === row.classroomId && where.institutionId === row.institutionId && where.batch.faculty.some.facultyId === row.userId;
}

test("the actual standalone classroom boundary rejects both cross-tenant fixture directions", () => {
  const scopeA = ownedPersonalClassroomWhere(tenantA);
  const scopeB = ownedPersonalClassroomWhere(tenantB);
  assert.equal(matchesOwnedClassroom(scopeA, tenantA), true);
  assert.equal(matchesOwnedClassroom(scopeB, tenantB), true);
  assert.equal(matchesOwnedClassroom(scopeA, tenantB), false);
  assert.equal(matchesOwnedClassroom(scopeB, tenantA), false);
  assert.throws(() => ownedPersonalClassroomWhere({ userId: "teacher-a", institutionId: "", classroomId: "class-a" }));
});

test("student edit and removal boundaries always carry explicit tenant and enrollment scope", () => {
  assert.deepEqual(invitedRosterStudentWhere(tenantA), {
    id: "student-a", institutionId: "tenant-a", userType: "student", status: "INVITED", studentBatches: { some: { batchId: "batch-a" } }
  });
  assert.deepEqual(rosterEnrollmentWhere(tenantB), {
    batchId: "batch-b", studentId: "student-b", student: { institutionId: "tenant-b", userType: "student" }
  });
  assert.notEqual(invitedRosterStudentWhere(tenantA).institutionId, tenantB.institutionId);
  assert.notEqual(rosterEnrollmentWhere(tenantB).student.institutionId, tenantA.institutionId);
});

test("standalone setup reuses canonical classroom and student models without a parallel schema", () => {
  const service = read("services/standalone-teacher-service.ts");
  const schema = read("prisma/schema.prisma");
  for (const operation of ["course.create", "batch.create", "classroom.create", "batchStudent.upsert", "assignmentSubmission.createMany"]) assert.ok(service.includes(operation));
  assert.match(service, /userType: "student", status: "INVITED"/);
  assert.equal((schema.match(/model Classroom \{/g) ?? []).length, 1);
  assert.equal((schema.match(/model StudentProfile \{/g) ?? []).length, 1);
});

test("personal class and roster mutations require authentication, validation, owner, and tenant checks", () => {
  const actions = read("features/classrooms/actions.ts");
  const service = read("services/standalone-teacher-service.ts");
  assert.match(actions, /if \(!session\?\.user\?\.id \|\| !session\.user\.institutionId\)/);
  assert.match(actions, /standaloneClassSchema\.safeParse/);
  assert.match(actions, /rosterStudentSchema\.safeParse/);
  assert.match(service, /explicit\.ownerId === userId/);
  assert.match(service, /ownedPersonalClassroomWhere\(\{ userId, institutionId, classroomId \}\)/);
  assert.doesNotMatch(service, /institutionId:\s*undefined/);
});

test("new and legacy personal teachers are recognized without changing institution teachers", () => {
  const signup = read("features/auth/actions.ts");
  const service = read("services/standalone-teacher-service.ts");
  assert.match(signup, /key: "teachx\.workspace", value: personalWorkspaceSetting\(user\.id\)/);
  assert.match(service, /explicit\.kind === "PERSONAL_TEACHER"/);
  assert.match(service, /source === "teacher_phone_signup"/);
  assert.match(service, /Personal teacher workspace access is required/);
});

test("the teacher UI connects class creation, roster, attendance, assignments, resources, and planner", () => {
  const workspace = read("features/teacher-workspace/components/teacher-workspace-page.tsx");
  const classroom = read("features/classrooms/components/classroom-page.tsx");
  for (const label of ["Create your first class", "Open class and add students", "Add student", "Save name", "Remove", "Attendance", "Assignments", "Study Materials"]) assert.ok(`${workspace}\n${classroom}`.includes(label));
  for (const anchor of ['id="students"', 'id="attendance"', 'id="assignments"', 'id="materials"']) assert.ok(classroom.includes(anchor));
  assert.ok(workspace.includes("/teacher/workspace/planner"));
});

test("TARA resolves only faculty-owned classes and tenant-owned context for standalone teachers", () => {
  const tara = read("services/tara-service.ts");
  assert.match(tara, /institutionId: input\.institutionId/);
  assert.match(tara, /faculty: \{ some: \{ facultyId: input\.userId \} \}/);
  assert.match(tara, /createdById: input\.userId/);
  assert.match(tara, /sellerId: input\.userId/);
  assert.match(tara, /getActiveSubscription\(input\.userId, input\.institutionId, "TEACHER"\)/);
  assert.match(tara, /getAICreditSummary\(\{ userId: input\.userId, institutionId: input\.institutionId/);
});

test("production readiness remains fail-closed and does not claim absent live evidence", () => {
  const env = read("lib/env.ts");
  const ready = read("app/api/ready/route.ts");
  const gate = read("scripts/launch-gate.mjs");
  const p16 = read("docs/P16_PRODUCTION_LAUNCH_CERTIFICATION.md");
  assert.match(env, /process\.env\.NODE_ENV === "production"/);
  assert.match(ready, /status: runtime\.ok \? "ready" : "configuration_incomplete"/);
  assert.match(ready, /status: runtime\.ok \? 200 : 503/);
  assert.match(gate, /Production mode requires an HTTPS SMOKE_BASE_URL/);
  assert.match(gate, /Live payment evidence/);
  assert.match(p16, /npx prisma migrate deploy/);
  assert.match(p16, /CODE READY \/ PRODUCTION CONFIG BLOCKED/);
});
