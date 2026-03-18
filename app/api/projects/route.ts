import { db } from "@/db";
import { projects } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  const all = await db.select().from(projects);
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [project] = await db.insert(projects).values(body).returning();
    return NextResponse.json(project, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
