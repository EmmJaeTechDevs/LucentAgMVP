import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // All cart functionality has been moved to localStorage in the frontend
  // No cart API routes needed since cart data is stored locally

  const httpServer = createServer(app);

  return httpServer;
}