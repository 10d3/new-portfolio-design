import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProjectForm } from "../_components/project-form";
// import { ProjectForm } from "../_components/project-form";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const isNew = id === "new";

  let project = null;
  if (!isNew) {
    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.id, id))
      .limit(1);
    if (!result[0]) notFound();
    project = result[0];
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">
          {isNew ? "New Project" : "Edit Project"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isNew
            ? "Fill in the details. The slug page is what recruiters will see."
            : "Update project details."}
        </p>
      </div>
      <ProjectForm project={project} />
    </div>
  );
}
