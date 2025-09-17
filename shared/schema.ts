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

// Cart Items Table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  cropId: text("crop_id").notNull(), // External API crop ID
  plantName: text("plant_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  unit: text("unit").notNull().default('kg'),
  farmName: text("farm_name"),
  imageUrl: text("image_url"),
  maxAvailable: integer("max_available"),
  cropData: json("crop_data"), // Store original crop data from API
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
}));

// Cart schemas for validation
export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  userId: true,
  cropId: true,
  plantName: true,
  quantity: true,
  pricePerUnit: true,
  totalPrice: true,
  unit: true,
  farmName: true,
  imageUrl: true,
  maxAvailable: true,
  cropData: true,
});

export const updateCartItemSchema = createInsertSchema(cartItems).pick({
  quantity: true,
  totalPrice: true,
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
