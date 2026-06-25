import mongoose from 'mongoose';
import Content from './models/Content.js';
import Listing from './models/Listing.js';
import { MONGODB_URI } from './shared/constants.js';

const contentData = [
  {
    key: 'hero',
    value: {
      title: 'Fastest Delivery & Easy Pickup.',
      highlights: ['Delivery', 'Pickup'],
      subtitle: 'Grocen ensures fresh grocery every morning to your family without getting out in this pandemic.',
      badge: 'Bike Delivery',
      cta: { label: 'Order Now', link: '/menu' },
      secondaryCta: { label: 'Order Process', link: '#' },
      quote: { text: 'When you are too lazy to cook,\nwe are just a click away!', author: 'Chef' },
      images: {
        main: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80',
        chef: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=100&q=80',
        floating: [
          { image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=100&h=100&fit=crop&q=80', label: 'Pasta' },
          { image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=100&h=100&fit=crop&q=80', label: 'Steak' },
          { image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=100&h=100&fit=crop&q=80', label: 'Ramen' },
          { image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=100&h=100&fit=crop&q=80', label: 'Tacos' },
          { image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100&h=100&fit=crop&q=80', label: 'Pancakes' },
        ]
      }
    }
  },
  {
    key: 'home_how_it_works',
    value: {
      title: 'How It Works',
      highlight: 'Works',
      subtitle: 'Get your favorite food in 3 easy steps',
      steps: [
        { icon: 'FiShoppingBag', title: 'Browse & Choose', desc: 'Explore our curated menu from top restaurants' },
        { icon: 'FiCreditCard', title: 'Place Your Order', desc: 'Customize your meal and checkout securely' },
        { icon: 'FiTruck', title: 'Fast Delivery', desc: 'Track your order in real-time to your door' },
      ]
    }
  },
  {
    key: 'home_cta',
    value: {
      title: 'Get 20% Off Your First Order',
      subtitle: 'Sign up today and enjoy exclusive deals delivered to your inbox.',
      button: { label: 'Sign Up Now', link: '/register' }
    }
  },
  {
    key: 'footer',
    value: {
      brand: {
        name: 'Nile Food',
        description: 'Premium food delivery experience. Fresh meals from top restaurants delivered to your door with speed and care.'
      },
      sections: [
        {
          title: 'Product',
          links: [
            { label: 'Menu', path: '/menu' },
            { label: 'Featured', path: '/menu?category=featured' },
            { label: 'Categories', path: '/menu' },
            { label: 'Deals', path: '/offers' },
          ]
        },
        {
          title: 'Company',
          links: [
            { label: 'About Us', path: '/about' },
            { label: 'Experience', path: '/experience' },
            { label: 'Gallery', path: '/gallery' },
            { label: 'Contact', path: '/contact' },
          ]
        },
        {
          title: 'Services',
          links: [
            { label: 'Online Order', path: '/online-ordering' },
            { label: 'Reserve Table', path: '/reserve' },
            { label: 'Our Locations', path: '/location' },
            { label: 'Events', path: '/events' },
          ]
        }
      ],
      socials: [
        { icon: 'FiFacebook', label: 'Facebook', url: '#' },
        { icon: 'FiInstagram', label: 'Instagram', url: '#' },
        { icon: 'FiTwitter', label: 'Twitter', color: 'hover:bg-sky-500', url: '#' },
      ],
      contact: {
        phone: '+251 11 234 5678',
        email: 'info@nilefood.com',
        address: 'Addis Ababa, Ethiopia'
      },
      newsletter: {
        title: 'Stay in the Loop',
        subtitle: 'Get exclusive deals, new menu alerts, and food stories delivered to your inbox.'
      }
    }
  },
  {
    key: 'featured_section',
    value: {
      title: 'Our Featured Products',
      highlight: 'Featured',
      subtitle: 'Delicious food picks just for you'
    }
  },
  {
    key: 'deal_section',
    value: {
      title: 'Deal Of the Week',
      highlight: 'Of the Week',
      subtitle: 'Limited time offers!',
      countdown: { days: '02', hours: '14', minutes: '36', seconds: '48' }
    }
  },
  {
    key: 'categories_section',
    value: {
      title: 'Explore Categories',
      highlight: 'Categories',
      subtitle: 'Choose from our most popular food categories'
    }
  },
  {
    key: 'about_page',
    value: {
      title: 'About Nile Food',
      subtitle: 'Discover our story, our passion, and our commitment to bringing you the finest dining experience.',
      story: {
        text: 'Founded in 2010, Nile Food has grown from a small family kitchen to a beloved dining destination, serving authentic cuisine with a modern twist.',
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
        ctaLabel: 'Explore Our Menu',
        ctaLink: '/menu',
      },
      stats: [
        { label: 'Years of Excellence', value: '15+' },
        { label: 'Happy Customers', value: '50K+' },
        { label: 'Expert Chefs', value: '80+' },
        { label: 'Menu Items', value: '200+' },
      ],
      values: [
        { title: 'Quality Ingredients', desc: 'We source the freshest ingredients from local farms and trusted suppliers to ensure every dish meets our high standards.', icon: '🌿' },
        { title: 'Authentic Flavors', desc: 'Our recipes blend traditional Nile region cuisine with modern culinary techniques for an unforgettable dining experience.', icon: '🍲' },
        { title: 'Exceptional Service', desc: 'From the moment you walk in, our dedicated team ensures your dining experience is nothing short of perfect.', icon: '🤝' },
        { title: 'Sustainable Practices', desc: 'We are committed to eco-friendly practices, from reducing food waste to using sustainable packaging.', icon: '🌍' },
      ],
    }
  },
  {
    key: 'contact_page',
    value: {
      title: 'Contact Us',
      subtitle: "We'd love to hear from you. Get in touch with us for reservations, inquiries, or feedback.",
      contactInfo: [
        { label: 'Address', value: '123 Nile Street, Cairo, Egypt', icon: '📍' },
        { label: 'Phone', value: '+20 123 456 7890', icon: '📞' },
        { label: 'Email', value: 'info@nilefood.com', icon: '✉️' },
        { label: 'Hours', value: 'Daily: 10:00 AM - 11:00 PM', icon: '🕐' },
      ],
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3456.789!2d31.2345!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzQwLjAiTiAzMcKwMTQnMDQuMiJF!5e0!3m2!1sen!2seg!4v1',
    }
  },
  {
    key: 'reserve_page',
    value: {
      title: 'Reserve a Table',
      subtitle: 'Book your dining experience at Nile Food',
    }
  },
];

const listingData = [
  // Events
  { type: 'event', data: { icon: 'FiGift', title: 'Birthday Parties', desc: 'Make your birthday special with our catering and decoration packages.' }, order: 1 },
  { type: 'event', data: { icon: 'FiMusic', title: 'Corporate Events', desc: 'Full-service catering for meetings, conferences, and company gatherings.' }, order: 2 },
  { type: 'event', data: { icon: 'FiCamera', title: 'Weddings', desc: 'Elegant wedding catering with customized menus for your big day.' }, order: 3 },
  { type: 'event', data: { icon: 'FiCalendar', title: 'Private Dining', desc: 'Reserve our private dining room for intimate gatherings.' }, order: 4 },

  // Offers
  { type: 'offer', data: { title: 'First Order Discount', discount: '20% OFF', desc: 'Get 20% off your first order when you sign up today! Use code: WELCOME20', valid: 'Valid for new customers', color: 'from-primary-500 to-primary-400' }, order: 1 },
  { type: 'offer', data: { title: 'Family Feast Deal', discount: 'Buy 3 Get 1 Free', desc: 'Order any 3 main dishes and get 1 absolutely free. Perfect for family dinners!', valid: 'Valid on orders above ETB 1,500', color: 'from-purple-500 to-purple-400' }, order: 2 },
  { type: 'offer', data: { title: 'Lunch Special', discount: '15% OFF', desc: 'Enjoy 15% off on all lunch orders between 12 PM - 3 PM. Dine-in or takeaway.', valid: 'Valid weekdays only', color: 'from-green-500 to-green-400' }, order: 3 },
  { type: 'offer', data: { title: 'Free Delivery', discount: 'ETB 0 Delivery', desc: 'Free delivery on all orders above ETB 500. No promo code needed!', valid: 'Within Addis Ababa', color: 'from-cyan-500 to-cyan-400' }, order: 4 },
  { type: 'offer', data: { title: 'Student Special', discount: '25% OFF', desc: 'Students get 25% off with valid student ID. Available for dine-in only.', valid: 'Valid student ID required', color: 'from-rose-500 to-rose-400' }, order: 5 },
  { type: 'offer', data: { title: 'Birthday Bonus', discount: 'Free Dessert', desc: 'Celebrate your birthday with us and get a free dessert on us!', valid: 'Valid within 3 days of your birthday', color: 'from-amber-500 to-amber-400' }, order: 6 },

  // Gallery
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80', category: 'Food', title: 'Grilled Feast' }, order: 1 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80', category: 'Food', title: 'Classic Pizza' }, order: 2 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80', category: 'Interior', title: 'Elegant Dining Hall' }, order: 3 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80', category: 'Interior', title: 'Cozy Ambiance' }, order: 4 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&q=80', category: 'Events', title: 'Rooftop Gathering' }, order: 5 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80', category: 'Food', title: 'Fine Dining Plate' }, order: 6 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&q=80', category: 'Interior', title: 'Comfort Lounge' }, order: 7 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80', category: 'Events', title: 'Catering Setup' }, order: 8 },
  { type: 'gallery', data: { src: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80', category: 'Food', title: 'Fresh Desserts' }, order: 9 },

  // Dining Experiences
  { type: 'dining_experience', data: { icon: 'FiSun', title: 'Breakfast', time: '7:00 AM - 10:30 AM', desc: 'Start your day with our freshly prepared breakfast menu featuring both local and international dishes.', image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80' }, order: 1 },
  { type: 'dining_experience', data: { icon: 'FiCoffee', title: 'Lunch', time: '11:30 AM - 2:30 PM', desc: 'Enjoy a variety of lunch options from quick bites to full-course meals prepared by our top chefs.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' }, order: 2 },
  { type: 'dining_experience', data: { icon: 'FiMoon', title: 'Dinner', time: '6:00 PM - 10:30 PM', desc: 'Experience fine dining with our exquisite dinner menu, perfect for romantic dates or family gatherings.', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&q=80' }, order: 3 },
  { type: 'dining_experience', data: { icon: 'FiHeart', title: 'Weekend Brunch', time: '9:00 AM - 2:00 PM (Sat-Sun)', desc: 'Our famous weekend brunch buffet with live cooking stations, unlimited drinks, and delightful desserts.', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80' }, order: 4 },

  // Experience features
  { type: 'experience_feature', data: { icon: 'FiAward', title: 'Premium Quality', desc: 'We source the freshest ingredients and work with top chefs to deliver exceptional meals.' }, order: 1 },
  { type: 'experience_feature', data: { icon: 'FiTruck', title: 'Fast Delivery', desc: 'Our optimized delivery network ensures your food arrives hot and on time, every time.' }, order: 2 },
  { type: 'experience_feature', data: { icon: 'FiShield', title: 'Hygiene First', desc: 'Strict food safety standards and regular health inspections across all our locations.' }, order: 3 },
  { type: 'experience_feature', data: { icon: 'FiUsers', title: 'Expert Team', desc: 'Passionate chefs, friendly servers, and dedicated support staff committed to your satisfaction.' }, order: 4 },
  { type: 'experience_feature', data: { icon: 'FiStar', title: 'Unique Recipes', desc: 'Signature dishes crafted by our head chefs, blending local flavors with international cuisine.' }, order: 5 },
  { type: 'experience_feature', data: { icon: 'FiHeart', title: 'Community Focused', desc: 'We support local farmers and give back to the communities we serve.' }, order: 6 },

  // Rooms


  // Locations
  { type: 'location', data: { name: 'Addis Ababa - Bole', address: 'Bole Road, near Bole International Airport', phone: '+251 11 123 4567', hours: '8:00 AM - 11:00 PM', latitude: 9.0, longitude: 38.75 }, order: 1 },
  { type: 'location', data: { name: 'Addis Ababa - Piazza', address: 'Piazza District, Churchill Avenue', phone: '+251 11 234 5678', hours: '9:00 AM - 10:00 PM', latitude: 9.03, longitude: 38.74 }, order: 2 },
  { type: 'location', data: { name: 'Addis Ababa - Kazanchis', address: 'Kazanchis Business District', phone: '+251 11 345 6789', hours: '8:00 AM - 11:00 PM', latitude: 9.01, longitude: 38.76 }, order: 3 },
  { type: 'location', data: { name: 'Bahir Dar', address: 'Lake Tana Shore, City Center', phone: '+251 58 123 4567', hours: '9:00 AM - 10:00 PM', latitude: 11.6, longitude: 37.38 }, order: 4 },
  { type: 'location', data: { name: 'Hawassa', address: 'Main Street, near Hawassa University', phone: '+251 46 123 4567', hours: '9:00 AM - 9:00 PM', latitude: 7.05, longitude: 38.48 }, order: 5 },

  // Packages
  { type: 'package', data: { name: 'Starter', price: 'ETB 499', items: ['1 Main Dish', '1 Side', '1 Drink', 'Free Delivery'], popular: false }, order: 1 },
  { type: 'package', data: { name: 'Family', price: 'ETB 1,299', items: ['3 Main Dishes', '2 Sides', '4 Drinks', '1 Dessert', 'Free Delivery'], popular: true }, order: 2 },
  { type: 'package', data: { name: 'Party', price: 'ETB 2,499', items: ['5 Main Dishes', '4 Sides', '8 Drinks', '2 Desserts', 'Free Delivery', 'Party Decor'], popular: false }, order: 3 },
  { type: 'package', data: { name: 'Corporate', price: 'ETB 4,999', items: ['10 Main Dishes', '8 Sides', '15 Drinks', '5 Desserts', 'Free Delivery', 'Full Setup'], popular: false }, order: 4 },

  // Testimonials
  { type: 'testimonial', data: { name: 'Sarah Mitchell', role: 'Food Enthusiast', text: 'The fastest delivery I have ever experienced! Food arrived hot and delicious. The app is incredibly easy to use.', rating: 5, initial: 'S' }, order: 1 },
  { type: 'testimonial', data: { name: 'John Davidson', role: 'Regular Customer', text: 'Amazing variety and quality. The table ordering feature is a game changer! I use it every time I dine in.', rating: 5, initial: 'J' }, order: 2 },
  { type: 'testimonial', data: { name: 'Emily Roberts', role: 'Food Blogger', text: 'Best food ordering app in the city. Love the seamless experience and the AI recommendations are spot on.', rating: 5, initial: 'E' }, order: 3 },
  { type: 'testimonial', data: { name: 'Michael Chen', role: 'Tech Professional', text: 'Clean interface, fast delivery, and excellent customer support. This is how food delivery should be done.', rating: 5, initial: 'M' }, order: 4 },
  { type: 'testimonial', data: { name: 'Lisa Anderson', role: 'Busy Mom', text: 'Ordering for the family has never been easier. The kids love tracking their food on the map!', rating: 5, initial: 'L' }, order: 5 },
  { type: 'testimonial', data: { name: 'David Kim', role: 'Student', text: 'Great deals and quick delivery to campus. The AI suggestions always hit the spot when I am hungry.', rating: 5, initial: 'D' }, order: 6 },

  // Online ordering steps
  { type: 'online_ordering_step', data: { icon: 'FiMonitor', title: 'Browse Menu', desc: 'Explore our full menu with photos, descriptions, and prices.' }, order: 1 },
  { type: 'online_ordering_step', data: { icon: 'FiSmartphone', title: 'Place Order', desc: 'Add items to your cart, customize, and checkout securely.' }, order: 2 },
  { type: 'online_ordering_step', data: { icon: 'FiCreditCard', title: 'Pay Online', desc: 'Pay with mobile money, card, or cash on delivery.' }, order: 3 },
  { type: 'online_ordering_step', data: { icon: 'FiMapPin', title: 'Fast Delivery', desc: 'Get your food delivered hot and fresh to your doorstep.' }, order: 4 },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    for (const item of contentData) {
      await Content.findOneAndUpdate(
        { key: item.key },
        { $setOnInsert: item },
        { upsert: true, new: true }
      );
    }
    console.log(`Seeded ${contentData.length} content sections`);

    const listingTypes = [...new Set(listingData.map(l => l.type))];
    for (const type of listingTypes) {
      await Listing.deleteMany({ type });
    }
    await Listing.insertMany(listingData);
    console.log(`Seeded ${listingData.length} listings across ${listingTypes.length} types`);

    console.log('Content seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
