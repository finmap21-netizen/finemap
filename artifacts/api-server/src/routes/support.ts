import { Router } from "express";
import { db } from "@workspace/db";
import { supportMessages, insertSupportMessageSchema } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { requireAuth, requireAdmin } from "../lib/auth";

export const supportRouter = Router();

// Get all support messages (Admin only)
supportRouter.get("/messages", requireAdmin, async (req, res) => {
  try {
    const messages = await db.select().from(supportMessages).orderBy(desc(supportMessages.createdAt));
    res.json(messages);
  } catch (error) {
    console.error("Error fetching support messages:", error);
    res.status(500).json({ error: "Failed to fetch support messages" });
  }
});

// Mark message as read (Admin only)
supportRouter.post("/messages/:id/read", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [updated] = await db
      .update(supportMessages)
      .set({ isRead: true })
      .where(eq(supportMessages.id, id))
      .returning();
    
    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({ error: "Failed to mark message as read" });
  }
});

// Create a new support message (User)
supportRouter.post("/messages", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { firstName, lastName, message } = req.body;
    
    if (!firstName || !lastName || !message) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    const [newMessage] = await db.insert(supportMessages).values({
      userId,
      firstName,
      lastName,
      message,
    }).returning();
    
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error creating support message:", error);
    res.status(500).json({ error: "Failed to create support message" });
  }
});

// Reply to a message (Admin only)
supportRouter.post("/messages/:id/reply", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { reply } = req.body;
    
    if (!reply) {
      return res.status(400).json({ error: "Reply message is required" });
    }
    
    const [updated] = await db
      .update(supportMessages)
      .set({ adminReply: reply, isRead: true })
      .where(eq(supportMessages.id, id))
      .returning();
      
    if (!updated) {
      return res.status(404).json({ error: "Message not found" });
    }
    
    res.json(updated);
  } catch (error) {
    console.error("Error replying to message:", error);
    res.status(500).json({ error: "Failed to reply to message" });
  }
});

// Get user's own messages (User)
supportRouter.get("/messages/my", requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const messages = await db
      .select()
      .from(supportMessages)
      .where(eq(supportMessages.userId, userId))
      .orderBy(desc(supportMessages.createdAt));
      
    res.json(messages);
  } catch (error) {
    console.error("Error fetching user messages:", error);
    res.status(500).json({ error: "Failed to fetch your messages" });
  }
});
