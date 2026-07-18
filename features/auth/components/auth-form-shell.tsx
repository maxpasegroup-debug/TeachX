import type { ReactNode } from "react";

type AuthFormShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthFormShell({ title, subtitle, children }: AuthFormShellProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <section className="w-full max-w-md">
        <div className="mb-10">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-semibold text-white shadow-soft">
            TX
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-3 text-lg leading-8 text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
