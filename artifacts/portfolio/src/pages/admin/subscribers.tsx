import { useEffect, useState } from "react";
import { AdminLayout } from "./layout";
import { adminApi } from "@/lib/admin-api";
import { Users, Loader2, UserCheck, UserX } from "lucide-react";

interface Subscriber {
  id: number;
  email: string;
  name?: string | null;
  subscribedAt: string;
  unsubscribedAt?: string | null;
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSubscribers().then(setSubscribers).finally(() => setLoading(false));
  }, []);

  const active = subscribers.filter((s) => !s.unsubscribedAt);
  const inactive = subscribers.filter((s) => s.unsubscribedAt);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Subscribers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {active.length} active · {inactive.length} unsubscribed
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No subscribers yet</p>
          </div>
        ) : (
          <div className="bg-background rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Subscriber</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide hidden md:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{s.email}</div>
                        {s.name && <div className="text-xs text-muted-foreground">{s.name}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {s.unsubscribedAt ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                          <UserX className="w-3 h-3" />
                          Unsubscribed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                          <UserCheck className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
