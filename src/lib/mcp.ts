import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { db } from "@/db";
import { posts, projects } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createMcpServer(): Server {
  const server = new Server(
    {
      name: "portfolio-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // ─── Tool Definitions ───────────────────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        // ─── Blog Tools ───
        {
          name: "list_blogs",
          description: "List all blog posts and drafts (shows ID, title, slug, summary, published status).",
          inputSchema: {
            type: "object",
            properties: {
              limit: { type: "number", description: "Max posts to return (default: 20)" },
            },
          },
        },
        {
          name: "get_blog",
          description: "Get the full content and details of a specific blog post by ID or slug.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "The UUID of the post" },
              slug: { type: "string", description: "The URL slug of the post" },
            },
          },
        },
        {
          name: "create_blog_draft",
          description:
            "Create a new blog draft in Herley's portfolio. Follows the blog structure: Hook -> Problem -> Solution -> Steps with code -> Conclusion.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Punchy article title" },
              slug: { type: "string", description: "Optional custom URL slug (auto-generated if omitted)" },
              summary: { type: "string", description: "1-sentence hook / summary" },
              content: {
                type: "string",
                description: "The full article body in standard Markdown (headings, code blocks, lists)",
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "6 to 10 relevant tech keywords/tags",
              },
              imageUrl: { type: "string", description: "Optional cover image URL" },
              published: {
                type: "boolean",
                description: "Whether to publish immediately. Defaults to false (draft).",
              },
            },
            required: ["title", "summary", "content"],
          },
        },
        {
          name: "edit_blog",
          description: "Edit an existing blog post or draft by ID or slug.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Post ID to update (either id or slug is required)" },
              slug: { type: "string", description: "Post slug to update (either id or slug is required)" },
              title: { type: "string", description: "New title" },
              newSlug: { type: "string", description: "New slug (if renaming slug)" },
              summary: { type: "string", description: "New 1-sentence summary" },
              content: { type: "string", description: "New Markdown content" },
              keywords: { type: "array", items: { type: "string" }, description: "New keywords list" },
              imageUrl: { type: "string", description: "New cover image URL" },
              published: { type: "boolean", description: "Toggle published status (true or false)" },
            },
          },
        },

        // ─── Project Tools ───
        {
          name: "list_projects",
          description: "List all portfolio projects (shows ID, title, slug, active status, technologies).",
          inputSchema: {
            type: "object",
            properties: {
              limit: { type: "number", description: "Max projects to return (default: 20)" },
            },
          },
        },
        {
          name: "get_project",
          description: "Get the full details of a specific portfolio project by ID or slug.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Project UUID" },
              slug: { type: "string", description: "Project URL slug" },
            },
          },
        },
        {
          name: "create_project",
          description: "Create a new portfolio project case study for recruiter display.",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string", description: "Project title" },
              slug: { type: "string", description: "Optional custom URL slug (auto-generated if omitted)" },
              description: { type: "string", description: "Short description for the homepage card" },
              dates: { type: "string", description: "e.g. 'Jan 2024 - Present' or '2024'" },
              technologies: {
                type: "array",
                items: { type: "string" },
                description: "Array of tech (e.g. ['Next.js 15', 'React 19', 'PostgreSQL', 'Drizzle'])",
              },
              role: { type: "string", description: "Your role (e.g. 'Lead Full-Stack Developer' or 'Creator')" },
              teamSize: { type: "string", description: "e.g. 'Solo' or '3 developers'" },
              challenges: {
                type: "array",
                items: { type: "string" },
                description: "Key challenges you solved (list of bullet points)",
              },
              outcomes: {
                type: "array",
                items: { type: "string" },
                description: "Measurable outcomes / impact (e.g. 'Reduced loading time by 50%')",
              },
              body: { type: "string", description: "Full case-study overview / description" },
              siteUrl: { type: "string", description: "Live website / demo URL" },
              sourceUrl: { type: "string", description: "GitHub / repository URL" },
              imageUrl: { type: "string", description: "Hero / preview image URL" },
              active: { type: "boolean", description: "Display on portfolio homepage (default: false)" },
            },
            required: ["title", "description", "dates", "technologies"],
          },
        },
        {
          name: "edit_project",
          description: "Edit an existing portfolio project case study by ID or slug.",
          inputSchema: {
            type: "object",
            properties: {
              id: { type: "string", description: "Project ID to update (either id or slug is required)" },
              slug: { type: "string", description: "Project slug to update (either id or slug is required)" },
              title: { type: "string", description: "New title" },
              newSlug: { type: "string", description: "New slug" },
              description: { type: "string", description: "New short card description" },
              dates: { type: "string", description: "New dates string" },
              technologies: { type: "array", items: { type: "string" }, description: "New tech stack list" },
              role: { type: "string", description: "New role description" },
              teamSize: { type: "string", description: "New team size" },
              challenges: { type: "array", items: { type: "string" }, description: "New challenges list" },
              outcomes: { type: "array", items: { type: "string" }, description: "New outcomes list" },
              body: { type: "string", description: "New case-study text" },
              siteUrl: { type: "string", description: "New live site URL" },
              sourceUrl: { type: "string", description: "New repo URL" },
              imageUrl: { type: "string", description: "New preview image URL" },
              active: { type: "boolean", description: "Toggle active on homepage (true/false)" },
            },
          },
        },
      ],
    };
  });

  // ─── Tool Execution ─────────────────────────────────────────────────────
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args = {} } = request.params;

    try {
      if (name === "list_blogs") {
        const limit = Number(args.limit) || 20;
        const allPosts = await db
          .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            summary: posts.summary,
            published: posts.published,
            createdAt: posts.createdAt,
          })
          .from(posts)
          .orderBy(desc(posts.createdAt))
          .limit(limit);

        return {
          content: [{ type: "text", text: JSON.stringify(allPosts, null, 2) }],
        };
      }

      if (name === "get_blog") {
        const { id, slug } = args as { id?: string; slug?: string };
        if (!id && !slug) throw new Error("Must provide either 'id' or 'slug'");

        const condition = id ? eq(posts.id, id) : eq(posts.slug, slug!);
        const [post] = await db.select().from(posts).where(condition).limit(1);

        if (!post) throw new Error(`Post not found with ${id ? `id '${id}'` : `slug '${slug}'`}`);

        return {
          content: [{ type: "text", text: JSON.stringify(post, null, 2) }],
        };
      }

      if (name === "create_blog_draft") {
        const {
          title,
          slug,
          summary,
          content,
          keywords = [],
          imageUrl,
          published = false,
        } = args as any;

        const finalSlug = slug ? slugify(slug) : slugify(title);
        const now = new Date();

        const [newPost] = await db
          .insert(posts)
          .values({
            title,
            slug: finalSlug,
            summary,
            content,
            keywords,
            imageUrl: imageUrl || null,
            published,
            publishedAt: published ? now : null,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return {
          content: [
            {
              type: "text",
              text: `✅ Blog draft created!\n- ID: ${newPost.id}\n- Title: "${newPost.title}"\n- Slug: /blog/${newPost.slug}\n- Status: ${newPost.published ? "Published" : "Draft"}\n- Edit in Dashboard: /dashboard/blog/${newPost.id}`,
            },
          ],
        };
      }

      if (name === "edit_blog") {
        const {
          id,
          slug,
          title,
          newSlug,
          summary,
          content,
          keywords,
          imageUrl,
          published,
        } = args as any;

        if (!id && !slug) throw new Error("Must provide either 'id' or 'slug' to edit a post");

        const condition = id ? eq(posts.id, id) : eq(posts.slug, slug);

        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (title !== undefined) updateData.title = title;
        if (newSlug !== undefined) updateData.slug = slugify(newSlug);
        if (summary !== undefined) updateData.summary = summary;
        if (content !== undefined) updateData.content = content;
        if (keywords !== undefined) updateData.keywords = keywords;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (published !== undefined) {
          updateData.published = published;
          if (published) updateData.publishedAt = new Date();
        }

        const [updated] = await db
          .update(posts)
          .set(updateData)
          .where(condition)
          .returning();

        if (!updated) throw new Error("Blog post not found to update");

        return {
          content: [
            {
              type: "text",
              text: `✅ Blog post updated successfully!\n- ID: ${updated.id}\n- Title: "${updated.title}"\n- Slug: /blog/${updated.slug}\n- Status: ${updated.published ? "Published" : "Draft"}`,
            },
          ],
        };
      }

      if (name === "list_projects") {
        const limit = Number(args.limit) || 20;
        const allProjects = await db
          .select({
            id: projects.id,
            title: projects.title,
            slug: projects.slug,
            description: projects.description,
            active: projects.active,
            technologies: projects.technologies,
            dates: projects.dates,
          })
          .from(projects)
          .orderBy(desc(projects.createdAt))
          .limit(limit);

        return {
          content: [{ type: "text", text: JSON.stringify(allProjects, null, 2) }],
        };
      }

      if (name === "get_project") {
        const { id, slug } = args as { id?: string; slug?: string };
        if (!id && !slug) throw new Error("Must provide either 'id' or 'slug'");

        const condition = id ? eq(projects.id, id) : eq(projects.slug, slug!);
        const [proj] = await db.select().from(projects).where(condition).limit(1);

        if (!proj) throw new Error(`Project not found with ${id ? `id '${id}'` : `slug '${slug}'`}`);

        return {
          content: [{ type: "text", text: JSON.stringify(proj, null, 2) }],
        };
      }

      if (name === "create_project") {
        const {
          title,
          slug,
          description,
          dates,
          technologies = [],
          role,
          teamSize,
          challenges = [],
          outcomes = [],
          body,
          siteUrl,
          sourceUrl,
          imageUrl,
          active = false,
        } = args as any;

        const finalSlug = slug ? slugify(slug) : slugify(title);
        const now = new Date();

        const [newProject] = await db
          .insert(projects)
          .values({
            title,
            slug: finalSlug,
            description,
            dates,
            technologies,
            role: role || null,
            teamSize: teamSize || null,
            challenges,
            outcomes,
            body: body || null,
            siteUrl: siteUrl || null,
            sourceUrl: sourceUrl || null,
            imageUrl: imageUrl || null,
            active,
            createdAt: now,
            updatedAt: now,
          })
          .returning();

        return {
          content: [
            {
              type: "text",
              text: `✅ Project created!\n- ID: ${newProject.id}\n- Title: "${newProject.title}"\n- Slug: /projects/${newProject.slug}\n- Active on Homepage: ${newProject.active ? "Yes" : "No (Draft)"}\n- Edit in Dashboard: /dashboard/projects/${newProject.id}`,
            },
          ],
        };
      }

      if (name === "edit_project") {
        const {
          id,
          slug,
          title,
          newSlug,
          description,
          dates,
          technologies,
          role,
          teamSize,
          challenges,
          outcomes,
          body,
          siteUrl,
          sourceUrl,
          imageUrl,
          active,
        } = args as any;

        if (!id && !slug) throw new Error("Must provide either 'id' or 'slug' to edit a project");

        const condition = id ? eq(projects.id, id) : eq(projects.slug, slug);

        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };
        if (title !== undefined) updateData.title = title;
        if (newSlug !== undefined) updateData.slug = slugify(newSlug);
        if (description !== undefined) updateData.description = description;
        if (dates !== undefined) updateData.dates = dates;
        if (technologies !== undefined) updateData.technologies = technologies;
        if (role !== undefined) updateData.role = role;
        if (teamSize !== undefined) updateData.teamSize = teamSize;
        if (challenges !== undefined) updateData.challenges = challenges;
        if (outcomes !== undefined) updateData.outcomes = outcomes;
        if (body !== undefined) updateData.body = body;
        if (siteUrl !== undefined) updateData.siteUrl = siteUrl;
        if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (active !== undefined) updateData.active = active;

        const [updated] = await db
          .update(projects)
          .set(updateData)
          .where(condition)
          .returning();

        if (!updated) throw new Error("Project not found to update");

        return {
          content: [
            {
              type: "text",
              text: `✅ Project updated successfully!\n- ID: ${updated.id}\n- Title: "${updated.title}"\n- Slug: /projects/${updated.slug}\n- Active on Homepage: ${updated.active ? "Yes" : "No"}`,
            },
          ],
        };
      }

      throw new Error(`Tool '${name}' not recognized.`);
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error: ${err.message}` }],
      };
    }
  });

  return server;
}
