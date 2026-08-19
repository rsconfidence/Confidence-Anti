const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function apiRequest(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const adminApi = {
  login: (password: string) => apiRequest("POST", "/api/admin/login", { password }),
  logout: () => apiRequest("POST", "/api/admin/logout"),
  me: () => apiRequest("GET", "/api/admin/me"),
  stats: () => apiRequest("GET", "/api/admin/stats"),

  // Messages
  getMessages: () => apiRequest("GET", "/api/admin/messages"),
  markRead: (id: number) => apiRequest("PATCH", `/api/admin/messages/${id}/read`),
  deleteMessage: (id: number) => apiRequest("DELETE", `/api/admin/messages/${id}`),

  // Projects
  getProjects: () => apiRequest("GET", "/api/admin/projects"),
  createProject: (data: unknown) => apiRequest("POST", "/api/admin/projects", data),
  updateProject: (id: number, data: unknown) => apiRequest("PUT", `/api/admin/projects/${id}`, data),
  deleteProject: (id: number) => apiRequest("DELETE", `/api/admin/projects/${id}`),

  // Blog
  getBlogPosts: () => apiRequest("GET", "/api/admin/blog"),
  createBlogPost: (data: unknown) => apiRequest("POST", "/api/admin/blog", data),
  updateBlogPost: (id: number, data: unknown) => apiRequest("PUT", `/api/admin/blog/${id}`, data),
  deleteBlogPost: (id: number) => apiRequest("DELETE", `/api/admin/blog/${id}`),

  // Gallery
  getGallery: () => apiRequest("GET", "/api/admin/gallery"),
  createGalleryItem: (data: unknown) => apiRequest("POST", "/api/admin/gallery", data),
  updateGalleryItem: (id: number, data: unknown) => apiRequest("PUT", `/api/admin/gallery/${id}`, data),
  deleteGalleryItem: (id: number) => apiRequest("DELETE", `/api/admin/gallery/${id}`),

  // Subscribers
  getSubscribers: () => apiRequest("GET", "/api/admin/subscribers"),

  // Upload
  uploadFile: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE}/api/admin/upload`, {
      method: "POST",
      body: form,
      credentials: "include",
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Upload failed");
    }
    const data = await res.json();
    return data.url as string;
  },
  uploadImage: (file: File) => adminApi.uploadFile(file),
  getSettings: () => apiRequest("GET", "/api/admin/settings"),
  updateSettings: (data: Record<string, string>) => apiRequest("PUT", "/api/admin/settings", data),
};
