import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Bookmark, CalendarDays, Clock, Filter, GraduationCap, Languages, MapPin, MessageCircle, Search, Share2, Star, UsersRound, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { favoriteTeacherAction, createTeacherBookingRequestAction, updateTeacherMarketplaceProfileAction } from "@/features/marketplace/actions";
import type { MarketplaceTeacher, getMarketplaceFacets, getMarketplaceTeacher, getTeacherMarketplaceDashboard, getStudentMarketplaceDashboard } from "@/services/marketplace-service";
import { getInitials } from "@/lib/utils";

export function MarketplaceHome({ teachers, facets }: { teachers: MarketplaceTeacher[]; facets: Awaited<ReturnType<typeof getMarketplaceFacets>> }) {
  const featured = teachers.slice(0, 6);
  const online = teachers.filter((teacher) => teacher.teachingMode === "Online" || teacher.teachingMode === "Hybrid").slice(0, 6);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>TeachX Marketplace</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Find the right teacher for every learning goal.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">A premium education talent platform for learning, teaching, and earning. No payments or live video yet.</p>
          </div>
          <MarketplaceSearch facets={facets} />
        </div>
      </section>

      <TeacherSection title="Featured Teachers" teachers={featured} />
      <SubjectCloud title="Popular Subjects" items={facets.subjects} />
      <TeacherSection title="Top Rated" teachers={teachers.slice(0, 4)} placeholder="Ratings arrive in a later phase." />
      <TeacherSection title="Recently Joined" teachers={teachers.slice(-6).reverse()} />
      <TeacherSection title="Online Teachers" teachers={online} />
      <SubjectCloud title="Nearby Teachers" items={facets.locations.length ? facets.locations : ["Nearby teacher discovery placeholder"]} />
    </div>
  );
}

