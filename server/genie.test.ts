import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock all DB and external calls
vi.mock("./db", () => ({
  getScanSources: vi.fn().mockResolvedValue([]),
  createScanSource: vi.fn().mockResolvedValue({ id: 1, name: "Test", type: "reddit", isActive: true }),
  updateScanSource: vi.fn().mockResolvedValue({}),
  deleteScanSource: vi.fn().mockResolvedValue({}),
  getRecentScanJobs: vi.fn().mockResolvedValue([]),
  getPainPoints: vi.fn().mockResolvedValue([]),
  getPainPointById: vi.fn().mockResolvedValue(null),
  updatePainPoint: vi.fn().mockResolvedValue({}),
  getPainPointCount: vi.fn().mockResolvedValue(0),
  getSolutions: vi.fn().mockResolvedValue([]),
  getSolutionById: vi.fn().mockResolvedValue(null),
  updateSolution: vi.fn().mockResolvedValue({}),
  getSolutionsByPainPoint: vi.fn().mockResolvedValue([]),
  getProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(null),
  updateProduct: vi.fn().mockResolvedValue({}),
  getFeaturedProducts: vi.fn().mockResolvedValue([]),
  getOrders: vi.fn().mockResolvedValue([]),
  getOrderById: vi.fn().mockResolvedValue(null),
  updateOrder: vi.fn().mockResolvedValue({}),
  createOrder: vi.fn().mockResolvedValue({ id: 1 }),
  getOrderByToken: vi.fn().mockResolvedValue(null),
  getAnalyticsSummary: vi.fn().mockResolvedValue({
    totalPainPoints: 5,
    totalSolutions: 3,
    totalProducts: 2,
    totalOrders: 1,
    totalRevenue: 9.99,
    recentEvents: [],
  }),
  getRevenueByDay: vi.fn().mockResolvedValue([]),
  getPainPointsByNiche: vi.fn().mockResolvedValue([]),
  getSolutionTemplates: vi.fn().mockResolvedValue([]),
  createSolutionTemplate: vi.fn().mockResolvedValue({}),
  updateSolutionTemplate: vi.fn().mockResolvedValue({}),
  getAppSettings: vi.fn().mockResolvedValue([]),
  setAppSetting: vi.fn().mockResolvedValue({}),
  logEvent: vi.fn().mockResolvedValue({}),
}));

vi.mock("./scanner", () => ({
  runScan: vi.fn().mockResolvedValue({ painPointsFound: 3 }),
}));

vi.mock("./solutionGenerator", () => ({
  generateSolution: vi.fn().mockResolvedValue({ id: 1, title: "Test Solution", type: "pdf_guide" }),
  publishSolutionAsProduct: vi.fn().mockResolvedValue({ id: 1, title: "Test Product", price: 9.99 }),
  prepareSolutionFile: vi.fn().mockResolvedValue("https://cdn.example.com/file.pdf"),
  generateDownloadToken: vi.fn().mockReturnValue("test-token-abc123"),
}));

vi.mock("./stripe", () => ({
  createCheckoutSession: vi.fn().mockResolvedValue({
    url: "https://checkout.stripe.com/pay/cs_test_xxx",
    downloadToken: "test-token-abc123",
  }),
  isStripeEnabled: vi.fn().mockReturnValue(true),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as any,
    res: { clearCookie: vi.fn() } as any,
  };
}

describe("auth router", () => {
  it("me returns null for unauthenticated user", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("me returns user for authenticated user", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.auth.me();
    expect(result?.role).toBe("admin");
  });
});

describe("scanner router", () => {
  it("getSources returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.scanner.getSources();
    expect(Array.isArray(result)).toBe(true);
  });

  it("getRecentJobs returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.scanner.getRecentJobs({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("triggerScan requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.scanner.triggerScan({})
    ).rejects.toThrow();
  });

  it("createSource requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.scanner.createSource({ name: "Test", type: "reddit" })
    ).rejects.toThrow();
  });

  it("admin can create source", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.scanner.createSource({ name: "Test Reddit", type: "reddit" });
    expect(result).toBeDefined();
  });

  it("admin can trigger scan", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.scanner.triggerScan({});
    expect(result.status).toBe("running");
  });
});

describe("painPoints router", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.painPoints.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getNicheStats returns array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.painPoints.getNicheStats();
    expect(Array.isArray(result)).toBe(true);
  });

  it("generateSolution requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.painPoints.generateSolution({ painPointId: 1 })
    ).rejects.toThrow();
  });
});

describe("solutions router", () => {
  it("list returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.solutions.list({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("review requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.solutions.review({ id: 1, status: "approved" })
    ).rejects.toThrow();
  });

  it("publish requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.solutions.publish({ id: 1 })
    ).rejects.toThrow();
  });
});

describe("marketplace router", () => {
  it("listProducts returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.marketplace.listProducts({ limit: 10 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("getFeatured returns empty array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.marketplace.getFeatured();
    expect(Array.isArray(result)).toBe(true);
  });

  it("createCheckoutSession validates email", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.marketplace.createCheckoutSession({ productId: 1, buyerEmail: "not-an-email", buyerName: "Test" })
    ).rejects.toThrow();
  });

  it("createCheckoutSession returns Stripe URL for valid product and email", async () => {
    const { getProductById } = await import("./db");
    vi.mocked(getProductById).mockResolvedValueOnce({
      id: 1, title: "Test Product", description: "desc", shortDescription: "short",
      price: 9.99, category: "General", tags: [], isPublished: true, isFeatured: false,
      salesCount: 0, viewCount: 0, rating: 0, solutionId: 1,
      coverImageUrl: null,
      createdAt: new Date(), updatedAt: new Date(),
    });
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.marketplace.createCheckoutSession({
      productId: 1,
      buyerEmail: "buyer@example.com",
      buyerName: "Test Buyer",
    });
    expect(result.checkoutUrl).toContain("checkout.stripe.com");
  });

  it("allProducts requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.marketplace.allProducts({ limit: 10 })
    ).rejects.toThrow();
  });

  it("updateProduct requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.marketplace.updateProduct({ id: 1, price: 99 })
    ).rejects.toThrow();
  });
});

describe("analytics router", () => {
  it("summary returns totals", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.summary();
    expect(result.totalPainPoints).toBe(5);
    expect(result.totalRevenue).toBe(9.99);
  });

  it("revenueByDay returns array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.revenueByDay({ days: 7 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("nicheStats returns array", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.analytics.nicheStats();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("admin router security", () => {
  it("setSetting requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.admin.setSetting({ key: "test", value: "value" })
    ).rejects.toThrow();
  });

  it("createTemplate requires admin", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.admin.createTemplate({ name: "Test", type: "pdf_guide", promptTemplate: "test" })
    ).rejects.toThrow();
  });
});

