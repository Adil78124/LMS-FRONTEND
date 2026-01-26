import React, { createContext, useContext, useState, useEffect } from 'react';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Загрузка корзины из API или localStorage
    const loadCart = async () => {
      try {
        // В реальном приложении здесь будет userId из контекста авторизации
        const userId = localStorage.getItem('userId');
        if (userId) {
          const cart = await cartService.getCart(userId);
          setCartItems(cart);
        } else {
          // Fallback на localStorage для мокового режима
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            setCartItems(JSON.parse(savedCart));
          }
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        // Fallback на localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      }
    };
    
    loadCart();
  }, []);

  useEffect(() => {
    // Сохранение корзины в localStorage (для мокового режима)
    // В реальном приложении это будет делаться через API
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = async (course) => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await cartService.addToCart(userId, course.id);
      }
      
      setCartItems((prev) => {
        // Проверка, не добавлен ли уже курс
        if (prev.find((item) => item.id === course.id)) {
          return prev;
        }
        return [...prev, course];
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback на локальное состояние
      setCartItems((prev) => {
        if (prev.find((item) => item.id === course.id)) {
          return prev;
        }
        return [...prev, course];
      });
    }
  };

  const removeFromCart = async (courseId) => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await cartService.removeFromCart(userId, courseId);
      }
      
      setCartItems((prev) => prev.filter((item) => item.id !== courseId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      // Fallback на локальное состояние
      setCartItems((prev) => prev.filter((item) => item.id !== courseId));
    }
  };

  const clearCart = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await cartService.clearCart(userId);
      }
      
      setCartItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Fallback на локальное состояние
      setCartItems([]);
    }
  };

  const isInCart = (courseId) => {
    return cartItems.some((item) => item.id === courseId);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.currentPrice || 0), 0);
  const cartCount = cartItems.length;

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    isInCart,
    cartTotal,
    cartCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
