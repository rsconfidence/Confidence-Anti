import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { Mail, MailOpen, Trash2, ExternalLink, Loader2, Inbox } from "lucide-react";

interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  budget?: string | null;
  timeline?: string | null;
  readStatus: boolean;
  respondedAt?: string | null;
  createdAt: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = () =>
    adminApi.getMessages().then(setMessages).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const markRead = async (id: number) => {
    await adminApi.markRead(id);
    setMessages((ms) => ms.map((m) => m.id === id ? { ...m, readStatus: true } : m));
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this message?")) return;
    await adminApi.deleteMessage(id);
    setMessages((ms) => ms.filter((m) => m.id !== id));
  };

  const toggle = (id: number) => {
    setExpanded((v) => (v === id ? null : id));
    const msg = messages.find((m) => m.id === id);
    if (msg && !msg.readStatus) markRead(id);
  };

  const unread = messages.filter((m) => !m.readStatus).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Messages</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "All messages read"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Inbox className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-background rounded-xl border transition-all ${
                  !msg.readStatus ? "border-primary/30 shadow-sm" : "border-border"
                }`}
              >
                <button
                  onClick={() => toggle(msg.id)}
                  className="w-full flex items-center gap-4 p-4 text-left"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.readStatus ? "bg-muted" : "bg-primary/10"
                  }`}>
                    {msg.readStatus
                      ? <MailOpen className="w-4 h-4 text-muted-foreground" />
                      : <Mail className="w-4 h-4 text-primary" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-medium ${!msg.readStatus ? "font-semibold" : ""}`}>
                        {msg.name}
                      </span>
                      <span className="text-xs text-muted-foreground">{msg.email}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{msg.message}</p>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </button>

                {expanded === msg.id && (
                  <div className="px-4 pb-4 border-t border-border pt-4 space-y-4">
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    {(msg.budget || msg.timeline) && (
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {msg.budget && <span>Budget: <strong className="text-foreground">{msg.budget}</strong></span>}
                        {msg.timeline && <span>Timeline: <strong className="text-foreground">{msg.timeline}</strong></span>}
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`mailto:${msg.email}?subject=Re: Your message&body=Hi ${msg.name},`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Reply via email
                      </a>
                      <button
                        onClick={() => remove(msg.id)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive ml-auto transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
