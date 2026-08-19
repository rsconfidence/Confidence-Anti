import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  featured: boolean("featured").default(false).notNull(),
  featuredImage: text("featured_image"),
  galleryImages: text("gallery_images").array().default([]),
  techStack: text("tech_stack").array().default([]).notNull(),
  category: text("category").notNull(),
  year: integer("year").notNull(),
  duration: text("duration"),
  teamSize: integer("team_size"),
  repositoryLink: text("repository_link"),
  liveLink: text("live_link"),
  caseStudySlug: text("case_study_slug"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
