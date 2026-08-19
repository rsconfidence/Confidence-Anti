import { Router, type IRouter } from "express";
import { db, blogPostsTable } from "@workspace/db";
import { eq, desc, isNotNull } from "drizzle-orm";
import { ListBlogPostsQueryParams, GetBlogPostParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatPost(p: typeof blogPostsTable.$inferSelect) {
  return {
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
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  };
}

router.get("/blog", async (req, res) => {
  const query = ListBlogPostsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, tag, search } = query.data;

  let rows = await db
    .select()
    .from(blogPostsTable)
    .where(isNotNull(blogPostsTable.publishedAt))
    .orderBy(desc(blogPostsTable.publishedAt));

  if (category) rows = rows.filter((p) => p.category === category);
  if (tag) rows = rows.filter((p) => p.tags?.includes(tag) ?? false);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt ?? "").toLowerCase().includes(q)
    );
  }

  res.json(rows.map(formatPost));
});

router.get("/blog/recent", async (_req, res) => {
  const rows = await db
    .select()
    .from(blogPostsTable)
    .where(isNotNull(blogPostsTable.publishedAt))
    .orderBy(desc(blogPostsTable.publishedAt))
    .limit(3);

  res.json(rows.map(formatPost));
});

router.get("/blog/:slug", async (req, res) => {
  const params = GetBlogPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.slug, params.data.slug))
    .limit(1);

  if (!post) {
    res.status(404).json({ error: "Blog post not found" });
    return;
  }

  res.json(formatPost(post));
});

export default router;