function MarketplaceSearch({ facets }: { facets: Awaited<ReturnType<typeof getMarketplaceFacets>> }) {
  return (
    <form className="rounded-2xl border border-border bg-surface p-4 shadow-sm" action="/marketplace">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="min-w-0 flex-1 bg-transparent outline-none" name="q" placeholder="Search subject, teacher, city" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select name="subject"><option value="">Subject</option>{facets.subjects.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="mode"><option value="">Teaching Mode</option><option>Online</option><option>Offline</option><option>Hybrid</option></Select>
        <Select name="language"><option value="">Language</option>{facets.languages.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="board"><option value="">Board</option>{facets.boards.map((item) => <option key={item}>{item}</option>)}</Select>
      </div>
      <Button className="mt-3 w-full" type="submit"><Filter className="mr-2 h-4 w-4" />Apply Filters</Button>
    </form>
  );
}

function TeacherSection({ title, teachers, placeholder }: { title: string; teachers: MarketplaceTeacher[]; placeholder?: string }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">{title}</h2>
      {teachers.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{teachers.map((teacher) => <TeacherCard teacher={teacher} key={teacher.id} />)}</div> : <EmptyState icon={<UsersRound className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description={placeholder ?? "Teachers will appear here after they publish marketplace profiles."} />}
    </section>
  );
}

function SubjectCloud({ title, items }: { title: string; items: string[] }) {
  return <section><h2 className="mb-4 text-2xl font-semibold">{title}</h2><div className="flex flex-wrap gap-2">{items.length ? items.slice(0, 16).map((item) => <span className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800" key={item}>{item}</span>) : <span className="text-muted-foreground">Subjects will appear here.</span>}</div></section>;
}

export function TeacherCard({ teacher }: { teacher: MarketplaceTeacher }) {
  const name = teacher.user.name;
  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="h-24 bg-gradient-to-br from-sky-100 to-blue-100" />
      <div className="p-5">
        <div className="-mt-14 flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-surface bg-sky-600 text-xl font-semibold text-white">{getInitials(name)}</div>
        <div className="mt-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{teacher.qualification ?? teacher.headline ?? "TeachX Teacher"}</p>
          </div>
          <Badge>{teacher.teachingMode ?? "Hybrid"}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">{teacher.subjects.slice(0, 4).map((subject) => <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium" key={subject}>{subject}</span>)}</div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
          <p><Star className="mr-1 inline h-4 w-4 text-sky-700" />New</p>
          <p><Clock className="mr-1 inline h-4 w-4 text-sky-700" />Fast</p>
          <p><MapPin className="mr-1 inline h-4 w-4 text-sky-700" />{teacher.location ?? "Remote"}</p>
        </div>
        <div className="mt-5 flex gap-2">
          <Link className="flex-1 rounded-xl bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground" href={`/marketplace/teachers/${teacher.id}`}>View Profile</Link>
          <form action={favoriteTeacherAction}>
            <input name="teacherProfileId" type="hidden" value={teacher.id} />
            <input name="title" type="hidden" value={name} />
            <button aria-label={`Save ${name}`} className="rounded-xl border border-border px-3 py-2" type="submit"><Bookmark className="h-4 w-4" /></button>
          </form>
        </div>
      </div>
    </Card>
  );
}

export function PublicTeacherProfile({ teacher }: { teacher: NonNullable<Awaited<ReturnType<typeof getMarketplaceTeacher>>> }) {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
        <div className="h-48 bg-gradient-to-br from-sky-100 via-white to-blue-100" />
        <div className="p-6 sm:p-8">
          <div className="-mt-24 flex h-32 w-32 items-center justify-center rounded-[2rem] border-4 border-surface bg-sky-600 text-3xl font-semibold text-white">{getInitials(teacher.user.name)}</div>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{teacher.user.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{teacher.qualification ?? teacher.headline}</p>
              <div className="mt-5 flex flex-wrap gap-2">{[...teacher.subjects, ...teacher.classes, ...teacher.boards].slice(0, 12).map((item) => <span className="rounded-full bg-muted px-3 py-1 text-sm" key={item}>{item}</span>)}</div>
            </div>
            <Card className="p-5 shadow-sm">
              <p className="font-semibold">Pricing</p>
              <p className="mt-3 text-sm text-muted-foreground">Hourly: {teacher.hourlyRate ? `INR ${teacher.hourlyRate}` : "Available on request"}</p>
              <p className="text-sm text-muted-foreground">Weekly: {teacher.weeklyRate ? `INR ${teacher.weeklyRate}` : "Available on request"}</p>
              <p className="text-sm text-muted-foreground">Monthly: {teacher.monthlyRate ? `INR ${teacher.monthlyRate}` : "Available on request"}</p>
            </Card>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Info title="About" text={teacher.bio ?? "This teacher is preparing a detailed TeachX profile."} />
          <Info title="Teaching Style" text={teacher.teachingStyle ?? "Personalized, structured, and progress-focused."} />
          <div className="grid gap-4 md:grid-cols-2">
            <Meta icon={Languages} title="Languages" items={teacher.languages} />
            <Meta icon={Video} title="Teaching Mode" items={[teacher.teachingMode ?? "Hybrid"]} />
            <Meta icon={Star} title="Achievements" items={teacher.achievements} />
            <Meta icon={GraduationCap} title="Certificates" items={teacher.certificates} />
          </div>
          <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">Ratings & Reviews</h2><p className="mt-3 text-muted-foreground">Ratings, reviews, and response time placeholders are ready for a later phase.</p></Card>
        </div>
        <BookingRequestCard teacher={teacher} />
      </section>
    </div>
  );
}

function Info({ title, text }: { title: string; text: string }) {
  return <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">{title}</h2><p className="mt-3 leading-7 text-muted-foreground">{text}</p></Card>;
}

function Meta({ icon: Icon, title, items }: { icon: LucideIcon; title: string; items: string[] }) {
  return <Card className="p-5 shadow-soft"><Icon className="h-5 w-5 text-sky-700" /><h2 className="mt-4 font-semibold">{title}</h2><div className="mt-3 flex flex-wrap gap-2">{items.length ? items.map((item) => <span className="rounded-full bg-muted px-3 py-1 text-xs" key={item}>{item}</span>) : <span className="text-sm text-muted-foreground">Not added yet</span>}</div></Card>;
}

function BookingRequestCard({ teacher }: { teacher: NonNullable<Awaited<ReturnType<typeof getMarketplaceTeacher>>> }) {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">Book Teacher</h2>
      <p className="mt-2 text-sm text-muted-foreground">No payment is collected. This saves a request for the teacher.</p>
      <form action={createTeacherBookingRequestAction} className="mt-5 space-y-4">
        <input name="teacherProfileId" type="hidden" value={teacher.id} />
        <Input name="preferredDate" type="date" />
        <Input name="preferredTime" placeholder="Preferred time" />
        <Input name="subject" placeholder="Subject" defaultValue={teacher.subjects[0] ?? ""} />
        <Input name="className" placeholder="Class" />
        <Textarea name="learningGoal" placeholder="Learning goal" />
        <Textarea name="message" placeholder="Message" />
        <Button className="w-full" type="submit"><CalendarDays className="mr-2 h-4 w-4" />Request Class</Button>
      </form>
      <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
        <p><MessageCircle className="mr-2 inline h-4 w-4" />Messaging placeholder</p>
        <p><Share2 className="mr-2 inline h-4 w-4" />Share profile architecture</p>
      </div>
    </Card>
  );
}

