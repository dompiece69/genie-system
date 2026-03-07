import { eq, desc, and, like, or, sql, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  scanSources, ScanSource,
  scanJobs, ScanJob,
  painPoints, PainPoint,
  solutions, Solution,
  products, Product,
  orders, Order,
  analyticsEvents,
  solutionTemplates, SolutionTemplate,
  appSettings,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ---- Users ----
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ---- Scan Sources ----
export async function getScanSources() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scanSources).orderBy(desc(scanSources.createdAt));
}

export async function createScanSource(data: Omit<typeof scanSources.$inferInsert, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(scanSources).values(data);
  return result;
}

export async function updateScanSource(id: number, data: Partial<typeof scanSources.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(scanSources).set(data).where(eq(scanSources.id, id));
}

export async function deleteScanSource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(scanSources).where(eq(scanSources.id, id));
}

// ---- Scan Jobs ----
export async function createScanJob(sourceId?: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(scanJobs).values({ sourceId, status: 'pending' });
  const insertId = Number((result as any)[0]?.insertId);
  const [job] = await db.select().from(scanJobs).where(eq(scanJobs.id, insertId)).limit(1);
  return job;
}

export async function updateScanJob(id: number, data: Partial<typeof scanJobs.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(scanJobs).set(data).where(eq(scanJobs.id, id));
}

export async function getRecentScanJobs(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scanJobs).orderBy(desc(scanJobs.createdAt)).limit(limit);
}

// ---- Pain Points ----
export async function createPainPoint(data: Omit<typeof painPoints.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(painPoints).values(data);
  const insertId = Number((result as any)[0]?.insertId);
  const [pp] = await db.select().from(painPoints).where(eq(painPoints.id, insertId)).limit(1);
  return pp;
}

