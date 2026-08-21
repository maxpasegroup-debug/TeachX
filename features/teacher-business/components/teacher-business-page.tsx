"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import {
  BarChart3, BookOpen, BriefcaseBusiness, CheckCircle2, CircleDollarSign, Download,
  ExternalLink, FileText, GraduationCap, Home, Lightbulb, Package, PenLine, Plus, Search, Sparkles, Star, Store, Upload,
  UserRound, WalletCards
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { changeSubscriptionAction } from "@/features/commerce/actions";
import {
  deleteBusinessResourceAction, deletePortfolioItemAction, saveBusinessProfileAction,
  saveMarketplaceProductAction, saveOneToOneTeachingAction, savePortfolioItemAction, setBusinessResourceStatusAction, submitHappyNotesAction,
  setSubscriptionRenewalAction
} from "@/features/teacher-business/actions";
import type { getTeacherBusinessData, TeacherBusinessModule } from "@/services/teacher-business-service";
import { ProfilePhotoUpload } from "@/features/teacher-business/components/profile-photo-upload";

type Data = NonNullable<Awaited<ReturnType<typeof getTeacherBusinessData>>>;
type Resource = Data["resources"][number];

const modules: { slug: TeacherBusinessModule; label: string; icon: typeof Home }[] = [
  { slug: "home", label: "Business Home", icon: Home },
  { slug: "one-to-one", label: "Teach 1:1", icon: GraduationCap },
  { slug: "profile", label: "Profile", icon: UserRound },
  { slug: "portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { slug: "publishing", label: "Publishing", icon: Upload },
  { slug: "happy-notes", label: "Happy Notes", icon: PenLine },
  { slug: "marketplace", label: "Products", icon: Store },
  { slug: "orders", label: "Orders", icon: FileText },
  { slug: "earnings", label: "Earnings", icon: CircleDollarSign },
  { slug: "wallet", label: "Wallet", icon: WalletCards },
  { slug: "payouts", label: "Payouts", icon: CheckCircle2 },
  { slug: "analytics", label: "Analytics", icon: BarChart3 },
  { slug: "subscription", label: "Subscription", icon: Star },
  { slug: "downloads", label: "Purchases", icon: Download },
  { slug: "opportunities", label: "Future Opportunities", icon: Lightbulb }
];

const descriptions: Record<TeacherBusinessModule, string> = {
  home: "Your professional profile, publishing, sales, and wallet evidence in one concise view.",
  "one-to-one": "Complete one simple professional teaching profile, set your real availability and pricing, then activate it for discovery.",
  profile: "Maintain the professional profile shared with the teacher network and marketplace.",
  portfolio: "Present selected teaching work, achievements, qualifications, and published resources.",
  publishing: "Move existing Resource Studio work through draft, publication, and marketplace availability.",
  "happy-notes": "Prepare constructive knowledge for the existing Happy Notes platform through a clear TeachX handoff boundary.",
  marketplace: "Manage canonical product pricing, delivery status, reviews, and marketplace presence.",
  orders: "Review seller-owned order evidence without exposing private buyer contact details.",
  earnings: "Read completed and pending earnings from the shared wallet ledger.",
  wallet: "Inspect balances and immutable transaction evidence across supported currencies.",
  payouts: "Review settlement readiness and payout history when a verified provider is available.",
  analytics: "Use recorded profile, resource, order, and network signals to understand growth.",
  subscription: "Manage the existing teacher subscription, AI entitlement, usage, and billing records.",
  downloads: "Access resources purchased through the shared commerce and entitlement system.",
  opportunities: "A truthful readiness area for future verified teacher opportunities."
};

function money(value: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(value);
}
function when(value?: string | null) { return value ? new Date(value).toLocaleString() : "Not available"; }
function downloadCsv(name: string, rows: (string | number)[][]) {
  const body = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a"); link.href = url; link.download = `${name}.csv`; link.click(); URL.revokeObjectURL(url);
}
function ActionLink({ href, children, primary = false }: { href: string; children: React.ReactNode; primary?: boolean }) {
  return <Link className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium ${primary ? "bg-primary text-primary-foreground" : "border bg-surface"}`} href={href}>{children}</Link>;
}
function Submit({ children, danger = false }: { children: React.ReactNode; danger?: boolean }) {
  return <button className={`min-h-10 rounded-md border px-3 text-sm font-medium ${danger ? "text-red-700" : ""}`} type="submit">{children}</button>;
}
function Metric({ label, value, detail }: { label: string; value: React.ReactNode; detail?: string }) {
  return <div className="border-l-2 border-sky-600 bg-surface px-4 py-3"><p className="text-xs font-medium uppercase text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p>{detail ? <p className="mt-1 text-xs text-muted-foreground">{detail}</p> : null}</div>;
}
function EmptyAction({ icon, title, description, action, href }: { icon: React.ReactNode; title: string; description: string; action: string; href: string }) {
  return <div><EmptyState description={description} icon={icon} title={title} /><div className="mt-3 text-center"><ActionLink href={href}>{action}</ActionLink></div></div>;
}

function BusinessHome({ data }: { data: Data }) {
  const h = data.home;
  return <div className="space-y-6">
    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Metric detail={data.profile.public ? "Publicly visible" : "Private"} label="Profile" value={`${h.profileCompletion}%`} />
      <Metric label="Published resources" value={h.publishedResources} />
      <Metric label="Marketplace products" value={h.marketplaceProducts} />
      <Metric label="Seller orders" value={h.orders} />
      <Metric label="Available earnings" value={money(data.earnings.available, data.earnings.currency)} />
      <Metric label="Pending balance" value={money(data.earnings.pending, data.earnings.currency)} />
      <Metric label="Profile views" value={h.profileViews} />
      <Metric label="Resource views" value={h.resourceViews} />
    </section>
    <section className="flex flex-wrap gap-2">
      <ActionLink href="/teacher/business/profile" primary><UserRound className="h-4 w-4" />Complete Profile</ActionLink>
      <ActionLink href="/teacher/business/one-to-one"><GraduationCap className="h-4 w-4" />Teach 1:1</ActionLink>
      <ActionLink href="/teacher/resources"><Plus className="h-4 w-4" />Create Resource</ActionLink>
      <ActionLink href="/teacher/business/publishing"><Upload className="h-4 w-4" />Publishing Center</ActionLink>
      <ActionLink href="/teacher/business/happy-notes"><PenLine className="h-4 w-4" />Publish Knowledge</ActionLink>
      <ActionLink href="/teacher/business/orders"><FileText className="h-4 w-4" />View Orders</ActionLink>
    </section>
    <section className="grid gap-5 lg:grid-cols-2">
      <Card className="p-5"><h2 className="font-semibold">Recent business activity</h2><div className="mt-3 space-y-3">{h.recentActivity.length ? h.recentActivity.map((item) => <Link className="block border-b pb-3 text-sm" href={item.link || "/teacher/business/home"} key={item.id}><b>{item.title}</b><span className="block text-xs text-muted-foreground">{when(item.createdAt)}</span></Link>) : <p className="text-sm text-muted-foreground">No business activity has been recorded yet.</p>}</div></Card>
      <Card className="p-5"><h2 className="font-semibold">Business path</h2><div className="mt-3 grid gap-2 text-sm">{[["Profile and portfolio","/teacher/business/profile"],["Create in Resource Studio","/teacher/resources"],["Publish and prepare","/teacher/business/publishing"],["Sell in Marketplace","/teacher/business/marketplace"],["Order to wallet evidence","/teacher/business/orders"],["Settlement readiness","/teacher/business/payouts"]].map(([label, href], index) => <Link className="flex min-h-10 items-center justify-between border-b" href={href} key={label}><span>{index + 1}. {label}</span><ExternalLink className="h-4 w-4" /></Link>)}</div></Card>
    </section>
  </div>;
}

function Profile({ data }: { data: Data }) {
  const p = data.profile;
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
    <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Professional profile</h2><p className="text-sm text-muted-foreground">{p.completion}% complete</p></div><Link className="text-sm font-semibold text-sky-700" href="/teacher/ai-studio/chat"><Sparkles className="mr-1 inline h-4 w-4" />Improve with AI</Link></div>
      <form action={saveBusinessProfileAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Profile photo"><ProfilePhotoUpload /><Input defaultValue={p.avatarUrl ?? ""} name="avatarUrl" type="hidden" /></Field>
        <Field label="Cover URL"><Input defaultValue={p.banner ?? ""} name="coverUrl" type="url" /></Field>
        <Field label="Professional headline"><Input defaultValue={p.headline ?? ""} maxLength={180} name="headline" /></Field>
        <Field label="Experience years"><Input defaultValue={p.experienceYears ?? ""} max="80" min="0" name="experienceYears" type="number" /></Field>
        <Field label="Qualification"><Input defaultValue={p.qualification ?? ""} maxLength={180} name="qualification" /></Field>
        <Field label="Certifications"><Input defaultValue={p.certifications.join(", ")} name="certifications" /></Field>
        <Field label="Achievements"><Input defaultValue={p.achievements.join(", ")} name="achievements" /></Field>
        <Field label="Teaching expertise"><Input defaultValue={p.skills.join(", ")} name="skills" /></Field>
        <Field label="Professional interests"><Input defaultValue={p.interests.join(", ")} name="interests" /></Field>
        <Field label="Subjects"><Input defaultValue={p.subjects.join(", ")} name="subjects" /></Field>
        <Field label="Grades"><Input defaultValue={p.grades.join(", ")} name="grades" /></Field>
        <Field label="Boards"><Input defaultValue={p.boards.join(", ")} name="boards" /></Field>
        <Field label="Languages"><Input defaultValue={p.languages.join(", ")} name="languages" /></Field>
        <Field label="Teaching mode"><Select defaultValue={p.teachingMode ?? ""} name="teachingMode"><option value="">Select</option><option>Online</option><option>Offline</option><option>Hybrid</option></Select></Field>
        <Field label="Location"><Input defaultValue={p.location ?? ""} maxLength={180} name="location" /></Field>
        <Field label="Website"><Input defaultValue={p.website} name="website" type="url" /></Field>
        <Field className="md:col-span-2" label="Bio"><Textarea defaultValue={p.bio ?? ""} maxLength={4000} name="bio" /></Field>
        <Field className="md:col-span-2" label="Teaching style"><Textarea defaultValue={p.teachingStyle ?? ""} maxLength={1000} name="teachingStyle" /></Field>
        <Field className="md:col-span-2" label="Availability"><Textarea defaultValue={p.availability} maxLength={1000} name="availability" /></Field>
        <Field className="md:col-span-2" label="Contact preferences"><Input defaultValue={p.contactPreferences} maxLength={500} name="contactPreferences" /></Field>
        <label className="flex min-h-11 items-center gap-2 text-sm"><input defaultChecked={p.public} name="public" type="checkbox" />Show my professional profile publicly</label>
        <Button type="submit">Save Profile</Button>
      </form>
    </Card>
    <aside className="space-y-4"><Card className="p-5"><h2 className="font-semibold">Profile visibility</h2><p className="mt-2 text-sm text-muted-foreground">{p.public ? "Visible in the professional teacher marketplace." : "Private until you enable public visibility."}</p><ActionLink href="/teacher/business/profile-preview"><ExternalLink className="h-4 w-4" />Preview Profile</ActionLink></Card><Card className="p-5"><h2 className="font-semibold">Professional network</h2><p className="mt-2 text-sm text-muted-foreground">Your public profile is reused by Community teacher discovery.</p><ActionLink href="/teacher/community/network">Open Teacher Network</ActionLink></Card></aside>
  </div>;
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <div className={className}><Label>{label}</Label>{children}</div>;
}

const teachingFormats = ["Online", "In person", "Hybrid", "Small group"];
const happyNotesCategories = ["Education", "Personal Growth", "Health", "Wealth", "Happiness", "Leadership", "Career", "Psychology", "Productivity", "Life Skills"];

function OneToOne({ data }: { data: Data }) {
  const p = data.profile;
  const active = p.oneToOneStatus === "one-to-one-active";
  return <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
    <Card className="p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Professional teaching profile</h2><p className="mt-1 text-sm text-muted-foreground">Save a draft at any time. Activation only succeeds when every essential detail is present.</p></div><Badge>{active ? "ACTIVE" : "DRAFT"}</Badge></div>
      <form action={saveOneToOneTeachingAction} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field className="md:col-span-2" label="1. Profile photo"><div className="grid gap-3 sm:grid-cols-[80px_1fr]">{p.avatarUrl ? <Image alt="Current profile" className="h-20 w-20 border object-cover" height={80} src={p.avatarUrl} unoptimized width={80} /> : <div className="flex h-20 w-20 items-center justify-center border text-xs text-muted-foreground">No photo</div>}<ProfilePhotoUpload /></div></Field>
        <Field label="2. Qualification"><Input defaultValue={p.qualification ?? ""} maxLength={180} name="qualification" required /></Field>
        <Field label="3. Experience in years"><Input defaultValue={p.experienceYears ?? ""} max="80" min="0" name="experienceYears" type="number" required /></Field>
        <Field label="4. Expertise"><Input defaultValue={p.skills.join(", ")} name="skills" placeholder="Primary teaching strengths" /></Field>
        <Field label="Subjects"><Input defaultValue={p.subjects.join(", ")} name="subjects" placeholder="Mathematics, Science" /></Field>
        <Field label="5. Teaching levels"><Input defaultValue={p.grades.join(", ")} name="classes" placeholder="Grade 6, Grade 7" required /></Field>
        <Field label="6. Languages"><Input defaultValue={p.languages.join(", ")} name="languages" placeholder="English, Hindi" required /></Field>
        <fieldset className="md:col-span-2"><legend className="text-sm font-medium">7. Teaching format</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{teachingFormats.map((format) => <label className="flex min-h-11 items-center gap-3 border px-3 text-sm" key={format}><input defaultChecked={p.teachingFormats.includes(format)} name="teachingFormats" type="checkbox" value={format} />{format}</label>)}</div></fieldset>
        <Field className="md:col-span-2" label="8. Availability"><Textarea defaultValue={p.availability} maxLength={1000} name="availability" placeholder="Days, times and time zone" required /></Field>
        <Field label="9. Pricing currency"><Select defaultValue={p.pricingCurrency} name="pricingCurrency">{["INR", "AED", "SAR", "QAR", "OMR"].map((currency) => <option key={currency}>{currency}</option>)}</Select></Field>
        <div className="grid grid-cols-3 gap-2"><Field label="Hourly"><Input defaultValue={p.hourlyRate || ""} min="0" name="hourlyRate" step="0.01" type="number" /></Field><Field label="Weekly"><Input defaultValue={p.weeklyRate || ""} min="0" name="weeklyRate" step="0.01" type="number" /></Field><Field label="Monthly"><Input defaultValue={p.monthlyRate || ""} min="0" name="monthlyRate" step="0.01" type="number" /></Field></div>
        <Field className="md:col-span-2" label="Custom pricing"><Input defaultValue={p.customPricing} maxLength={500} name="customPricing" placeholder="Optional package or custom pricing terms" /></Field>
        <div className="flex flex-wrap gap-2 md:col-span-2"><Button name="intent" type="submit" value="draft" variant="secondary">Save Draft</Button><Button name="intent" type="submit" value="activate">Submit and Activate</Button><ActionLink href="/teacher/business/profile-preview">Preview Profile</ActionLink></div>
      </form>
    </Card>
    <aside className="space-y-4"><Card className="p-5"><h2 className="font-semibold">Preview</h2><p className="mt-2 text-lg font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">{p.qualification || "Qualification not added"}</p><p className="mt-3 text-sm">{[...p.subjects, ...p.skills].join(", ") || "Expertise not added"}</p><p className="mt-3 text-sm">{p.languages.join(", ") || "Languages not added"}</p><p className="mt-3 font-semibold">{p.hourlyRate ? `${money(p.hourlyRate, p.pricingCurrency)} / hour` : "Hourly price not set"}</p></Card><Card className="p-5"><h2 className="font-semibold">Discovery and booking</h2><p className="mt-2 text-sm text-muted-foreground">Activation reuses your existing professional marketplace profile and the canonical teacher booking-request workflow.</p></Card></aside>
  </div>;
}

function HappyNotes({ data }: { data: Data }) {
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"><Card className="p-5"><h2 className="text-xl font-semibold">Submit constructive knowledge</h2><p className="mt-2 text-sm text-muted-foreground">TeachX securely prepares your submission for the Happy Notes integration boundary. External publication is not claimed until that platform accepts it.</p><form action={submitHappyNotesAction} className="mt-5 space-y-4"><Field label="Category"><Select name="category" required><option value="">Choose a category</option>{happyNotesCategories.map((category) => <option key={category}>{category}</option>)}</Select></Field><Field label="Title"><Input maxLength={180} name="title" required /></Field><Field label="Content"><Textarea className="min-h-64" maxLength={20000} minLength={50} name="content" required /></Field><Button type="submit">Submit to Happy Notes</Button></form></Card><Card className="p-5"><h2 className="font-semibold">Your submissions</h2><div className="mt-3 space-y-3">{data.happyNotes.length ? data.happyNotes.map((item) => <div className="border-b pb-3" key={item.id}><Badge>{item.status.replaceAll("_", " ")}</Badge><p className="mt-2 font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.category} | {when(item.submittedAt)}</p></div>) : <p className="text-sm text-muted-foreground">No knowledge submissions yet.</p>}</div></Card></div>;
}

export function TeacherProfilePreview({ data }: { data: Data }) {
  const p = data.profile;
  return <div className="mx-auto max-w-3xl space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><Badge>{p.public ? "PUBLIC" : "PRIVATE PREVIEW"}</Badge><h1 className="mt-3 text-3xl font-semibold">Professional profile preview</h1><p className="mt-2 text-sm text-muted-foreground">This is how your current saved profile reads. A private draft is not visible in public discovery.</p></div><ActionLink href="/teacher/business/one-to-one">Back to editing</ActionLink></div><Card className="overflow-hidden"><div className="h-28 bg-sky-100" /> <div className="p-6">{p.avatarUrl ? <Image alt={`${p.name} profile`} className="-mt-16 h-24 w-24 border-4 border-white object-cover" height={96} src={p.avatarUrl} unoptimized width={96} /> : <div className="-mt-16 grid h-24 w-24 place-items-center border-4 border-white bg-surface text-sm text-muted-foreground">No photo</div>}<h2 className="mt-4 text-2xl font-semibold">{p.name}</h2><p className="mt-1 text-muted-foreground">{p.headline || p.qualification || "Professional headline not added"}</p><p className="mt-5 whitespace-pre-wrap leading-7">{p.bio || "Professional bio not added."}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><Metric label="Experience" value={p.experienceYears ? `${p.experienceYears} years` : "Not added"} /><Metric label="Teaching format" value={p.teachingFormats.join(", ") || p.teachingMode || "Not added"} /><Metric label="Subjects" value={p.subjects.join(", ") || "Not added"} /><Metric label="Languages" value={p.languages.join(", ") || "Not added"} /></div><p className="mt-5 text-sm"><b>Availability:</b> {p.availability || "Not added"}</p><p className="mt-2 text-sm"><b>Pricing:</b> {p.hourlyRate ? `${money(p.hourlyRate, p.pricingCurrency)} per hour` : p.customPricing || "Not added"}</p>{p.public && p.id ? <div className="mt-5"><ActionLink href={`/marketplace/teachers/${p.id}`}>Open live public profile</ActionLink></div> : null}</div></Card></div>;
}

function Opportunities() {
  return <Card className="mx-auto max-w-2xl p-7 text-center"><Lightbulb className="mx-auto h-8 w-8 text-sky-700" /><h2 className="mt-4 text-2xl font-semibold">Future Opportunities</h2><p className="mt-3 text-muted-foreground">Verified professional opportunities will appear here when an authorized opportunity provider is connected. TeachX does not display invented roles, employers, rates, or application counts.</p><div className="mt-5 flex justify-center"><ActionLink href="/teacher/business/profile">Keep your profile ready</ActionLink></div></Card>;
}

function PortfolioForm({ item }: { item?: Data["portfolio"][number] }) {
  return <form action={savePortfolioItemAction} className="mt-4 grid gap-3 md:grid-cols-2">{item ? <input name="id" type="hidden" value={item.id} /> : null}<Input defaultValue={item?.title} maxLength={180} name="title" placeholder="Title" required /><Select defaultValue={item?.type ?? "SAMPLE_LESSON"} name="type">{["SAMPLE_LESSON","SAMPLE_WORKSHEET","SAMPLE_ASSESSMENT","TEACHING_PHILOSOPHY","ACHIEVEMENT","AWARD","PUBLICATION","GALLERY","VIDEO","DOCUMENT"].map((type) => <option key={type}>{type}</option>)}</Select><Textarea className="md:col-span-2" defaultValue={item?.description} maxLength={3000} name="description" placeholder="Description" /><Input defaultValue={item?.url} name="url" placeholder="Public URL" type="url" /><Input defaultValue={item?.thumbnail} name="thumbnail" placeholder="Thumbnail URL" type="url" /><label className="flex items-center gap-2 text-sm"><input defaultChecked={item?.public} name="public" type="checkbox" />Public selected work</label><Button type="submit">{item ? "Save Item" : "Add Item"}</Button></form>;
}

function Portfolio({ data }: { data: Data }) {
  const [query, setQuery] = useState("");
  const items = data.portfolio.filter((item) => `${item.title} ${item.description} ${item.type}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="space-y-6"><section className="grid gap-4 md:grid-cols-3"><Card className="p-5"><h2 className="font-semibold">Experience</h2><p className="mt-2 text-2xl font-semibold">{data.profile.experienceYears ?? 0} years</p><p className="text-sm text-muted-foreground">{data.profile.qualification || "Qualification not added"}</p></Card><Card className="p-5"><h2 className="font-semibold">Expertise</h2><p className="mt-2 text-sm">{[...data.profile.subjects, ...data.profile.skills].join(", ") || "Add teaching expertise"}</p></Card><Card className="p-5"><h2 className="font-semibold">Published work</h2><p className="mt-2 text-2xl font-semibold">{data.resources.filter((item) => item.status === "PUBLISHED").length}</p><Link className="text-sm font-semibold text-sky-700" href="/teacher/business/publishing">Open publishing</Link></Card></section>
    <Card className="p-5"><h2 className="font-semibold">Achievements and qualifications</h2><p className="mt-3 text-sm text-muted-foreground">{[...data.profile.achievements, ...data.profile.certifications].join(" | ") || "No achievements or certificates added yet."}</p></Card>
    <details className="border bg-surface p-5"><summary className="cursor-pointer font-semibold"><Plus className="mr-2 inline h-4 w-4" />Add selected work</summary><PortfolioForm /></details>
    <div className="max-w-xl"><Label>Search portfolio</Label><Input onChange={(event) => setQuery(event.target.value)} value={query} /></div>
    {items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map((item) => <Card className="p-5" key={item.id}><Badge>{item.type}</Badge><h2 className="mt-2 text-lg font-semibold">{item.title}</h2><p className="mt-2 text-sm text-muted-foreground">{item.description}</p>{item.url ? <a className="mt-3 inline-flex text-sm font-semibold text-sky-700" href={item.url} rel="noreferrer" target="_blank">View selected work</a> : null}<details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-medium">Edit</summary><PortfolioForm item={item} /></details><form action={deletePortfolioItemAction} className="mt-3"><input name="id" type="hidden" value={item.id} /><Submit danger>Delete</Submit></form></Card>)}</div> : <EmptyAction action="Build portfolio" description="Add selected professional work and evidence of your teaching practice." href="/teacher/business/portfolio" icon={<BriefcaseBusiness className="h-5 w-5" />} title="No portfolio work" />}
  </div>;
}

function StatusAction({ item, status, label }: { item: Resource; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; label: string }) {
  return <form action={setBusinessResourceStatusAction}><input name="id" type="hidden" value={item.id} /><input name="status" type="hidden" value={status} /><Submit>{label}</Submit></form>;
}

function Publishing({ data }: { data: Data }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("ALL");
  const rows = data.resources.filter((item) => `${item.title} ${item.category} ${item.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())).filter((item) => status === "ALL" || item.status === status);
  return <div className="space-y-5"><div className="flex flex-wrap gap-2"><ActionLink href="/teacher/resources" primary><Plus className="h-4 w-4" />Create in Resource Studio</ActionLink><ActionLink href="/teacher/ai-studio/chat"><Sparkles className="h-4 w-4" />Generate title or description</ActionLink></div><div className="grid gap-3 sm:grid-cols-4"><Metric label="Drafts" value={data.resources.filter((item) => item.status === "DRAFT").length} /><Metric label="Published" value={data.resources.filter((item) => item.status === "PUBLISHED").length} /><Metric label="Pending review" value={data.resources.filter((item) => ["SUBMITTED","ACADEMIC_APPROVAL"].includes(item.status)).length} /><Metric label="Archived" value={data.resources.filter((item) => item.status === "ARCHIVED").length} /></div><div className="grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex min-h-11 items-center gap-2 border bg-surface px-3"><Search className="h-4 w-4" /><input className="w-full bg-transparent outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search resources" value={query} /></label><Select onChange={(event) => setStatus(event.target.value)} value={status}><option>ALL</option><option>DRAFT</option><option>SUBMITTED</option><option>ACADEMIC_APPROVAL</option><option>PUBLISHED</option><option>ARCHIVED</option></Select></div>{rows.length ? <div className="grid gap-4 lg:grid-cols-2">{rows.map((item) => <Card className="p-5" key={item.id}><div className="flex items-start justify-between gap-3"><div><Badge>{item.status}</Badge><h2 className="mt-2 text-lg font-semibold">{item.title}</h2><p className="text-sm text-muted-foreground">{item.course}{item.subject ? ` | ${item.subject}` : ""} | Version {item.version}</p></div>{item.listing ? <Badge>{item.listing.status}</Badge> : null}</div><p className="mt-3 text-sm">{item.description || "No description added."}</p><p className="mt-2 text-xs text-muted-foreground">{item.views} views | {item.downloads} downloads</p>{item.workflowReviews.length ? <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Review activity</summary>{item.workflowReviews.map((review, index) => <p className="mt-2 text-sm" key={index}>{review.decision}: {review.notes || "No notes"}</p>)}</details> : null}<div className="mt-4 flex flex-wrap gap-2">{item.status !== "PUBLISHED" ? <StatusAction item={item} label="Publish to Marketplace" status="PUBLISHED" /> : <StatusAction item={item} label="Move to Draft" status="DRAFT" />}{item.status !== "ARCHIVED" ? <StatusAction item={item} label="Archive" status="ARCHIVED" /> : <StatusAction item={item} label="Restore Draft" status="DRAFT" />}{item.status === "DRAFT" ? <form action={deleteBusinessResourceAction}><input name="id" type="hidden" value={item.id} /><Submit danger>Delete Unsold Draft</Submit></form> : null}<ActionLink href="/teacher/resources">Open Resource</ActionLink></div>{item.status === "PUBLISHED" && !item.fileUrl?.startsWith("https://") ? <p className="mt-3 border-l-2 border-amber-500 pl-3 text-sm text-amber-800">Marketplace purchase is disabled until secure HTTPS delivery is attached in Resource Studio.</p> : null}</Card>)}</div> : <EmptyAction action="Create a resource" description="Create teaching material in Resource Studio, then return here to publish it." href="/teacher/resources" icon={<Package className="h-5 w-5" />} title="No resources" />}</div>;
}

function ProductForm({ item, currency }: { item: Resource; currency: string }) {
  const listing = item.listing;
  return <form action={saveMarketplaceProductAction} className="mt-4 grid gap-3 md:grid-cols-2"><input name="id" type="hidden" value={item.id} /><Input defaultValue={item.title} maxLength={180} name="title" placeholder="Product title" required /><Input defaultValue={item.category} maxLength={100} name="category" placeholder="Category" /><Input defaultValue={item.tags.join(", ")} name="tags" placeholder="Tags" /><Input defaultValue={item.thumbnail ?? ""} name="thumbnail" placeholder="Cover URL" type="url" /><Input defaultValue={listing?.price ?? 0} min="0" name="price" step="0.01" type="number" /><Input aria-label="Currency" disabled value={currency} /><Select defaultValue={listing?.license ?? "INSTITUTION_PERSONAL"} name="license"><option>INSTITUTION_PERSONAL</option><option>PERSONAL</option><option>CLASSROOM</option></Select><label className="flex items-center gap-2 text-sm"><input defaultChecked={listing?.purchaseEnabled} name="purchaseEnabled" type="checkbox" />Enable purchase and download</label><Textarea className="md:col-span-2" defaultValue={item.description ?? ""} maxLength={4000} name="description" placeholder="Product description" /><Textarea className="md:col-span-2" defaultValue={item.preview} maxLength={2000} name="preview" placeholder="Public preview" /><Button type="submit">Save Product</Button></form>;
}

function Marketplace({ data }: { data: Data }) {
  const [status, setStatus] = useState("ALL");
  const eligible = data.resources.filter((item) => item.status === "PUBLISHED");
  const rows = eligible.filter((item) => status === "ALL" || (item.listing?.status ?? "NOT_LISTED") === status);
  return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-4"><Metric label="Published resources" value={eligible.length} /><Metric label="Active products" value={eligible.filter((item) => item.listing?.status === "ACTIVE").length} /><Metric label="Recorded sales" value={data.sales.filter((sale) => ["PAID","FULFILLED"].includes(sale.status)).length} /><Metric label="Product downloads" value={eligible.reduce((sum, item) => sum + item.downloads, 0)} /></div><div className="flex flex-wrap items-center justify-between gap-3"><Select className="max-w-xs" onChange={(event) => setStatus(event.target.value)} value={status}><option>ALL</option><option>ACTIVE</option><option>INACTIVE</option><option>NOT_LISTED</option></Select><div className="flex gap-2"><ActionLink href="/student/marketplace"><ExternalLink className="h-4 w-4" />Preview Marketplace</ActionLink><ActionLink href="/teacher/community/resources">Share in Community</ActionLink></div></div>{rows.length ? <div className="grid gap-4 lg:grid-cols-2">{rows.map((item) => <Card className="p-5" key={item.id}><div className="flex justify-between gap-3"><div><Badge>{item.listing?.status ?? "NOT LISTED"}</Badge><h2 className="mt-2 text-lg font-semibold">{item.title}</h2></div><strong>{money(item.listing?.price ?? 0, item.listing?.currency ?? data.currency)}</strong></div><p className="mt-2 text-sm text-muted-foreground">{item.views} views | {item.downloads} downloads | {item.listing?.sales ?? 0} entitlements | {item.listing?.saves ?? 0} saves</p><p className="mt-2 text-sm">{item.listing?.rating === null || item.listing?.rating === undefined ? "No verified reviews yet." : `${item.listing.rating}/5 from ${item.listing.reviews.length} verified reviews`}</p>{item.listing?.reviews.length ? <details className="mt-3"><summary className="cursor-pointer text-sm font-medium">Verified reviews</summary>{item.listing.reviews.map((review) => <div className="mt-2 border-l-2 pl-3 text-sm" key={review.id}><b>{review.rating}/5 {review.title}</b><p>{review.body}</p></div>)}</details> : null}<details className="mt-4 border-t pt-3"><summary className="cursor-pointer text-sm font-semibold">Product details and pricing</summary><ProductForm currency={data.currency} item={item} /></details></Card>)}</div> : <EmptyAction action="Publish a resource" description="Only published resources can be prepared as marketplace products." href="/teacher/business/publishing" icon={<Store className="h-5 w-5" />} title="No marketplace products" />}</div>;
}

function Orders({ data }: { data: Data }) {
  const [query, setQuery] = useState(""); const [status, setStatus] = useState("ALL");
  const rows = data.sales.filter((item) => `${item.product} ${item.customer} ${item.orderId}`.toLowerCase().includes(query.toLowerCase())).filter((item) => status === "ALL" || item.status === status);
  return <div className="space-y-5"><div className="grid gap-3 md:grid-cols-[1fr_220px]"><Input onChange={(event) => setQuery(event.target.value)} placeholder="Search products, buyers, or orders" value={query} /><Select onChange={(event) => setStatus(event.target.value)} value={status}><option>ALL</option>{[...new Set(data.sales.map((item) => item.status))].map((item) => <option key={item}>{item}</option>)}</Select></div>{rows.length ? <div className="space-y-3">{rows.map((item) => <Card className="p-4" key={item.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><Badge>{item.status}</Badge><h2 className="mt-2 font-semibold">{item.product}</h2><p className="text-sm text-muted-foreground">Buyer: {item.customer} | Order {item.orderId}</p><p className="text-xs text-muted-foreground">Created {when(item.createdAt)}{item.paidAt ? ` | Paid ${when(item.paidAt)}` : ""}</p></div><div className="text-left sm:text-right"><strong>{money(item.amount, item.currency)}</strong><p className="text-xs text-muted-foreground">{item.downloads} product downloads | {item.refundStatus}</p></div></div></Card>)}</div> : <EmptyAction action="Publish products" description="Seller orders will appear after customers acquire your marketplace products." href="/teacher/business/marketplace" icon={<FileText className="h-5 w-5" />} title="No orders" />}<Button onClick={() => downloadCsv("teacher-orders", [["Order","Product","Buyer","Status","Amount","Currency"], ...rows.map((item) => [item.orderId,item.product,item.customer,item.status,item.amount,item.currency])])} type="button" variant="secondary"><Download className="mr-2 h-4 w-4" />Export Orders</Button></div>;
}

function Earnings({ data }: { data: Data }) {
  const e = data.earnings;
  return <div className="space-y-6"><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Lifetime earnings" value={money(e.total, e.currency)} /><Metric label="Current period" value={money(e.currentPeriod, e.currency)} /><Metric label="Pending" value={money(e.pending, e.currency)} /><Metric label="Available" value={money(e.available, e.currency)} /><Metric label="Completed ledger earnings" value={money(e.completed, e.currency)} /><Metric label="Marketplace revenue" value={money(e.marketplace, e.currency)} /><Metric detail="No commission rule is connected" label="Platform commission" value={e.platformCommission === null ? "Not available" : money(e.platformCommission, e.currency)} /><Metric label="Currencies" value={e.byCurrency.length} /></section>{e.byCurrency.length > 1 ? <Card className="p-5"><h2 className="font-semibold">Balances by currency</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{e.byCurrency.map((item) => <div className="border p-3 text-sm" key={item.currency}><b>{item.currency}</b><p>Available: {money(item.available, item.currency)}</p><p>Lifetime: {money(item.total, item.currency)}</p></div>)}</div></Card> : null}<Card className="p-5"><h2 className="font-semibold">Six-month settled earnings</h2><div className="mt-5 flex h-44 items-end gap-2">{e.trend.map((item) => { const max = Math.max(...e.trend.map((entry) => entry.value), 1); return <div className="flex min-w-0 flex-1 flex-col items-center gap-2" key={item.label}><span className="max-w-full truncate text-xs">{money(item.value, e.currency)}</span><div className="w-full bg-sky-600" style={{ height: `${Math.max(4, (item.value / max) * 105)}px` }} /><span className="text-xs text-muted-foreground">{item.label}</span></div>; })}</div></Card>{e.total === 0 ? <EmptyAction action="Start selling resources" description="Publish secure resources and enable marketplace purchasing to begin recording earnings." href="/teacher/business/marketplace" icon={<CircleDollarSign className="h-5 w-5" />} title="No earnings yet" /> : null}<Button onClick={() => downloadCsv("teacher-earnings", [["Month","Amount","Currency"], ...e.trend.map((item) => [item.label,item.value,e.currency])])} type="button" variant="secondary">Export Earnings</Button></div>;
}

function Wallet({ data }: { data: Data }) {
  const wallet = data.wallet;
  return <div className="space-y-6"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Available balance" value={money(wallet.balance, wallet.currency)} /><Metric label="Pending balance" value={money(wallet.pending, wallet.currency)} /><Metric label="Lifetime earnings" value={money(wallet.lifetimeEarnings, wallet.currency)} /><Metric label="Lifetime spending" value={money(wallet.lifetimeSpending, wallet.currency)} /></div>{wallet.balances.length > 1 ? <div className="grid gap-3 sm:grid-cols-2">{wallet.balances.map((item) => <Card className="p-4" key={item.currency}><h2 className="font-semibold">{item.currency} wallet</h2><p className="mt-2 text-sm">Available {money(item.balance, item.currency)} | Pending {money(item.pending, item.currency)}</p></Card>)}</div> : null}<Card className="p-5"><h2 className="font-semibold">Wallet transactions</h2><p className="mt-1 text-sm text-muted-foreground">Financial ledger records are read-only.</p><div className="mt-4 space-y-2">{wallet.transactions.length ? wallet.transactions.map((item) => <div className="flex flex-col justify-between gap-2 border-b py-3 text-sm sm:flex-row" key={item.id}><div><b>{item.description}</b><p className="text-xs text-muted-foreground">{item.type} | {item.pending ? "Pending" : "Settled"} | {when(item.createdAt)}</p></div><strong>{money(item.amount, item.currency)}</strong></div>) : <p className="text-sm text-muted-foreground">No wallet transactions have been recorded.</p>}</div></Card><ActionLink href="/teacher/business/payouts">Open Settlement Readiness</ActionLink><Button onClick={() => downloadCsv("teacher-wallet", [["Date","Type","Description","Amount","Currency","Status"], ...wallet.transactions.map((item) => [item.createdAt,item.type,item.description,item.amount,item.currency,item.pending ? "Pending" : "Settled"])])} type="button" variant="secondary">Export Wallet Statement</Button></div>;
}

function Payouts({ data }: { data: Data }) {
  const payouts = data.payouts;
  return <div className="space-y-5"><section className="grid gap-3 sm:grid-cols-3"><Metric label="Eligibility" value={payouts.eligible ? "Eligible" : "Unavailable"} /><Metric label="Settlement status" value={payouts.status.replaceAll("_", " ")} /><Metric label="Payout records" value={payouts.history.length} /></section>{!payouts.supported ? <Card className="border-l-4 border-amber-500 p-5"><h2 className="font-semibold">Payout requests are not active</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{payouts.reason}</p><p className="mt-3 text-sm">Your recorded wallet balance remains visible and unchanged. No payout request or payment detail is fabricated.</p></Card> : null}{payouts.history.length ? <div className="space-y-3">{payouts.history.map((item) => <Card className="p-4" key={item.id}><b>{money(item.amount, item.currency)}</b><p className="text-sm text-muted-foreground">{item.status} | {when(item.createdAt)}</p></Card>)}</div> : <EmptyState description="Verified settlement records will appear when the existing payment infrastructure supports teacher payouts." icon={<CheckCircle2 className="h-5 w-5" />} title="No payout history" />}<ActionLink href="/teacher/business/wallet">Review Wallet</ActionLink></div>;
}

function Analytics({ data }: { data: Data }) {
  const a = data.analytics;
  return <div className="space-y-6"><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Profile views" value={a.profileViews} /><Metric label="Resource views" value={a.resourceViews} /><Metric label="Downloads" value={a.downloads} /><Metric label="Completed sales" value={a.sales} /><Metric label="Pending orders" value={a.pendingOrders} /><Metric label="Followers" value={a.followers} /><Metric label="Profile-to-sale conversion" value={a.conversion === null ? "Insufficient data" : `${a.conversion}%`} /><Metric label="Recorded activities" value={a.timeline.length} /></section><Card className="p-5"><h2 className="font-semibold">Recent growth activity</h2><div className="mt-3 space-y-2">{a.timeline.length ? a.timeline.map((item) => <div className="border-b py-3 text-sm" key={item.id}><b>{item.title}</b><span className="ml-2 text-xs text-muted-foreground">{item.type} | {when(item.createdAt)}</span></div>) : <p className="text-sm text-muted-foreground">No activity is available for the last 90 days.</p>}</div></Card><Button onClick={() => downloadCsv("teacher-business-analytics", [["Metric","Value"],["Profile views",a.profileViews],["Resource views",a.resourceViews],["Downloads",a.downloads],["Sales",a.sales],["Followers",a.followers],["Conversion",a.conversion ?? "Unavailable"]])} type="button" variant="secondary">Export Analytics</Button></div>;
}

function Subscription({ data }: { data: Data }) {
  const subscription = data.subscription;
  const currentPrice = data.plans.find((plan) => plan.id === subscription?.planId)?.price ?? 0;
  const recurringSubscription = subscription?.status === "ACTIVE" && subscription.price > 0 && !subscription.prepaid;
  const planDescription = (key: string) => key === "teacher-pro"
    ? "Higher AI allowance, the full Save Time experience, Earn More and business tools, plus enhanced learning access."
    : key === "teacher-basic"
      ? "Core teaching, planning, resources, community, essential AI, and appropriate Learn More access."
      : "Your account and saved data remain available with a small essential allowance.";

  return (
    <div className="space-y-6">
      {data.trial?.active ? (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-5 text-sky-950" aria-label="Trial status">
          <Badge>TRIAL ACTIVE</Badge>
          <h2 className="mt-3 text-xl font-semibold">{data.trial.daysRemaining} days remaining</h2>
          <p className="mt-2 text-sm leading-6">Your 7-day {data.trial.planName} trial ends on {when(data.trial.endsAt)}. Your saved work will not be deleted when the trial ends.</p>
        </section>
      ) : data.trial?.status === "EXPIRED" ? (
        <section className="rounded-lg border bg-muted/40 p-5" aria-label="Trial status">
          <Badge>TRIAL ENDED</Badge>
          <h2 className="mt-3 text-xl font-semibold">Continue with the plan that fits your work</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your account, profile, and saved content remain available. Paid plan allowances require a verified subscription payment.</p>
        </section>
      ) : null}

      {subscription ? (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Current plan" value={subscription.name} />
          <Metric label="Status" value={subscription.status === "TRIALING" ? "Trial active" : subscription.status} />
          <Metric label="AI usage" value={`${data.credits.used}/${data.credits.allocation}`} />
          <Metric label="AI balance" value={data.credits.balance} />
          <Metric label="Resources" value={`${data.resources.length}/${subscription.resourceLimit}`} />
          <Metric label="Storage limit" value={`${subscription.storageLimitMb} MB`} />
          <Metric label="Marketplace" value={subscription.marketplaceAccess ? "Included" : "Not included"} />
          <Metric label={subscription.status === "TRIALING" ? "Trial ends" : subscription.prepaid ? "Access through" : "Renews"} value={when(subscription.periodEndsAt)} />
        </section>
      ) : (
        <EmptyAction action="Choose a plan" description="Activate an existing teacher plan to manage entitlements and usage." href="/teacher/business/subscription" icon={<Star className="h-5 w-5" />} title="No active subscription" />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div><h2 className="font-semibold">Monthly plans</h2><p className="mt-1 text-sm text-muted-foreground">Prices exclude applicable taxes. Annual billing is not configured yet.</p></div>
        <Badge>MONTHLY</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.plans.map((plan) => {
          const current = subscription?.planId === plan.id;
          const canChoose = !current && !(data.trial?.active && plan.price === 0);
          return (
            <Card className="p-5" key={plan.id}>
              <Badge>{current ? "CURRENT" : "AVAILABLE"}</Badge>
              <h2 className="mt-3 text-lg font-semibold">{plan.name}</h2>
              <p className="mt-2 text-2xl font-semibold">{money(plan.price, plan.currency)}<span className="text-sm font-normal text-muted-foreground"> / month</span></p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{planDescription(plan.key)}</p>
              <p className="mt-3 text-sm text-muted-foreground">{plan.credits.toLocaleString()} AI credits | {plan.resourceLimit} resources | {plan.storageLimitMb} MB</p>
              {canChoose ? (
                <form action={changeSubscriptionAction} className="mt-4">
                  <input name="planId" type="hidden" value={plan.id} />
                  <Button className="w-full" type="submit">{plan.price === 0 ? "Use Free Access" : plan.price > currentPrice ? "Choose Plan" : "Change Plan"}</Button>
                </form>
              ) : null}
            </Card>
          );
        })}
      </div>

      {recurringSubscription ? (
        <form action={setSubscriptionRenewalAction}>
          <input name="id" type="hidden" value={subscription.id} />
          <input name="cancel" type="hidden" value={String(!subscription.cancelAtPeriodEnd)} />
          <Button type="submit" variant="secondary">{subscription.cancelAtPeriodEnd ? "Resume Renewal" : "Cancel at Period End"}</Button>
        </form>
      ) : null}

      <Card className="p-5">
        <h2 className="font-semibold">Billing information</h2>
        <p className="mt-2 text-sm text-muted-foreground">A plan changes only after TeachX verifies payment with the configured provider.</p>
        <div className="mt-3 space-y-2">{data.invoices.length ? data.invoices.map((invoice) => <div className="flex flex-col justify-between gap-2 border-b py-3 text-sm sm:flex-row" key={invoice.id}><span>{invoice.number} | {invoice.status} | {when(invoice.createdAt)}</span><b>{money(invoice.total, invoice.currency)}</b></div>) : <p className="text-sm text-muted-foreground">No billing invoices are recorded.</p>}</div>
      </Card>
    </div>
  );
}

function Downloads({ data }: { data: Data }) {
  return <div className="space-y-6"><h2 className="text-lg font-semibold">Purchased resources</h2>{data.purchases.length ? <div className="grid gap-4 md:grid-cols-2">{data.purchases.flatMap((order) => order.items.filter((item) => item.resourceId).map((item, index) => <Card className="p-4" key={`${order.id}-${index}`}><Badge>{order.status}</Badge><h3 className="mt-2 font-semibold">{item.title}</h3>{item.fileUrl && ["PAID","FULFILLED"].includes(order.status) ? <a className="mt-3 inline-flex text-sm font-semibold text-sky-700" href={item.fileUrl} rel="noreferrer" target="_blank">Open purchased resource</a> : <p className="mt-2 text-sm text-muted-foreground">Secure delivery is not available for this order.</p>}</Card>))}</div> : <EmptyState description="Resources purchased through the marketplace will appear here." icon={<BookOpen className="h-5 w-5" />} title="No purchases" />}<h2 className="text-lg font-semibold">Download history</h2>{data.downloads.length ? <div className="space-y-3">{data.downloads.map((item) => <Card className="p-4" key={item.id}><h3 className="font-semibold">{item.title}</h3><p className="text-sm text-muted-foreground">{item.course} | {when(item.downloadedAt)}</p></Card>)}</div> : <p className="text-sm text-muted-foreground">No download history has been recorded.</p>}</div>;
}

export function TeacherBusinessPage({ module, data }: { module: TeacherBusinessModule; data: Data }) {
  const active = modules.find((item) => item.slug === module)!;
  return <div className="min-w-0 space-y-6"><nav className="text-sm text-muted-foreground"><Link href="/teacher">Teacher Home</Link><span className="mx-2">/</span><span>Business</span><span className="mx-2">/</span><span className="text-foreground">{active.label}</span></nav><header className="border-b pb-5"><Badge>Teacher Business OS</Badge><h1 className="mt-3 text-3xl font-semibold">{active.label}</h1><p className="mt-2 max-w-3xl text-muted-foreground">{descriptions[module]}</p></header><nav aria-label="Teacher business modules" className="flex max-w-full gap-2 overflow-x-auto pb-2">{modules.map((item) => { const Icon = item.icon; return <Link aria-current={module === item.slug ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium ${module === item.slug ? "bg-primary text-primary-foreground" : "border bg-surface"}`} href={`/teacher/business/${item.slug}`} key={item.slug}><Icon className="h-4 w-4" />{item.label}</Link>; })}</nav>{module === "home" ? <BusinessHome data={data} /> : module === "one-to-one" ? <OneToOne data={data} /> : module === "profile" ? <Profile data={data} /> : module === "portfolio" ? <Portfolio data={data} /> : module === "publishing" ? <Publishing data={data} /> : module === "happy-notes" ? <HappyNotes data={data} /> : module === "marketplace" ? <Marketplace data={data} /> : module === "orders" ? <Orders data={data} /> : module === "earnings" ? <Earnings data={data} /> : module === "wallet" ? <Wallet data={data} /> : module === "payouts" ? <Payouts data={data} /> : module === "analytics" ? <Analytics data={data} /> : module === "subscription" ? <Subscription data={data} /> : module === "opportunities" ? <Opportunities /> : <Downloads data={data} />}</div>;
}
