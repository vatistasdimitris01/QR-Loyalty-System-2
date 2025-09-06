
import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessPage from './pages/BusinessPage';
import BusinessScannerPage from './pages/BusinessScannerPage';
import CustomerPage from './pages/CustomerPage';
import DiscountsPage from './pages/DiscountsPage';
import BusinessSignupPage from './pages/BusinessSignupPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import OneSignalSetup from './components/OneSignalSetup';
import BusinessEditorPage from './pages/BusinessEditorPage';

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  const renderPage = () => {
    if (path === '/customer' && searchParams.has('token')) {
      return <CustomerPage qrToken={searchParams.get('token')!} />;
    }
    if (path === '/business') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/scanner') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessScannerPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/editor') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessEditorPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/login') {
      return <BusinessLoginPage />;
    }
    if (path === '/signup/business') {
        return <BusinessSignupPage />;
    }
    if (path === '/signup/customer') {
        return <CustomerSignupPage />;
    }
    if (path === '/discounts') {
      return <DiscountsPage />;
    }

    return <LandingPage />;
  };

  return (
    <LanguageProvider>
      <OneSignalSetup />
      {renderPage()}
    </LanguageProvider>
  );
};

export default App;