import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users table updated to match new types.ts ProfileModal requirements
  users: defineTable({
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),
    joinDate: v.string(),
    
    // New optional profile fields
    phone: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    
    // Arrays for new features
    goals: v.optional(v.array(v.string())),
    triggers: v.optional(v.array(v.string())),
    
    // Nested Objects
    preferences: v.optional(v.object({
      aiTone: v.optional(v.string()), // 'empathetic' | 'direct' etc.
    })),
    
    emergencyContacts: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      relation: v.string(),
      phone: v.string(),
    }))),
  })
  .index("by_token", ["tokenIdentifier"])
  .index("by_email", ["email"]),

  // User Data Storage (Chats, Resources, etc)
  userData: defineTable({
    userId: v.string(), 
    // We use v.any() for complex nested structures to ensure
    // saving doesn't fail if types.ts changes slightly.
    sessions: v.any(), 
    appointments: v.any(),
    resources: v.any(),
    journalEntries: v.any(),
    lastSaved: v.string(),
  }).index("by_userId", ["userId"]),
});