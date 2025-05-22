import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    date: v.optional(v.string()),
    priority: v.optional(v.string()),
    reminder: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    user_id: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("task", {
      title: args.title,
      date: args.date,
      priority: args.priority,
      reminder: args.reminder,
      completed: args.completed ?? false, // Default to false if not provided
      user_id: args.user_id,
      username: args.username,
    });
    return taskId;
  },
});

// Get all tasks for a specific user
export const getTasksByUser = query({
  args: { user_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("task")
      .filter((q) => q.eq(q.field("user_id"), args.user_id))
      .collect();
  },
});

// Get a specific task by ID
export const getTask = query({
  args: { id: v.id("task") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    id: v.id("task"),
    title: v.optional(v.string()),
    date: v.optional(v.string()),
    priority: v.optional(v.string()),
    reminder: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...fieldsToUpdate } = args;
    
    // Create a properly typed object for the fields to update
    const updates: Record<string, string | boolean | undefined> = {
      title: fieldsToUpdate.title,
      date: fieldsToUpdate.date,
      priority: fieldsToUpdate.priority,
      reminder: fieldsToUpdate.reminder,
      completed: fieldsToUpdate.completed
    };
    
    // Remove undefined fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );
    
    await ctx.db.patch(id, filteredUpdates);
    return id;
  },
});

// Delete a task
export const deleteTask = mutation({
  args: { id: v.id("task") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
