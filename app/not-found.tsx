import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="max-w-lg text-center">
        <p className="text-sm font-medium text-muted-foreground">Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page is not available.</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">The link may be old, or your institution may not use this area yet.</p>
        <Button className="mt-8" type="button"><a href="/dashboard">Go to dashboard</a></Button>
      </section>
    </main>
  );
}
