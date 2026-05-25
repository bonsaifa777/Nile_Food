export const driverProfile = {
  name: 'Karim Bekele',
  rating: 4.92,
  totalDeliveries: 1248,
  memberSince: '2023-06',
  vehicle: 'Toyota Hiace - AB-1234',
  vehicleType: 'Van',
  fuelLevel: 68,
  batteryLevel: null,
  online: true,
  shiftHours: '08:00 - 17:00',
};

export const metricsData = {
  totalDeliveries: 18,
  activeOrders: 3,
  completedDeliveries: 14,
  hotelDeliveries: 6,
  pendingPickups: 2,
  driverRating: 4.92,
  distanceCovered: 64.5,
  earningsToday: 2450,
  fuelUsage: 8.2,
  successRate: 98.5,
};

export const earningsBreakdown = {
  delivery: 1850,
  tips: 420,
  bonus: 180,
  hotel: 650,
  total: 2450,
};

export const weeklyEarnings = [
  { day: 'Mon', amount: 1800 },
  { day: 'Tue', amount: 2100 },
  { day: 'Wed', amount: 1950 },
  { day: 'Thu', amount: 2450 },
  { day: 'Fri', amount: 2800 },
  { day: 'Sat', amount: 3200 },
  { day: 'Sun', amount: 2450 },
];

export const deliveries = [
  {
    id: 'DEL-1089', orderId: 'ORD-1040',
    customer: 'James Wilson', phone: '+251-911-234-567',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Bole Atlas, Villa 7, Addis Ababa',
    deliveryType: 'food-delivery',
    items: [
      { name: 'Beef Tenderloin', quantity: 1 },
      { name: 'Truffle Pasta', quantity: 1 },
      { name: 'Chocolate Lava Cake', quantity: 1 },
    ],
    status: 'on_the_way', priority: 'high',
    distance: 3.2, duration: 12,
    estimatedDelivery: '12:50 PM',
    paymentStatus: 'paid', paymentMethod: 'card',
    instructions: 'Gate code: 7421. Leave at reception.',
    specialNotes: null,
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T12:20:00',
  },
  {
    id: 'DEL-1088', orderId: 'ORD-1036',
    customer: 'Alex Turner', phone: '+251-922-345-678',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'CMC Road, House 23, Addis Ababa',
    deliveryType: 'food-delivery',
    items: [
      { name: 'Lamb Chops', quantity: 2 },
      { name: 'Chocolate Lava Cake', quantity: 1 },
    ],
    status: 'on_the_way', priority: 'high',
    distance: 5.8, duration: 18,
    estimatedDelivery: '12:55 PM',
    paymentStatus: 'paid', paymentMethod: 'cash',
    instructions: 'Call on arrival - gate might be closed',
    specialNotes: null,
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T12:15:00',
  },
  {
    id: 'DEL-1087', orderId: 'ORD-1035',
    customer: 'Priya Sharma', phone: '+251-933-456-789',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Sheraton Hotel - Room 208',
    deliveryType: 'room-service',
    items: [
      { name: 'Caesar Salad', quantity: 1, size: 'Large' },
      { name: 'Chocolate Lava Cake', quantity: 1 },
    ],
    status: 'pickup_ready', priority: 'medium',
    distance: 0.8, duration: 5,
    estimatedDelivery: '12:40 PM',
    paymentStatus: 'paid', paymentMethod: 'room-charge',
    instructions: 'Deliver to hotel room. Use service elevator.',
    specialNotes: 'VIP guest - please be extra courteous',
    restaurant: 'Sheraton Hotel Kitchen',
    assignedAt: '2026-05-16T12:10:00',
  },
  {
    id: 'DEL-1086', orderId: 'ORD-1039',
    customer: 'Lina Park', phone: '+251-944-567-890',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Hilton Hotel - Room 305',
    deliveryType: 'room-service',
    items: [
      { name: 'Grilled Salmon', quantity: 1 },
      { name: 'Caesar Salad', quantity: 1 },
    ],
    status: 'assigned', priority: 'high',
    distance: 1.2, duration: 7,
    estimatedDelivery: '12:45 PM',
    paymentStatus: 'paid', paymentMethod: 'room-charge',
    instructions: 'Contact front desk for room access',
    specialNotes: 'Guest requested extra napkins and utensils',
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T12:25:00',
  },
  {
    id: 'DEL-1085', orderId: 'ORD-1038',
    customer: 'Robert Kim', phone: '+251-955-678-901',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Bole Medhanealem, Condo 12',
    deliveryType: 'food-delivery',
    items: [
      { name: 'Lobster Bisque', quantity: 1 },
    ],
    status: 'assigned', priority: 'low',
    distance: 2.5, duration: 10,
    estimatedDelivery: '1:00 PM',
    paymentStatus: 'paid', paymentMethod: 'card',
    instructions: 'Apartment 3B, 2nd floor',
    specialNotes: null,
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T12:28:00',
  },
  {
    id: 'DEL-1084', orderId: 'ORD-1037',
    customer: 'Yara Aziz', phone: '+251-966-789-012',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Marriott Hotel - Room 412',
    deliveryType: 'room-service',
    items: [
      { name: 'Beef Tenderloin', quantity: 1 },
      { name: 'Tiramisu', quantity: 1 },
    ],
    status: 'delivered', priority: 'medium',
    distance: 0.9, duration: 6,
    estimatedDelivery: '12:15 PM',
    paymentStatus: 'paid', paymentMethod: 'room-charge',
    instructions: null,
    specialNotes: 'Champagne on ice requested',
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T11:45:00',
  },
  {
    id: 'DEL-1083', orderId: 'ORD-1033',
    customer: 'Mohamed Ali', phone: '+251-977-890-123',
    pickup: 'Nile Food Kitchen - Bole',
    pickupAddress: 'Bole Road, Addis Ababa',
    deliveryAddress: 'Bole Rwanda, Villa 15',
    deliveryType: 'food-delivery',
    items: [
      { name: 'Mixed Grill Platter', quantity: 1 },
      { name: 'Hummus', quantity: 2 },
    ],
    status: 'delivered', priority: 'low',
    distance: 4.1, duration: 15,
    estimatedDelivery: '12:10 PM',
    paymentStatus: 'paid', paymentMethod: 'cash',
    instructions: 'Ring the bell twice',
    specialNotes: null,
    restaurant: 'Nile Food Main Kitchen',
    assignedAt: '2026-05-16T11:30:00',
  },
];