export async function getPainPoints(opts?: { status?: string; niche?: string; search?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.status) conditions.push(eq(painPoints.status, opts.status as any));
  if (opts?.niche) conditions.push(eq(painPoints.niche, opts.niche));
  if (opts?.search) conditions.push(or(like(painPoints.title, `%${opts.search}%`), like(painPoints.description, `%${opts.search}%`)));
  const query = db.select().from(painPoints).orderBy(desc(painPoints.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0);
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getPainPointById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [pp] = await db.select().from(painPoints).where(eq(painPoints.id, id)).limit(1);
  return pp;
}

export async function updatePainPoint(id: number, data: Partial<typeof painPoints.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(painPoints).set(data).where(eq(painPoints.id, id));
}

export async function getPainPointCount() {
  const db = await getDb();
  if (!db) return 0;
  const [r] = await db.select({ count: sql<number>`count(*)` }).from(painPoints);
  return Number(r?.count ?? 0);
}

// ---- Solutions ----
export async function createSolution(data: Omit<typeof solutions.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(solutions).values(data);
  const insertId = Number((result as any)[0]?.insertId);
  const [sol] = await db.select().from(solutions).where(eq(solutions.id, insertId)).limit(1);
  return sol;
}

export async function getSolutions(opts?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.status) conditions.push(eq(solutions.status, opts.status as any));
  const query = db.select().from(solutions).orderBy(desc(solutions.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0);
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getSolutionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [sol] = await db.select().from(solutions).where(eq(solutions.id, id)).limit(1);
  return sol;
}

export async function updateSolution(id: number, data: Partial<typeof solutions.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(solutions).set(data).where(eq(solutions.id, id));
}

export async function getSolutionsByPainPoint(painPointId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(solutions).where(eq(solutions.painPointId, painPointId));
}

// ---- Products ----
export async function createProduct(data: Omit<typeof products.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values(data);
  const insertId = Number((result as any)[0]?.insertId);
  const [prod] = await db.select().from(products).where(eq(products.id, insertId)).limit(1);
  return prod;
}

export async function getProducts(opts?: { category?: string; search?: string; published?: boolean; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.published !== undefined) conditions.push(eq(products.isPublished, opts.published));
  if (opts?.category) conditions.push(eq(products.category, opts.category));
  if (opts?.search) conditions.push(or(like(products.title, `%${opts.search}%`), like(products.description, `%${opts.search}%`)));
  const query = db.select().from(products).orderBy(desc(products.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0);
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [prod] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return prod;
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function getFeaturedProducts(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products).where(and(eq(products.isPublished, true), eq(products.isFeatured, true))).orderBy(desc(products.salesCount)).limit(limit);
}

// ---- Orders ----
export async function createOrder(data: Omit<typeof orders.$inferInsert, 'id' | 'createdAt' | 'updatedAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  const insertId = Number((result as any)[0]?.insertId);
  const [order] = await db.select().from(orders).where(eq(orders.id, insertId)).limit(1);
  return order;
}

export async function getOrders(opts?: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (opts?.status) conditions.push(eq(orders.status, opts.status as any));
  const query = db.select().from(orders).orderBy(desc(orders.createdAt)).limit(opts?.limit ?? 50).offset(opts?.offset ?? 0);
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return order;
}

export async function updateOrder(id: number, data: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

export async function getOrderByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [order] = await db.select().from(orders).where(eq(orders.downloadToken, token)).limit(1);
  return order;
}

// ---- Analytics ----
export async function logEvent(type: typeof analyticsEvents.$inferInsert['type'], entityId?: number, entityType?: string, metadata?: Record<string, unknown>) {
  const db = await getDb();
  if (!db) return;
  await db.insert(analyticsEvents).values({ type, entityId, entityType, metadata });
}

export async function getAnalyticsSummary() {
  const db = await getDb();
  if (!db) return { totalPainPoints: 0, totalSolutions: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0, recentEvents: [] };
  const [ppCount] = await db.select({ count: sql<number>`count(*)` }).from(painPoints);
  const [solCount] = await db.select({ count: sql<number>`count(*)` }).from(solutions);
  const [prodCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.status, 'completed'));
  const [revenue] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` }).from(orders).where(eq(orders.status, 'completed'));
  const recentEvents = await db.select().from(analyticsEvents).orderBy(desc(analyticsEvents.createdAt)).limit(50);
  return {
    totalPainPoints: Number(ppCount?.count ?? 0),
    totalSolutions: Number(solCount?.count ?? 0),
    totalProducts: Number(prodCount?.count ?? 0),
    totalOrders: Number(orderCount?.count ?? 0),
    totalRevenue: Number(revenue?.total ?? 0),
    recentEvents,
  };
}

export async function getRevenueByDay(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT DATE(createdAt) as date, COUNT(*) as orders, COALESCE(SUM(amount),0) as revenue
    FROM orders WHERE status='completed' AND createdAt >= DATE_SUB(NOW(), INTERVAL ${days} DAY)
    GROUP BY DATE(createdAt) ORDER BY date ASC
  `);
  return (result as any)[0] as { date: string; orders: number; revenue: number }[];
}

export async function getPainPointsByNiche() {
  const db = await getDb();
  if (!db) return [];
  const result = await db.execute(sql`
    SELECT niche, COUNT(*) as count FROM pain_points WHERE niche IS NOT NULL GROUP BY niche ORDER BY count DESC LIMIT 10
  `);
  return (result as any)[0] as { niche: string; count: number }[];
}

// ---- Solution Templates ----
export async function getSolutionTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(solutionTemplates).where(eq(solutionTemplates.isActive, true));
}

export async function createSolutionTemplate(data: Omit<typeof solutionTemplates.$inferInsert, 'id' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(solutionTemplates).values(data);
}

export async function updateSolutionTemplate(id: number, data: Partial<typeof solutionTemplates.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(solutionTemplates).set(data).where(eq(solutionTemplates.id, id));
}

// ---- App Settings ----
export async function getAppSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(appSettings);
}

export async function setAppSetting(key: string, value: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(appSettings).values({ key, value, description }).onDuplicateKeyUpdate({ set: { value } });
}

export async function getAppSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [s] = await db.select().from(appSettings).where(eq(appSettings.key, key)).limit(1);
  return s?.value;
}
