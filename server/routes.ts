import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { BaseUrl } from "../Baseconfig";

export async function registerRoutes(app: Express): Promise<Server> {
  // All cart functionality has been moved to localStorage in the frontend
  // No cart API routes needed since cart data is stored locally

  // Order placement endpoint - handles external API calls with dynamic buyer tokens
  app.post('/api/orders', async (req, res) => {
    try {
      const { buyerToken, ...orderData } = req.body;
      
      // Validate buyer token
      if (!buyerToken) {
        return res.status(401).json({ error: 'Buyer token is required' });
      }
      
      // Validate required fields
      const requiredFields = ['cropId', 'quantityOrdered', 'deliveryFee', 'deliveryAddress', 'deliveryState', 'deliveryLga'];
      for (const field of requiredFields) {
        const value = orderData[field];
        // Allow 0 for numeric fields, only reject if truly missing
        if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // Make request to external API with buyer token from request
      const response = await fetch(`${BaseUrl}/api/buyer/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${buyerToken}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('External API error:', error);
        return res.status(response.status).json({ error: 'Failed to place order with external service' });
      }

      const result = await response.json();
      res.json(result);
    } catch (error) {
      console.error('Order placement error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}