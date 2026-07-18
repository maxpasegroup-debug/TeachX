import { Bookmark, Clock, Search, Star } from "lucide-react";
import type { PromptTemplate } from "@prisma/client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { favoriteAIItemAction } from "@/features/ai-studio/actions";

export function PromptLibraryPage({ templates }: { templates: PromptTemplate[] }) {
  const categories = ["Planning", "Assessment", "Communication", "Reports", "Personal Templates", "Institution Templates"];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-border bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6 shadow-soft sm:p-8">
        <h1 className="text-4xl font-semibold tracking-tight">Prompt Library</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">Search categories, favorites, recently used prompts, institution templates, and personal templates.</p>
        <div className="mt-6 flex h-12 max-w-xl items-center gap-3 rounded-xl border border-border bg-surface px-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Search prompts" aria-label="Search prompts" />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((category) => <Card className="p-5 shadow-soft" key={category}><Bookmark className="h-5 w-5 text-sky-700" /><p className="mt-4 font-semibold">{category}</p><p className="mt-1 text-sm text-muted-foreground">Prompt category</p></Card>)}
      </div>

      {templates.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {templates.map((template) => (
            <Card className="p-5 shadow-soft" key={template.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-sky-700">{template.institutionId ? "Institution Template" : "Global Template"}</p>
                  <h2 className="mt-2 text-xl font-semibold">{template.name}</h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{template.key}</p>
                </div>
                <Star className="h-5 w-5 text-sky-700" />
              </div>
              <pre className="mt-4 max-h-32 overflow-hidden whitespace-pre-wrap rounded-xl bg-background p-4 text-xs leading-6 text-muted-foreground">{template.userPrompt}</pre>
              <form action={favoriteAIItemAction} className="mt-4">
                <input name="entityId" type="hidden" value={template.id} />
                <input name="title" type="hidden" value={template.name} />
                <input name="type" type="hidden" value="prompt" />
                <button className="rounded-full border border-border px-3 py-1 text-xs font-medium" type="submit"><Star className="mr-1 inline h-3 w-3" />Favorite</button>
              </form>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState icon={<Clock className="h-5 w-5" />} title="No prompt templates yet" description="Institution and personal prompt templates will appear here as your AI Studio grows." />
      )}
    </div>
  );
}
