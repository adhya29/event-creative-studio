import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { ContentProvider } from './context/ContentContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { ServiceDetail } from './pages/ServiceDetail';
import { Portfolio } from './pages/Portfolio';
import { Contact } from './pages/Contact';
import { Quotation } from './pages/Quotation';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminPortfolio } from './pages/admin/AdminPortfolio';
import { AdminEnquiries } from './pages/admin/AdminEnquiries';
import { AdminQuotations } from './pages/admin/AdminQuotations';
import { AdminContent } from './pages/admin/AdminContent';

// Public Layout Wrapper
const PublicLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-burgundy">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ContentProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public Website Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quotation" element={<Quotation />} />
            </Route>

            {/* Admin Authentication Screen */}
            <Route path="/admin/login" element={<AdminLogin />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<ProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="portfolio" element={<AdminPortfolio />} />
                <Route path="enquiries" element={<AdminEnquiries />} />
                <Route path="quotations" element={<AdminQuotations />} />
                <Route path="content" element={<AdminContent />} />
              </Route>
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ContentProvider>
  );
};

export default App;
