import Link from "next/link";
import { Bookmark, BookOpenCheck, Download, Eye, FileText, Filter, Lock, Search, Sparkles, UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createResourcePurchaseOrderAction } from "@/features/commerce/actions";
import {
  bookmarkLearningResourceAction,
  downloadLearningResourceAction,
  publishLearningResourceAction,
  saveAIConversationAsResourceAction,
  wishlistLearningResourceAction
} from "@/features/learning-marketplace/actions";
import { getInitials } from "@/lib/utils";
import { TeacherResourceStudio, type TeacherResourceRow } from "@/features/learning-marketplace/components/teacher-resource-studio";
import type { getLearningMarketplaceFacets, getLearningMarketplaceHome, getRelatedLearningResources, getStudentResourceDashboard, getTeacherResourceLibrary, LearningResource } from "@/services/learning-marketplace-service";
import { getResourceMetadata, learningResourceTypes } from "@/services/learning-marketplace-service";

type HomeData = Awaited<ReturnType<typeof getLearningMarketplaceHome>>;
type Facets = Awaited<ReturnType<typeof getLearningMarketplaceFacets>>;
type TeacherLibrary = Awaited<ReturnType<typeof getTeacherResourceLibrary>>;
type StudentDashboard = Awaited<ReturnType<typeof getStudentResourceDashboard>>;

export function LearningMarketplaceHome({ data, facets, resources }: { data: HomeData; facets: Facets; resources: LearningResource[] }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>TeachX Learning Marketplace</Badge>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Discover beautiful resources for every classroom and learner.</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Teacher-created lesson plans, worksheets, notes, projects, and AI-assisted study materials. Payments stay locked for Phase 7.</p>
          </div>
          <ResourceFilters facets={facets} />
        </div>
      </section>

      <ResourceSection title="Featured Resources" resources={data.featured} />
      <ResourceSection title="Trending" resources={data.trending} />
      <ResourceSection title="Most Downloaded" resources={data.mostDownloaded} />
      <ResourceSection title="Newest" resources={data.newest} />
      <ResourceSection title="Free Resources" resources={data.free} />
      <ResourceSection title="Premium Resources" resources={data.premium} locked />
      <RecentViewed items={data.recentlyViewed} />
      <ResourceSection title="Recommended" resources={resources.length ? resources : data.recommended} />
      <CategoryCloud categories={data.categories.length ? data.categories : facets.categories} />
    </div>
  );
}

