import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CartItem, AddToCartData } from "@shared/schema";

const CART_STORAGE_KEY = "agricultural_marketplace_cart";

class LocalStorageCartService {
  private static instance: LocalStorageCartService;

  private constructor() {}

  public static getInstance(): LocalStorageCartService {
    if (!LocalStorageCartService.instance) {
      LocalStorageCartService.instance = new LocalStorageCartService();
    }
    return LocalStorageCartService.instance;
  }

  // Generate unique ID for cart items
  private generateId(): string {
    return `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get cart items from localStorage
  getCartItems(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];
      
      const items = JSON.parse(stored) as CartItem[];
      return Array.isArray(items) ? items : [];
    } catch (error) {
      console.error("Error reading cart from localStorage:", error);
      return [];
    }
  }

  // Save cart items to localStorage
  private saveCartItems(items: CartItem[]): void {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      throw new Error("Failed to save cart data");
    }
  }

  // Add item to cart
  addToCart(item: AddToCartData): CartItem {
    const items = this.getCartItems();
    
    // Check if item already exists (same cropId) - ensure both are strings for comparison
    const existingIndex = items.findIndex(cartItem => String(cartItem.cropId) === String(item.cropId));
    
    if (existingIndex >= 0) {
      // Update existing item quantity
      items[existingIndex].quantity += item.quantity;
      items[existingIndex].totalPrice = items[existingIndex].quantity * items[existingIndex].pricePerUnit;
      this.saveCartItems(items);
      return items[existingIndex];
    } else {
      // Add new item
      const newItem: CartItem = {
        id: this.generateId(),
        cropId: item.cropId,
        plantName: item.plantName,
        quantity: item.quantity,
        pricePerUnit: item.pricePerUnit,
        totalPrice: item.pricePerUnit * item.quantity,
        unit: item.unit,
        farmName: item.farmName,
        imageUrl: item.imageUrl,
        maxAvailable: item.maxAvailable,
        cropData: item.cropData,
        createdAt: new Date().toISOString(),
      };
      
      items.push(newItem);
      this.saveCartItems(items);
      return newItem;
    }
  }

  // Update cart item quantity
  updateCartItem(id: string, quantity: number): CartItem | null {
    const items = this.getCartItems();
    const itemIndex = items.findIndex(item => item.id === id);
    
    if (itemIndex >= 0) {
      items[itemIndex].quantity = quantity;
      items[itemIndex].totalPrice = quantity * items[itemIndex].pricePerUnit;
      this.saveCartItems(items);
      return items[itemIndex];
    }
    
    return null;
  }

  // Remove item from cart
  removeCartItem(id: string): boolean {
    const items = this.getCartItems();
    const initialLength = items.length;
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length !== initialLength) {
      this.saveCartItems(filteredItems);
      return true;
    }
    
    return false;
  }

  // Clear entire cart
  clearCart(): void {
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  // Get cart item count (sum of all quantities)
  getCartCount(): number {
    const items = this.getCartItems();
    return items.reduce((total, item) => total + item.quantity, 0);
  }
}

export const cartService = LocalStorageCartService.getInstance();

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch cart items from localStorage
  const fetchCartItems = () => {
    setIsLoading(true);
    try {
      const items = cartService.getCartItems();
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
        cropId: String(productData.id || productData.cropId), // Ensure cropId is always a string
        plantName: productData.name,
        quantity,
        pricePerUnit: parseFloat(productData.rawData?.pricePerUnit || 0),
        unit: productData.rawData?.unit || 'kg',
        farmName: productData.farm,
        imageUrl: typeof productData.image === 'string' ? productData.image : undefined,
        maxAvailable: productData.rawData?.availableQuantity || productData.rawData?.totalQuantity,
        cropData: productData.rawData
      };

      cartService.addToCart(cartItemData);
      fetchCartItems(); // Refresh cart items
      
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
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      setIsLoading(true);
      const updatedItem = cartService.updateCartItem(cartItemId, newQuantity);
      
      if (updatedItem) {
        fetchCartItems(); // Refresh cart items
      } else {
        throw new Error("Item not found");
      }
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
  const removeItem = async (cartItemId: string) => {
    try {
      setIsLoading(true);
      const removed = cartService.removeCartItem(cartItemId);
      
      if (removed) {
        fetchCartItems(); // Refresh cart items
        
        toast({
          title: "Removed from Cart",
          description: "Item has been removed from your cart",
        });
      } else {
        throw new Error("Item not found");
      }
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
      cartService.clearCart();
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
  const fetchCartCount = () => {
    try {
      const count = cartService.getCartCount();
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