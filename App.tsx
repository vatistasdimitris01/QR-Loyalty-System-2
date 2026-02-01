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
import { DeviceGuard, SplashScreen } from './components/common';

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // If the user has seen the splash this session, don't show it again on internal navigations
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

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
            const isMobile = window.innerWidth < 1024;
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