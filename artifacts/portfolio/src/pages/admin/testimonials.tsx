import { useState, useEffect } from "react";
import { AdminLayout } from "@/pages/admin/layout";
import { CheckCircle, Trash2, Star, Clock, MessageSquare } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  institution: string | null;
  text: string;
  rating: number;
  approved: boolean;
  featured: boolean;
  createdAt: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/testimonials", { credentials: "include" });
      if (res.ok) setTestimonials(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (id: number) => {
    await fetch(`/api/admin/testimonials/${id}/approve`, { method: "PATCH", credentials: "include" });
    fetchAll();
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE", credentials: "include" });
    fetchAll();
  };

  const filtered = testimonials.filter((t) =>
    filter === "all" ? true : filter === "pending" ? !t.approved : t.approved
  );

  const pending = testimonials.filter((t) => !t.approved).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Testimonials</h1>
            <p className="text-gray-400 text-sm mt-1">Manage public testimonials from your contacts</p>
          </div>
          {pending > 0 && (
            <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-3 py-1 text-xs font-mono rounded">
              {pending} pending review
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 border-b border-gray-800 pb-0">
          {(["all", "pending", "approved"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-mono capitalize border-b-2 transition-colors -mb-px ${
                filter === f
                  ? "border-green-400 text-green-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {f}
              <span className="ml-1.5 text-xs opacity-60">
                ({f === "all" ? testimonials.length : f === "pending" ? pending : testimonials.length - pending})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-gray-500 font-mono text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-600">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-mono text-sm">No testimonials {filter !== "all" ? `(${filter})` : ""}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`border rounded p-5 space-y-3 ${
                  t.approved ? "border-gray-800 bg-gray-900/40" : "border-yellow-500/30 bg-yellow-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{t.name}</span>
                      {!t.approved && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                      {t.approved && (
                        <span className="text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded font-mono flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Approved
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-green-400 font-mono">{t.role}</div>
                    {t.institution && <div className="text-xs text-gray-500">{t.institution}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-gray-600 font-mono">
                    {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <div className="flex gap-2">
                    {!t.approved && (
                      <button
                        onClick={() => approve(t.id)}
                        className="inline-flex items-center gap-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-3 py-1.5 transition-colors font-mono"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => remove(t.id)}
                      className="inline-flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs px-3 py-1.5 transition-colors font-mono"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
