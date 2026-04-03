import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(request: Request, { params }: Params) {

  const guard = await requireAuth();
  if (guard.error) return guard.error;

  const { id } = await params;
  try {
    const body = await request.json();
    const [updated] = await db
      .update(projects)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    revalidatePath("/");
    revalidatePath("/projects");
    if (updated?.slug) revalidatePath(`/projects/${updated.slug}`);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PATCH(request: Request, { params }: Params) {

  const guard = await requireAuth();
  if (guard.error) return guard.error;

  const { id } = await params;
  const body = await request.json();
  const [updated] = await db
    .update(projects)
    .set({ ...body, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning();
  revalidatePath("/");
  revalidatePath("/projects");
  if (updated?.slug) revalidatePath(`/projects/${updated.slug}`);
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {

  const guard = await requireAuth();
  if (guard.error) return guard.error;
  
  const { id } = await params;
  await db.delete(projects).where(eq(projects.id, id));
  revalidatePath("/");
  revalidatePath("/projects");
  return NextResponse.json({ success: true });
}
