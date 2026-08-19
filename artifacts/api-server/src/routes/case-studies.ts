import { Router, type IRouter } from "express";
import { db, caseStudiesTable, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetCaseStudyParams } from "@workspace/api-zod";

const router: IRouter = Router();

async function enrichCaseStudy(cs: typeof caseStudiesTable.$inferSelect) {
  let projectSlug: string | null = null;
  let projectTitle: string | null = null;
  if (cs.projectId) {
    const [project] = await db
      .select({ slug: projectsTable.slug, title: projectsTable.title })
      .from(projectsTable)
      .where(eq(projectsTable.id, cs.projectId))
      .limit(1);
    if (project) {
      projectSlug = project.slug;
      projectTitle = project.title;
    }
  }
  return {
    id: cs.id,
    projectId: cs.projectId,
    projectSlug,
    projectTitle,
    slug: cs.slug,
    title: cs.title,
    challenge: cs.challenge,
    solution: cs.solution,
    technicalDetails: cs.technicalDetails,
    results: cs.results,
    learnings: cs.learnings,
    processImage: cs.processImage,
    architectureDiagram: cs.architectureDiagram,
    resultsImage: cs.resultsImage,
    createdAt: cs.createdAt.toISOString(),
  };
}

router.get("/case-studies", async (_req, res) => {
  const rows = await db.select().from(caseStudiesTable);
  const result = await Promise.all(rows.map(enrichCaseStudy));
  res.json(result);
});

router.get("/case-studies/:slug", async (req, res) => {
  const params = GetCaseStudyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const [cs] = await db
    .select()
    .from(caseStudiesTable)
    .where(eq(caseStudiesTable.slug, params.data.slug))
    .limit(1);

  if (!cs) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }

  res.json(await enrichCaseStudy(cs));
});

export default router;
