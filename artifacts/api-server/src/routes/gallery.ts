import { Router, type IRouter } from "express";
import { db, galleryTable } from "@workspace/db";
import { ListGalleryQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/gallery", async (req, res) => {
  const query = ListGalleryQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category } = query.data;

  let rows = await db.select().from(galleryTable);
  if (category) rows = rows.filter((r) => r.category === category);

  const result = rows.map((g) => ({
    id: g.id,
    title: g.title,
    description: g.description,
    imageUrl: g.imageUrl,
    thumbnailUrl: g.thumbnailUrl,
    category: g.category,
    tags: g.tags ?? [],
    altText: g.altText,
    createdAt: g.createdAt.toISOString(),
  }));

  res.json(result);
});

export default router;
