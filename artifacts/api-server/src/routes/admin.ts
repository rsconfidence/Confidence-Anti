import { Router, type IRouter } from "express";
import { db, projectsTable, blogPostsTable, contactSubmissionsTable, galleryTable, newsletterSubscribersTable, siteVisitsTable, siteSettingsTable } from "@workspace/db";
import { eq, isNull, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "IsaacOtoo.05";
const router: IRouter = Router();

function requireAdmin(req: Parameters<Parameters<typeof router.get>[1]>[0], res: Parameters<Parameters<typeof router.get>[1]>[1], next: Parameters<Parameters<typeof router.get>[1]>[2]) {
  if (!req.session?.adminAuthenticated) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// Auth
router.post("/admin/login", (req, res) => {
  const { password } = req.body as { password?: string };
  if (password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }
  req.session.adminAuthenticated = true;
  res.json({ success: true });
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

router.get("/admin/me", (req, res) => {
  if (!req.session?.adminAuthenticated) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true });
});

// Site settings (background image, resume file, and future admin-managed content)
router.get("/settings", async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable);
  res.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
});

router.get("/admin/settings", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(siteSettingsTable);
  res.json(Object.fromEntries(rows.map((row) => [row.key, row.value])));
});

router.put("/admin/settings", requireAdmin, async (req, res) => {
  const entries = req.body as Record<string, unknown>;
  const allowedKeys = new Set(["heroBackground", "resumePdf"]);
  const updates = Object.entries(entries).filter(
    ([key, value]) => allowedKeys.has(key) && typeof value === "string",
  ) as Array<[string, string]>;

  for (const [key, value] of updates) {
    await db
      .insert(siteSettingsTable)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettingsTable.key,
        set: { value, updatedAt: new Date() },
      });
  }

  res.json({ success: true });
});

// Stats
router.get("/admin/stats", requireAdmin, async (_req, res) => {
  const [projects, blogPosts, contacts, unreadContacts, galleryImages, subscribers, visitors] = await Promise.all([
    db.select({ count: count() }).from(projectsTable),
    db.select({ count: count() }).from(blogPostsTable),
    db.select({ count: count() }).from(contactSubmissionsTable),
    db.select({ count: count() }).from(contactSubmissionsTable).where(eq(contactSubmissionsTable.readStatus, false)),
    db.select({ count: count() }).from(galleryTable),
    db.select({ count: count() }).from(newsletterSubscribersTable).where(isNull(newsletterSubscribersTable.unsubscribedAt)),
    db.select({ count: count() }).from(siteVisitsTable),
  ]);

  res.json({
    projects: Number(projects[0].count),
    blogPosts: Number(blogPosts[0].count),
    contacts: Number(contacts[0].count),
    unreadContacts: Number(unreadContacts[0].count),
    galleryImages: Number(galleryImages[0].count),
    subscribers: Number(subscribers[0].count),
    totalVisitors: Number(visitors[0].count),
  });
});

// Messages
router.get("/admin/messages", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(contactSubmissionsTable).orderBy(contactSubmissionsTable.createdAt);
  res.json(rows.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    message: s.message,
    budget: s.budget,
    timeline: s.timeline,
    readStatus: s.readStatus,
    respondedAt: s.respondedAt?.toISOString() ?? null,
    createdAt: s.createdAt.toISOString(),
  })).reverse());
});

router.patch("/admin/messages/:id/read", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.update(contactSubmissionsTable).set({ readStatus: true }).where(eq(contactSubmissionsTable.id, id));
  res.json({ success: true });
});

router.delete("/admin/messages/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(contactSubmissionsTable).where(eq(contactSubmissionsTable.id, id));
  res.json({ success: true });
});

// Projects
router.get("/admin/projects", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  res.json(rows.reverse().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    longDescription: p.longDescription,
    featured: p.featured,
    featuredImage: p.featuredImage,
    galleryImages: p.galleryImages ?? [],
    techStack: p.techStack,
    category: p.category,
    year: p.year,
    duration: p.duration,
    teamSize: p.teamSize,
    repositoryLink: p.repositoryLink,
    liveLink: p.liveLink,
    caseStudySlug: p.caseStudySlug,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/admin/projects", requireAdmin, async (req, res) => {
  const data = req.body as typeof projectsTable.$inferInsert;
  const [row] = await db.insert(projectsTable).values({ ...data, updatedAt: new Date() }).returning();
  res.status(201).json({ success: true, id: row.id });
});

router.put("/admin/projects/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body as Partial<typeof projectsTable.$inferInsert>;
  await db.update(projectsTable).set({ ...data, updatedAt: new Date() }).where(eq(projectsTable.id, id));
  res.json({ success: true });
});

router.delete("/admin/projects/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(projectsTable).where(eq(projectsTable.id, id));
  res.json({ success: true });
});

// Blog
router.get("/admin/blog", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(blogPostsTable).orderBy(blogPostsTable.updatedAt);
  res.json(rows.reverse().map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    author: p.author,
    category: p.category,
    tags: p.tags ?? [],
    featuredImage: p.featuredImage,
    readingTimeMinutes: p.readingTimeMinutes,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    updatedAt: p.updatedAt.toISOString(),
  })));
});

router.post("/admin/blog", requireAdmin, async (req, res) => {
  const data = req.body as typeof blogPostsTable.$inferInsert;
  const [row] = await db.insert(blogPostsTable).values({ ...data, updatedAt: new Date() }).returning();
  res.status(201).json({ success: true, id: row.id });
});

router.put("/admin/blog/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body as Partial<typeof blogPostsTable.$inferInsert>;
  await db.update(blogPostsTable).set({ ...data, updatedAt: new Date() }).where(eq(blogPostsTable.id, id));
  res.json({ success: true });
});

router.delete("/admin/blog/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  res.json({ success: true });
});

// Gallery
router.get("/admin/gallery", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(galleryTable).orderBy(galleryTable.createdAt);
  res.json(rows.reverse().map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    thumbnailUrl: g.thumbnailUrl,
    category: g.category,
    tags: g.tags ?? [],
    altText: g.altText,
    createdAt: g.createdAt.toISOString(),
  })));
});

router.post("/admin/gallery", requireAdmin, async (req, res) => {
  const data = req.body as typeof galleryTable.$inferInsert;
  const [row] = await db.insert(galleryTable).values(data).returning();
  res.status(201).json({ success: true, id: row.id });
});

router.put("/admin/gallery/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body as Partial<typeof galleryTable.$inferInsert>;
  await db.update(galleryTable).set(data).where(eq(galleryTable.id, id));
  res.json({ success: true });
});

router.delete("/admin/gallery/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  await db.delete(galleryTable).where(eq(galleryTable.id, id));
  res.json({ success: true });
});

// Subscribers
router.get("/admin/subscribers", requireAdmin, async (_req, res) => {
  const rows = await db.select().from(newsletterSubscribersTable).orderBy(newsletterSubscribersTable.subscribedAt);
  res.json(rows.reverse().map((s) => ({
    id: s.id,
    email: s.email,
    name: s.name,
    subscribedAt: s.subscribedAt.toISOString(),
    unsubscribedAt: s.unsubscribedAt?.toISOString() ?? null,
  })));
});

// Track visit (called from public frontend)
router.post("/track-visit", async (req, res) => {
  const path = (req.body as { path?: string })?.path ?? "/";
  try {
    await db.insert(siteVisitsTable).values({ path });
  } catch (e) {
    logger.error(e);
  }
  res.json({ ok: true });
});

export default router;
