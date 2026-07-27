import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      setCartItemsCount(0);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      if (res.data && res.data.success) {
        setCart(res.data.data);
        const count = res.data.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartItemsCount(count);
      }
    } catch (err) {
      console.error("Error fetching cart", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post(`/cart/items?productId=${productId}&quantity=${quantity}`);
      if (res.data && res.data.success) {
        setCart(res.data.data);
        const count = res.data.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartItemsCount(count);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      return { success: false, message: msg };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${cartItemId}?quantity=${quantity}`);
      if (res.data && res.data.success) {
        setCart(res.data.data);
        const count = res.data.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartItemsCount(count);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message: msg };
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      if (res.data && res.data.success) {
        setCart(res.data.data);
        const count = res.data.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        setCartItemsCount(count);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      return { success: false, message: msg };
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart');
      if (res.data && res.data.success) {
        setCart(null);
        setCartItemsCount(0);
        return { success: true };
      }
    } catch (err) {
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  return (
    <CartContext.Provider value={{ cart, cartItemsCount, loading, addToCart, updateQuantity, removeFromCart, clearCart, refreshCart: fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
export default CartContext;
