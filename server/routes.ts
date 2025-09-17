import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Middleware to extract external user ID from Bearer token
const getExternalUserIdFromSession = (req: any): string | null => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Hash the token to create a consistent external user ID for this session
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Convert to positive ID string with prefix
    const externalUserId = `buyer_${Math.abs(hash % 10000000)}`;
    return externalUserId;
  } catch (error) {
    console.error('Error extracting external user ID from token:', error);
    return null;
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Cart Routes
  
  // GET /api/cart - Get all cart items for current user
  app.get("/api/cart", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const cartItems = await storage.getCartItems(externalUserId);
      res.json({ cartItems });
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  // POST /api/cart - Add item to cart
  app.post("/api/cart", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      // Validate required fields
      const { cropId, plantName, quantity, pricePerUnit, unit, farmName, imageUrl, maxAvailable, cropData } = req.body;
      
      if (!cropId || !plantName || !quantity || !pricePerUnit) {
        return res.status(400).json({ error: "Missing required fields: cropId, plantName, quantity, pricePerUnit" });
      }
      
      // Validate quantity and price
      if (quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
      }
      
      const unitPrice = parseFloat(pricePerUnit);
      if (unitPrice <= 0) {
        return res.status(400).json({ error: "Price per unit must be greater than 0" });
      }
      
      // Server-side calculation of totalPrice to prevent tampering
      const totalPrice = (unitPrice * quantity).toString();
      
      const cartItemData = {
        externalUserId,
        cropId,
        plantName,
        quantity,
        pricePerUnit: unitPrice.toString(),
        totalPrice,
        unit: unit || 'kg',
        farmName,
        imageUrl,
        maxAvailable,
        cropData
      };

      // Check if item already exists in cart
      const existingItem = await storage.getCartItem(externalUserId, cropId);
      
      if (existingItem) {
        // Update quantity if item already exists
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = (unitPrice * newQuantity).toString();
        
        const updatedItem = await storage.updateCartItemQuantity(
          externalUserId,
          existingItem.id,
          newQuantity,
          newTotalPrice
        );
        
        return res.json({ cartItem: updatedItem });
      } else {
        // Add new item to cart
        const cartItem = await storage.addToCart(cartItemData);
        return res.json({ cartItem });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ error: "Failed to add item to cart" });
    }
  });

  // PUT /api/cart/:id - Update cart item quantity
  app.put("/api/cart/:id", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Validate quantity
      if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
        return res.status(400).json({ error: "Quantity must be a positive integer" });
      }
      
      // Get existing cart item to use its stored pricePerUnit (prevent price tampering)
      const existingItem = await storage.getCartItem(externalUserId, '');
      // Need to get by cart item ID, let's find it in all cart items
      const allCartItems = await storage.getCartItems(externalUserId);
      const currentItem = allCartItems.find(item => item.id === cartItemId);
      
      if (!currentItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      
      // Use stored price to prevent tampering
      const storedPricePerUnit = parseFloat(currentItem.pricePerUnit);
      const totalPrice = (storedPricePerUnit * quantity).toString();

      const updatedItem = await storage.updateCartItemQuantity(
        externalUserId,
        cartItemId,
        quantity,
        totalPrice
      );

      if (!updatedItem) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ cartItem: updatedItem });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  // DELETE /api/cart/:id - Remove item from cart
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const cartItemId = parseInt(req.params.id);
      const success = await storage.removeCartItem(externalUserId, cartItemId);

      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }

      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing cart item:", error);
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  // DELETE /api/cart - Clear entire cart
  app.delete("/api/cart", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const success = await storage.clearCart(externalUserId);
      res.json({ message: "Cart cleared", success });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  // GET /api/cart/count - Get cart item count
  app.get("/api/cart/count", async (req, res) => {
    try {
      const externalUserId = getExternalUserIdFromSession(req);
      if (!externalUserId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const cartItems = await storage.getCartItems(externalUserId);
      const count = cartItems.reduce((total, item) => total + item.quantity, 0);
      
      res.json({ count });
    } catch (error) {
      console.error("Error getting cart count:", error);
      res.status(500).json({ error: "Failed to get cart count" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
