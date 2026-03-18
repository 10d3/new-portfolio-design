import { db } from "@/db";
import { posts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  try {
    const body = await request.json();
    const [updated] = await db
      .update(posts)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    revalidatePath("/blog");
    if (updated?.slug) revalidatePath(`/blog/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const [updated] = await db
    .update(posts)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(posts.id, id))
    .returning();
  revalidatePath("/blog");
  if (updated?.slug) revalidatePath(`/blog/${updated.slug}`);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/blog");
  return NextResponse.json({ success: true });
}
