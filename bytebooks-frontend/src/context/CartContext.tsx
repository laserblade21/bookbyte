
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the cart item interface
export interface CartItem {
  id: number; // Changed from string to number
  title: string;
  author: string;
  imageUrl?: string;
  price: number;
  quantity: number;
}

// Define the cart context interface
interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: number) => boolean;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

// Create the context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  isItemInCart: () => false,
  getTotalItems: () => 0,
  getTotalPrice: () => 0
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize cart from localStorage or empty array
  const [items, setItems] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Add an item to the cart
  const addItem = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems(currentItems => {
      // Check if the item already exists in the cart
      const existingItemIndex = currentItems.findIndex(
        cartItem => cartItem.id === item.id
      );

      if (existingItemIndex >= 0) {
        // Create a new array with the updated quantity
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += item.quantity || 1;
        return newItems;
      } else {
        // Add the new item with quantity 1 or the specified quantity
        return [...currentItems, { ...item, quantity: item.quantity || 1 }];
      }
    });
  };

  // Remove an item from the cart
  const removeItem = (id: number) => {
    setItems(currentItems => 
      currentItems.filter(item => item.id !== id)
    );
  };

  // Update the quantity of an item
  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      // If quantity is 0 or less, remove the item
      removeItem(id);
      return;
    }

    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setItems([]);
  };

  // Check if an item is in the cart
  const isItemInCart = (id: number) => {
    return items.some(item => item.id === id);
  };

  // Get the total number of items in the cart
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get the total price of all items in the cart
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Provide the cart context to children
  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isItemInCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;