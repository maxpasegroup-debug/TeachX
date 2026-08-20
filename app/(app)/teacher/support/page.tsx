import { LifeBuoy, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";

import { TeacherSupportForm } from "@/features/launch-intelligence/components/teacher-support-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export const metadata = {
  title: "Teacher Support | TeachX Guru"
};

const helpCards: Array<{ title: string; body: string; icon: LucideIcon }> = [
  { title: "Start simple", body: "Use Create Lesson, Create Worksheet, or Create Quiz from the teacher home before opening advanced tools.", icon: Sparkles },
  { title: "Save your work", body: "After generating AI content, save useful output to your Lesson Library or Resource Library.", icon: MessageSquareText },
  { title: "Stay safe", body: "Avoid unnecessary student personal data in AI prompts and review every output before sharing.", icon: ShieldCheck }
];

export default function TeacherSupportPage() {
  return (
    <section className="space-y-6">
      <Card className="bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 shadow-soft">
        <Badge>Teacher help</Badge>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-5xl">Get unstuck fast.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">Send a support request, report a bug, or ask the launch team what to do next. Your request goes into the admin support queue.</p>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <LifeBuoy className="h-5 w-5 text-sky-700" />
            <h2 className="text-xl font-semibold">Contact support</h2>
          </div>
          <TeacherSupportForm />
        </Card>

        <div className="grid gap-4">
          {helpCards.map(({ title, body, icon: Icon }) => {
            return (
              <Card className="p-5" key={title}>
                <Icon className="h-5 w-5 text-sky-700" />
                <h2 className="mt-4 font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
