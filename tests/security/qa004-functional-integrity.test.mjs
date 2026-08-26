import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const criticalRoutes = [
  "app/page.tsx",
  "app/(auth)/login/page.tsx",
  "app/signup/teacher/page.tsx",
  "app/(app)/teacher/page.tsx",
  "app/(app)/teacher/ai-studio/page.tsx",
  "app/(app)/teacher/resources/page.tsx",
  "app/(app)/teacher/community/[module]/page.tsx",
  "app/(app)/teacher/business/[module]/page.tsx",
  "app/(app)/teacher/support/page.tsx",
  "app/(app)/classrooms/page.tsx",
  "app/(app)/classrooms/[classroomId]/page.tsx",
  "app/(app)/exams/page.tsx",
  "app/(app)/exams/[examId]/take/page.tsx",
  "app/(app)/student/page.tsx",
  "app/(app)/parent/page.tsx",
  "app/(app)/admin/page.tsx",
  "app/(app)/checkout/[orderId]/page.tsx",
];

test("STATIC QA004-01: launch-critical routes have concrete page modules", () => {
  const missing = criticalRoutes.filter((path) => !existsSync(new URL(`../../${path}`, import.meta.url)));
  assert.deepEqual(missing, []);
});

test("STATIC QA004-02: core teacher forms bind real server actions", () => {
  const classroom = read("features/classrooms/components/classroom-page.tsx");
  const actions = read("features/classrooms/actions.ts");
  for (const action of [
    "addStandaloneStudentAction",
    "createAssignmentAction",
    "saveAttendanceAction",
    "reviewAssignmentSubmissionAction",
  ]) {
    assert.match(classroom, new RegExp(`action=\\{[^}]*${action.replace("Action", "")}|${action}`));
    assert.match(actions, new RegExp(`export async function ${action}\\b`));
  }
});

