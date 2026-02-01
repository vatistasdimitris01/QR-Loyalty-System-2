import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessPage from './pages/BusinessPage';
import CustomerPage from './pages/CustomerPage';
import BusinessSignupPage from './pages/BusinessSignupPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import AdminPage from './pages/AdminPage';
import BusinessScannerPage from './pages/BusinessScannerPage';
import { DeviceGuard, PageLoader, SplashScreen } from './components/common';

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
    };
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;
  if (loading) return <PageLoader />;

  const renderPage = () => {
    if (path === '/admin') {
      return <DeviceGuard target="pc"><AdminPage /></DeviceGuard>;
    }

    if (path === '/customer' && searchParams.has('token')) {
      return (
        <DeviceGuard target="mobile">
          <div className="flex justify-center bg-mint-white min-h-screen">
            <div className="w-full max-w-md bg-white min-h-screen relative overflow-hidden">
               <CustomerPage qrToken={searchParams.get('token')!} />
            </div>
          </div>
        </DeviceGuard>
      );
    }
    if (path === '/signup/customer') {
      return (
        <DeviceGuard target="mobile">
          <div className="flex justify-center bg-mint-white min-h-screen">
            <div className="w-full max-w-md bg-white min-h-screen">
              <CustomerSignupPage />
            </div>
          </div>
        </DeviceGuard>
      );
    }

    if (path === '/business') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        if (isLoggedIn) {
            if (isMobile) return <BusinessScannerPage />;
            return <BusinessPage />;
        }
        return <BusinessLoginPage />;
    }
    
    if (path === '/business/scanner') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return <DeviceGuard target="mobile">{isLoggedIn ? <BusinessScannerPage /> : <BusinessLoginPage />}</DeviceGuard>;
    }

    if (path === '/business/login') {
      return <BusinessLoginPage />;
    }
    
    if (path === '/signup/business') {
        return <DeviceGuard target="pc"><BusinessSignupPage /></DeviceGuard>;
    }

    return <LandingPage />;
  };

  return (
    <LanguageProvider>
      <div className="antialiased selection:bg-green-100">
        {renderPage()}
      </div>
    </LanguageProvider>
  );
};

export default App;