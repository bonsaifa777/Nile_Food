import { createContext, useContext, useState, useEffect } from 'react';
import { splitVat } from '../utils/price.js';

const CartContext = createContext(null);

const MAX_CART_IMAGE_LENGTH = 5000;

const sanitizeImage = (img) => {
  if (!img) return '';
  return String(img).length > MAX_CART_IMAGE_LENGTH ? '' : img;
};

const sanitizeCartItem = (item) => ({
  ...item,
  image: sanitizeImage(item.image),
});

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed.map(sanitizeCartItem) : [];
    } catch {
      return [];
    }
  });
  const [itemAdded, setItemAdded] = useState(null);
  const [orderType, setOrderType] = useState('delivery');

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
    } catch {
      // Never crash the app when localStorage is full (e.g. oversized base64 images).
    }
  }, [cart]);

  const addToCart = (food, quantity = 1, size = null, extras = [], specialInstructions = '', removedIngredients = []) => {
    const cartItem = {
      id: `${food._id}-${Date.now()}`,
      food: food._id,
      name: food.name,
      image: sanitizeImage(food.image),
      basePrice: food.price,
      quantity,
      size,
      extras,
      specialInstructions,
      removedIngredients
    };
    
    let totalPrice = food.price;
    if (size) {
      const sizeObj = food.sizes?.find(s => s.name === size);
      if (sizeObj) totalPrice += sizeObj.price;
    }
    if (extras.length > 0) {
      extras.forEach(extra => {
        totalPrice += extra.price;
      });
    }
    cartItem.price = totalPrice * quantity;
    
    setCart(prev => [...prev, cartItem]);
    setItemAdded(cartItem.id);
    setTimeout(() => setItemAdded(null), 2000);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const baseTotal = item.basePrice * quantity;
        const extraTotal = item.extras.reduce((acc, e) => acc + e.price, 0) * quantity;
        return { ...item, quantity, price: baseTotal + extraTotal };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getGrossSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price, 0);
  };

  const getSubtotal = () => {
    return splitVat(getGrossSubtotal()).base;
  };

  const getDeliveryFee = () => {
    if (orderType !== 'delivery') return 0;
    return cart.length > 0 ? 50 : 0;
  };

  const getTax = () => {
    return splitVat(getGrossSubtotal()).tax;
  };

  const getTotal = () => {
    return getGrossSubtotal() + getDeliveryFee();
  };

  const totalItems = () => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      itemAdded,
      orderType,
      setOrderType,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getSubtotal,
      getDeliveryFee,
      getTax,
      getTotal,
      totalItems
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);