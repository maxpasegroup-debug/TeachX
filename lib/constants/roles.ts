export const roleKeys = [
  "DIRECTOR",
  "ACADEMIC_HEAD",
  "ACADEMIC_FACULTY",
  "PHYSICAL_TRAINER",
  "PART_TIME_TUTOR",
  "STUDENT",
  "PARENT",
  "GUEST",
  "ADMIN",
  "ACCOUNTS",
  "RECEPTION",
  "BUSINESS_DEVELOPMENT_EXECUTIVE",
  "VIDEO_EDITOR"
] as const;

export type RoleKey = (typeof roleKeys)[number];

export const roleLabels: Record<RoleKey, string> = {
  DIRECTOR: "Director",
  ACADEMIC_HEAD: "Academic Head",
  ACADEMIC_FACULTY: "Academic Faculty",
  PHYSICAL_TRAINER: "Physical Trainer",
  PART_TIME_TUTOR: "Part Time Tutor",
  STUDENT: "Student",
  PARENT: "Parent",
  GUEST: "Guest",
  ADMIN: "Admin",
  ACCOUNTS: "Accounts",
  RECEPTION: "Reception",
  BUSINESS_DEVELOPMENT_EXECUTIVE: "Business Development Executive",
  VIDEO_EDITOR: "Video Editor"
};

export const permissionKeys = [
  "dashboard.view",
  "institution.manage",
  "people.view",
  "people.manage",
  "operations.view",
  "reports.view",
  "settings.view",
  "settings.manage",
  "finance.view",
  "finance.manage",
  "reception.view",
  "reception.manage",
  "staff.view",
  "staff.manage",
  "leave.view",
  "leave.manage",
  "director.view",
  "content.view",
  "content.manage",
  "academic.setup.manage",
  "courses.manage",
  "batches.manage",
  "planner.manage",
  "planner.view",
  "classrooms.view",
  "classrooms.manage",
  "classrooms.own.manage",
  "admissions.view",
  "admissions.manage",
  "partners.view",
  "partners.manage",
  "guest.portal",
  "exams.view",
  "exams.manage",
  "exams.attempt"
] as const;

export type PermissionKey = (typeof permissionKeys)[number];

export const rolePermissions: Record<RoleKey, PermissionKey[]> = {
  DIRECTOR: ["dashboard.view", "institution.manage", "people.view", "operations.view", "reports.view", "settings.view", "settings.manage", "finance.view", "finance.manage", "reception.view", "reception.manage", "staff.view", "staff.manage", "leave.view", "leave.manage", "director.view", "content.view", "content.manage", "academic.setup.manage", "courses.manage", "batches.manage", "planner.manage", "planner.view", "classrooms.view", "admissions.view", "admissions.manage", "partners.view", "partners.manage", "exams.view", "exams.manage"],
  ACADEMIC_HEAD: ["dashboard.view", "people.view", "operations.view", "reports.view", "reception.view", "staff.view", "leave.view", "content.view", "content.manage", "academic.setup.manage", "courses.manage", "batches.manage", "planner.manage", "planner.view", "classrooms.view", "classrooms.manage", "classrooms.own.manage", "admissions.view", "exams.view", "exams.manage"],
  ACADEMIC_FACULTY: ["dashboard.view", "content.view", "content.manage", "planner.view", "classrooms.view", "classrooms.own.manage", "exams.view", "exams.manage"],
  PHYSICAL_TRAINER: ["dashboard.view", "people.view", "operations.view", "content.view", "content.manage", "planner.view", "classrooms.view", "classrooms.own.manage"],
  PART_TIME_TUTOR: ["dashboard.view", "people.view", "operations.view", "content.view", "content.manage", "planner.view", "classrooms.view", "classrooms.own.manage"],
  STUDENT: ["dashboard.view", "content.view", "planner.view", "exams.view", "exams.attempt"],
  PARENT: ["dashboard.view", "reports.view", "planner.view"],
  GUEST: ["dashboard.view", "guest.portal"],
  ADMIN: ["dashboard.view", "institution.manage", "people.view", "people.manage", "operations.view", "reports.view", "settings.view", "settings.manage", "finance.view", "finance.manage", "reception.view", "reception.manage", "staff.view", "staff.manage", "leave.view", "leave.manage", "director.view", "content.view", "content.manage", "academic.setup.manage", "courses.manage", "batches.manage", "planner.manage", "planner.view", "classrooms.view", "classrooms.manage", "admissions.view", "admissions.manage", "partners.view", "partners.manage", "exams.view", "exams.manage"],
  ACCOUNTS: ["dashboard.view", "reports.view", "finance.view", "finance.manage", "admissions.view", "partners.view"],
  RECEPTION: ["dashboard.view", "people.view", "reception.view", "reception.manage", "finance.view", "admissions.view"],
  BUSINESS_DEVELOPMENT_EXECUTIVE: ["dashboard.view", "people.view", "reports.view", "admissions.view", "admissions.manage", "partners.view"],
  VIDEO_EDITOR: ["dashboard.view", "content.view", "content.manage"]
};
