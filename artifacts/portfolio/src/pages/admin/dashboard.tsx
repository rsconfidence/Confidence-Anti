import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { Link } from "wouter";
import {
  FolderKanban,
  FileText,
  MessageSquare,
  Image,
  Users,
  Eye,
  ArrowRight,
  Loader2,
} from "lucide-react";

interface Stats {
  projects: number;
  blogPosts: number;
  contacts: number;
  unreadContacts: number;
  galleryImages: number;
  subscribers: number;
  totalVisitors: number;
}

const statCards = (stats: Stats) => [
  { label: "Total Visitors", value: stats.totalVisitors, icon: Eye, color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30", href: "/admin" },
  { label: "Messages", value: stats.contacts, badge: stats.unreadContacts > 0 ? stats.unreadContacts : undefined, badgeLabel: "unread", icon: MessageSquare, color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30", href: "/admin/messages" },
  { label: "Projects", value: stats.projects, icon: FolderKanban, color: "text-violet-500 bg-violet-50 dark:bg-violet-950/30", href: "/admin/projects" },
  { label: "Blog Posts", value: stats.blogPosts, icon: FileText, color: "text-green-500 bg-green-50 dark:bg-green-950/30", href: "/admin/blog" },
  { label: "Gallery Images", value: stats.galleryImages, icon: Image, color: "text-pink-500 bg-pink-50 dark:bg-pink-950/30", href: "/admin/gallery" },
  { label: "Subscribers", value: stats.subscribers, icon: Users, color: "text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30", href: "/admin/subscribers" },
];

const quickActions = [
  { label: "New Project", href: "/admin/projects", icon: FolderKanban },
  { label: "New Blog Post", href: "/admin/blog", icon: FileText },
  { label: "Add Gallery Image", href: "/admin/gallery", icon: Image },
  { label: "View Messages", href: "/admin/messages", icon: MessageSquare },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.stats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Overview of your portfolio</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards(stats).map((card) => (
                <Link
                  key={card.label}
                  href={card.href}
                  className="bg-background rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                      <card.icon className="w-5 h-5" />
                    </div>
                    {card.badge !== undefined && (
                      <span className="text-xs font-bold bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full">
                        {card.badge} {card.badgeLabel}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground mt-0.5">{card.label}</div>
                </Link>
              ))}
            </div>

            <div>
              <h2 className="text-base font-semibold mb-3">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="bg-background rounded-lg border border-border px-4 py-3 flex items-center gap-3 hover:border-primary/30 hover:bg-muted/50 transition-all group text-sm font-medium"
                  >
                    <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {action.label}
                    <ArrowRight className="w-3 h-3 ml-auto text-muted-foreground/50 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground text-sm">Failed to load stats.</p>
        )}
      </div>
    </AdminLayout>
  );
}
