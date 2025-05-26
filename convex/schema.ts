import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Define the "task" table with the specified columns
  task: defineTable({
    title: v.string(),
    date: v.optional(v.string()),
    priority: v.optional(v.string()),
    reminder: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    user_id: v.string(),
    username: v.string(),
    email: v.optional(v.string()), // Added email field for the logged-in user
  }),
});
