import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { ImageUploader } from "./image-uploader";
import { Plus, Pencil, Trash2, FileText, Loader2, Globe, EyeOff } from "lucide-react";

interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  author?: string | null;
  category: string;
  tags: string[];
  featuredImage?: string | null;
  readingTimeMinutes?: number | null;
  publishedAt?: string | null;
  updatedAt: string;
}

type ModalData = Omit<BlogPost, "id"> & { id?: number };

const empty: ModalData = {
  slug: "", title: "", excerpt: "", content: "", author: "",
  category: "", tags: [], featuredImage: "", readingTimeMinutes: undefined, publishedAt: null,
  updatedAt: new Date().toISOString(),
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
          rows={8}
          className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none font-mono"
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

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getBlogPosts().then(setPosts).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setField = <K extends keyof ModalData>(key: K, value: ModalData[K]) =>
    setModal((m) => m ? { ...m, [key]: value } : m);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      const payload = { ...modal, readingTimeMinutes: modal.readingTimeMinutes ? Number(modal.readingTimeMinutes) : null };
      if (modal.id) {
        await adminApi.updateBlogPost(modal.id, payload);
      } else {
        await adminApi.createBlogPost(payload);
      }
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this blog post?")) return;
    await adminApi.deleteBlogPost(id);
    setPosts((ps) => ps.filter((p) => p.id !== id));
  };

  const togglePublish = async (post: BlogPost) => {
    const publishedAt = post.publishedAt ? null : new Date().toISOString();
    await adminApi.updateBlogPost(post.id, { ...post, publishedAt });
    setPosts((ps) => ps.map((p) => p.id === post.id ? { ...p, publishedAt } : p));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Blog Posts</h1>
            <p className="text-sm text-muted-foreground mt-1">{posts.length} total</p>
          </div>
          <button
            onClick={() => setModal({ ...empty })}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Post
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No blog posts yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((p) => (
              <div key={p.id} className="bg-background rounded-xl border border-border p-4 flex items-center gap-4">
                {p.featuredImage ? (
                  <img src={p.featuredImage} alt={p.title} className="w-14 h-14 object-cover rounded-lg border border-border shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <FileText className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{p.title}</span>
                    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      p.publishedAt
                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {p.publishedAt ? <Globe className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {p.publishedAt ? "Published" : "Draft"}
                    </span>
                    {p.category && <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{p.category}</span>}
                  </div>
                  {p.excerpt && <p className="text-sm text-muted-foreground truncate mt-0.5">{p.excerpt}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(p.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublish(p)}
                    className={`text-xs px-2.5 py-1 rounded-md border transition-all ${
                      p.publishedAt
                        ? "border-border text-muted-foreground hover:text-destructive hover:border-destructive"
                        : "border-primary/30 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {p.publishedAt ? "Unpublish" : "Publish"}
                  </button>
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

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-background rounded-xl border border-border w-full max-w-2xl my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">{modal.id ? "Edit Post" : "New Post"}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title *" value={modal.title} onChange={(v) => setField("title", v)} />
                <Field label="Slug *" value={modal.slug} onChange={(v) => setField("slug", v)} placeholder="my-post" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Category *" value={modal.category} onChange={(v) => setField("category", v)} />
                <Field label="Author" value={modal.author ?? ""} onChange={(v) => setField("author", v)} />
              </div>
              <Field label="Excerpt" value={modal.excerpt ?? ""} onChange={(v) => setField("excerpt", v)} placeholder="Short description…" />
              <Field label="Content (Markdown)" value={modal.content ?? ""} onChange={(v) => setField("content", v)} multiline placeholder="## Heading\n\nYour content here…" />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(modal.tags ?? []).join(", ")}
                  onChange={(e) => setField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="react, typescript, web"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
              <ImageUploader
                label="Featured Image"
                value={modal.featuredImage ?? ""}
                onChange={(v) => setField("featuredImage", v)}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-all">Cancel</button>
              <button
                onClick={save}
                disabled={saving || !modal.title || !modal.slug}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.id ? "Save Changes" : "Create Post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
