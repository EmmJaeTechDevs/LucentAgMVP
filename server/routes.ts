import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // All cart functionality has been moved to localStorage in the frontend
  // No cart API routes needed since cart data is stored locally

  // Order placement endpoint - handles external API calls securely
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = req.body;
      
      // Validate required fields
      const requiredFields = ['cropId', 'quantityOrdered', 'deliveryFee', 'deliveryAddress', 'deliveryState', 'deliveryLga'];
      for (const field of requiredFields) {
        if (!orderData[field]) {
          return res.status(400).json({ error: `Missing required field: ${field}` });
        }
      }

      // Make request to external API with buyer token from environment
      const response = await fetch('https://lucent-ag-api-damidek.replit.app/api/buyer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BUYER_TOKEN}`
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