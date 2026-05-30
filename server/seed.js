import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Food from './models/Food.js';
import Table from './models/Table.js';
import { hashPassword } from './shared/utils.js';
import { ROLES } from './shared/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const lanEnv = path.join(__dirname, '.env.lan');
if (fs.existsSync(lanEnv)) {
  dotenv.config({ path: lanEnv, override: true });
}

const categories = [
  { name: 'Fast Food', description: 'Quick and tasty fast food options', color: '#eab308' },
  { name: 'Burgers', description: 'Juicy burgers with premium ingredients', color: '#f97316' },
  { name: 'Pizza', description: 'Authentic Italian pizzas', color: '#ef4444' },
  { name: 'Chicken', description: 'Delicious chicken dishes', color: '#d97706' },
  { name: 'Traditional', description: 'Traditional and authentic cuisine', color: '#a16207' },
  { name: 'Desserts', description: 'Sweet treats and desserts', color: '#ec4899' },
  { name: 'Drinks', description: 'Refreshing drinks and beverages', color: '#06b6d4' },
  { name: 'Healthy', description: 'Healthy and nutritious options', color: '#22c55e' },
  { name: 'Breakfast', description: 'Start your day with our delicious breakfast items', color: '#f59e0b' },
  { name: 'Lunch', description: 'Perfect lunch options for busy days', color: '#10b981' },
  { name: 'Dinner', description: 'Evening meals to end your day', color: '#8b5cf6' },
  { name: 'Vegan', description: 'Plant-based and vegan-friendly options', color: '#16a34a' },
  { name: 'Seafood', description: 'Fresh seafood selections', color: '#0d9488' },
  { name: 'BBQ & Grill', description: 'Smoky BBQ and grilled specialties', color: '#dc2626' },
  { name: 'Hotel Specials', description: 'Exclusive hotel signature dishes', color: '#7c3aed' },
  { name: 'Beverages', description: 'Refreshing drinks', color: '#0891b2' },
  { name: 'Snacks', description: 'Quick bites and snacks', color: '#ca8a04' }
];

