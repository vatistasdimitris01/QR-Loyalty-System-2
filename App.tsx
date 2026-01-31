
import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessPage from './pages/BusinessPage';
import CustomerPage from './pages/CustomerPage';
import BusinessSignupPage from './pages/BusinessSignupPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import BusinessEditorPage from './pages/BusinessEditorPage';
import AdminPage from './pages/AdminPage';
import BusinessScannerPage from './pages/BusinessScannerPage';

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  // Helper to determine if we are on a "Business" path
  const isBusinessPath = path.startsWith('/business') || path.startsWith('/signup/business');
  const isCustomerPath = path.startsWith('/customer') || path.startsWith('/signup/customer');

  const renderPage = () => {
    // Admin route
    if (path === '/admin') {
      return <AdminPage />;
    }

    // Customer routes (Mobile-focused)
    if (path === '/customer' && searchParams.has('token')) {
      return (
        <div className="flex justify-center bg-slate-50 min-h-screen">
          <div className="w-full max-w-md bg-white shadow-2xl min-h-screen relative overflow-hidden">
             <CustomerPage qrToken={searchParams.get('token')!} />
          </div>
        </div>
      );
    }
    if (path === '/signup/customer') {
      return (
        <div className="flex justify-center bg-slate-50 min-h-screen">
          <div className="w-full max-w-md bg-white shadow-2xl min-h-screen">
            <CustomerSignupPage />
          </div>
        </div>
      );
    }

    // Business routes (PC-focused)
    if (path === '/business') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/editor') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessEditorPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/scanner') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessScannerPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/login') {
      return <BusinessLoginPage />;
    }
    if (path === '/signup/business') {
        return <BusinessSignupPage />;
    }

    // Root/Landing
    return <LandingPage />;
  };

  return (
    <LanguageProvider>
      <div className="antialiased selection:bg-blue-100">
        {renderPage()}
      </div>
    </LanguageProvider>
  );
};

export default App;
