import { pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const siteSettingsTable = pgTable(
  "site_settings",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    keyUnique: uniqueIndex("site_settings_key_unique").on(table.key),
  }),
);

export type SiteSetting = typeof siteSettingsTable.$inferSelect;