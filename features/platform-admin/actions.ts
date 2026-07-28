"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { writeAuditLog } from "@/lib/audit";
import { prisma } from "@/lib/db";

const value = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
async function admin() {
  const session = await auth();
  if (!session?.user.id || !session.user.roles.includes("ADMIN")) throw new Error("Platform administrator access is required.");
  return session;
}
function refresh() { revalidatePath("/admin/control", "layout"); }
async function audit(actorId: string, action: "CREATE"|"UPDATE"|"DELETE", entity: string, entityId: string, message: string) {
  await writeAuditLog({ actorId, action, entity, entityId, message });
}
export async function updateUserStatusAction(fd: FormData) {
  const session = await admin(); const ids = value(fd, "ids").split(",").filter(Boolean); const status = value(fd, "status") as "ACTIVE"|"SUSPENDED";
  if (!ids.length || !["ACTIVE","SUSPENDED"].includes(status)) return;
  await prisma.user.updateMany({ where: { id: { in: ids } }, data: { status } });
  await audit(session.user.id, "UPDATE", "User", ids.join(","), `${status === "ACTIVE" ? "Reactivated" : "Suspended"} ${ids.length} user(s)`); refresh();
}
export async function verifyUsersAction(fd: FormData) {
  const session = await admin(); const ids = value(fd, "ids").split(",").filter(Boolean); if (!ids.length) return;
  await prisma.user.updateMany({ where: { id: { in: ids } }, data: { emailVerifiedAt: new Date() } });
  await audit(session.user.id, "UPDATE", "User", ids.join(","), `Verified ${ids.length} user(s)`); refresh();
}
export async function assignRoleAction(fd: FormData) {
  const session = await admin(); const userId=value(fd,"userId"), roleId=value(fd,"roleId");
  await prisma.userRole.upsert({ where: { userId_roleId: { userId, roleId } }, create: { userId, roleId }, update: {} });
  await audit(session.user.id, "UPDATE", "UserRole", userId, "Assigned platform role"); refresh();
}
export async function createRoleAction(fd: FormData) {
  const session=await admin(); const key=value(fd,"key").toUpperCase().replace(/[^A-Z0-9_]/g,"_");
  const role=await prisma.role.create({ data:{ key, name:value(fd,"name"), description:value(fd,"description")||null } });
  await audit(session.user.id,"CREATE","Role",role.id,`Created role ${role.name}`); refresh();
}
export async function updateRolePermissionsAction(fd: FormData) {
  const session=await admin(); const roleId=value(fd,"roleId"); const permissionIds=fd.getAll("permissionIds").map(String);
  await prisma.$transaction([prisma.rolePermission.deleteMany({where:{roleId}}),prisma.rolePermission.createMany({data:permissionIds.map(permissionId=>({roleId,permissionId})),skipDuplicates:true})]);
  await audit(session.user.id,"UPDATE","Role",roleId,"Updated permission matrix"); refresh();
}
export async function moderateResourceAction(fd: FormData) {
  const session=await admin(); const ids=value(fd,"ids").split(",").filter(Boolean); const status=value(fd,"status") as never;
  await prisma.contentItem.updateMany({where:{id:{in:ids}},data:{status,publishedAt:status==="PUBLISHED"?new Date():undefined}});
  await audit(session.user.id,"UPDATE","ContentItem",ids.join(","),`Moderated ${ids.length} resource(s): ${status}`); refresh();
}
export async function moderateDiscussionAction(fd: FormData) {
  const session=await admin(); const ids=value(fd,"ids").split(",").filter(Boolean); const status=value(fd,"status") as never;
  await prisma.genericDiscussion.updateMany({where:{id:{in:ids}},data:{status,isLocked:status==="LOCKED"}});
  await audit(session.user.id,"UPDATE","GenericDiscussion",ids.join(","),`Moderated ${ids.length} discussion(s): ${status}`); refresh();
}
export async function savePlanAction(fd: FormData) {
  const session=await admin(); const id=value(fd,"id"); const data={name:value(fd,"name"),price:Number(value(fd,"price")||0),aiMonthlyCredits:Number(value(fd,"credits")||0),resourceLimit:Number(value(fd,"resourceLimit")||0),isActive:fd.get("isActive")==="on"};
  if(id) await prisma.subscriptionPlan.update({where:{id},data}); else await prisma.subscriptionPlan.create({data:{...data,key:value(fd,"key"),audience:value(fd,"audience") as never}});
  await audit(session.user.id,id?"UPDATE":"CREATE","SubscriptionPlan",id||value(fd,"key"),"Saved subscription plan"); refresh();
}
export async function savePlatformSettingAction(fd: FormData) {
  const session=await admin(); if(!session.user.institutionId) throw new Error("Administrator institution is required."); const key=`platform.${value(fd,"category")}`;
  await prisma.setting.upsert({where:{institutionId_key:{institutionId:session.user.institutionId,key}},create:{institutionId:session.user.institutionId,key,value:{value:value(fd,"setting")}},update:{value:{value:value(fd,"setting")}}});
  await audit(session.user.id,"UPDATE","Setting",key,`Updated ${key}`); refresh();
}
