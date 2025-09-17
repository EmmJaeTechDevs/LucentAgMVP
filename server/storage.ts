import { users, cartItems, type User, type InsertUser, type CartItem, type InsertCartItem, type UpdateCartItem } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(userId: number, cartItemId: number, quantity: number, totalPrice: string): Promise<CartItem | undefined>;
  removeCartItem(userId: number, cartItemId: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  getCartItem(userId: number, cropId: string): Promise<CartItem | undefined>;
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
  async getCartItems(userId: number): Promise<CartItem[]> {
    return db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db
      .insert(cartItems)
      .values(cartItem)
      .returning();
    return newCartItem;
  }

  async updateCartItemQuantity(userId: number, cartItemId: number, quantity: number, totalPrice: string): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ 
        quantity, 
        totalPrice, 
        updatedAt: new Date()
      })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
      .returning();
    return updatedItem || undefined;
  }

  async removeCartItem(userId: number, cartItemId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)));
    return (result.rowCount ?? 0) > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
    return (result.rowCount ?? 0) >= 0; // Return true even if cart was already empty
  }

  async getCartItem(userId: number, cropId: string): Promise<CartItem | undefined> {
    const [item] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.cropId, cropId)));
    return item || undefined;
  }
}

export const storage = new DatabaseStorage();
