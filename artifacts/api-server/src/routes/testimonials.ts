import { Router } from "express";
import { db } from "@workspace/db";
import { testimonialsTable, insertTestimonialSchema } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";

const router = Router();

// Public: get approved testimonials
router.get("/testimonials", async (_req, res) => {
  try {
    const rows = await db
      .select()
      .from(testimonialsTable)
      .where(eq(testimonialsTable.approved, true))
      .orderBy(desc(testimonialsTable.createdAt));
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch testimonials" });
  }
});

// Public: submit a testimonial (pending approval)
router.post("/testimonials", async (req, res) => {
  const parsed = insertTestimonialSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data", details: parsed.error.issues });
  }
  try {
    const [row] = await db
      .insert(testimonialsTable)
      .values({ ...parsed.data, approved: false })
      .returning();
     return res.status(201).json({ success: true, id: row.id });
  } catch (e) {
    return res.status(500).json({ error: "Failed to submit testimonial" });
  }
});

// Admin: get all testimonials (including pending)
router.get("/admin/testimonials", async (req, res) => {
  if (!req.session?.adminAuthenticated) return res.status(401).json({ error: "Unauthorized" });
  try {
    const rows = await db.select().from(testimonialsTable).orderBy(desc(testimonialsTable.createdAt));
     return res.json(rows);
  } catch (e) {
     return res.status(500).json({ error: "Failed to fetch" });
  }
});

// Admin: approve
router.patch("/admin/testimonials/:id/approve", async (req, res) => {
  if (!req.session?.adminAuthenticated) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  try {
    await db.update(testimonialsTable).set({ approved: true }).where(eq(testimonialsTable.id, id));
     return res.json({ success: true });
  } catch (e) {
     return res.status(500).json({ error: "Failed to approve" });
  }
});

// Admin: toggle featured
router.patch("/admin/testimonials/:id/feature", async (req, res) => {
  if (!req.session?.adminAuthenticated) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  const { featured } = req.body;
  try {
    await db.update(testimonialsTable).set({ featured }).where(eq(testimonialsTable.id, id));
     return res.json({ success: true });
  } catch (e) {
     return res.status(500).json({ error: "Failed to update" });
  }
});

// Admin: delete
router.delete("/admin/testimonials/:id", async (req, res) => {
  if (!req.session?.adminAuthenticated) return res.status(401).json({ error: "Unauthorized" });
  const id = parseInt(req.params.id);
  try {
    await db.delete(testimonialsTable).where(eq(testimonialsTable.id, id));
     return res.json({ success: true });
  } catch (e) {
     return res.status(500).json({ error: "Failed to delete" });
  }
});

export default router;