const foods = [
  {
    name: 'Pepperoni Pizza', description: 'Classic pepperoni with mozzarella cheese on our signature hand-tossed crust, baked to golden perfection with a rich tomato base.', price: 350, category: 'Pizza', featured: true,
    sizes: [{ name: 'Medium', price: 0 }, { name: 'Large', price: 100 }],
    extras: [{ name: 'Extra Cheese', price: 25, image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Mushrooms', price: 20, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Pizza Dough', amount: '200g', image: 'https://images.unsplash.com/photo-1543826173-1beeb97525d8?w=100&h=100&fit=crop' }, { name: 'Mozzarella', amount: '150g', image: 'https://images.unsplash.com/photo-1634487359989-3e90c9432133?w=100&h=100&fit=crop' }, { name: 'Pepperoni', amount: '80g', image: 'https://images.unsplash.com/photo-1626108836803-2f6e9e4c0a5b?w=100&h=100&fit=crop' }, { name: 'Tomato Sauce', amount: '100ml', image: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten'],
    nutritionalInfo: { servingSize: '1 slice', calories: 285, totalFat: '12g', saturatedFat: '5g', cholesterol: '35mg', sodium: '640mg', totalCarbohydrates: '32g', dietaryFiber: '2g', sugars: '3g', protein: '13g' }
  },
  {
    name: 'Margherita Pizza', description: 'Fresh tomatoes, mozzarella, and basil on a thin crispy crust drizzled with extra virgin olive oil.', price: 300, category: 'Pizza', featured: true,
    ingredients: [{ name: 'Pizza Dough', amount: '180g', image: 'https://images.unsplash.com/photo-1543826173-1beeb97525d8?w=100&h=100&fit=crop' }, { name: 'Fresh Mozzarella', amount: '120g', image: 'https://images.unsplash.com/photo-1634487359989-3e90c9432133?w=100&h=100&fit=crop' }, { name: 'Tomatoes', amount: '100g', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop' }, { name: 'Basil', amount: '5 leaves', image: 'https://images.unsplash.com/photo-1596865261581-56e7cd68363a?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten'],
    nutritionalInfo: { servingSize: '1 slice', calories: 250, totalFat: '10g', saturatedFat: '4g', cholesterol: '20mg', sodium: '520mg', totalCarbohydrates: '30g', dietaryFiber: '2g', sugars: '4g', protein: '11g' }
  },
  {
    name: 'BBQ Chicken Pizza', description: 'Grilled chicken with tangy BBQ sauce, red onions, and a blend of cheeses on a crispy crust.', price: 400, category: 'Pizza',
    extras: [{ name: 'Extra Chicken', price: 50, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' }, { name: 'Jalapenos', price: 15, image: 'https://images.unsplash.com/photo-1515516969-d7e29e74c4a6?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Pizza Dough', amount: '200g', image: 'https://images.unsplash.com/photo-1543826173-1beeb97525d8?w=100&h=100&fit=crop' }, { name: 'Grilled Chicken', amount: '120g', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' }, { name: 'BBQ Sauce', amount: '60ml', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=100&h=100&fit=crop' }, { name: 'Red Onions', amount: '40g', image: 'https://images.unsplash.com/photo-1508747703728-777eb9f12d45?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten'],
    nutritionalInfo: { servingSize: '1 slice', calories: 320, totalFat: '14g', saturatedFat: '5g', cholesterol: '45mg', sodium: '780mg', totalCarbohydrates: '34g', dietaryFiber: '1g', sugars: '8g', protein: '18g' }
  },
  {
    name: 'Classic Burger', description: 'Juicy beef patty with fresh lettuce, tomato, onion, and our special sauce in a toasted brioche bun.', price: 180, category: 'Burgers', featured: true,
    sizes: [{ name: 'Regular', price: 0 }, { name: 'Large', price: 50 }],
    extras: [{ name: 'Extra Cheese', price: 20, image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Bacon', price: 30, image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Fried Egg', price: 15, image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Beef Patty', amount: '150g', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100&fit=crop' }, { name: 'Brioche Bun', amount: '1', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Lettuce', amount: '2 leaves', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }, { name: 'Tomato', amount: '3 slices', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop' }],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionalInfo: { servingSize: '1 burger', calories: 550, totalFat: '32g', saturatedFat: '12g', cholesterol: '85mg', sodium: '920mg', totalCarbohydrates: '38g', dietaryFiber: '2g', sugars: '6g', protein: '28g' }
  },
  {
    name: 'Chicken Burger', description: 'Grilled chicken breast with special sauce, lettuce, and pickles on a sesame seed bun.', price: 150, category: 'Burgers',
    extras: [{ name: 'Extra Cheese', price: 20, image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Bacon', price: 30, image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Chicken Breast', amount: '180g', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' }, { name: 'Sesame Bun', amount: '1', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Lettuce', amount: '2 leaves', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }, { name: 'Pickles', amount: '4 slices', image: 'https://images.unsplash.com/photo-1526412550699-e3192fe0a2e5?w=100&h=100&fit=crop' }],
    allergens: ['Gluten'],
    nutritionalInfo: { servingSize: '1 burger', calories: 420, totalFat: '18g', saturatedFat: '4g', cholesterol: '75mg', sodium: '780mg', totalCarbohydrates: '34g', dietaryFiber: '1g', sugars: '5g', protein: '32g' }
  },
  {
    name: 'Veggie Burger', description: 'Plant-based patty with fresh vegetables, avocado, and vegan mayo.', price: 160, category: 'Burgers',
    ingredients: [{ name: 'Plant Patty', amount: '150g', image: 'https://images.unsplash.com/photo-1610440042657-612c34d95e9f?w=100&h=100&fit=crop' }, { name: 'Whole Wheat Bun', amount: '1', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Avocado', amount: '1/2', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop' }, { name: 'Mixed Greens', amount: '30g', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }],
    allergens: ['Gluten'],
    nutritionalInfo: { servingSize: '1 burger', calories: 380, totalFat: '16g', saturatedFat: '3g', cholesterol: '0mg', sodium: '650mg', totalCarbohydrates: '42g', dietaryFiber: '8g', sugars: '4g', protein: '18g' }
  },
  {
    name: 'Grilled Salmon', description: 'Fresh Atlantic salmon fillet seasoned with herbs and lemon, served with seasonal vegetables and rice.', price: 450, category: 'Dinner', featured: true,
    extras: [{ name: 'Extra Vegetables', price: 30, image: 'https://images.unsplash.com/photo-1566385101042-1a0dd0b126af?w=100&h=100&fit=crop' }, { name: 'Garlic Butter', price: 20, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Atlantic Salmon', amount: '250g', image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop' }, { name: 'Lemon', amount: '1/2', image: 'https://images.unsplash.com/photo-1590502593387-255f8b92c0c7?w=100&h=100&fit=crop' }, { name: 'Mixed Herbs', amount: '10g', image: 'https://images.unsplash.com/photo-1596865261581-56e7cd68363a?w=100&h=100&fit=crop' }, { name: 'Jasmine Rice', amount: '200g', image: 'https://images.unsplash.com/photo-1536304993881-ff6e9eebe2a6?w=100&h=100&fit=crop' }],
    allergens: ['Fish'],
    nutritionalInfo: { servingSize: '1 fillet', calories: 520, totalFat: '22g', saturatedFat: '5g', cholesterol: '95mg', sodium: '480mg', totalCarbohydrates: '38g', dietaryFiber: '4g', sugars: '2g', protein: '42g' }
  },
  {
    name: 'Chicken Alfredo', description: 'Creamy alfredo sauce with grilled chicken breast over fettuccine pasta, topped with parmesan.', price: 280, category: 'Dinner',
    ingredients: [{ name: 'Fettuccine', amount: '250g', image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=100&h=100&fit=crop' }, { name: 'Chicken Breast', amount: '180g', image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' }, { name: 'Alfredo Sauce', amount: '150ml', image: 'https://images.unsplash.com/photo-1594831752297-44681496f9a7?w=100&h=100&fit=crop' }, { name: 'Parmesan', amount: '30g', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten'],
    nutritionalInfo: { servingSize: '1 plate', calories: 680, totalFat: '28g', saturatedFat: '14g', cholesterol: '110mg', sodium: '890mg', totalCarbohydrates: '62g', dietaryFiber: '3g', sugars: '4g', protein: '38g' }
  },
  {
    name: 'Pasta Carbonara', description: 'Traditional Italian carbonara with pancetta, egg yolk, pecorino, and black pepper.', price: 250, category: 'Dinner',
    extras: [{ name: 'Extra Pancetta', price: 30, image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Truffle Oil', price: 40, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Spaghetti', amount: '200g', image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=100&h=100&fit=crop' }, { name: 'Pancetta', amount: '100g', image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Egg Yolks', amount: '3', image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }, { name: 'Pecorino', amount: '50g', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }],
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    nutritionalInfo: { servingSize: '1 plate', calories: 580, totalFat: '24g', saturatedFat: '10g', cholesterol: '185mg', sodium: '820mg', totalCarbohydrates: '58g', dietaryFiber: '2g', sugars: '2g', protein: '26g' }
  },
  {
    name: 'Caesar Salad', description: 'Fresh romaine lettuce with classic caesar dressing, croutons, parmesan, and grilled chicken.', price: 120, category: 'Healthy', featured: true,
    extras: [{ name: 'Add Grilled Chicken', price: 40, image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=100&h=100&fit=crop' }, { name: 'Add Shrimp', price: 50, image: 'https://images.unsplash.com/photo-1522163723-5d0324235c44?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Romaine Lettuce', amount: '200g', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }, { name: 'Caesar Dressing', amount: '50ml', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop' }, { name: 'Croutons', amount: '30g', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=100&h=100&fit=crop' }, { name: 'Parmesan', amount: '20g', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten'],
    nutritionalInfo: { servingSize: '1 bowl', calories: 320, totalFat: '18g', saturatedFat: '6g', cholesterol: '25mg', sodium: '720mg', totalCarbohydrates: '18g', dietaryFiber: '4g', sugars: '3g', protein: '22g' }
  },
  {
    name: 'Greek Salad', description: 'Fresh cucumber, tomato, red onion, olives, and feta cheese with oregano vinaigrette.', price: 100, category: 'Healthy',
    ingredients: [{ name: 'Cucumber', amount: '100g', image: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?w=100&h=100&fit=crop' }, { name: 'Tomatoes', amount: '150g', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop' }, { name: 'Feta Cheese', amount: '60g', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Kalamata Olives', amount: '40g', image: 'https://images.unsplash.com/photo-1585136912272-1e00a6a2b228?w=100&h=100&fit=crop' }],
    allergens: ['Dairy'],
    nutritionalInfo: { servingSize: '1 bowl', calories: 180, totalFat: '12g', saturatedFat: '4g', cholesterol: '15mg', sodium: '520mg', totalCarbohydrates: '12g', dietaryFiber: '4g', sugars: '6g', protein: '6g' }
  },
  {
    name: 'Club Sandwich', description: 'Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo on toasted bread.', price: 200, category: 'Lunch',
    extras: [{ name: 'Extra Bacon', price: 25, image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Avocado', price: 20, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Turkey', amount: '100g', image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Bacon', amount: '3 strips', image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Sourdough Bread', amount: '3 slices', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Lettuce & Tomato', amount: '1 serving', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }],
    allergens: ['Gluten'],
    nutritionalInfo: { servingSize: '1 sandwich', calories: 450, totalFat: '18g', saturatedFat: '5g', cholesterol: '55mg', sodium: '980mg', totalCarbohydrates: '38g', dietaryFiber: '2g', sugars: '4g', protein: '32g' }
  },
  {
    name: 'French Fries', description: 'Crispy golden fries seasoned with sea salt and herbs, served with ketchup.', price: 60, category: 'Snacks',
    extras: [{ name: 'Cheese Sauce', price: 15, image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Truffle Mayo', price: 20, image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Potatoes', amount: '250g', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=100&h=100&fit=crop' }, { name: 'Sea Salt', amount: '2g', image: 'https://images.unsplash.com/photo-1626197031507-c1703f220736?w=100&h=100&fit=crop' }, { name: 'Vegetable Oil', amount: '500ml', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop' }],
    allergens: [],
    nutritionalInfo: { servingSize: '1 portion', calories: 320, totalFat: '16g', saturatedFat: '2g', cholesterol: '0mg', sodium: '380mg', totalCarbohydrates: '42g', dietaryFiber: '4g', sugars: '1g', protein: '4g' }
  },
  {
    name: 'Onion Rings', description: 'Crispy battered onion rings with a smoky chipotle dipping sauce.', price: 70, category: 'Snacks',
    ingredients: [{ name: 'Onions', amount: '200g', image: 'https://images.unsplash.com/photo-1508747703728-777eb9f12d45?w=100&h=100&fit=crop' }, { name: 'Batter Mix', amount: '100g', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=100&h=100&fit=crop' }, { name: 'Chipotle Sauce', amount: '50ml', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop' }],
    allergens: ['Gluten'],
    nutritionalInfo: { servingSize: '1 portion', calories: 280, totalFat: '14g', saturatedFat: '2g', cholesterol: '0mg', sodium: '420mg', totalCarbohydrates: '34g', dietaryFiber: '2g', sugars: '6g', protein: '4g' }
  },
  {
    name: 'Chocolate Cake', description: 'Rich, moist chocolate layer cake with velvety chocolate ganache and a dusting of cocoa powder.', price: 80, category: 'Desserts', featured: true,
    extras: [{ name: 'Vanilla Ice Cream', price: 15, image: 'https://images.unsplash.com/photo-1505394033641-40f6ad2718bc?w=100&h=100&fit=crop' }, { name: 'Whipped Cream', price: 10, image: 'https://images.unsplash.com/photo-1556897055-3f6c45ec9e42?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Dark Chocolate', amount: '150g', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=100&h=100&fit=crop' }, { name: 'Flour', amount: '200g', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=100&h=100&fit=crop' }, { name: 'Butter', amount: '150g', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=100&h=100&fit=crop' }, { name: 'Eggs', amount: '3', image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    nutritionalInfo: { servingSize: '1 slice', calories: 380, totalFat: '22g', saturatedFat: '13g', cholesterol: '65mg', sodium: '240mg', totalCarbohydrates: '44g', dietaryFiber: '3g', sugars: '30g', protein: '5g' }
  },
  {
    name: 'Tiramisu', description: 'Classic Italian tiramisu with layers of espresso-soaked ladyfingers and mascarpone cream.', price: 100, category: 'Desserts',
    ingredients: [{ name: 'Mascarpone', amount: '250g', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Ladyfingers', amount: '200g', image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=100&h=100&fit=crop' }, { name: 'Espresso', amount: '100ml', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=100&h=100&fit=crop' }, { name: 'Cocoa Powder', amount: '15g', image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=100&h=100&fit=crop' }],
    allergens: ['Dairy', 'Gluten', 'Eggs'],
    nutritionalInfo: { servingSize: '1 slice', calories: 320, totalFat: '18g', saturatedFat: '11g', cholesterol: '85mg', sodium: '120mg', totalCarbohydrates: '34g', dietaryFiber: '1g', sugars: '22g', protein: '6g' }
  },
  {
    name: 'Ice Cream Scoop', description: 'Premium vanilla ice cream made with real Madagascar vanilla beans.', price: 40, category: 'Desserts',
    extras: [{ name: 'Chocolate Sauce', price: 10, image: 'https://images.unsplash.com/photo-1556897055-3f6c45ec9e42?w=100&h=100&fit=crop' }, { name: 'Strawberry Topping', price: 10, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop' }, { name: 'Sprinkles', price: 5, image: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Vanilla Ice Cream', amount: '2 scoops', image: 'https://images.unsplash.com/photo-1505394033641-40f6ad2718bc?w=100&h=100&fit=crop' }, { name: 'Vanilla Beans', amount: '1 pod', image: 'https://images.unsplash.com/photo-1556897055-3f6c45ec9e42?w=100&h=100&fit=crop' }],
    allergens: ['Dairy'],
    nutritionalInfo: { servingSize: '2 scoops', calories: 210, totalFat: '12g', saturatedFat: '8g', cholesterol: '50mg', sodium: '80mg', totalCarbohydrates: '24g', dietaryFiber: '0g', sugars: '20g', protein: '4g' }
  },
  {
    name: 'Fresh Orange Juice', description: 'Freshly squeezed oranges, no added sugar or preservatives.', price: 50, category: 'Beverages',
    ingredients: [{ name: 'Fresh Oranges', amount: '4', image: 'https://images.unsplash.com/photo-1590502593387-255f8b92c0c7?w=100&h=100&fit=crop' }],
    allergens: [],
    nutritionalInfo: { servingSize: '1 glass (250ml)', calories: 110, totalFat: '0g', saturatedFat: '0g', cholesterol: '0mg', sodium: '2mg', totalCarbohydrates: '26g', dietaryFiber: '0g', sugars: '22g', protein: '2g' }
  },
  {
    name: 'Mango Smoothie', description: 'Sweet mango blended with creamy yogurt and a hint of honey.', price: 70, category: 'Beverages',
    extras: [{ name: 'Protein Boost', price: 20, image: 'https://images.unsplash.com/photo-1622485831020-e4d2a19cb1fa?w=100&h=100&fit=crop' }, { name: 'Chia Seeds', price: 10, image: 'https://images.unsplash.com/photo-1517507228761-8d0b1c1c5ca2?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Mango', amount: '200g', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=100&h=100&fit=crop' }, { name: 'Yogurt', amount: '150ml', image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }, { name: 'Honey', amount: '15ml', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&h=100&fit=crop' }],
    allergens: ['Dairy'],
    nutritionalInfo: { servingSize: '1 glass (300ml)', calories: 190, totalFat: '3g', saturatedFat: '2g', cholesterol: '10mg', sodium: '60mg', totalCarbohydrates: '36g', dietaryFiber: '2g', sugars: '30g', protein: '5g' }
  },
  {
    name: 'Iced Coffee', description: 'Cold brew coffee served with milk over ice, smooth and refreshing.', price: 80, category: 'Beverages',
    extras: [{ name: 'Vanilla Syrup', price: 10, image: 'https://images.unsplash.com/photo-1556897055-3f6c45ec9e42?w=100&h=100&fit=crop' }, { name: 'Soy Milk', price: 10, image: 'https://images.unsplash.com/photo-1552767059-ce1833656d5f?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Cold Brew Coffee', amount: '200ml', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=100&h=100&fit=crop' }, { name: 'Milk', amount: '100ml', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=100&h=100&fit=crop' }, { name: 'Ice', amount: '1 cup', image: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=100&h=100&fit=crop' }],
    allergens: ['Dairy'],
    nutritionalInfo: { servingSize: '1 glass', calories: 80, totalFat: '2g', saturatedFat: '1g', cholesterol: '5mg', sodium: '50mg', totalCarbohydrates: '10g', dietaryFiber: '0g', sugars: '8g', protein: '3g' }
  },
  {
    name: 'Pancakes', description: 'Fluffy buttermilk pancakes with maple syrup, fresh berries, and a dusting of powdered sugar.', price: 150, category: 'Breakfast', featured: true,
    extras: [{ name: 'Blueberries', price: 20, image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=100&h=100&fit=crop' }, { name: 'Banana', price: 15, image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=100&h=100&fit=crop' }, { name: 'Nutella', price: 25, image: 'https://images.unsplash.com/photo-1556897055-3f6c45ec9e42?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Buttermilk Pancake Mix', amount: '200g', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=100&h=100&fit=crop' }, { name: 'Eggs', amount: '2', image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }, { name: 'Maple Syrup', amount: '60ml', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=100&h=100&fit=crop' }, { name: 'Mixed Berries', amount: '50g', image: 'https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=100&h=100&fit=crop' }],
    allergens: ['Gluten', 'Dairy', 'Eggs'],
    nutritionalInfo: { servingSize: '3 pancakes', calories: 420, totalFat: '10g', saturatedFat: '4g', cholesterol: '95mg', sodium: '580mg', totalCarbohydrates: '72g', dietaryFiber: '3g', sugars: '28g', protein: '10g' }
  },
  {
    name: 'Eggs Benedict', description: 'Poached eggs on toasted English muffins with Canadian bacon and creamy hollandaise sauce.', price: 180, category: 'Breakfast',
    ingredients: [{ name: 'English Muffin', amount: '2 halves', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Eggs', amount: '2', image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }, { name: 'Canadian Bacon', amount: '4 slices', image: 'https://images.unsplash.com/photo-1559742811-822f4580b12e?w=100&h=100&fit=crop' }, { name: 'Hollandaise Sauce', amount: '80ml', image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=100&h=100&fit=crop' }],
    allergens: ['Gluten', 'Eggs', 'Dairy'],
    nutritionalInfo: { servingSize: '1 serving', calories: 480, totalFat: '32g', saturatedFat: '14g', cholesterol: '340mg', sodium: '920mg', totalCarbohydrates: '26g', dietaryFiber: '1g', sugars: '3g', protein: '24g' }
  },
  {
    name: 'Avocado Toast', description: 'Sourdough toast with smashed avocado, cherry tomatoes, microgreens, and a sprinkle of red pepper flakes.', price: 140, category: 'Breakfast',
    extras: [{ name: 'Poached Egg', price: 15, image: 'https://images.unsplash.com/photo-1584485260272-9e0f28c6e7f6?w=100&h=100&fit=crop' }, { name: 'Smoked Salmon', price: 40, image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=100&h=100&fit=crop' }],
    ingredients: [{ name: 'Sourdough Bread', amount: '2 slices', image: 'https://images.unsplash.com/photo-1549931319-a5457534679b?w=100&h=100&fit=crop' }, { name: 'Avocado', amount: '1', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=100&h=100&fit=crop' }, { name: 'Cherry Tomatoes', amount: '50g', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=100&h=100&fit=crop' }, { name: 'Microgreens', amount: '10g', image: 'https://images.unsplash.com/photo-1556801712-76c7eb07f8b3?w=100&h=100&fit=crop' }],
    allergens: ['Gluten'],
    nutritionalInfo: { servingSize: '1 serving', calories: 340, totalFat: '18g', saturatedFat: '3g', cholesterol: '0mg', sodium: '480mg', totalCarbohydrates: '36g', dietaryFiber: '10g', sugars: '3g', protein: '8g' }
  }
];

const tables = [
  { tableNumber: 'T1', category: 'regular', capacity: 2 },
  { tableNumber: 'T2', category: 'regular', capacity: 2 },
  { tableNumber: 'T3', category: 'regular', capacity: 4 },
  { tableNumber: 'T4', category: 'regular', capacity: 4 },
  { tableNumber: 'T5', category: 'regular', capacity: 6 },
  { tableNumber: 'T6', category: 'regular', capacity: 4 },
  { tableNumber: 'T7', category: 'regular', capacity: 6 },
  { tableNumber: 'T8', category: 'regular', capacity: 8 },
  { tableNumber: 'V1', category: 'vip', capacity: 10 },
  { tableNumber: 'V2', category: 'vip', capacity: 12 },
  { tableNumber: '101', category: 'room', capacity: 2, floor: '1' },
  { tableNumber: '102', category: 'room', capacity: 2, floor: '1' },
  { tableNumber: '103', category: 'room', capacity: 4, floor: '1' },
  { tableNumber: '201', category: 'room', capacity: 2, floor: '2' },
  { tableNumber: '202', category: 'room', capacity: 4, floor: '2' },
  { tableNumber: '203', category: 'room', capacity: 4, floor: '2' },
  { tableNumber: '301', category: 'room', capacity: 4, floor: '3' },
  { tableNumber: '302', category: 'room', capacity: 6, floor: '3' },
  { tableNumber: '303', category: 'room', capacity: 6, floor: '3' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nilefood');
    console.log('Connected to MongoDB');

    await User.deleteMany({ role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.KITCHEN_STAFF, ROLES.DELIVERY_DRIVER] } });
    console.log('Cleared staff users');

    const adminPassword = await hashPassword('Admin@123');
    const admin = new User({
      name: 'Super Admin',
      email: 'admin@foodapp.com',
      password: adminPassword,
      role: ROLES.SUPER_ADMIN
    });
    await admin.save();
    console.log('Created super admin user: admin@foodapp.com / Admin@123');

    const manager = new User({
      name: 'Restaurant Manager',
      email: 'manager@foodapp.com',
      password: adminPassword,
      role: ROLES.ADMIN
    });
    await manager.save();
    console.log('Created manager user: manager@foodapp.com / Admin@123');

    const kitchenStaff = new User({
      name: 'Kitchen Staff',
      email: 'kitchen@foodapp.com',
      password: adminPassword,
      role: ROLES.KITCHEN_STAFF
    });
    await kitchenStaff.save();
    console.log('Created kitchen staff user: kitchen@foodapp.com / Admin@123');

    const deliveryDriver = new User({
      name: 'Delivery Driver',
      email: 'driver@foodapp.com',
      password: adminPassword,
      role: ROLES.DELIVERY_DRIVER
    });
    await deliveryDriver.save();
    console.log('Created delivery driver user: driver@foodapp.com / Admin@123');

    await Category.deleteMany({});
    const categoryDocs = await Category.insertMany(categories);
    console.log(`Created ${categories.length} categories`);

    const categoryMap = {};
    categoryDocs.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    await Food.deleteMany({});
    const foodDocs = foods.map(f => ({
      ...f,
      category: categoryMap[f.category],
      image: `https://picsum.photos/seed/${f.name.replace(/[^a-zA-Z0-9]/g, '')}/400/300`
    }));
    await Food.insertMany(foodDocs);
    console.log(`Created ${foods.length} food items`);

    await Table.deleteMany({});
    const tableDocs = tables.map(t => ({ ...t, status: 'available' }));
    await Table.insertMany(tableDocs);
    console.log(`Created ${tables.length} tables`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nLogin credentials (all passwords: Admin@123):');
    console.log('  Admin Panel: http://localhost:3000');
    console.log('  Super Admin: admin@foodapp.com');
    console.log('  Manager:     manager@foodapp.com');
    console.log('  Kitchen:     kitchen@foodapp.com');
    console.log('  Driver:      driver@foodapp.com');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();