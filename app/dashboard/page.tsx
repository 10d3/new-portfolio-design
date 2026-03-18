import { db } from "@/db";
import { projects, posts } from "@/db/schema";
import { sql } from "drizzle-orm";
import { FolderKanban, BookOpen, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const [projectCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(projects);
  const [postCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts);
  const [publishedCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(posts)
    .where(sql`published = true`);

  const stats = [
    {
      label: "Total Projects",
      value: projectCount.count,
      icon: FolderKanban,
      href: "/dashboard/projects",
    },
    {
      label: "Blog Posts",
      value: postCount.count,
      icon: BookOpen,
      href: "/dashboard/blog",
    },
    {
      label: "Published Posts",
      value: publishedCount.count,
      icon: Activity,
      href: "/dashboard/blog",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          Manage your portfolio content
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{Number(value)}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/dashboard/projects/new">+ New Project</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/blog/new">+ New Post</Link>
        </Button>
      </div>
    </div>
  );
}
