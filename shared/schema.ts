import { pgTable, text, serial, integer, boolean, decimal, timestamp, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const usersRelations = relations(users, ({ many }) => ({
  // No relations needed for localStorage cart
}));

// Simple cart item interface for localStorage
export interface CartItem {
  id: string; // UUID for localStorage
  cropId: string;
  plantName: string;
  quantity: number;
  pricePerUnit: number;
  totalPrice: number;
  unit: string;
  farmName?: string;
  imageUrl?: string;
  maxAvailable?: number;
  cropData?: any;
  createdAt: string; // ISO string
}

export interface AddToCartData {
  cropId: string;
  plantName: string;
  quantity: number;
  pricePerUnit: number;
  unit: string;
  farmName?: string;
  imageUrl?: string;
  maxAvailable?: number;
  cropData?: any;
}