test("STATIC QA004-03: core classroom actions reach persistent database operations", () => {
  const source = read("features/classrooms/actions.ts");
  assert.match(source, /createStandaloneClass\(/);
  assert.match(source, /addStandaloneStudent\(/);
  assert.match(source, /prisma\.\$transaction/);
  assert.match(source, /attendanceSession\.upsert/);
  assert.match(source, /attendanceRecord\.upsert/);
});

test("STATIC QA004-04: launch-critical controls contain no placeholder links or unbound forms", () => {
  const files = [
    "features/classrooms/components/classroom-page.tsx",
    "features/ai-studio/components/generation-workflow.tsx",
    "features/teacher-workspace/components/teacher-workspace-page.tsx",
    "features/commerce/components/commerce-components.tsx",
  ];
  for (const file of files) {
    const source = read(file);
    assert.doesNotMatch(source, /href=["']#["']/);
    assert.doesNotMatch(source, /<form\b(?![^>]*(?:action=|onSubmit=))[^>]*>/s);
  }
});

test("STATIC QA004-05: automation never reports simulated work as completed", () => {
  const source = read("services/automation-service.ts");
  assert.doesNotMatch(source, /status:\s*["']COMPLETED["'][\s\S]{0,160}simulated:\s*true/);
});

test("STATIC QA004-06: AI generation reaches the configured production provider", () => {
  const ai = read("services/ai-service.ts");
  const provider = read("services/openai-service.ts");
  assert.match(ai, /runOpenAICompletion\(/);
  assert.match(provider, /openai\.responses\.create\(/);
  assert.match(ai, /aIConversation\.(?:create|update)/);
  assert.match(ai, /aIUsage\.create/);
});

test("STATIC QA004-07: missing AI configuration fails instead of persisting a fake response", () => {
  const source = read("services/openai-service.ts");
  assert.doesNotMatch(source, /AI is ready\. Add OPENAI_API_KEY to enable live responses\./);
});

test("STATIC QA004-08: payments require signed provider verification before fulfillment", () => {
  const payment = read("services/payment-service.ts");
  const stripe = read("app/api/payments/webhooks/stripe/route.ts");
  const razorpay = read("app/api/payments/webhooks/razorpay/route.ts");
  assert.match(stripe, /constructEvent\(/);
  assert.match(razorpay, /verifyRazorpayWebhook\(/);
  assert.match(payment, /recordPaymentSignal/);
  assert.match(payment, /fulfil\(/);
  assert.match(payment, /providerEventId/);
});

test("STATIC QA004-09: exam mutations enforce the authenticated student's attempt and exam access", () => {
  const actions = read("features/exams/actions.ts");
  const service = read("services/exam-service.ts");
  assert.match(actions, /requireCurrentUser\("exams\.attempt"\)/);
  assert.match(actions, /startStudentExamAttempt\(\{ examId, studentId: user\.id \}\)/);
  assert.match(actions, /saveStudentExamAnswer\(\{ studentId: user\.id, attemptId, questionId/);
  assert.match(actions, /submitStudentExamAttempt\(\{ studentId: user\.id, attemptId \}\)/);
  assert.match(service, /studentId: student\.id,[\s\S]*status: "IN_PROGRESS"/);
});

test("STATIC QA004-P0-EXAM-01/07/08: Tenant A and B exam visibility is symmetric and batch-null remains institution scoped", () => {
  const source = read("services/exam-service.ts");
  for (const functionName of ["getExamForStudent", "getAvailableStudentExams", "startStudentExamAttempt"]) {
    const body = source.match(new RegExp(`(?:export )?async function ${functionName}[\\s\\S]*?(?=\\n(?:export )?async function|$)`))?.[0] ?? "";
    assert.match(body, /institutionId(?:: student\.institutionId|,)/);
    assert.match(body, /course: \{ institutionId/);
    assert.match(body, /\{ batchId: null \}/);
  }
});

test("STATIC QA004-P0-EXAM-02/03/05: attempt answer and submission ownership comes only from the authenticated student", () => {
  const source = read("services/exam-service.ts");
  assert.match(source, /saveStudentExamAnswer[\s\S]*id: input\.attemptId,[\s\S]*studentId: student\.id/);
  assert.match(source, /submitStudentExamAttempt[\s\S]*id: input\.attemptId,[\s\S]*studentId: student\.id/);
  assert.doesNotMatch(read("features/exams/actions.ts"), /formData\.get\(["']studentId["']\)/);
});

test("STATIC QA004-P0-EXAM-04/18: questions must belong to both the attempt exam and the same tenant academic graph", () => {
  const exam = read("services/exam-service.ts");
  const academic = read("services/academic-integrity-service.ts");
  assert.match(exam, /questions: \{ some: \{ questionId: input\.questionId \} \}/);
  assert.match(academic, /exam\.courseId !== question\.courseId/);
  assert.match(academic, /exam\.subjectId && exam\.subjectId !== question\.subjectId/);
});

test("STATIC QA004-P0-EXAM-06/10: evaluation is actor scoped and duplicate submission is idempotent", () => {
  const evaluation = read("services/evaluation-service.ts");
  const exam = read("services/exam-service.ts");
  assert.match(evaluation, /studentId: input\.studentId/);
  assert.match(evaluation, /institutionId: input\.institutionId/);
  assert.match(evaluation, /pg_advisory_xact_lock/);
  assert.match(exam, /attempt\.status === "EVALUATED" && attempt\.result/);
  assert.match(evaluation, /status: "IN_PROGRESS"/);
});

test("STATIC QA004-P0-EXAM-09/11: attempt limits and configured exam windows are enforced server-side", () => {
  const source = read("services/exam-service.ts");
  assert.match(source, /used >= exam\.attemptsAllowed/);
  assert.match(source, /assertExamWindow\(exam, now, "start"\)/);
  assert.match(source, /attemptDeadline\(attempt\)/);
  assert.match(source, /AUTO_SUBMITTED/);
});

test("STATIC QA004-P0-ACADEMIC-12/19: batch-course and exam-batch writes validate the complete tenant graph", () => {
  const batches = read("features/batches/actions.ts");
  const exams = read("features/exams/actions.ts");
  assert.match(batches, /requireAcademicReferences\(institutionId, parsed\.data\)/);
  assert.match(exams, /requireAcademicReferences\(institutionId, \{ courseId, subjectId, chapterId, topicId, batchId \}\)/);
});

test("STATIC QA004-P0-ACADEMIC-13: subject references are tenant and course scoped", () => {
  const source = read("services/academic-integrity-service.ts");
  assert.match(source, /prisma\.subject\.findFirst\(\{ where: \{ id: refs\.subjectId, course: \{ institutionId \}/);
  assert.match(source, /refs\.courseId \? \{ courseId: refs\.courseId \}/);
});

test("STATIC QA004-P0-ACADEMIC-14: faculty references require same-tenant active academic staff", () => {
  const source = read("services/academic-integrity-service.ts");
  assert.match(source, /id: refs\.facultyId, institutionId, status: "ACTIVE"/);
  assert.match(source, /key: \{ in: facultyRoles \}/);
});

test("STATIC QA004-P0-ACADEMIC-15/16/17: branch department and academic-year references are institution scoped", () => {
  const source = read("services/academic-integrity-service.ts");
  assert.match(source, /prisma\.branch\.findFirst\(\{ where: \{ id: refs\.branchId, institutionId \}/);
  assert.match(source, /prisma\.department\.findFirst\(\{ where: \{ id: refs\.departmentId, institutionId \}/);
  assert.match(source, /prisma\.academicYear\.findFirst\(\{ where: \{ id: refs\.academicYearId, institutionId \}/);
});

test("STATIC QA004-P0-ACADEMIC-20: academic relationship writes require authoritative permissions", () => {
  for (const file of ["features/courses/actions.ts", "features/batches/actions.ts", "features/exams/actions.ts", "features/academic/actions.ts", "features/planner/actions.ts"]) {
    assert.match(read(file), /requireCurrentUser\("(?:courses\.manage|batches\.manage|exams\.manage|academic\.setup\.manage|planner\.manage)"\)/);
  }
});

test("STATIC QA004-P0-ACADEMIC-REVERSE: all tenant checks derive one authenticated institution, so Tenant B to A is equally rejected", () => {
  const source = read("services/academic-integrity-service.ts");
  assert.doesNotMatch(source, /input\.institutionId|refs\.institutionId/);
  assert.match(source, /if \(!institutionId\) throw new Error\("Institution context is required\."\)/);
  assert.match(source, /The selected .* is outside your institution or academic scope/);
});

test("STATIC QA004-10: course and batch management expose intended update and delete lifecycles", () => {
  const course = read("features/courses/actions.ts");
  const batch = read("features/batches/actions.ts");
  assert.match(course, /export async function updateCourseAction/);
  assert.match(course, /export async function deleteCourseAction/);
  assert.match(batch, /export async function updateBatchAction/);
  assert.match(batch, /export async function deleteBatchAction/);
});

test("STATIC QA004-11: AI credit-pack creation sends the buyer to a usable checkout result", () => {
  const source = read("features/commerce/actions.ts");
  const body = source.match(/export async function createAICreditPackOrderAction[\s\S]*?(?=\nexport async function)/)?.[0] ?? "";
  assert.match(body, /redirect\(`\/checkout\/\$\{order\.id\}`\)|return\s+\{[^}]*orderId/);
});

test("STATIC QA004-12: critical commerce UI does not advertise placeholders as operations", () => {
  const source = read("features/commerce/components/commerce-components.tsx");
  assert.doesNotMatch(source, />Invoice Placeholder</);
  assert.doesNotMatch(source, /Placeholder for revenue graph/);
});

test("STATIC QA004-13: important server-action failures are returned to visible action state", () => {
  const commerce = read("features/commerce/actions.ts");
  const support = read("features/teacher-settings/actions.ts");
  assert.doesNotMatch(commerce, /createBookingReservationOrderAction[\s\S]*?if\s*\([^)]*\)\s*return;/);
  assert.doesNotMatch(support, /replyToTeacherSupportAction[\s\S]*?if\s*\([^)]*\)\s*return;/);
});

test("STATIC QA004-14: classroom announcements target enrolled recipients rather than the whole institution", () => {
  const source = read("features/classrooms/actions.ts");
  const body = source.match(/export async function createAnnouncementAction[\s\S]*?(?=\nconst materialSchema)/)?.[0] ?? "";
  assert.match(body, /classroom\.batch\.students|createMany/);
  assert.doesNotMatch(body, /notification\.create\(\{\s*data:\s*\{\s*institutionId,\s*title:/);
});

test("STATIC QA004-15: AI calls define bounded timeout or abort behavior", () => {
  const source = read("services/openai-service.ts");
  assert.match(source, /timeout|AbortSignal|signal/);
});