function ResourceFilters({ facets }: { facets: Facets }) {
  return (
    <form action="/resources" className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-border bg-background px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input className="min-w-0 flex-1 bg-transparent outline-none" name="q" placeholder="Search resources, tags, teachers" />
      </label>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Select name="category"><option value="">Category</option>{facets.categories.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="subject"><option value="">Subject</option>{facets.subjects.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="className"><option value="">Class</option>{facets.classes.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="board"><option value="">Board</option>{facets.boards.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="language"><option value="">Language</option>{facets.languages.map((item) => <option key={item}>{item}</option>)}</Select>
        <Select name="priceType"><option value="">Price Type</option>{facets.priceTypes.map((item) => <option key={item}>{item}</option>)}</Select>
      </div>
      <Button className="mt-3 w-full" type="submit"><Filter className="mr-2 h-4 w-4" />Apply Filters</Button>
    </form>
  );
}

function ResourceSection({ title, resources, locked = false }: { title: string; resources: LearningResource[]; locked?: boolean }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {locked ? <Badge><Lock className="mr-1 h-3 w-3" />Locked</Badge> : null}
      </div>
      {resources.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{resources.map((resource) => <ResourceCard key={resource.id} resource={resource} locked={locked} />)}</div> : <EmptyState icon={<FileText className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Published learning resources will appear here." />}
    </section>
  );
}

export function ResourceCard({ resource, locked = false }: { resource: LearningResource; locked?: boolean }) {
  const metadata = getResourceMetadata(resource);
  const teacherName = resource.createdBy?.name ?? "TeachX Teacher";

  return (
    <Card className="overflow-hidden shadow-soft">
      <div className="flex h-36 items-end bg-gradient-to-br from-sky-100 via-white to-blue-100 p-5">
        <div className="rounded-2xl bg-white/80 px-3 py-2 text-sm font-semibold text-sky-900">{metadata.resourceType ?? resource.type.replaceAll("_", " ")}</div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase text-sky-700">{metadata.category ?? resource.course.name}</p>
            <h3 className="mt-2 text-xl font-semibold">{resource.title}</h3>
          </div>
          <Badge>{metadata.priceType ?? "Free"}</Badge>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{resource.description ?? metadata.preview ?? "A polished TeachX learning resource ready for preview and download."}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[resource.subject?.name, metadata.className, metadata.board, metadata.language].filter(Boolean).slice(0, 4).map((item) => <span className="rounded-full bg-muted px-3 py-1 text-xs" key={item}>{item}</span>)}
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-muted-foreground">
          <span><Eye className="mr-1 inline h-3.5 w-3.5" />{resource.analytics?.views ?? 0}</span>
          <span><Download className="mr-1 inline h-3.5 w-3.5" />{resource.downloads.length}</span>
          <span>{metadata.pages ?? "Preview"} pages</span>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-sm font-semibold text-white">{getInitials(teacherName)}</div>
          <div className="min-w-0 text-sm">
            <p className="truncate font-medium">{teacherName}</p>
            <p className="truncate text-muted-foreground">{resource.createdBy?.teacherProfile?.qualification ?? "TeachX Educator"}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <Link className="flex-1 rounded-xl bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground" href={`/resources/${resource.id}`}>{locked ? "Preview" : "View Resource"}</Link>
          <ResourceBookmarkButton id={resource.id} title={resource.title} />
        </div>
      </div>
    </Card>
  );
}

function ResourceBookmarkButton({ id, title }: { id: string; title: string }) {
  return (
    <form action={bookmarkLearningResourceAction}>
      <input name="resourceId" type="hidden" value={id} />
      <button aria-label={`Bookmark ${title}`} className="rounded-xl border border-border px-3 py-2 transition hover:bg-sky-50" type="submit"><Bookmark className="h-4 w-4" /></button>
    </form>
  );
}

function RecentViewed({ items }: { items: HomeData["recentlyViewed"] }) {
  return (
    <section>
      <h2 className="mb-4 text-2xl font-semibold">Recently Viewed</h2>
      {items.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{items.map((item) => <Link className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition hover:border-sky-200 hover:bg-sky-50" href={item.link ?? "/resources"} key={item.id}>{item.title}</Link>)}</div> : <EmptyState icon={<BookOpenCheck className="h-5 w-5" />} title="No recent resources" description="Open a resource to build your recent learning trail." />}
    </section>
  );
}

function CategoryCloud({ categories }: { categories: string[] }) {
  return <section><h2 className="mb-4 text-2xl font-semibold">Categories</h2><div className="flex flex-wrap gap-2">{(categories.length ? categories : [...learningResourceTypes]).slice(0, 18).map((item) => <Link className="rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800" href={`/resources?category=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}</div></section>;
}

export function ResourceDetailPage({ resource, related, canAccess = false }: { resource: LearningResource; related: Awaited<ReturnType<typeof getRelatedLearningResources>>; canAccess?: boolean }) {
  const metadata = getResourceMetadata(resource);
  const teacher = resource.createdBy;
  const isPremium = metadata.priceType === "Premium";
  const hasDelivery = Boolean(resource.fileUrl || resource.externalUrl);
  const needsPurchase = isPremium && !canAccess;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-soft">
        <div className="flex min-h-56 items-end bg-gradient-to-br from-sky-100 via-white to-blue-100 p-6 sm:p-8">
          <div>
            <Badge>{metadata.category ?? resource.course.name}</Badge>
            <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{resource.title}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">{resource.description ?? metadata.preview ?? "Preview this TeachX learning resource before saving it to your study library."}</p>
          </div>
        </div>
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card className="p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Preview</h2>
              <p className="mt-3 whitespace-pre-line leading-7 text-muted-foreground">{metadata.preview ?? "A clean preview panel is ready for PDF, DOCX, PPT, image, and video placeholders. Storage provider integration remains in the existing upload architecture."}</p>
            </Card>
            <Card className="p-5 shadow-sm">
              <h2 className="text-xl font-semibold">Details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Detail label="Subject" value={resource.subject?.name ?? resource.course.name} />
                <Detail label="Class" value={metadata.className ?? "All classes"} />
                <Detail label="Board" value={metadata.board ?? "General"} />
                <Detail label="Language" value={metadata.language ?? "English"} />
                <Detail label="Pages" value={metadata.pages ?? "Preview"} />
                <Detail label="Format" value={metadata.outputFormat ?? resource.type.replaceAll("_", " ")} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">{(metadata.tags ?? []).map((tag) => <span className="rounded-full bg-muted px-3 py-1 text-xs" key={tag}>{tag}</span>)}</div>
            </Card>
          </div>
          <Card className="h-fit p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 font-semibold text-white">{getInitials(teacher?.name ?? "Teacher")}</div>
              <div>
                <p className="font-semibold">{teacher?.name ?? "TeachX Teacher"}</p>
                <p className="text-sm text-muted-foreground">{teacher?.teacherProfile?.qualification ?? "Verified educator"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-sm">
              <StatMini label="Views" value={(resource.analytics?.views ?? 0).toString()} />
              <StatMini label="Downloads" value={resource.downloads.length.toString()} />
              <StatMini label="Rating" value="Soon" />
            </div>
            <div className="mt-5 space-y-3">
              <form action={needsPurchase ? createResourcePurchaseOrderAction : downloadLearningResourceAction}>
                <input name="resourceId" type="hidden" value={resource.id} />
                <Button className="w-full" disabled={!needsPurchase && !hasDelivery} type="submit">{needsPurchase ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}{needsPurchase ? "Create Purchase Order" : hasDelivery ? "Download Resource" : "Delivery unavailable"}</Button>
              </form>
              {isPremium && !canAccess ? (
                <form action={wishlistLearningResourceAction}>
                  <input name="resourceId" type="hidden" value={resource.id} />
                  <Button className="w-full" type="submit" variant="secondary"><Lock className="mr-2 h-4 w-4" />Wishlist Premium Resource</Button>
                </form>
              ) : null}
              <form action={bookmarkLearningResourceAction}>
                <input name="resourceId" type="hidden" value={resource.id} />
                <Button className="w-full" type="submit" variant="secondary"><Bookmark className="mr-2 h-4 w-4" />Bookmark</Button>
              </form>
            </div>
          </Card>
        </div>
      </section>
      <ResourceSection title="Related Resources" resources={related} />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-border bg-background p-4"><p className="text-xs uppercase text-muted-foreground">{label}</p><p className="mt-1 font-medium">{value}</p></div>;
}

function StatMini({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-muted p-3"><p className="font-semibold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>;
}

export function TeacherResourceLibrary({ data }: { data: TeacherLibrary }) {
  const toRows = (items: (typeof data.resources) | (typeof data.savedResources)) => items.map((resource): TeacherResourceRow => {
    const metadata = getResourceMetadata(resource);
    return { id: resource.id, title: resource.title, status: resource.status, type: resource.type.replaceAll("_", " "), category: metadata.category ?? "", subject: resource.subject?.name ?? resource.course.name, grade: metadata.className ?? "", language: metadata.language ?? "", tags: metadata.tags ?? [], views: resource.analytics?.views ?? 0, downloads: resource.downloads.length, updatedAt: resource.updatedAt.toISOString(), fileUrl: resource.fileUrl, externalUrl: resource.externalUrl };
  });
  const downloadRows = data.downloads.map((download): TeacherResourceRow => {
    const metadata = getResourceMetadata(download.item);
    return { id: download.item.id, title: download.item.title, status: download.item.status, type: download.item.type.replaceAll("_", " "), category: metadata.category ?? "", subject: download.item.subject?.name ?? download.item.course.name, grade: metadata.className ?? "", language: metadata.language ?? "", tags: metadata.tags ?? [], views: download.item.analytics?.views ?? 0, downloads: 1, updatedAt: download.downloadedAt.toISOString(), fileUrl: download.item.fileUrl, externalUrl: download.item.externalUrl };
  });
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>My Teaching Bag</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Bring your teaching into TeachX.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Upload syllabus, timetable, lesson plans, PDFs, photos, worksheets, question papers, documents and links. TeachX keeps them in your teaching workspace using the existing secure upload flow.</p>
        <div className="mt-6 flex flex-wrap gap-3"><a className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="#upload-resource">Upload teaching material</a><a className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium" href="#create-resource">Create material</a><Link className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium" href="/teacher/workspace/resources">My materials</Link></div>
      </section>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatMini label="Published" value={data.stats.published.toString()} />
        <StatMini label="Drafts" value={data.stats.drafts.toString()} />
        <StatMini label="Archived" value={data.stats.archived.toString()} />
        <StatMini label="Downloads" value={data.stats.downloads.toString()} />
        <StatMini label="Saved" value={data.stats.saved.toString()} />
        <StatMini label="Views" value={data.stats.views.toString()} />
      </div>
      <div id="create-resource"><ResourcePublisher data={data} /></div>
      <AIToResourceForm data={data} />
      <section id="upload-resource" className="rounded-2xl border border-border bg-surface p-5 shadow-soft"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold">Upload teaching material</h2><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Bring PDFs, Word documents, spreadsheets, presentations, photos, audio, video, notes, worksheets and question papers. The existing private upload flow verifies the file and saves it safely.</p></div><Link className="rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-sky-50" href="/content-studio">Choose file</Link></div></section>
      <TeacherResourceStudio downloads={downloadRows} resources={toRows(data.resources)} savedResources={toRows(data.savedResources)} />
    </div>
  );
}

function ResourcePublisher({ data }: { data: TeacherLibrary }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <UploadCloud className="h-5 w-5 text-sky-700" />
        <h2 className="text-xl font-semibold">Guided Publisher</h2>
      </div>
      <form action={publishLearningResourceAction} className="mt-6 grid gap-4 md:grid-cols-2">
        <Input className="md:col-span-2" name="title" placeholder="Resource title" />
        <Textarea className="md:col-span-2" name="description" placeholder="Description" />
        <Select name="resourceType">{learningResourceTypes.map((item) => <option key={item}>{item}</option>)}</Select>
        <Input name="category" placeholder="Category" />
        <Select name="courseId"><option value="">Course</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
        <Select name="subjectId"><option value="">Subject</option>{data.subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</Select>
        <Input name="className" placeholder="Class" />
        <Input name="board" placeholder="Board" />
        <Input name="language" placeholder="Language" defaultValue="English" />
        <Input name="tags" placeholder="Tags, comma separated" />
        <Input name="pages" placeholder="Pages" />
        <Select name="priceType"><option>Free</option><option>Premium</option></Select>
        <Select name="outputFormat"><option>PDF</option><option>DOCX</option><option>PPT</option><option>Markdown</option><option>Print</option></Select>
        <Input name="fileUrl" placeholder="File URL placeholder" />
        <Input name="externalUrl" placeholder="External URL placeholder" />
        <Textarea className="md:col-span-2" name="preview" placeholder="Preview text" />
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button name="intent" type="submit" value="publish">Publish Resource</Button>
          <Button name="intent" type="submit" value="draft" variant="secondary">Save Draft</Button>
        </div>
      </form>
    </Card>
  );
}

function AIToResourceForm({ data }: { data: TeacherLibrary }) {
  return (
    <Card className="p-5 shadow-soft">
      <div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-sky-700" /><h2 className="text-xl font-semibold">Save AI Studio Output</h2></div>
      <form action={saveAIConversationAsResourceAction} className="mt-5 grid gap-4 md:grid-cols-4">
        <Select name="conversationId"><option value="">Recent AI generation</option>{data.aiGenerations.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Select>
        <Input name="title" placeholder="Resource title" />
        <Select name="courseId"><option value="">Course</option>{data.courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</Select>
        <Select name="resourceType">{learningResourceTypes.map((item) => <option key={item}>{item}</option>)}</Select>
        <Button className="md:col-span-4" type="submit" variant="secondary">Save as Draft</Button>
      </form>
    </Card>
  );
}

export function StudentResourceDashboard({ data }: { data: StudentDashboard }) {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Learning Resources</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Your saved resources, downloads, and study library.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Browse the marketplace, bookmark useful materials, download free resources, and wishlist premium resources for Phase 7.</p>
        <Link className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-5 font-medium text-primary-foreground" href="/resources"><Search className="mr-2 h-4 w-4" />Browse Marketplace</Link>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <SimpleList title="Saved Resources" items={data.savedResources.map((item) => ({ title: item.title, href: item.link ?? "/resources" }))} />
        <SimpleList title="Premium Wishlist" items={data.wishlist.map((item) => ({ title: item.title, href: item.link ?? "/resources" }))} />
        <SimpleList title="Recent Downloads" items={data.downloads.map((item) => ({ title: item.item.title, href: `/resources/${item.itemId}` }))} />
        <SimpleList title="Recently Viewed" items={data.recent.map((item) => ({ title: item.title, href: item.link ?? "/resources" }))} />
      </div>
      <ResourceSection title="Recommended For You" resources={data.recommended} />
    </div>
  );
}

function SimpleList({ title, items }: { title: string; items: { title: string; href: string }[] }) {
  return <Card className="p-5 shadow-soft"><h2 className="text-xl font-semibold">{title}</h2><div className="mt-5 space-y-3">{items.length ? items.map((item) => <Link className="block rounded-xl border border-border bg-background px-4 py-3 text-sm transition hover:border-sky-200 hover:bg-sky-50" href={item.href} key={`${title}-${item.href}-${item.title}`}>{item.title}</Link>) : <EmptyState icon={<Bookmark className="h-5 w-5" />} title={`No ${title.toLowerCase()} yet`} description="Your resource marketplace activity will appear here." />}</div></Card>;
}
