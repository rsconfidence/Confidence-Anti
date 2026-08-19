import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { ImageUploader } from "./image-uploader";
import { Plus, Pencil, Trash2, Star, ExternalLink, Loader2, FolderKanban } from "lucide-react";

interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  longDescription?: string | null;
  featured: boolean;
  featuredImage?: string | null;
  galleryImages?: string[];
  techStack: string[];
  category: string;
  year: number;
  duration?: string | null;
  teamSize?: number | null;
  repositoryLink?: string | null;
  liveLink?: string | null;
  caseStudySlug?: string | null;
}

type ModalData = Omit<Project, "id"> & { id?: number };

const empty: ModalData = {
  slug: "", title: "", description: "", longDescription: "",
  featured: false, featuredImage: "", galleryImages: [],
  techStack: [], category: "", year: new Date().getFullYear(),
  duration: "", teamSize: undefined, repositoryLink: "", liveLink: "", caseStudySlug: "",
};

function Field({ label, value, onChange, type = "text", multiline, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; multiline?: boolean; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {multiline ? (
        <textarea
          value={value as string}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      )}
    </div>
  );
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getProjects().then(setProjects).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setField = <K extends keyof ModalData>(key: K, value: ModalData[K]) =>
    setModal((m) => m ? { ...m, [key]: value } : m);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const payload = {
        ...modal,
        techStack: modal.techStack,
        year: Number(modal.year),
        teamSize: modal.teamSize ? Number(modal.teamSize) : null,
      };
      if (modal.id) {
        await adminApi.updateProject(modal.id, payload);
      } else {
        await adminApi.createProject(payload);
      }
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this project?")) return;
    await adminApi.deleteProject(id);
    setProjects((ps) => ps.filter((p) => p.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Projects</h1>
            <p className="text-sm text-muted-foreground mt-1">{projects.length} total</p>
          </div>
          <button
            onClick={() => setModal({ ...empty })}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderKanban className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No projects yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="bg-background rounded-xl border border-border p-4 flex items-center gap-4">
                {p.featuredImage ? (
                  <img src={p.featuredImage} alt={p.title} className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <FolderKanban className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{p.title}</span>
                    {p.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.category}</span>
                    <span className="text-xs text-muted-foreground">{p.year}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">{p.description}</p>
                  {p.techStack?.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {p.techStack.slice(0, 4).map((t) => (
                        <span key={t} className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.liveLink && (
                    <a href={p.liveLink} target="_blank" rel="noopener noreferrer" className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => setModal({ ...p })} className="p-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-background rounded-xl border border-border w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">{modal.id ? "Edit Project" : "New Project"}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title *" value={modal.title} onChange={(v) => setField("title", v)} />
                <Field label="Slug *" value={modal.slug} onChange={(v) => setField("slug", v)} placeholder="my-project" />
              </div>
              <Field label="Description *" value={modal.description} onChange={(v) => setField("description", v)} multiline />
              <Field label="Long Description" value={modal.longDescription ?? ""} onChange={(v) => setField("longDescription", v)} multiline />
              <div className="grid grid-cols-3 gap-4">
                <Field label="Category *" value={modal.category} onChange={(v) => setField("category", v)} />
                <Field label="Year *" value={modal.year} onChange={(v) => setField("year", v as unknown as number)} type="number" />
                <Field label="Duration" value={modal.duration ?? ""} onChange={(v) => setField("duration", v)} placeholder="3 months" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Repository URL" value={modal.repositoryLink ?? ""} onChange={(v) => setField("repositoryLink", v)} type="url" />
                <Field label="Live URL" value={modal.liveLink ?? ""} onChange={(v) => setField("liveLink", v)} type="url" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tech Stack (comma-separated)</label>
                <input
                  type="text"
                  value={(modal.techStack ?? []).join(", ")}
                  onChange={(e) => setField("techStack", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <ImageUploader
                label="Featured Image"
                value={modal.featuredImage ?? ""}
                onChange={(v) => setField("featuredImage", v)}
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={modal.featured}
                  onChange={(e) => setField("featured", e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <label htmlFor="featured" className="text-sm">Featured on homepage</label>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-all">Cancel</button>
              <button
                onClick={save}
                disabled={saving || !modal.title || !modal.slug}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.id ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
