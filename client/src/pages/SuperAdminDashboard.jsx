import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Loading from '../components/common/Loading';
import { FiShoppingBag, FiUsers, FiDollarSign, FiClock, FiSettings, FiShield, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';

export default function SuperAdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/dashboard');
      setStats(data.data.stats);
      setRecentOrders(data.data.recentOrders || []);
    } catch (error) {
      toast.error(t('admin.dashboardLoadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  const statCards = [
    { title: t('admin.totalOrders'), value: stats?.totalOrders || 0, icon: FiShoppingBag, color: 'from-blue-500 to-blue-600', link: '/admin/orders' },
    { title: t('admin.revenue'), value: `ETB ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: FiDollarSign, color: 'from-green-500 to-green-600', link: '/admin/analytics' },
    { title: t('admin.customers'), value: stats?.totalUsers || 0, icon: FiUsers, color: 'from-purple-500 to-purple-600', link: '/admin/users' },
    { title: t('admin.pending'), value: stats?.pendingOrders || 0, icon: FiClock, color: 'from-yellow-500 to-yellow-600', link: '/admin/orders?filter=pending' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'confirmed': return 'bg-blue-500';
      case 'preparing': return 'bg-primary-500';
      case 'ready': return 'bg-purple-500';
      case 'on_the_way': return 'bg-cyan-500';
      case 'delivered': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="w-full px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <FiShield className="text-primary-500" size={32} />
              <h1 className="text-4xl font-bold">{t('admin.superAdminDashboard')}</h1>
            </div>
            <p className="text-white/60">{t('admin.fullSystemAccess')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={stat.link} className="glass-card block hover:bg-white/10 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">{stat.title}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="glass-card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{t('admin.recentOrders')}</h2>
                  <Link to="/admin/orders" className="text-primary-500 text-sm hover:underline">
                    {t('admin.viewAll')}
                  </Link>
                </div>

                {recentOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <FiShoppingBag className="mx-auto text-white/30 mb-4" size={48} />
                    <p className="text-white/60">{t('admin.noOrdersYet')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div
                        key={order._id}
                        className="glass-light rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">Order #{order.orderId}</h3>
                            <p className="text-white/60 text-sm">
                              {order.guestName || order.user?.name || 'Guest'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                            <p className="text-primary-500 font-semibold mt-2">{order.total?.toFixed(2)} ETB</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-6"
            >
              <div className="glass-card">
                <h2 className="text-xl font-semibold mb-6">{t('admin.superAdminActions')}</h2>
                <div className="space-y-2">
                  <Link to="/admin/users" className="btn-ghost w-full flex items-center justify-center gap-2">
                    <FiUsers /> {t('admin.manageAdmins')}
                  </Link>
                  <Link to="/admin/analytics" className="btn-ghost w-full flex items-center justify-center gap-2">
                    <FiTrendingUp /> {t('admin.salesAnalytics')}
                  </Link>
                  <Link to="/admin/settings" className="btn-ghost w-full flex items-center justify-center gap-2">
                    <FiSettings /> {t('admin.systemSettings')}
                  </Link>
                </div>
              </div>

              <div className="glass-card">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <FiAlertTriangle className="text-yellow-500" />
                  {t('admin.systemStatus')}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between glass-light rounded-xl p-3">
                    <span className="text-white/60">{t('admin.database')}</span>
                    <span className="text-green-500 font-semibold">{t('admin.connected')}</span>
                  </div>
                  <div className="flex items-center justify-between glass-light rounded-xl p-3">
                    <span className="text-white/60">{t('admin.paymentGateway')}</span>
                    <span className="text-green-500 font-semibold">{t('admin.active')}</span>
                  </div>
                  <div className="flex items-center justify-between glass-light rounded-xl p-3">
                    <span className="text-white/60">{t('admin.totalUsers')}</span>
                    <span className="font-semibold">{stats?.totalUsers || 0}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
