import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { ImageUploader } from "./image-uploader";
import { Plus, Pencil, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";

interface GalleryItem {
  id: number;
  title?: string | null;
  description?: string | null;
  imageUrl: string;
  thumbnailUrl?: string | null;
  category: string;
  tags: string[];
  altText?: string | null;
  createdAt: string;
}

type ModalData = Omit<GalleryItem, "id" | "createdAt"> & { id?: number };

const empty: ModalData = {
  title: "", description: "", imageUrl: "", thumbnailUrl: "",
  category: "General", tags: [], altText: "",
};

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
      />
    </div>
  );
}

export default function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalData | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => adminApi.getGallery().then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const setField = <K extends keyof ModalData>(key: K, value: ModalData[K]) =>
    setModal((m) => m ? { ...m, [key]: value } : m);

  const save = async () => {
    if (!modal) return;
    setSaving(true);
    try {
      if (modal.id) {
        await adminApi.updateGalleryItem(modal.id, modal);
      } else {
        await adminApi.createGalleryItem(modal);
      }
      await load();
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this image?")) return;
    await adminApi.deleteGalleryItem(id);
    setItems((is) => is.filter((i) => i.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Gallery</h1>
            <p className="text-sm text-muted-foreground mt-1">{items.length} images</p>
          </div>
          <button
            onClick={() => setModal({ ...empty })}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Image
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No gallery images yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {items.map((item) => (
              <div key={item.id} className="group relative bg-muted rounded-xl overflow-hidden border border-border aspect-square">
                <img
                  src={item.thumbnailUrl ?? item.imageUrl}
                  alt={item.altText ?? item.title ?? ""}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                  <div>
                    {item.title && <p className="text-white text-xs font-medium truncate">{item.title}</p>}
                    <p className="text-white/70 text-xs">{item.category}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setModal({ id: item.id, title: item.title ?? "", description: item.description ?? "", imageUrl: item.imageUrl, thumbnailUrl: item.thumbnailUrl ?? "", category: item.category, tags: item.tags, altText: item.altText ?? "" })}
                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5 text-white" />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="p-1.5 bg-white/20 hover:bg-red-500/70 rounded-md transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-background rounded-xl border border-border w-full max-w-lg my-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold">{modal.id ? "Edit Image" : "Add Image"}</h2>
              <button onClick={() => setModal(null)} className="text-muted-foreground hover:text-foreground text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <ImageUploader
                label="Image *"
                value={modal.imageUrl}
                onChange={(v) => setField("imageUrl", v)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title" value={modal.title ?? ""} onChange={(v) => setField("title", v)} />
                <Field label="Category *" value={modal.category} onChange={(v) => setField("category", v)} placeholder="General" />
              </div>
              <Field label="Alt Text" value={modal.altText ?? ""} onChange={(v) => setField("altText", v)} placeholder="Describe this image…" />
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={(modal.tags ?? []).join(", ")}
                  onChange={(e) => setField("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
                  placeholder="nature, travel, portrait"
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setModal(null)} className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-all">Cancel</button>
              <button
                onClick={save}
                disabled={saving || !modal.imageUrl}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {modal.id ? "Save Changes" : "Add Image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
