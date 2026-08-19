import { pgTable, serial, timestamp, text } from "drizzle-orm/pg-core";

export const siteVisitsTable = pgTable("site_visits", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().default("/"),
  visitedAt: timestamp("visited_at").defaultNow().notNull(),
});

export type SiteVisit = typeof siteVisitsTable.$inferSelect;
