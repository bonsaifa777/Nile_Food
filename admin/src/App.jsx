import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy, useState } from 'react';
import { motion } from 'framer-motion';
import Loading from './components/Loading';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import { useAuth } from './context/AuthContext';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Orders = lazy(() => import('./pages/Orders'));
const Kitchen = lazy(() => import('./pages/Kitchen'));
const Delivery = lazy(() => import('./pages/Delivery'));
const Operations = lazy(() => import('./pages/Operations'));
const Menu = lazy(() => import('./pages/Menu'));
const Categories = lazy(() => import('./pages/Categories'));
const Tables = lazy(() => import('./pages/Tables'));
const Users = lazy(() => import('./pages/Users'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Content = lazy(() => import('./pages/Content'));
const Settings = lazy(() => import('./pages/Settings'));
const Payments = lazy(() => import('./pages/Payments'));
const Reservations = lazy(() => import('./pages/Reservations'));
const Bookings = lazy(() => import('./pages/Bookings'));
const Messages = lazy(() => import('./pages/Messages'));
const Login = lazy(() => import('./pages/Login'));

const STAFF_ROLES = ['admin', 'super_admin', 'kitchen_staff', 'delivery_driver'];

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !STAFF_ROLES.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function KitchenRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !['admin', 'super_admin', 'kitchen_staff'].includes(user.role)) {
    if (user?.role === 'delivery_driver') return <Navigate to="/delivery" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DeliveryRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !['admin', 'super_admin', 'delivery_driver'].includes(user.role)) {
    if (user?.role === 'kitchen_staff') return <Navigate to="/kitchen" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !['admin', 'super_admin'].includes(user.role)) {
    if (user?.role === 'kitchen_staff') return <Navigate to="/kitchen" replace />;
    if (user?.role === 'delivery_driver') return <Navigate to="/delivery" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {isAdmin && (
        <Sidebar isOpen={sidebarOpen} />
      )}
      <motion.div
        initial={false}
        animate={{ marginLeft: isAdmin ? (sidebarOpen ? 280 : 88) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {isAdmin && (
          <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        )}
        <main className={isAdmin ? 'p-6 pt-16' : ''}>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
      </motion.div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/kitchen" element={
        <KitchenRoute>
          <Kitchen />
        </KitchenRoute>
      } />

      <Route path="/delivery" element={
        <DeliveryRoute>
          <Delivery />
        </DeliveryRoute>
      } />

      <Route path="/operations" element={
        <AdminRoute>
          <AppLayout>
            <Operations />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/" element={
        <AdminRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/orders" element={
        <AdminRoute>
          <AppLayout>
            <Orders />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/menu" element={
        <AdminRoute>
          <AppLayout>
            <Menu />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/categories" element={
        <AdminRoute>
          <AppLayout>
            <Categories />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/tables" element={
        <AdminRoute>
          <AppLayout>
            <Tables />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/users" element={
        <AdminRoute>
          <AppLayout>
            <Users />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/analytics" element={
        <AdminRoute>
          <AppLayout>
            <Analytics />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/payments" element={
        <AdminRoute>
          <AppLayout>
            <Payments />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/reservations" element={
        <AdminRoute>
          <AppLayout>
            <Reservations />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/bookings" element={
        <AdminRoute>
          <AppLayout>
            <Bookings />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/messages" element={
        <AdminRoute>
          <AppLayout>
            <Messages />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/inventory" element={
        <AdminRoute>
          <AppLayout>
            <Inventory />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/content" element={
        <AdminRoute>
          <AppLayout>
            <Content />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/settings" element={
        <AdminRoute>
          <AppLayout>
            <Settings />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
