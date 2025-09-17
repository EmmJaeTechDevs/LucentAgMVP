import { SessionCrypto } from "@/utils/sessionCrypto";

export interface CartItem {
  id: string;
  cropId: string;
  name: string;
  quantity: number;
  price: number;
  pricePerUnit: string;
  unit: string;
  image: any;
  farm: string;
  maxAvailable: number;
  rawCropData: any; // Store original crop data for future reference
}

class CartService {
  private static instance: CartService;
  private cartKey = 'lucentCart';

  private constructor() {}

  public static getInstance(): CartService {
    if (!CartService.instance) {
      CartService.instance = new CartService();
    }
    return CartService.instance;
  }

  // Get the current buyer's user ID from session
  private getCurrentBuyerId(): string | null {
    try {
      const buyerSession = sessionStorage.getItem("buyerSession");
      if (!buyerSession) return null;

      const encryptedSessionData = JSON.parse(buyerSession);
      const sessionData = SessionCrypto.decryptSessionData(encryptedSessionData);
      
      // Use buyer ID or email as unique identifier
      return sessionData.userId || sessionData.email || null;
    } catch (error) {
      console.error("Error getting buyer ID:", error);
      return null;
    }
  }

  // Generate unique cart key for current buyer
  private getBuyerCartKey(): string {
    const buyerId = this.getCurrentBuyerId();
    return buyerId ? `${this.cartKey}_${buyerId}` : this.cartKey;
  }

  // Get all cart items for current buyer
  public getCartItems(): CartItem[] {
    try {
      const cartKey = this.getBuyerCartKey();
      const cartData = localStorage.getItem(cartKey);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error("Error getting cart items:", error);
      return [];
    }
  }

  // Add item to cart or update quantity if it already exists
  public addToCart(cropData: any, quantity: number): boolean {
    try {
      const buyerId = this.getCurrentBuyerId();
      if (!buyerId) {
        console.error("No buyer session found");
        return false;
      }

      const cartItems = this.getCartItems();
      const existingItemIndex = cartItems.findIndex(item => item.cropId === cropData.id);

      const cartItem: CartItem = {
        id: existingItemIndex >= 0 ? cartItems[existingItemIndex].id : `cart_${Date.now()}_${cropData.id}`,
        cropId: cropData.id,
        name: cropData.name,
        quantity: quantity,
        price: cropData.pricePerUnit * quantity,
        pricePerUnit: `₦${cropData.pricePerUnit.toLocaleString()}`,
        unit: cropData.unit || 'unit',
        image: cropData.image,
        farm: cropData.farm,
        maxAvailable: cropData.availableQuantity || cropData.totalQuantity || 999,
        rawCropData: cropData
      };

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].price = cartItems[existingItemIndex].quantity * cropData.pricePerUnit;
      } else {
        // Add new item to cart
        cartItems.push(cartItem);
      }

      const cartKey = this.getBuyerCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  }

  // Update item quantity in cart
  public updateQuantity(cartItemId: string, newQuantity: number): boolean {
    try {
      if (newQuantity < 1) return this.removeFromCart(cartItemId);

      const cartItems = this.getCartItems();
      const itemIndex = cartItems.findIndex(item => item.id === cartItemId);

      if (itemIndex >= 0) {
        const item = cartItems[itemIndex];
        
        // Check if new quantity exceeds available quantity
        if (newQuantity > item.maxAvailable) {
          console.warn(`Cannot add more than ${item.maxAvailable} ${item.unit} for ${item.name}`);
          return false;
        }

        cartItems[itemIndex].quantity = newQuantity;
        cartItems[itemIndex].price = newQuantity * (item.rawCropData.pricePerUnit || 0);

        const cartKey = this.getBuyerCartKey();
        localStorage.setItem(cartKey, JSON.stringify(cartItems));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating cart quantity:", error);
      return false;
    }
  }

  // Remove item from cart
  public removeFromCart(cartItemId: string): boolean {
    try {
      const cartItems = this.getCartItems();
      const filteredItems = cartItems.filter(item => item.id !== cartItemId);

      const cartKey = this.getBuyerCartKey();
      localStorage.setItem(cartKey, JSON.stringify(filteredItems));
      return true;
    } catch (error) {
      console.error("Error removing from cart:", error);
      return false;
    }
  }

  // Clear entire cart for current buyer
  public clearCart(): boolean {
    try {
      const cartKey = this.getBuyerCartKey();
      localStorage.removeItem(cartKey);
      return true;
    } catch (error) {
      console.error("Error clearing cart:", error);
      return false;
    }
  }

  // Get total number of items in cart
  public getCartItemCount(): number {
    const cartItems = this.getCartItems();
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  // Get cart total price
  public getCartTotal(): number {
    const cartItems = this.getCartItems();
    return cartItems.reduce((total, item) => total + item.price, 0);
  }

  // Subscribe to cart changes (for real-time updates)
  public onCartChange(callback: (cartItems: CartItem[]) => void): () => void {
    const handleStorageChange = (e: StorageEvent) => {
      const cartKey = this.getBuyerCartKey();
      if (e.key === cartKey) {
        callback(this.getCartItems());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }
}

export const cartService = CartService.getInstance();