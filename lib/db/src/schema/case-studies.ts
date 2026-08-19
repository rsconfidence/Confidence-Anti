import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStudiesTable = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id"),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  challenge: text("challenge"),
  solution: text("solution"),
  technicalDetails: text("technical_details"),
  results: text("results"),
  learnings: text("learnings"),
  processImage: text("process_image"),
  architectureDiagram: text("architecture_diagram"),
  resultsImage: text("results_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudiesTable.$inferSelect;
