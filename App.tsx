
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

const App: React.FC = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  const renderPage = () => {
    if (path === '/admin') {
      return <AdminPage />;
    }
    if (path === '/customer' && searchParams.has('token')) {
      return <CustomerPage qrToken={searchParams.get('token')!} />;
    }
    if (path === '/business') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/editor') {
        const isLoggedIn = sessionStorage.getItem('isBusinessLoggedIn') === 'true';
        return isLoggedIn ? <BusinessEditorPage /> : <BusinessLoginPage />;
    }
    if (path === '/business/login') {
      return <BusinessLoginPage />;
    }
    if (path === '/signup/customer') {
        return <CustomerSignupPage />;
    }
    if (path === '/signup/business') {
        return <BusinessSignupPage />;
    }

    return <LandingPage />;
  };

  return (
    <LanguageProvider>
      {renderPage()}
    </LanguageProvider>
  );
};

export default App;