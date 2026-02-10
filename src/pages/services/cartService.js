// Сервис для работы с корзиной
// Готов для интеграции с бэкендом
import { API_BASE_URL } from '../../config/api';

// Получить корзину пользователя
export const getCart = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    // Fallback на localStorage для мокового режима
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }
};

// Добавить курс в корзину
export const addToCart = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, courseId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    // Fallback на localStorage для мокового режима
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!cart.find(item => item.id === courseId)) {
      cart.push({ id: courseId });
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    return { success: true };
  }
};

// Удалить курс из корзины
export const removeFromCart = async (userId, courseId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/${courseId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove from cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    // Fallback на localStorage для мокового режима
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter(item => item.id !== courseId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    return { success: true };
  }
};

// Очистить корзину
export const clearCart = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/clear`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to clear cart');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error clearing cart:', error);
    // Fallback на localStorage для мокового режима
    localStorage.setItem('cart', '[]');
    return { success: true };
  }
};

// Оформить заказ (checkout)
export const checkout = async (userId, paymentData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ userId, ...paymentData }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to checkout');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};
