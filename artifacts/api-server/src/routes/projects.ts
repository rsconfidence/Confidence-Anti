import { Router, type IRouter } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import {
  ListProjectsQueryParams,
  GetProjectParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/projects", async (req, res) => {
  const query = ListProjectsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: "Invalid query params" });
    return;
  }
  const { category, year, tech, featured } = query.data;

  let rows = await db.select().from(projectsTable).orderBy(desc(projectsTable.year), desc(projectsTable.createdAt));

  if (category) rows = rows.filter((r) => r.category === category);
  if (year) rows = rows.filter((r) => r.year === Number(year));
  if (tech) rows = rows.filter((r) => r.techStack.includes(tech));
  if (featured !== undefined) rows = rows.filter((r) => r.featured === (featured === true || featured === ("true" as unknown)));

  const result = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    featuredImage: p.featuredImage,
    techStack: p.techStack,
    category: p.category,
    year: p.year,
    duration: p.duration,
    teamSize: p.teamSize,
    featured: p.featured,
    repositoryLink: p.repositoryLink,
    liveLink: p.liveLink,
    caseStudySlug: p.caseStudySlug,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/projects/featured", async (_req, res) => {
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.featured, true))
    .orderBy(desc(projectsTable.year))
    .limit(6);

  const result = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    featuredImage: p.featuredImage,
    techStack: p.techStack,
    category: p.category,
    year: p.year,
    duration: p.duration,
    teamSize: p.teamSize,
    featured: p.featured,
    repositoryLink: p.repositoryLink,
    liveLink: p.liveLink,
    caseStudySlug: p.caseStudySlug,
    createdAt: p.createdAt.toISOString(),
  }));

  res.json(result);
});

router.get("/projects/stats", async (_req, res) => {
  const rows = await db.select().from(projectsTable);
  const totalCount = rows.length;

  const byCategory = Object.entries(
    rows.reduce<Record<string, number>>((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([label, count]) => ({ label, count }));

  const byYear = Object.entries(
    rows.reduce<Record<string, number>>((acc, p) => {
      const y = String(p.year);
      acc[y] = (acc[y] || 0) + 1;
      return acc;
    }, {})
  )
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => Number(b.label) - Number(a.label));

  const techCounts: Record<string, number> = {};
  rows.forEach((p) => {
    p.techStack.forEach((t) => {
      techCounts[t] = (techCounts[t] || 0) + 1;
    });
  });
  const byTech = Object.entries(techCounts)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({ totalCount, byCategory, byYear, byTech });
});

router.get("/projects/:slug", async (req, res) => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid params" });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.slug, params.data.slug))
    .limit(1);

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json({
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    longDescription: project.longDescription,
    featuredImage: project.featuredImage,
    galleryImages: project.galleryImages ?? [],
    techStack: project.techStack,
    category: project.category,
    year: project.year,
    duration: project.duration,
    teamSize: project.teamSize,
    featured: project.featured,
    repositoryLink: project.repositoryLink,
    liveLink: project.liveLink,
    caseStudySlug: project.caseStudySlug,
    createdAt: project.createdAt.toISOString(),
  });
});

export default router;
