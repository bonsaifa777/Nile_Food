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
const Attendance = lazy(() => import('./pages/Attendance'));
const MyAttendance = lazy(() => import('./pages/MyAttendance'));
const Shifts = lazy(() => import('./pages/Shifts'));
const LeaveManagement = lazy(() => import('./pages/LeaveManagement'));
const AttendanceReports = lazy(() => import('./pages/AttendanceReports'));
const Payroll = lazy(() => import('./pages/Payroll'));
const QRAttendance = lazy(() => import('./pages/QRAttendance'));
const CashierDashboard = lazy(() => import('./pages/cashier/CashierDashboard'));
const POS = lazy(() => import('./pages/cashier/POS'));
const CashierTables = lazy(() => import('./pages/cashier/CashierTables'));
const CashierPayments = lazy(() => import('./pages/cashier/CashierPayments'));
const CashDrawer = lazy(() => import('./pages/cashier/CashDrawer'));
const CashierCustomers = lazy(() => import('./pages/cashier/CashierCustomers'));
const CashierChat = lazy(() => import('./pages/cashier/CashierChat'));
const CashierReports = lazy(() => import('./pages/cashier/CashierReports'));

const STAFF_ROLES = ['admin', 'super_admin', 'kitchen_staff', 'delivery_driver', 'cashier', 'waiter'];

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
    if (user?.role === 'cashier' || user?.role === 'waiter') return <Navigate to="/cashier" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function CashierRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user || !['admin', 'super_admin', 'cashier', 'waiter'].includes(user.role)) {
    if (user?.role === 'kitchen_staff') return <Navigate to="/kitchen" replace />;
    if (user?.role === 'delivery_driver') return <Navigate to="/delivery" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const showSidebar = ['admin', 'super_admin', 'cashier', 'waiter'].includes(user?.role);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-body)' }}>
      {showSidebar && (
        <Sidebar isOpen={sidebarOpen} />
      )}
      <motion.div
        initial={false}
        animate={{ marginLeft: showSidebar ? (sidebarOpen ? 280 : 88) : 0 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="relative z-10"
      >
        {showSidebar && (
          <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
        )}
        <main className={showSidebar ? 'p-6 pt-16' : ''}>
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

      <Route path="/attendance" element={
        <AdminRoute>
          <AppLayout>
            <Attendance />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/my-attendance" element={
        <ProtectedRoute>
          <AppLayout>
            <MyAttendance />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/shifts" element={
        <AdminRoute>
          <AppLayout>
            <Shifts />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/leave" element={
        <ProtectedRoute>
          <AppLayout>
            <LeaveManagement />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/attendance-reports" element={
        <AdminRoute>
          <AppLayout>
            <AttendanceReports />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/payroll" element={
        <AdminRoute>
          <AppLayout>
            <Payroll />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/qr-attendance" element={
        <AdminRoute>
          <AppLayout>
            <QRAttendance />
          </AppLayout>
        </AdminRoute>
      } />

      <Route path="/cashier" element={
        <CashierRoute>
          <AppLayout>
            <CashierDashboard />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/pos" element={
        <CashierRoute>
          <AppLayout>
            <POS />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/tables" element={
        <CashierRoute>
          <AppLayout>
            <CashierTables />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/payments" element={
        <CashierRoute>
          <AppLayout>
            <CashierPayments />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/drawer" element={
        <CashierRoute>
          <AppLayout>
            <CashDrawer />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/customers" element={
        <CashierRoute>
          <AppLayout>
            <CashierCustomers />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/chat" element={
        <CashierRoute>
          <AppLayout>
            <CashierChat />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="/cashier/reports" element={
        <CashierRoute>
          <AppLayout>
            <CashierReports />
          </AppLayout>
        </CashierRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
