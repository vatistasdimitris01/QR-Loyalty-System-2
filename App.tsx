
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
import { DeviceGuard } from './components/common';

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  const renderPage = () => {
    // Admin route - Always PC
    if (path === '/admin') {
      return <DeviceGuard target="pc"><AdminPage /></DeviceGuard>;
    }

    // Customer routes (Mobile-focused)
    if (path === '/customer' && searchParams.has('token')) {
      return (
        <DeviceGuard target="mobile">
          <div className="flex justify-center bg-slate-50 min-h-screen">
            <div className="w-full max-w-md bg-white shadow-2xl min-h-screen relative overflow-hidden">
               <CustomerPage qrToken={searchParams.get('token')!} />
            </div>
          </div>
        </DeviceGuard>
      );
    }
    if (path === '/signup/customer') {
      return (
        <DeviceGuard target="mobile">
          <div className="flex justify-center bg-slate-50 min-h-screen">
            <div className="w-full max-w-md bg-white shadow-2xl min-h-screen">
              <CustomerSignupPage />
            </div>
          </div>
        </DeviceGuard>
      );
    }

    // Business routes (PC-focused)
    if (path === '/business') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return <DeviceGuard target="pc">{isLoggedIn ? <BusinessPage /> : <BusinessLoginPage />}</DeviceGuard>;
    }
    if (path === '/business/editor') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return <DeviceGuard target="pc">{isLoggedIn ? <BusinessEditorPage /> : <BusinessLoginPage />}</DeviceGuard>;
    }
    if (path === '/business/scanner') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        // Scanner is an exception - it's a Kiosk, but often used on tablets or dedicated phones. 
        // We'll allow it on both but keep target="mobile" style for constraints.
        return <DeviceGuard target="mobile"><BusinessScannerPage /></DeviceGuard>;
    }
    if (path === '/business/login') {
      return <DeviceGuard target="pc"><BusinessLoginPage /></DeviceGuard>;
    }
    if (path === '/signup/business') {
        return <DeviceGuard target="pc"><BusinessSignupPage /></DeviceGuard>;
    }

    // Root/Landing - Universal
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
