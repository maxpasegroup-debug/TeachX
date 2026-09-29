import { GuruLoader } from "@/components/brand/guru-loader";

export default function Loading() {
  return (
    <main aria-live="polite" className="tx-public-page relative flex min-h-screen items-center justify-center overflow-hidden px-6" role="status">
      <section className="text-center">
        <GuruLoader />
        <p className="sr-only">Preparing Your Workspace</p>
      </section>
    </main>
  );
}
