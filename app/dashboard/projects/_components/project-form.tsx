"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Project } from "@/db/schema";
import { Editor } from "@/components/shared/blog/editor";
import { useUploadThing } from "@/lib/uploadthing";
import { ImagePlus, Loader2 } from "lucide-react";

type ProjectFormProps = {
  project?: Project | null;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
        {children}
      </span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function FieldLabel({
  htmlFor,
  children,
  hint,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-foreground"
      >
        {children}
        {required && (
          <span className="ml-1 text-muted-foreground font-normal">*</span>
        )}
      </label>
      {hint && (
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function FormInput({
  id,
  className,
  ...props
}: React.ComponentProps<"input"> & { id: string }) {
  return (
    <Input
      id={id}
      className={cn(
        "bg-card border-border text-foreground placeholder:text-muted-foreground/50 h-10 text-sm",
        "focus-visible:border-foreground/40 focus-visible:ring-0 transition-colors",
        className
      )}
      {...props}
    />
  );
}

function FormTextarea({
  id,
  className,
  ...props
}: React.ComponentProps<"textarea"> & { id: string }) {
  return (
    <Textarea
      id={id}
      className={cn(
        "bg-card border-border text-foreground placeholder:text-muted-foreground/50 text-sm resize-none",
        "focus-visible:border-foreground/40 focus-visible:ring-0 transition-colors leading-relaxed",
        className
      )}
      {...props}
    />
  );
}

// Minimal editor stand-in — replace with your real <Editor /> import
// function RichTextEditor({
//   content,
//   onChange,
// }: {
//   content: string;
//   onChange: (html: string) => void;
// }) {
//   return (
//     <div className="rounded-lg border border-border bg-card overflow-hidden">
//       {/* Toolbar hint bar */}
//       <div className="flex items-center gap-2 border-b border-border px-4 py-2">
//         <span className="text-xs text-muted-foreground font-mono">
//           Type <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">/</kbd> for commands · <span className="opacity-60">drag ⠿ to reorder</span>
//         </span>
//       </div>
//       <textarea
//         value={content}
//         onChange={(e) => onChange(e.target.value)}
//         placeholder="Write your case study here…"
//         className={cn(
//           "w-full min-h-64 bg-transparent px-5 py-4 text-sm text-foreground placeholder:text-muted-foreground/40",
//           "outline-none resize-none leading-relaxed font-sans"
//         )}
//       />
//     </div>
//   );
// }

// ─── Main Form ────────────────────────────────────────────────────────────────

export function ProjectForm({ project }: ProjectFormProps) {
  const isNew = !project;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]?.ufsUrl) set("imageUrl", res[0].ufsUrl);
      setUploading(false);
    },
    onUploadError: () => setUploading(false),
  });

  const [form, setForm] = useState({
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    body: project?.body ?? "",
    dates: project?.dates ?? "",
    active: project?.active ?? false,
    videoUrl: project?.videoUrl ?? "",
    imageUrl: project?.imageUrl ?? "",
    siteUrl: project?.siteUrl ?? "",
    sourceUrl: project?.sourceUrl ?? "",
    role: project?.role ?? "",
    teamSize: project?.teamSize ?? "",
    technologies: (project?.technologies ?? []).join(", "),
    challenges: ((project?.challenges as string[]) ?? []).join("\n"),
    outcomes: ((project?.outcomes as string[]) ?? []).join("\n"),
    metaDescription: project?.metaDescription ?? "",
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      ...form,
      technologies: form.technologies
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      challenges: form.challenges
        .split("\n")
        .map((c) => c.trim())
        .filter(Boolean),
      outcomes: form.outcomes
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean),
    };

    try {
      const res = await fetch(
        isNew ? "/api/projects" : `/api/projects/${project!.id}`,
        {
          method: isNew ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Something went wrong.");
        return;
      }

      // Saved — optionally redirect or show success
    } catch (err) {
      console.error("Save error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12">

      {/* ── Core Info ──────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Core Info</SectionLabel>
        <div className="space-y-4">

          {/* Title + Slug */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="title" required>Title</FieldLabel>
              <FormInput
                id="title"
                placeholder="Real-Time Collaboration Suite"
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (isNew) set("slug", slugify(e.target.value));
                }}
                required
              />
            </div>
            <div>
              <FieldLabel htmlFor="slug" required>Slug</FieldLabel>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground font-mono">
                  /projects/
                </span>
                <FormInput
                  id="slug"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  className="pl-[5.5rem] font-mono text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Short description */}
          <div>
            <FieldLabel
              htmlFor="description"
              required
              hint="Shown on project cards. Keep it under 160 characters."
            >
              Short Description
            </FieldLabel>
            <FormTextarea
              id="description"
              rows={2}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              required
            />
          </div>

          {/* Dates + Active */}
          <div className="grid gap-4 sm:grid-cols-2 items-end">
            <div>
              <FieldLabel htmlFor="dates" required>Timeline</FieldLabel>
              <FormInput
                id="dates"
                placeholder="Jan 2025 – Mar 2025"
                value={form.dates}
                onChange={(e) => set("dates", e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 h-10">
              <label htmlFor="active" className="text-sm text-foreground cursor-pointer select-none">
                Show on homepage
              </label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => set("active", v)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Case Study ─────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Case Study</SectionLabel>
        <div className="space-y-4">

          {/* Rich text body */}
          <div>
            <FieldLabel
              htmlFor="body"
              hint="Full case study rendered on the recruiter detail page. Use / for slash commands."
            >
              Body
            </FieldLabel>
            <Editor
              content={form.body}
              onChange={(html) => set("body", html)}
            />
          </div>

          {/* Role + Team */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="role">Your Role</FieldLabel>
              <FormInput
                id="role"
                placeholder="Lead Full-Stack Developer"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="teamSize">Team Size</FieldLabel>
              <FormInput
                id="teamSize"
                placeholder="Solo / 3 people"
                value={form.teamSize}
                onChange={(e) => set("teamSize", e.target.value)}
              />
            </div>
          </div>

          {/* Challenges + Outcomes side by side on large screens */}
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <FieldLabel
                htmlFor="challenges"
                hint="One challenge per line."
              >
                Challenges
              </FieldLabel>
              <FormTextarea
                id="challenges"
                rows={5}
                placeholder={"Real-time audio pipeline\nConcurrent user handling with BullMQ"}
                value={form.challenges}
                onChange={(e) => set("challenges", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel
                htmlFor="outcomes"
                hint="One outcome per line."
              >
                Outcomes & Impact
              </FieldLabel>
              <FormTextarea
                id="outcomes"
                rows={5}
                placeholder={"Reduced processing time by 60%\nOnboarded 200+ users in first month"}
                value={form.outcomes}
                onChange={(e) => set("outcomes", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech & Links ───────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Tech & Links</SectionLabel>
        <div className="space-y-4">
          <div>
            <FieldLabel
              htmlFor="technologies"
              hint="Comma-separated list. e.g. Next.js, TypeScript, PostgreSQL"
            >
              Technologies
            </FieldLabel>
            <FormInput
              id="technologies"
              placeholder="Next.js, TypeScript, PostgreSQL, Redis"
              value={form.technologies}
              onChange={(e) => set("technologies", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FieldLabel htmlFor="siteUrl">Live Site URL</FieldLabel>
              <FormInput
                id="siteUrl"
                type="url"
                placeholder="https://example.com"
                value={form.siteUrl}
                onChange={(e) => set("siteUrl", e.target.value)}
              />
            </div>
            <div>
              <FieldLabel htmlFor="sourceUrl">Source / GitHub URL</FieldLabel>
              <FormInput
                id="sourceUrl"
                type="url"
                placeholder="https://github.com/you/repo"
                value={form.sourceUrl}
                onChange={(e) => set("sourceUrl", e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Media ──────────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>Media</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <FieldLabel htmlFor="imageUrl">Cover Image</FieldLabel>
            <div className="flex gap-2">
              <FormInput
                id="imageUrl"
                type="url"
                placeholder="https://cdn.example.com/cover.jpg or upload →"
                value={form.imageUrl}
                onChange={(e) => set("imageUrl", e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploading}
                onClick={() => imageInputRef.current?.click()}
                className="shrink-0 h-10"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  await startUpload([file]);
                  e.target.value = "";
                }}
              />
            </div>
            {form.imageUrl && (
              <div className="mt-2 rounded-md overflow-hidden border border-border aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.imageUrl}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                  onError={(e) =>
                    ((e.target as HTMLImageElement).style.display = "none")
                  }
                />
              </div>
            )}
          </div>
          <div>
            <FieldLabel htmlFor="videoUrl">Demo Video URL</FieldLabel>
            <FormInput
              id="videoUrl"
              type="url"
              placeholder="https://youtube.com/watch?v=…"
              value={form.videoUrl}
              onChange={(e) => set("videoUrl", e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── SEO ────────────────────────────────────────────────────────── */}
      <section>
        <SectionLabel>SEO</SectionLabel>
        <div>
          <FieldLabel
            htmlFor="metaDescription"
            hint="Shown in search engine results. Recommended: under 155 characters."
          >
            Meta Description
          </FieldLabel>
          <FormTextarea
            id="metaDescription"
            rows={2}
            placeholder="A concise SEO description of the project…"
            value={form.metaDescription}
            onChange={(e) => set("metaDescription", e.target.value)}
          />
          <p className="mt-1.5 text-right text-[11px] text-muted-foreground font-mono">
            {form.metaDescription.length} / 155
          </p>
        </div>
      </section>

      {/* ── Error ──────────────────────────────────────────────────────── */}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {/* ── Actions ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2 border-t border-border">
        <Button
          type="submit"
          disabled={loading}
          className="bg-foreground text-background hover:bg-foreground/90 px-6 text-sm font-medium"
        >
          {loading ? "Saving…" : isNew ? "Create Project" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:text-foreground text-sm"
          onClick={() => { }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