export function TeacherMarketplaceEditor({ data }: { data: Awaited<ReturnType<typeof getTeacherMarketplaceDashboard>> }) {
  const profile = data.profile;
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Teacher Marketplace</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Build your professional teaching profile.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Create your profile, manage requests, and prepare your teaching business. Payments and live video come later.</p>
      </section>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Profile Views" value={data.profileViews.toString()} />
        <Stat label="Saved By Students" value={data.savedByStudents.toString()} />
        <Stat label="Teaching Requests" value={data.requests.length.toString()} />
        <Stat label="Acceptance Rate" value="Placeholder" />
      </section>
      <Card className="p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Profile Editor</h2>
        <form action={updateTeacherMarketplaceProfileAction} className="mt-6 grid gap-5 md:grid-cols-2">
          <Input name="headline" placeholder="Headline" defaultValue={profile?.headline ?? ""} />
          <Input name="qualification" placeholder="Qualification" defaultValue={profile?.qualification ?? ""} />
          <Input name="experienceYears" placeholder="Experience years" defaultValue={profile?.experienceYears?.toString() ?? ""} />
          <Input name="subjects" placeholder="Subjects, comma separated" defaultValue={profile?.subjects.join(", ") ?? ""} />
          <Input name="classes" placeholder="Classes, comma separated" defaultValue={profile?.classes.join(", ") ?? ""} />
          <Input name="boards" placeholder="Boards, comma separated" defaultValue={profile?.boards.join(", ") ?? ""} />
          <Input name="languages" placeholder="Languages, comma separated" defaultValue={profile?.languages.join(", ") ?? ""} />
          <Select name="teachingMode" defaultValue={profile?.teachingMode ?? "Hybrid"}><option>Online</option><option>Offline</option><option>Hybrid</option></Select>
          <Input name="hourlyRate" placeholder="Hourly Rate" defaultValue={profile?.hourlyRate?.toString() ?? ""} />
          <Input name="weeklyRate" placeholder="Weekly Rate" defaultValue={profile?.weeklyRate?.toString() ?? ""} />
          <Input name="monthlyRate" placeholder="Monthly Rate" defaultValue={profile?.monthlyRate?.toString() ?? ""} />
          <Input name="location" placeholder="Location" defaultValue={profile?.location ?? ""} />
          <Textarea name="availability" placeholder="Availability" />
          <Textarea name="teachingStyle" placeholder="Teaching style" defaultValue={profile?.teachingStyle ?? ""} />
          <Input name="certificates" placeholder="Certificates, comma separated" defaultValue={profile?.certificates.join(", ") ?? ""} />
          <Input name="achievements" placeholder="Achievements, comma separated" defaultValue={profile?.achievements.join(", ") ?? ""} />
          <Textarea className="md:col-span-2" name="bio" placeholder="About / Bio" defaultValue={profile?.bio ?? ""} />
          <label className="flex items-center gap-3 md:col-span-2"><input name="isMarketplaceListed" type="checkbox" defaultChecked={profile?.isMarketplaceListed ?? false} /> Publish in marketplace</label>
          <Button className="md:col-span-2" type="submit">Save Profile</Button>
        </form>
      </Card>
      <RequestList title="Booking Requests" requests={data.requests} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return <Card className="p-5 shadow-soft"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></Card>;
}

function RequestList({ title, requests }: { title: string; requests: { id: string; studentName: string; subject: string; status: string; message: string | null }[] }) {
  return <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{requests.length ? requests.map((request) => <div className="rounded-xl border border-border bg-background p-4" key={request.id}><p className="font-semibold">{request.studentName} • {request.subject}</p><p className="mt-1 text-sm text-muted-foreground">{request.message ?? "No message"} • {request.status}</p></div>) : <EmptyState icon={<CalendarDays className="h-5 w-5" />} title="No requests yet" description="Student booking requests will appear here." />}</div></Card>;
}

export function StudentMarketplaceDashboard({ data }: { data: Awaited<ReturnType<typeof getStudentMarketplaceDashboard>> }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>My Teachers</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Saved teachers and requests.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Track favorite teachers, recent profiles, class requests, and upcoming session placeholders.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-3">
        <SimpleList title="Saved Teachers" items={data.savedTeachers.map((item) => item.title)} />
        <SimpleList title="Recent Teachers" items={data.recentTeachers.map((item) => item.title)} />
        <SimpleList title="My Requests" items={data.requests.map((item) => `${item.subject} • ${item.status}`)} />
      </div>
      <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">Upcoming Sessions</h2><p className="mt-3 text-muted-foreground">Placeholder for scheduled sessions. Live video belongs to a later phase.</p></Card>
    </div>
  );
}

function SimpleList({ title, items }: { title: string; items: string[] }) {
  return <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.length ? items.map((item) => <p className="rounded-xl border border-border bg-background px-4 py-3 text-sm" key={item}>{item}</p>) : <EmptyState icon={<Bookmark className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Your marketplace activity will appear here." />}</div></Card>;
}
