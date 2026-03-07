import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getScanSources, createScanSource, updateScanSource, deleteScanSource,
  getRecentScanJobs,
  getPainPoints, getPainPointById, updatePainPoint, getPainPointCount,
  getSolutions, getSolutionById, updateSolution, getSolutionsByPainPoint,
  getProducts, getProductById, updateProduct, getFeaturedProducts,
  getOrders, getOrderById, updateOrder, createOrder, getOrderByToken,
  getAnalyticsSummary, getRevenueByDay, getPainPointsByNiche,
  getSolutionTemplates, createSolutionTemplate, updateSolutionTemplate,
  getAppSettings, setAppSetting,
  logEvent,
} from "./db";
import { runScan } from "./scanner";
import { generateSolution, publishSolutionAsProduct, prepareSolutionFile, generateDownloadToken } from "./solutionGenerator";
import { nanoid } from "nanoid";

// Admin guard middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ---- Scanner ----
  scanner: router({
    getSources: publicProcedure.query(() => getScanSources()),

    createSource: adminProcedure.input(z.object({
      name: z.string().min(1),
      type: z.enum(["reddit", "forum", "twitter", "hackernews", "quora", "producthunt", "custom"]),
      url: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      scanIntervalMinutes: z.number().default(60),
    })).mutation(({ input }) => createScanSource(input)),

    updateSource: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      type: z.enum(["reddit", "forum", "twitter", "hackernews", "quora", "producthunt", "custom"]).optional(),
      url: z.string().optional(),
      keywords: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
      scanIntervalMinutes: z.number().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateScanSource(id, data);
    }),

    deleteSource: adminProcedure.input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteScanSource(input.id)),

    getRecentJobs: publicProcedure.input(z.object({ limit: z.number().default(20) }))
      .query(({ input }) => getRecentScanJobs(input.limit)),

    triggerScan: adminProcedure.input(z.object({ sourceId: z.number().optional() }))
      .mutation(async ({ input }) => {
        // Run scan in background
        runScan(input.sourceId).catch(console.error);
        return { message: "Scan started", status: "running" };
      }),

    triggerScanPublic: publicProcedure.input(z.object({ sourceId: z.number().optional() }))
      .mutation(async ({ input }) => {
        runScan(input.sourceId).catch(console.error);
        return { message: "Scan started", status: "running" };
      }),
  }),

  // ---- Pain Points ----
  painPoints: router({
    list: publicProcedure.input(z.object({
      status: z.string().optional(),
      niche: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(({ input }) => getPainPoints(input)),

    getById: publicProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => getPainPointById(input.id)),

    count: publicProcedure.query(() => getPainPointCount()),

    update: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["new", "analyzed", "solution_pending", "solution_ready", "published", "archived"]).optional(),
      niche: z.string().optional(),
      tags: z.array(z.string()).optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updatePainPoint(id, data);
    }),

    generateSolution: adminProcedure.input(z.object({
      painPointId: z.number(),
      type: z.enum(["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]).optional(),
    })).mutation(async ({ input }) => {
      return generateSolution(input.painPointId, input.type);
    }),

    generateSolutionPublic: publicProcedure.input(z.object({
      painPointId: z.number(),
      type: z.enum(["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]).optional(),
    })).mutation(async ({ input }) => {
      return generateSolution(input.painPointId, input.type);
    }),

    getNicheStats: publicProcedure.query(() => getPainPointsByNiche()),
  }),

  // ---- Solutions ----
  solutions: router({
    list: publicProcedure.input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(({ input }) => getSolutions(input)),

    getById: publicProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => getSolutionById(input.id)),

    getByPainPoint: publicProcedure.input(z.object({ painPointId: z.number() }))
      .query(({ input }) => getSolutionsByPainPoint(input.painPointId)),

    review: adminProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      reviewNotes: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSolution(id, data);
      return { success: true };
    }),

    reviewPublic: publicProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["approved", "rejected"]),
      reviewNotes: z.string().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
    })).mutation(async ({ input }) => {
      const { id, ...data } = input;
      await updateSolution(id, data);
      return { success: true };
    }),

    publish: adminProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const productId = await publishSolutionAsProduct(input.id);
        return { success: true, productId };
      }),

    publishPublic: publicProcedure.input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const productId = await publishSolutionAsProduct(input.id);
        return { success: true, productId };
      }),
  }),

  // ---- Marketplace ----
  marketplace: router({
    listProducts: publicProcedure.input(z.object({
      category: z.string().optional(),
      search: z.string().optional(),
      limit: z.number().default(24),
      offset: z.number().default(0),
    })).query(({ input }) => getProducts({ ...input, published: true })),

    allProducts: adminProcedure.input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(({ input }) => getProducts(input)),

    allProductsPublic: publicProcedure.input(z.object({
      limit: z.number().default(50),
      offset: z.number().default(0),
    })).query(({ input }) => getProducts(input)),

    getProduct: publicProcedure.input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (product) {
          await updateProduct(input.id, { viewCount: (product.viewCount || 0) + 1 });
          await logEvent('product_viewed', input.id, 'product');
        }
        return product;
      }),

    getFeatured: publicProcedure.query(() => getFeaturedProducts(6)),

    updateProduct: adminProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      price: z.number().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateProduct(id, data);
    }),

    updateProductPublic: publicProcedure.input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      shortDescription: z.string().optional(),
      price: z.number().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
      isFeatured: z.boolean().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateProduct(id, data);
    }),

    // Checkout (simulated - no real payment)
    checkout: publicProcedure.input(z.object({
      productId: z.number(),
      buyerEmail: z.string().email(),
      buyerName: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const product = await getProductById(input.productId);
      if (!product || !product.isPublished) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
      }

      const downloadToken = await generateDownloadToken();
      const downloadExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const order = await createOrder({
        productId: input.productId,
        userId: ctx.user?.id,
        buyerEmail: input.buyerEmail,
        buyerName: input.buyerName,
        amount: product.price,
        status: 'completed',
        paymentMethod: 'demo',
        deliveryStatus: 'pending',
        downloadToken,
        downloadExpiresAt,
      });

      // Update product sales count
      await updateProduct(input.productId, { salesCount: (product.salesCount || 0) + 1 });
      await logEvent('order_placed', order.id, 'order', { productId: input.productId, amount: product.price });
      await logEvent('order_completed', order.id, 'order', { productId: input.productId, amount: product.price });

      return {
        orderId: order.id,
        downloadToken,
        downloadUrl: `/api/download/${downloadToken}`,
        message: "Order completed! Check your email for download link.",
      };
    }),

    getDownload: publicProcedure.input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const order = await getOrderByToken(input.token);
        if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid download token" });
        if (order.downloadExpiresAt && new Date() > order.downloadExpiresAt) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Download link expired" });
        }

        const product = await getProductById(order.productId);
        if (!product) throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });

        // Get solution file URL
        const { getSolutionById } = await import("./db");
        const solution = await getSolutionById(product.solutionId);
        let fileUrl = solution?.fileUrl;
        if (!fileUrl && solution) {
          fileUrl = await prepareSolutionFile(solution.id);
        }

        await updateOrder(order.id, { deliveryStatus: 'sent' });

        return { product, fileUrl, order: { id: order.id, buyerEmail: order.buyerEmail } };
      }),
  }),

  // ---- Orders ----
  orders: router({
    list: adminProcedure.input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
    })).query(({ input }) => getOrders(input)),

    listPublic: publicProcedure.input(z.object({
      status: z.string().optional(),
      limit: z.number().default(50),
    })).query(({ input }) => getOrders(input)),

    getById: adminProcedure.input(z.object({ id: z.number() }))
      .query(({ input }) => getOrderById(input.id)),
  }),

  // ---- Analytics ----
  analytics: router({
    summary: publicProcedure.query(() => getAnalyticsSummary()),
    revenueByDay: publicProcedure.input(z.object({ days: z.number().default(30) }))
      .query(({ input }) => getRevenueByDay(input.days)),
    nicheStats: publicProcedure.query(() => getPainPointsByNiche()),
  }),

  // ---- Admin ----
  admin: router({
    getSettings: publicProcedure.query(() => getAppSettings()),

    setSetting: adminProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })).mutation(({ input }) => setAppSetting(input.key, input.value, input.description)),

    setSettingPublic: publicProcedure.input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })).mutation(({ input }) => setAppSetting(input.key, input.value, input.description)),

    getTemplates: publicProcedure.query(() => getSolutionTemplates()),

    createTemplate: adminProcedure.input(z.object({
      name: z.string(),
      type: z.enum(["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]),
      promptTemplate: z.string(),
      defaultPrice: z.number().optional(),
    })).mutation(({ input }) => createSolutionTemplate(input)),

    createTemplatePublic: publicProcedure.input(z.object({
      name: z.string(),
      type: z.enum(["automation_script", "pdf_guide", "mini_tool", "checklist", "template", "video_script"]),
      promptTemplate: z.string(),
      defaultPrice: z.number().optional(),
    })).mutation(({ input }) => createSolutionTemplate(input)),

    updateTemplate: adminProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      promptTemplate: z.string().optional(),
      defaultPrice: z.number().optional(),
      isActive: z.boolean().optional(),
    })).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateSolutionTemplate(id, data);
    }),
  }),
});

export type AppRouter = typeof appRouter;
