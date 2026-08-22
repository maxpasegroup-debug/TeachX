import type { Prisma } from "@prisma/client";

type ClassroomScope = { userId: string; institutionId: string; classroomId: string };
type RosterScope = { institutionId: string; batchId: string; studentId: string };

export function ownedPersonalClassroomWhere(input: ClassroomScope): Prisma.ClassroomWhereInput;
export function invitedRosterStudentWhere(input: RosterScope): Prisma.UserWhereInput;
export function rosterEnrollmentWhere(input: RosterScope): Prisma.BatchStudentWhereInput;
