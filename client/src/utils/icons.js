import {
  FiShoppingBag, FiCreditCard, FiTruck, FiSun, FiMoon, FiHeart, FiCoffee,
  FiGift, FiMusic, FiCamera, FiCalendar, FiTag, FiClock, FiBox, FiStar,
  FiUsers, FiShield, FiAward, FiHome, FiWifi, FiTv, FiMapPin, FiSmartphone,
  FiMonitor, FiCheckCircle, FiShoppingCart
} from 'react-icons/fi';

const iconMap = {
  FiShoppingBag, FiCreditCard, FiTruck, FiSun, FiMoon, FiHeart, FiCoffee,
  FiGift, FiMusic, FiCamera, FiCalendar, FiTag, FiClock, FiBox, FiStar,
  FiUsers, FiShield, FiAward, FiHome, FiWifi, FiTv, FiMapPin, FiSmartphone,
  FiMonitor, FiCheckCircle, FiShoppingCart,
};

export function getIcon(name) {
  return iconMap[name] || FiStar;
}

export function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : '?';
}
