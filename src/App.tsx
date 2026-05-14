import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AIChatBot } from './components/AIChatBot';

// Public Pages
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Supplies } from './pages/Supplies';
import { Portfolio } from './pages/Portfolio';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Profile } from './pages/Profile';

// Admin Pages
import { AdminLayout } from './admin/AdminLayout';
import { Dashboard } from './admin/Dashboard';
import { POS } from './admin/POS';
import { ProductManagement } from './admin/Products';
import { Inquiries } from './admin/Inquiries';
import { OrderTracker } from './admin/Orders';
import { CustomerManagement } from './admin/Customers';
import { Analytics } from './admin/Analytics';
import { PortfolioManagement } from './admin/Portfolio';
import { Expenses } from './admin/Expenses';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <Toaster position="bottom-right" toastOptions={{
          style: {
            background: '#0B0F19',
            color: '#fff',
            border: '1px solid #ffffff10',
            borderRadius: '16px',
          }
        }} />
        
        <AIChatBot />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
          <Route path="/supplies" element={<><Navbar /><Supplies /><Footer /></>} />
          <Route path="/portfolio" element={<><Navbar /><Portfolio /><Footer /></>} />
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
          <Route path="/profile" element={<><Navbar /><Profile /><Footer /></>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
             <Route index element={<Dashboard />} />
             <Route path="pos" element={<POS />} />
             <Route path="products" element={<ProductManagement />} />
             <Route path="orders" element={<OrderTracker />} />
             <Route path="customers" element={<CustomerManagement />} />
             <Route path="analytics" element={<Analytics />} />
             <Route path="portfolio" element={<PortfolioManagement />} />
             <Route path="inquiries" element={<Inquiries />} />
             <Route path="expenses" element={<Expenses />} />
             <Route path="*" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}
