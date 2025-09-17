import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { SessionCrypto } from "@/utils/sessionCrypto";

export interface CartItem {
  id: number;
  userId: number;
  cropId: string;
  plantName: string;
  quantity: number;
  pricePerUnit: string;
  totalPrice: string;
  unit: string;
  farmName?: string;
  imageUrl?: string;
  maxAvailable?: number;
  cropData?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartData {
  cropId: string;
  plantName: string;
  quantity: number;
  pricePerUnit: string;
  totalPrice: string;
  unit: string;
  farmName?: string;
  imageUrl?: string;
  maxAvailable?: number;
  cropData?: any;
}

class CartService {
  private static instance: CartService;
  private apiUrl = "/api/cart";

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Get Authorization headers with buyer token
  private getAuthHeaders(): HeadersInit {
    try {
      const buyerSession = sessionStorage.getItem("buyerSession");
      if (!buyerSession) {
        throw new Error("No buyer session found");
      }

      const encryptedSessionData = JSON.parse(buyerSession);
      const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
      const now = new Date().getTime();
      
      if (now >= sessionData.expiry) {
        throw new Error("Buyer session has expired");
      }

      const token = sessionData.token;
      if (!token) {
        throw new Error("No buyer token found in session");
      }

      return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      };
    } catch (error) {
      console.error("Error getting auth headers:", error);
      throw error;
    }
  }

  // Get all cart items
  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await fetch(this.apiUrl, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return data.cartItems || [];
      }
      throw new Error(`Failed to fetch cart items: ${response.status}`);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(item: AddToCartData): Promise<CartItem> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(item),
      });

      if (response.ok) {
        const data = await response.json();
        return data.cartItem;
      }
      throw new Error(`Failed to add to cart: ${response.status}`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  }

  // Update cart item quantity
  async updateCartItem(id: number, quantity: number, pricePerUnit: number): Promise<CartItem> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          quantity,
          pricePerUnit: pricePerUnit.toString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.cartItem;
      }
      throw new Error(`Failed to update cart item: ${response.status}`);
    } catch (error) {
      console.error("Error updating cart item:", error);
      throw error;
    }
  }

  // Remove item from cart
  async removeCartItem(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to remove cart item: ${response.status}`);
      }
    } catch (error) {
      console.error("Error removing cart item:", error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<void> {
    try {
      const response = await fetch(this.apiUrl, {
        method: "DELETE",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.status}`);
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    }
  }

  // Get cart item count
  async getCartCount(): Promise<number> {
    try {
      const response = await fetch(`${this.apiUrl}/count`, {
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        return data.count || 0;
      }
      throw new Error(`Failed to fetch cart count: ${response.status}`);
    } catch (error) {
      console.error("Error fetching cart count:", error);
      return 0;
    }
  }
}

export const cartService = CartService.getInstance();

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch cart items
  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const items = await cartService.getCartItems();
      setCartItems(items);
      const count = items.reduce((total, item) => total + item.quantity, 0);
      setCartCount(count);
    } catch (error) {
      console.error("Failed to fetch cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productData: any, quantity: number) => {
    try {
      setIsLoading(true);
      
      // Transform product data to cart item format
      const cartItemData: AddToCartData = {
        cropId: productData.id || productData.cropId,
        plantName: productData.name,
        quantity,
        pricePerUnit: parseFloat(productData.rawData?.pricePerUnit || 0).toString(),
        totalPrice: (parseFloat(productData.rawData?.pricePerUnit || 0) * quantity).toString(),
        unit: productData.rawData?.unit || 'kg',
        farmName: productData.farm,
        imageUrl: typeof productData.image === 'string' ? productData.image : undefined,
        maxAvailable: productData.rawData?.availableQuantity || productData.rawData?.totalQuantity,
        cropData: productData.rawData
      };

      await cartService.addToCart(cartItemData);
      await fetchCartItems(); // Refresh cart items
      
      toast({
        title: "Added to Cart",
        description: `${productData.name} has been added to your cart`,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update cart item quantity
  const updateQuantity = async (cartItemId: number, newQuantity: number, pricePerUnit: number) => {
    try {
      setIsLoading(true);
      await cartService.updateCartItem(cartItemId, newQuantity, pricePerUnit);
      await fetchCartItems(); // Refresh cart items
    } catch (error) {
      console.error("Failed to update cart item:", error);
      toast({
        title: "Error",
        description: "Failed to update cart item",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeItem = async (cartItemId: number) => {
    try {
      setIsLoading(true);
      await cartService.removeCartItem(cartItemId);
      await fetchCartItems(); // Refresh cart items
      
      toast({
        title: "Removed from Cart",
        description: "Item has been removed from your cart",
      });
    } catch (error) {
      console.error("Failed to remove cart item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      setIsLoading(true);
      await cartService.clearCart();
      setCartItems([]);
      setCartCount(0);
      
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch cart count only (for badge display)
  const fetchCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      setCartCount(count);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };

  // Initialize cart on mount
  useEffect(() => {
    fetchCartItems();
  }, []);

  return {
    cartItems,
    cartCount,
    isLoading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCartItems,
    fetchCartCount,
  };
}