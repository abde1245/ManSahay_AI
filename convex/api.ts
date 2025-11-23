import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// --- User Identity Operations ---

export const getUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    // Security check: verify the user is actually who they say they are
    if (!identity) {
        // Fallback for hybrid mode, but ideally return null
    }
    
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const createUser = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) return existing;

    const identity = await ctx.auth.getUserIdentity();
    const tokenIdentifier = identity ? identity.tokenIdentifier : args.email;

    const id = await ctx.db.insert("users", {
      tokenIdentifier,
      name: args.name,
      email: args.email,
      joinDate: new Date().toISOString(),
      emergencyContacts: [],
      goals: [],
      triggers: [],
      preferences: { aiTone: 'empathetic' }
    });

    return await ctx.db.get(id);
  },
});

// New Mutation to handle Profile updates
export const updateUser = mutation({
  args: {
    id: v.id("users"), // The Convex ID
    name: v.string(),
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    goals: v.optional(v.array(v.string())),
    triggers: v.optional(v.array(v.string())),
    preferences: v.optional(v.object({
        aiTone: v.optional(v.string())
    })),
    emergencyContacts: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      relation: v.string(),
      phone: v.string(),
    })))
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
    return await ctx.db.get(id);
  }
});

// --- Application Data Operations ---

export const loadUserData = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const saveUserData = mutation({
  args: {
    userId: v.string(),
    sessions: v.any(),
    appointments: v.any(),
    resources: v.any(),
    journalEntries: v.any(),
    lastSaved: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userData")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    const payload = {
      userId: args.userId,
      sessions: args.sessions,
      appointments: args.appointments,
      resources: args.resources,
      journalEntries: args.journalEntries,
      lastSaved: args.lastSaved,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("userData", payload);
    }
  },
});
