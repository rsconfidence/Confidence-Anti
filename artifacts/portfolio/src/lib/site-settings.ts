const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export interface SiteSettings {
  heroBackground?: string;
  resumePdf?: string;
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const response = await fetch(`${BASE}/api/settings`);
  if (!response.ok) throw new Error("Could not load site settings");
  return response.json();
}