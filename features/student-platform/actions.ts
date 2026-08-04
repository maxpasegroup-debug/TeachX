"use server";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
async function student() { const session = await auth(); if (!session?.user.id || !session.user.institutionId || !session.user.roles.some((role) => role === "STUDENT")) throw new Error("Student access is required."); return session; }
function refresh() { ["/student/notifications", "/student/timeline", "/student/files"].forEach((path) => revalidatePath(path)); }
export async function setStudentNotificationStateAction(formData: FormData) { const session = await student(); const id = String(formData.get("id") ?? ""); const state = String(formData.get("state") ?? "READ"); if (!id || !["READ", "ARCHIVED"].includes(state)) return; await prisma.notification.updateMany({ where: { id, userId: session.user.id }, data: state === "READ" ? { status: "READ", readAt: new Date() } : { status: "ARCHIVED" } }); refresh(); }