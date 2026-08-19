import { Router, type IRouter } from "express";
import { db, skillsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/skills", async (_req, res) => {
  const rows = await db.select().from(skillsTable);

  const groups: Record<string, typeof rows> = {};
  rows.forEach((s) => {
    if (!groups[s.category]) groups[s.category] = [];
    groups[s.category].push(s);
  });

  const result = Object.entries(groups).map(([category, skills]) => ({
    category,
    skills: skills.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      level: s.level,
      yearsOfExperience: s.yearsOfExperience,
    })),
  }));

  res.json(result);
});

export default router;
