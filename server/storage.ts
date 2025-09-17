import { users, cartItems, type User, type InsertUser, type CartItem, type InsertCartItem } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cart operations
  getCartItems(externalUserId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(externalUserId: string, cartItemId: number, quantity: number, totalPrice: string): Promise<CartItem | undefined>;
  removeCartItem(externalUserId: string, cartItemId: number): Promise<boolean>;
  clearCart(externalUserId: string): Promise<boolean>;
  getCartItem(externalUserId: string, cropId: string): Promise<CartItem | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Cart operations
  async getCartItems(externalUserId: string): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.externalUserId, externalUserId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db
      .insert(cartItems)
      .values(cartItem)
      .returning();
    return newCartItem;
  }

  async updateCartItemQuantity(externalUserId: string, cartItemId: number, quantity: number, totalPrice: string): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ 
        quantity, 
        totalPrice, 
        updatedAt: new Date()
      })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.externalUserId, externalUserId)))
      .returning();
    return updatedItem || undefined;
  }

  async removeCartItem(externalUserId: string, cartItemId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.externalUserId, externalUserId)));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(externalUserId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.externalUserId, externalUserId));
    return (result.rowCount ?? 0) >= 0; // Return true even if cart was already empty
  }

  async getCartItem(externalUserId: string, cropId: string): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.externalUserId, externalUserId), eq(cartItems.cropId, cropId)));
    return item || undefined;
  }
}

export const storage = new DatabaseStorage();
