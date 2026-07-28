import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { approveParentInvitationAction } from "@/features/student-foundation/actions";
import { prisma } from "@/lib/db";

export default async function ParentInvitationsPage() {
  const session = await auth();
  const records = session?.user.id ? await prisma.userPreference.findMany({ where: { key: "learnx.parent-invitations" }, include: { user: { select: { id: true, name: true, email: true } } } }) : [];
  const invitations = records.flatMap((record) => (Array.isArray(record.value) ? record.value as Array<Record<string, unknown>> : []).filter((item) => item.parentId === session?.user.id).map((item) => ({ id: String(item.id), relation: String(item.relation ?? "Parent"), student: record.user })));
  return <div className="mx-auto max-w-3xl space-y-6"><div><Badge>LearnX family connection</Badge><h1 className="mt-3 text-3xl font-semibold">Parent invitations</h1><p className="mt-2 text-muted-foreground">Review invitations before connecting to a student.</p></div>{invitations.length ? invitations.map((invitation) => <Card className="flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center" key={String(invitation.id)}><div><p className="font-semibold">{invitation.student.name}</p><p className="text-sm text-muted-foreground">{invitation.student.email} · {String(invitation.relation)}</p></div><form action={approveParentInvitationAction}><input name="studentId" type="hidden" value={invitation.student.id}/><input name="invitationId" type="hidden" value={String(invitation.id)}/><Button>Approve connection</Button></form></Card>) : <Card className="p-8 text-center"><h2 className="font-semibold">No pending invitations</h2><p className="mt-2 text-sm text-muted-foreground">New student connection requests will appear here.</p></Card>}</div>;
}
