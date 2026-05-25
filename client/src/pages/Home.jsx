import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedFoods from '../components/FeaturedFoods';
import MostOrdered from '../components/MostOrdered';
import EnterprisePlatform from '../components/EnterprisePlatform';
import PremiumRoomCollection from '../components/PremiumRoomCollection';
import Categories from '../components/Categories';
import Testimonials from '../components/Testimonials';
import Footer from '../components/common/Footer';
import { motion } from 'framer-motion';
import { FiArrowRight, FiStar, FiShoppingBag, FiCreditCard, FiTruck, FiSend } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

function CountdownTimer({ countdown }) {
  const [time, setTime] = useState({ days: '00', hours: '00', minutes: '00', seconds: '00' });
  const targetRef = useRef(null);

  useEffect(() => {
    if (!countdown) return;
    const d = parseInt(countdown.days) || 0;
    const h = parseInt(countdown.hours) || 0;
    const m = parseInt(countdown.minutes) || 0;
    const s = parseInt(countdown.seconds) || 0;
    targetRef.current = Date.now() + ((d * 86400 + h * 3600 + m * 60 + s) * 1000);

    const tick = () => {
      const diff = targetRef.current - Date.now();
      if (diff <= 0) {
        setTime({ days: '00', hours: '00', minutes: '00', seconds: '00' });
        return;
      }
      const total = Math.floor(diff / 1000);
      setTime({
        days: String(Math.floor(total / 86400)).padStart(2, '0'),
        hours: String(Math.floor((total % 86400) / 3600)).padStart(2, '0'),
        minutes: String(Math.floor((total % 3600) / 60)).padStart(2, '0'),
        seconds: String(total % 60).padStart(2, '0'),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [countdown?.days, countdown?.hours, countdown?.minutes, countdown?.seconds]);

  return (
    <div className="flex items-center gap-3">
      {[
        { value: time.days, label: 'Days' },
        { value: time.hours, label: 'Hrs' },
        { value: time.minutes, label: 'Min' },
        { value: time.seconds, label: 'Sec' },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-center shadow-sm">
            <span className="text-primary-500 font-bold text-lg block leading-none">{item.value}</span>
            <span className="text-gray-500 dark:text-gray-400 text-[10px] uppercase">{item.label}</span>
          </div>
          {i < 3 && <span className="text-gray-400 dark:text-gray-500 font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
}

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export default function Home() {
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [mostOrdered, setMostOrdered] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [howItWorks, setHowItWorks] = useState(null);
  const [ctaContent, setCtaContent] = useState(null);
  const [dealSection, setDealSection] = useState(null);
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, mostOrderedRes, howRes, ctaRes, dealRes] = await Promise.all([
        axios.get('/api/foods?limit=12'),
        axios.get('/api/foods/most-ordered?limit=8'),
        axios.get('/api/content/home_how_it_works').catch(() => null),
        axios.get('/api/content/home_cta').catch(() => null),
        axios.get('/api/content/deal_section').catch(() => null),
      ]);
      const menuFoods = menuRes.data.data?.foods || [];
      setFeaturedFoods(menuFoods);
      setMostOrdered(mostOrderedRes.data.data || []);
      setAllFoods(menuFoods);
      setHowItWorks(howRes?.data?.data?.value || null);
      setCtaContent(ctaRes?.data?.data?.value || null);
      setDealSection(dealRes?.data?.data?.value || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const dealFoods = allFoods.slice(0, 4);
  const steps = howItWorks?.steps || [
    { icon: 'FiShoppingBag', title: 'Browse & Choose', desc: 'Explore our curated menu from top restaurants' },
    { icon: 'FiCreditCard', title: 'Place Your Order', desc: 'Customize your meal and checkout securely' },
    { icon: 'FiTruck', title: 'Fast Delivery', desc: 'Track your order in real-time to your door' },
  ];
  const cta = ctaContent || { title: 'Get 20% Off Your First Order', subtitle: 'Sign up today and enjoy exclusive deals delivered to your inbox.', button: { label: 'Sign Up Now', link: '/register' } };
  const deal = dealSection || { title: 'Deal Of the Week', highlight: 'Of the Week', subtitle: 'Limited time offers!', countdown: { days: '02', hours: '14', minutes: '36', seconds: '48' } };

  const iconComponents = { FiShoppingBag, FiCreditCard, FiTruck, FiSend };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      <Hero />

      <Categories />

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Our <span className="text-primary-500">Featured</span> Products
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Delicious food picks just for you</p>
          </div>
          <FeaturedFoods foods={featuredFoods} loading={loading} />
          <div className="text-center mt-10">
            <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-lg transition-colors">
              View All Menu <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50 dark:bg-slate-900/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              Most <span className="text-primary-500">Ordered</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Our customers' top picks</p>
          </div>
          <MostOrdered foods={mostOrdered} loading={loading} />
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                Deal <span className="text-primary-500">{deal.highlight || 'Of the Week'}</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{deal.subtitle}</p>
            </div>
            {deal.countdown && <CountdownTimer countdown={deal.countdown} />}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {dealFoods.map((food, index) => (
              <Link key={food._id || index} to={`/menu/${food._id}`}>
                <motion.div whileHover={{ y: -5 }} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-shadow">
                  <div className="relative p-5 pb-0">
                    <div className="relative w-full aspect-square rounded-full overflow-hidden bg-gray-50 dark:bg-slate-700/50 mx-auto w-40 h-40">
                      {food.image ? (
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-40">🍽️</span>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-primary-500 text-white text-[10px] font-bold rounded-full">
                        -{Math.floor(Math.random() * 20 + 10)}%
                      </div>
                    </div>
                  </div>
                  <div className="p-5 pt-3 text-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{food.name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <FiStar key={s} size={10} className={s <= 4 ? 'text-primary-400 fill-primary-400' : 'text-gray-300 dark:text-gray-600'} />
                      ))}
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">(4.0)</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-primary-500 font-bold text-lg">ETB {food.price?.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-xs">ETB {(food.price * 1.2)?.toFixed(2)}</span>
                    </div>
                    <button className="w-full mt-3 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-full shadow-md transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={sectionVariants} className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              How It <span className="text-primary-500">Works</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">{howItWorks?.subtitle || 'Get your favorite food in 3 easy steps'}</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, index) => {
              const IconComp = iconComponents[item.icon] || FiShoppingBag;
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="bg-gray-50 dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 relative text-center">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 bg-primary-500 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-md">{index + 1}</div>
                  <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-500"><IconComp size={32} /></div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <EnterprisePlatform />

      <PremiumRoomCollection />

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <motion.div whileHover={{ scale: 1.005 }} className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-primary-500 to-primary-400 dark:from-primary-600 dark:to-primary-500 p-12 lg:p-16 text-center">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full" />
              <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-black text-white">{cta.title}</h2>
              <p className="text-primary-100 mt-3 text-lg max-w-xl mx-auto">{cta.subtitle}</p>
              <Link to={cta.button?.link || '/register'}>
                <button className="mt-8 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xl transition-colors">{cta.button?.label || 'Sign Up Now'}</button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Testimonials />
      <Footer />
    </div>
  );
}
