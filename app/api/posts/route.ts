import { db } from "@/db";
import { posts } from "@/db/schema";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET() {
  const all = await db.select().from(posts);
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [post] = await db.insert(posts).values(body).returning();
    revalidatePath("/blog");
    return NextResponse.json(post, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
