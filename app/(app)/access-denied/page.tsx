import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AccessDeniedPage() {
  return (
    <Card className="mx-auto max-w-2xl p-10 text-center">
      <p className="text-sm font-medium text-muted-foreground">Permission needed</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight">You cannot open this area.</h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">Your account is active, but this page needs another role. Please ask your administrator if this looks wrong.</p>
      <Button className="mt-8" type="button"><a href="/dashboard">Go to dashboard</a></Button>
    </Card>
  );
}