export const routeStops = [
  { id: 1, name: 'Current Location', address: 'Bole Road, Kitchen', status: 'current', lat: 9.022, lng: 38.746 },
  { id: 2, name: 'Pickup - Nile Kitchen', address: 'Bole Road', status: 'completed', lat: 9.022, lng: 38.746 },
  { id: 3, name: 'Drop - Sheraton Hotel', address: 'Room 208', status: 'current', lat: 9.030, lng: 38.755 },
  { id: 4, name: 'Drop - Hilton Hotel', address: 'Room 305', status: 'pending', lat: 9.035, lng: 38.760 },
  { id: 5, name: 'Drop - Bole Atlas', address: 'Villa 7', status: 'pending', lat: 9.015, lng: 38.738 },
];

export const hotelInfo = {
  'Sheraton Hotel': {
    floors: 8, hasServiceElevator: true, frontDesk: '+251-111-234-567',
    parking: 'Underground parking level B1', notes: 'Use service elevator for deliveries',
  },
  'Hilton Hotel': {
    floors: 12, hasServiceElevator: true, frontDesk: '+251-111-345-678',
    parking: 'Valet parking available', notes: 'Register at front desk for room access',
  },
  'Marriott Hotel': {
    floors: 15, hasServiceElevator: true, frontDesk: '+251-111-456-789',
    parking: 'Street parking nearby', notes: 'Contact guest via room phone',
  },
};

export const performanceData = {
  weeklyDeliveries: [14, 16, 12, 18, 22, 25, 18],
  acceptanceRate: 96,
  avgDeliveryTime: 18.5,
  satisfactionScore: 4.92,
  ranking: '#3 of 24 drivers',
  peakHours: [
    { hour: '07AM', deliveries: 2 },
    { hour: '09AM', deliveries: 5 },
    { hour: '11AM', deliveries: 8 },
    { hour: '12PM', deliveries: 12 },
    { hour: '01PM', deliveries: 10 },
    { hour: '02PM', deliveries: 6 },
    { hour: '05PM', deliveries: 7 },
    { hour: '07PM', deliveries: 11 },
    { hour: '08PM', deliveries: 9 },
  ],
};

export const vehicleInfo = {
  make: 'Toyota', model: 'Hiace', year: 2022, plate: 'AB-1234',
  fuelLevel: 68, fuelType: 'Diesel', fuelTank: 70,
  mileage: 45230, nextService: '5000 km',
  tireCondition: 75, batteryHealth: 88,
  lastService: '2026-04-15',
  insurance: 'Valid until 2026-12-31',
  documents: ['License', 'Insurance', 'Registration'],
};

export const chatMessages = [
  { id: 1, from: 'customer', name: 'James Wilson', message: 'Hi, are you on your way?', time: '12:35 PM' },
  { id: 2, from: 'driver', name: 'You', message: 'Yes, I\'ll be there in about 10 minutes!', time: '12:36 PM' },
  { id: 3, from: 'customer', name: 'James Wilson', message: 'Great, gate code is 7421', time: '12:36 PM' },
  { id: 4, from: 'system', name: '', message: 'Alex Turner called you (missed call)', time: '12:38 PM' },
  { id: 5, from: 'driver', name: 'You', message: 'Calling Alex back...', time: '12:40 PM' },
];

export const notifications = [
  { id: 1, type: 'new', message: 'New delivery assigned - Room 305, Hilton', time: '2m ago', urgent: false },
  { id: 2, type: 'urgent', message: '⚠️ VIP priority: Room 412 Marriott - expedite', time: '5m ago', urgent: true },
  { id: 3, type: 'traffic', message: '🚦 Traffic alert: Bole Road congestion ahead', time: '8m ago', urgent: true },
  { id: 4, type: 'weather', message: '🌧️ Light rain expected in 30min', time: '15m ago', urgent: false },
  { id: 5, type: 'earning', message: '💰 Tip received: ETB 50 from Robert Kim', time: '20m ago', urgent: false },
  { id: 6, type: 'fuel', message: '⛽ Fuel level below 30% - consider refueling', time: '25m ago', urgent: true },
];

export const earnings = {
  daily: [
    { label: 'Delivery Fees', amount: 1850, color: '#6366f1' },
    { label: 'Tips', amount: 420, color: '#10b981' },
    { label: 'Bonuses', amount: 180, color: '#f59e0b' },
    { label: 'Hotel Service', amount: 650, color: '#06b6d4' },
  ],
  total: 2450,
  currency: 'ETB',
};
