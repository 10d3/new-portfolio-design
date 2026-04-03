import { db } from "@/db";
import { projects } from "@/db/schema";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const all = await db.select().from(projects);
  return NextResponse.json(all);
}

export async function POST(request: Request) {

  const guard = await requireAuth();
  if (guard.error) return guard.error;

  try {
    const body = await request.json();
    const [project] = await db.insert(projects).values(body).returning();
    revalidatePath("/");
    revalidatePath("/projects");
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
