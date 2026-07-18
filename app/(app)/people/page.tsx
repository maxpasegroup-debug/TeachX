import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { getPeopleDirectory } from "@/services/people-service";

export default async function PeoplePage() {
  const session = await auth();
  const directory = await getPeopleDirectory(session?.user.institutionId);

  return (
    <>
      <PageHeader description="A simple view of everyone connected to the institution." eyebrow="Directory" title="People" />
      <section className="grid gap-4 md:grid-cols-4">
        {directory.counts.map((item) => <Card className="p-5" key={item.role}><p className="text-sm text-muted-foreground">{item.role}</p><p className="mt-3 text-3xl font-semibold">{item.count}</p></Card>)}
      </section>
      <Card className="mt-6 divide-y divide-border">
        {directory.people.length ? directory.people.map((person) => (
          <div className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between" key={person.id}>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-base font-semibold">{person.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <p className="text-base font-semibold">{person.name}</p>
                <p className="text-sm text-muted-foreground">{person.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {person.roles.map(({ role }) => <span className="rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground" key={role.id}>{role.name}</span>)}
            </div>
          </div>
        )) : <div className="p-8 text-muted-foreground">No people found.</div>}
      </Card>
    </>
  );
}
