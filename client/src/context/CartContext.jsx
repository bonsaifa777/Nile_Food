import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [itemAdded, setItemAdded] = useState(null);
  const [orderType, setOrderType] = useState('delivery');

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (food, quantity = 1, size = null, extras = [], specialInstructions = '', removedIngredients = []) => {
    const cartItem = {
      id: `${food._id}-${Date.now()}`,
      food: food._id,
      name: food.name,
      image: food.image,
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

  const getSubtotal = () => {
    return cart.reduce((acc, item) => acc + item.price, 0);
  };

  const getDeliveryFee = () => {
    if (orderType !== 'delivery') return 0;
    return cart.length > 0 ? 50 : 0;
  };

  const getTax = () => {
    return getSubtotal() * 0.15;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryFee() + getTax();
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