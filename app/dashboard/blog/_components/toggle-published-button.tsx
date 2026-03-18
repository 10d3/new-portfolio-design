"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function TogglePublishedButton({ id, published }: { id: string; published: boolean }) {
  const router = useRouter();
  async function toggle() {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
  }
  return (
    <Button size="sm" variant="ghost" onClick={toggle} title={published ? "Unpublish" : "Publish"}>
      {published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
    </Button>
  );
}
