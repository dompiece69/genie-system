import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float,
  boolean,
  json,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// --- Scan Sources ---
export const scanSources = mysqlTable("scan_sources", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["reddit", "forum", "twitter", "hackernews", "quora", "producthunt", "custom"]).notNull(),
  url: text("url"),
  keywords: json("keywords").$type<string[]>(),
  isActive: boolean("isActive").default(true).notNull(),
  scanIntervalMinutes: int("scanIntervalMinutes").default(60).notNull(),
  lastScannedAt: timestamp("lastScannedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScanSource = typeof scanSources.$inferSelect;

// --- Scan Jobs ---
export const scanJobs = mysqlTable("scan_jobs", {
  id: int("id").autoincrement().primaryKey(),
  sourceId: int("sourceId"),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  painPointsFound: int("painPointsFound").default(0).notNull(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScanJob = typeof scanJobs.$inferSelect;

// --- Pain Points ---
export const painPoints = mysqlTable("pain_points", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(),
  source: varchar("source", { length: 128 }),
  sourceUrl: text("sourceUrl"),
  niche: varchar("niche", { length: 128 }),
  tags: json("tags").$type<string[]>(),
  urgencyScore: float("urgencyScore").default(0),
  marketPotentialScore: float("marketPotentialScore").default(0),
  overallScore: float("overallScore").default(0),
  status: mysqlEnum("status", ["new", "analyzed", "solution_pending", "solution_ready", "published", "archived"]).default("new").notNull(),
  rawData: json("rawData"),
  scanJobId: int("scanJobId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PainPoint = typeof painPoints.$inferSelect;

// --- Solutions ---
export const solutions = mysqlTable("solutions", {
  id: int("id").autoincrement().primaryKey(),
  painPointId: int("painPointId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(),
  type: mysqlEnum("type", ["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]).notNull(),
  content: text("content"),
  fileUrl: text("fileUrl"),
  fileKey: text("fileKey"),
  status: mysqlEnum("status", ["draft", "pending_review", "approved", "rejected", "published"]).default("draft").notNull(),
  generatedBy: mysqlEnum("generatedBy", ["ai", "manual"]).default("ai").notNull(),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Solution = typeof solutions.$inferSelect;

// --- Products (marketplace listings) ---
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  solutionId: int("solutionId").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(),
  shortDescription: varchar("shortDescription", { length: 256 }),
  price: float("price").notNull().default(0),
  category: varchar("category", { length: 128 }),
  tags: json("tags").$type<string[]>(),
  coverImageUrl: text("coverImageUrl"),
  isPublished: boolean("isPublished").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  salesCount: int("salesCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  rating: float("rating").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;

// --- Orders ---
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  userId: int("userId"),
  buyerEmail: varchar("buyerEmail", { length: 320 }).notNull(),
  buyerName: varchar("buyerName", { length: 256 }),
  amount: float("amount").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "refunded", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 64 }),
  deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
  downloadToken: varchar("downloadToken", { length: 128 }),
  downloadExpiresAt: timestamp("downloadExpiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;

// --- Analytics Events ---
export const analyticsEvents = mysqlTable("analytics_events", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["scan_started", "scan_completed", "pain_point_found", "solution_generated", "product_published", "product_viewed", "order_placed", "order_completed"]).notNull(),
  entityId: int("entityId"),
  entityType: varchar("entityType", { length: 64 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;

// --- Solution Templates ---
export const solutionTemplates = mysqlTable("solution_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  type: mysqlEnum("type", ["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]).notNull(),
  promptTemplate: text("promptTemplate").notNull(),
  defaultPrice: float("defaultPrice").default(9.99),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SolutionTemplate = typeof solutionTemplates.$inferSelect;

// --- App Settings ---
export const appSettings = mysqlTable("app_settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 128 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AppSetting = typeof appSettings.$inferSelect;
