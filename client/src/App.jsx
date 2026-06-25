import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Loading from './components/common/Loading';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Menu = lazy(() => import('./pages/Menu'));
const FoodDetails = lazy(() => import('./pages/FoodDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const SelectTable = lazy(() => import('./pages/SelectTable'));
const BillingAddress = lazy(() => import('./pages/BillingAddress'));
const OrderTracking = lazy(() => import('./pages/OrderTracking'));
const Profile = lazy(() => import('./pages/Profile'));
const Orders = lazy(() => import('./pages/Orders'));
const Addresses = lazy(() => import('./pages/Addresses'));
const Auth = lazy(() => import('./pages/Auth'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const TableOrder = lazy(() => import('./pages/TableOrder'));
const Chatbot = lazy(() => import('./pages/Chatbot'));
const Location = lazy(() => import('./pages/Location'));
const Reserve = lazy(() => import('./pages/Reserve'));
const Packages = lazy(() => import('./pages/Packages'));
const Events = lazy(() => import('./pages/Events'));
const Dining = lazy(() => import('./pages/Dining'));
const OnlineOrdering = lazy(() => import('./pages/OnlineOrdering'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Experience = lazy(() => import('./pages/Experience'));
const Offers = lazy(() => import('./pages/Offers'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const CustomerDashboard = lazy(() => import('./pages/CustomerDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminNavigation = lazy(() => import('./pages/AdminNavigation'));
const AdminBookings = lazy(() => import('./pages/AdminBookings'));
const SuperAdminDashboard = lazy(() => import('./pages/SuperAdminDashboard'));
const Kiosk = lazy(() => import('./pages/Kiosk'));

function DashboardRedirect() {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'super_admin':
      return <Navigate to="/dashboard/super-admin" replace />;
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'customer':
    default:
      return <Navigate to="/dashboard/customer" replace />;
  }
}

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/menu/:id" element={<FoodDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/select-table" element={<SelectTable />} />
        <Route path="/billing-address" element={<BillingAddress />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/addresses" element={<Addresses />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/table/:tableId" element={<TableOrder />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/location" element={<Location />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/events" element={<Events />} />
        <Route path="/dining" element={<Dining />} />
        <Route path="/online-ordering" element={<OnlineOrdering />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/experience" element={<Experience />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/kiosk" element={<Kiosk />} />
        <Route path="/tablet" element={<Kiosk />} />
        
        <Route path="/dashboard" element={<DashboardRedirect />} />
        <Route 
          path="/dashboard/customer" 
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/super-admin" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <SuperAdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/admin/navigation" element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminNavigation />
          </ProtectedRoute>
        } />
        <Route path="/admin/bookings" element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
            <AdminBookings />
          </ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
}

export default App;