import { notFound } from "next/navigation";
import { CircleHelp, LifeBuoy, MessageSquareText, Send } from "lucide-react";

import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Textarea } from "@/components/ui/textarea";
import { TeacherSupportForm } from "@/features/launch-intelligence/components/teacher-support-form";
import { replyToTeacherSupportAction } from "@/features/teacher-settings/actions";
import { TeacherFeedbackForm } from "@/features/teacher-settings/components/teacher-feedback-form";
import { TeacherHelpCenter } from "@/features/teacher-settings/components/teacher-help-center";
import { formatDateTime, sentenceCase } from "@/lib/format";
import { getTeacherSupportData } from "@/services/teacher-support-service";

export const metadata = { title: "Teacher Help & Support | TeachX Guru" };

export default async function TeacherSupportPage() {
  const session=await auth();
  const data=await getTeacherSupportData(session?.user.id,session?.user.institutionId);
  if(!data) notFound();
  return <div className="space-y-6">
    <section className="border bg-sky-50 p-5 sm:p-7"><Badge>Teacher support</Badge><h1 className="mt-4 text-3xl font-semibold sm:text-4xl">Help & Support</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Search teacher guidance, report a problem, track requests, reply to support, or share feedback.</p></section>
    <nav aria-label="Help and support sections" className="flex gap-2 overflow-x-auto pb-2">{[["Help Center","help"],["Contact Support","contact"],["My Requests","requests"],["Feedback","feedback"]].map(([label,id])=><a className="min-h-11 shrink-0 rounded-md border bg-surface px-4 py-3 text-sm font-medium" href={`#${id}`} key={id}>{label}</a>)}</nav>

    <section className="space-y-4 scroll-mt-24"><div className="flex items-center gap-2"><CircleHelp className="h-5 w-5 text-sky-700"/><h2 className="text-2xl font-semibold">Help Center</h2></div><TeacherHelpCenter/></section>

    <section className="scroll-mt-24" id="contact"><Card className="p-5"><div className="flex items-center gap-3"><LifeBuoy className="h-5 w-5 text-sky-700"/><div><h2 className="text-xl font-semibold">Contact support or report a problem</h2><p className="mt-1 text-sm text-muted-foreground">Choose the closest category so the existing support queue can route your request.</p></div></div><TeacherSupportForm/></Card></section>

    <section className="scroll-mt-24 space-y-4" id="requests"><div className="flex items-center gap-2"><MessageSquareText className="h-5 w-5 text-sky-700"/><h2 className="text-2xl font-semibold">My Requests</h2></div>{data.tickets.length?<div className="space-y-3">{data.tickets.map((ticket)=>{const metadata=record(ticket.metadata);return <Card className="p-5" key={ticket.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2"><Badge>{sentenceCase(ticket.type)}</Badge><Badge>{sentenceCase(ticket.status)}</Badge>{metadata.category?<Badge>{String(metadata.category)}</Badge>:null}</div><h3 className="mt-3 font-semibold">{ticket.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{ticket.body}</p></div><div className="text-right text-xs text-muted-foreground"><p>{sentenceCase(ticket.priority)} priority</p><p className="mt-1">Updated {formatDateTime(ticket.updatedAt)}</p></div></div>{ticket.replies.length?<div className="mt-4 space-y-2 border-t pt-4">{ticket.replies.map((reply)=><div className={`p-3 text-sm ${reply.authorId===session?.user.id?"bg-sky-50":"bg-muted"}`} key={reply.id}><div className="flex justify-between gap-3"><strong>{reply.authorId===session?.user.id?"You":reply.author?.name??"TeachX Support"}</strong><time className="text-xs text-muted-foreground">{formatDateTime(reply.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{reply.body}</p></div>)}</div>:null}{!["CLOSED","ARCHIVED"].includes(ticket.status)?<form action={replyToTeacherSupportAction} className="mt-4 grid gap-3 border-t pt-4"><input name="ticketId" type="hidden" value={ticket.id}/><Textarea aria-label={`Reply to ${ticket.subject}`} maxLength={3000} name="body" placeholder="Add a reply" required/><Button className="w-fit" type="submit" variant="secondary"><Send className="mr-2 h-4 w-4"/>Send reply</Button></form>:null}</Card>})}</div>:<EmptyState icon={<LifeBuoy className="h-5 w-5"/>} title="No support requests yet" description="Your submitted support, bug, payment, marketplace, and account requests will appear here."/>}</section>

    <section className="scroll-mt-24" id="feedback"><Card className="p-5"><h2 className="text-xl font-semibold">Feedback</h2><p className="mt-2 text-sm text-muted-foreground">Rate your experience, tell us what was confusing, and suggest one improvement.</p><div className="mt-5"><TeacherFeedbackForm/></div></Card></section>
  </div>;
}

function record(value:unknown){return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};}
