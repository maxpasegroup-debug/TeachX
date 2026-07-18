import Link from "next/link";
import { Archive, Bookmark, BookOpenCheck, Copy, Download, Eye, FileText, Filter, Layers3, Lock, Search, Share2, Sparkles, Trash2, UploadCloud } from "lucide-react";

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
  deleteLearningResourceAction,
  downloadLearningResourceAction,
  duplicateLearningResourceAction,
  publishLearningResourceAction,
  saveAIConversationAsResourceAction,
  updateResourceStatusAction,
  wishlistLearningResourceAction
} from "@/features/learning-marketplace/actions";
import { getInitials } from "@/lib/utils";
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
              <form action={isPremium && !canAccess ? createResourcePurchaseOrderAction : downloadLearningResourceAction}>
                <input name="resourceId" type="hidden" value={resource.id} />
                <input name="amount" type="hidden" value="199" />
                <Button className="w-full" type="submit">{isPremium && !canAccess ? <Lock className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}{isPremium && !canAccess ? "Create Purchase Order" : "Download Resource"}</Button>
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
              <Button className="w-full" type="button" variant="secondary"><Share2 className="mr-2 h-4 w-4" />Share Placeholder</Button>
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
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <Badge>Teacher Resources</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight">Publish your knowledge marketplace library.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Create, draft, publish, archive, duplicate, and track resources. Payments and commission stay locked for Phase 7.</p>
      </section>
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatMini label="Published" value={data.stats.published.toString()} />
        <StatMini label="Drafts" value={data.stats.drafts.toString()} />
        <StatMini label="Archived" value={data.stats.archived.toString()} />
        <StatMini label="Downloads" value={data.stats.downloads.toString()} />
        <StatMini label="Bookmarks" value={data.stats.bookmarks.toString()} />
        <StatMini label="Views" value={data.stats.views.toString()} />
      </div>
      <ResourcePublisher data={data} />
      <AIToResourceForm data={data} />
      <TeacherResourceTable resources={data.resources} />
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

function TeacherResourceTable({ resources }: { resources: TeacherLibrary["resources"] }) {
  return (
    <Card className="p-5 shadow-soft">
      <h2 className="text-xl font-semibold">My Resources</h2>
      <div className="mt-5 space-y-3">
        {resources.length ? resources.map((resource) => {
          const metadata = getResourceMetadata(resource);
          return (
            <div className="grid gap-4 rounded-2xl border border-border bg-background p-4 lg:grid-cols-[1fr_auto] lg:items-center" key={resource.id}>
              <div>
                <div className="flex flex-wrap items-center gap-2"><Badge>{resource.status}</Badge><span className="text-sm text-muted-foreground">{metadata.category ?? resource.type.replaceAll("_", " ")}</span></div>
                <h3 className="mt-2 font-semibold">{resource.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{resource.downloads.length} downloads, {resource.analytics?.views ?? 0} views</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {resource.status !== "PUBLISHED" ? <ResourceStatusButton resourceId={resource.id} intent="publish" label="Publish" /> : <ResourceStatusButton resourceId={resource.id} intent="archive" label="Archive" icon={<Archive className="h-4 w-4" />} />}
                <IconAction action={duplicateLearningResourceAction} resourceId={resource.id} label="Duplicate" icon={<Copy className="h-4 w-4" />} />
                {resource.status !== "PUBLISHED" ? <IconAction action={deleteLearningResourceAction} resourceId={resource.id} label="Delete" icon={<Trash2 className="h-4 w-4" />} /> : null}
                {resource.status === "PUBLISHED" ? <Link className="rounded-xl border border-border px-3 py-2 text-sm" href={`/resources/${resource.id}`}>Preview</Link> : null}
              </div>
            </div>
          );
        }) : <EmptyState icon={<Layers3 className="h-5 w-5" />} title="No resources yet" description="Publish your first resource or save an AI Studio output as a draft." />}
      </div>
    </Card>
  );
}

function ResourceStatusButton({ resourceId, intent, label, icon }: { resourceId: string; intent: string; label: string; icon?: React.ReactNode }) {
  return <IconAction action={updateResourceStatusAction} extra={{ intent }} resourceId={resourceId} label={label} icon={icon} />;
}

function IconAction({ action, resourceId, label, icon, extra }: { action: (formData: FormData) => void | Promise<void>; resourceId: string; label: string; icon?: React.ReactNode; extra?: Record<string, string> }) {
  return (
    <form action={action}>
      <input name="resourceId" type="hidden" value={resourceId} />
      {extra ? Object.entries(extra).map(([key, item]) => <input key={key} name={key} type="hidden" value={item} />) : null}
      <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm transition hover:bg-sky-50" type="submit">{icon}{label}</button>
    </form>
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
