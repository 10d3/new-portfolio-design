import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BlogForm } from "../_components/blog-form";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let post = null;
  if (!isNew) {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    if (!result[0]) notFound();
    post = result[0];
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">
          {isNew ? "New Post" : "Edit Post"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isNew
            ? "Write your blog post. Use '/' inside the editor for slash commands."
            : "Update your blog post."}
        </p>
      </div>
      <BlogForm post={post} />
    </div>
  );
}
