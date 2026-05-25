import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { FiCalendar, FiMapPin, FiClock, FiChevronRight, FiStar, FiWifi, FiCoffee, FiDroplet } from 'react-icons/fi';

const sampleBookings = [
  {
    id: 1, hotel: 'Grand Nile Suite', location: 'Addis Ababa', checkIn: '2026-06-15', checkOut: '2026-06-18',
    status: 'confirmed', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop',
    rating: 4.8, amenities: ['Free WiFi', 'Breakfast', 'Pool'], price: 12500,
  },
  {
    id: 2, hotel: 'Lalibela View Resort', location: 'Lalibela', checkIn: '2026-07-20', checkOut: '2026-07-25',
    status: 'pending', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&h=300&fit=crop',
    rating: 4.6, amenities: ['Free WiFi', 'Breakfast', 'Spa'], price: 8900,
  },
];

export default function HotelBookings({ bookings = sampleBookings }) {
  const { darkMode } = useTheme();
  const d = darkMode;
  const [expanded, setExpanded] = useState(null);

  const statusStyles = {
    confirmed: 'bg-green-500/20 text-green-600 dark:text-green-300 border-green-500/20',
    pending: 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/20',
    completed: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/20',
    cancelled: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/20',
  };

  const amenityIcons = { 'Free WiFi': FiWifi, 'Breakfast': FiCoffee, 'Pool': FiDroplet, 'Spa': FiDroplet };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl overflow-hidden backdrop-blur-xl ${
        d ? 'bg-slate-900/60 border border-white/10' : 'bg-white/90 border border-gray-200/60 shadow-xl'
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${d ? 'from-purple-500/3' : 'from-purple-500/[0.01]'} to-transparent pointer-events-none`} />

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${d ? 'text-white' : 'text-gray-900'}`}>
            <FiCalendar className="text-purple-400" />
            Hotel Bookings
          </h2>
          <span className={`text-xs ${d ? 'text-white/40' : 'text-gray-500'}`}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</span>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16">
            <FiCalendar className={`mx-auto ${d ? 'text-white/20' : 'text-gray-300'} mb-4`} size={48} />
            <p className={`${d ? 'text-white/50' : 'text-gray-500'} text-lg mb-2`}>No bookings yet</p>
            <p className={`${d ? 'text-white/30' : 'text-gray-400'} text-sm`}>Explore our hotel rooms and book your stay!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking, i) => {
              const isExpanded = expanded === booking.id;
              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : booking.id)}
                    className="w-full text-left"
                  >
                    <div className="relative h-32 rounded-2xl overflow-hidden">
                      <img src={booking.image} alt={booking.hotel} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[booking.status] || statusStyles.pending}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <h3 className="text-lg font-bold text-white">{booking.hotel}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <FiMapPin size={12} /> {booking.location}
                          </span>
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <FiStar size={12} className="text-amber-400" /> {booking.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`p-4 space-y-3 ${d ? 'bg-slate-900/40' : 'bg-white/80'}`}>
                          <div className={`flex items-center gap-4 text-sm ${d ? 'text-white/60' : 'text-gray-600'}`}>
                            <span className="flex items-center gap-1.5">
                              <FiCalendar size={14} className="text-indigo-400" />
                              Check-in: {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <FiChevronRight size={14} className={d ? 'text-white/20' : 'text-gray-300'} />
                            <span className="flex items-center gap-1.5">
                              <FiCalendar size={14} className="text-purple-400" />
                              Check-out: {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>

                          <div className="flex gap-2 flex-wrap">
                            {booking.amenities.map(a => {
                              const Icon = amenityIcons[a] || FiCoffee;
                              return (
                                <span key={a} className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1 ${
                                  d ? 'glass text-white/50' : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <Icon size={12} /> {a}
                                </span>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">ETB {booking.price.toLocaleString()}</span>
                            <div className="flex gap-2">
                              <button className={`px-4 py-2 rounded-xl text-xs transition-all ${
                                d ? 'glass text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}>
                                Modify
                              </button>
                              <button className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-300 text-xs hover:bg-red-500/20 transition-all">
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
