"use client";
import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
export default function StudentError({reset}:{error:Error;reset:()=>void}) {
  return <Card className="mx-auto max-w-xl p-8 text-center"><WifiOff className="mx-auto h-8 w-8 text-indigo-600"/><h1 className="mt-4 text-2xl font-semibold">Your learning space could not load</h1><p className="mt-2 text-muted-foreground">Check your connection. Your saved LearnX profile is safe, and you can retry when you are online.</p><Button className="mt-6" onClick={reset}>Try again</Button></Card>;
}
