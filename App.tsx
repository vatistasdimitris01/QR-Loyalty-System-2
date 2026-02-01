import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import LandingPage from './pages/LandingPage';
import BusinessLoginPage from './pages/BusinessLoginPage';
import BusinessPage from './pages/BusinessPage';
import CustomerPage from './pages/CustomerPage';
import BusinessSignupPage from './pages/BusinessSignupPage';
import CustomerSignupPage from './pages/CustomerSignupPage';
import AdminPage from './pages/AdminPage';
import BusinessScannerPage from './pages/BusinessScannerPage';
import { DeviceGuard, SplashScreen } from './components/common';

// Info Pages
import { InfoLayout } from './components/InfoLayout';

const AppContent: React.FC = () => {
  const { t } = useLanguage();
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  // CRITICAL FIX: Initialize from sessionStorage immediately to prevent the flicker frame
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem('hasSeenSplash'));

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('hasSeenSplash', 'true');
  };

  if (showSplash) return <SplashScreen onComplete={handleSplashComplete} />;

  const renderPage = () => {
    // Basic Info Pages Handlers
    if (path === '/partners') return <InfoLayout category={t('landingFooterCompany')} title={t('compPartners')}><PartnersContent /></InfoLayout>;
    if (path === '/terms') return <InfoLayout category={t('landingFooterCompany')} title={t('compTerms')}><TermsContent /></InfoLayout>;
    if (path === '/privacy') return <InfoLayout category={t('landingFooterCompany')} title={t('compPrivacy')}><PrivacyContent /></InfoLayout>;
    if (path === '/status') return <InfoLayout category={t('landingFooterSupport')} title={t('suppStatus')}><StatusContent /></InfoLayout>;
    if (path === '/documentation') return <InfoLayout category={t('landingFooterSupport')} title={t('suppDocs')}><DocsContent /></InfoLayout>;
    if (path === '/contact') return <InfoLayout category={t('landingFooterSupport')} title={t('suppContact')}><ContactContent /></InfoLayout>;

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
    <div className="antialiased selection:bg-green-100">
      {renderPage()}
    </div>
  );
};

const App: React.FC = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

// --- CONTENT COMPONENTS ---

const PartnersContent = () => (
    <>
        <h2>Join the Ecosystem</h2>
        <p>We work with point-of-sale providers, marketing agencies, and enterprise retail chains to provide a unified loyalty experience.</p>
        <h3>Tier 1 Partners</h3>
        <p>Our Tier 1 partners receive priority access, custom co-branding, and 24/7 dedicated account support.</p>
    </>
);

const TermsContent = () => (
    <>
        <h2>Standard Service Agreement</h2>
        <p>By using QRoyal, businesses agree to maintain the privacy of their customers and honor the rewards promised within the platform.</p>
        <h3>Fees</h3>
        <p>Standard transactional fees apply based on point volume. Enterprise customers can opt for fixed-fee monthly infrastructure plans.</p>
    </>
);

const PrivacyContent = () => (
    <>
        <h2>Privacy is Paramount</h2>
        <p>QRoyal does not sell user data. Customers have full control over which businesses can see their profile and can delete their identity instantly.</p>
        <h3>GDPR Compliance</h3>
        <p>We are fully compliant with GDPR and CCPA. Users can request a full data export from their Profile Settings.</p>
    </>
);

const StatusContent = () => (
    <>
        <h2>System Status</h2>
        <div className="p-8 bg-green-50 rounded-2xl border border-green-100 flex items-center gap-4">
            <div className="size-4 bg-green-500 rounded-full animate-pulse"></div>
            <p className="font-bold text-green-700 m-0">All Systems Operational (99.99% Uptime)</p>
        </div>
        <ul className="mt-8">
            <li><strong>Identity Ledger:</strong> Normal</li>
            <li><strong>QR Generation:</strong> Normal</li>
            <li><strong>System Gateways:</strong> Normal</li>
        </ul>
    </>
);

const DocsContent = () => (
    <>
        <h2>Getting Started</h2>
        <p>Welcome to the QRoyal Documentation Hub. Whether you are a small business or an enterprise, we have guides to help you scale.</p>
        <h3>Guides</h3>
        <ul>
            <li>Dashboard Quickstart</li>
            <li>Custom Branding Guide</li>
            <li>Customer Engagement Best Practices</li>
        </ul>
    </>
);

const ContactContent = () => (
    <>
        <h2>Get in Touch</h2>
        <p>We are here to support your loyalty journey. Reach out to the specific department you need below.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mt-8">
            <div className="p-8 bg-white border border-slate-100 rounded-3xl">
                <h4 className="font-black text-[#163a24] uppercase tracking-widest text-xs mb-2">Technical Support</h4>
                <a href="mailto:vatistasdim.dev@icloud.com" className="text-xl font-bold text-[#2bee6c]">Contact Engineers</a>
            </div>
            <div className="p-8 bg-white border border-slate-100 rounded-3xl">
                <h4 className="font-black text-[#163a24] uppercase tracking-widest text-xs mb-2">Sales & Partnerships</h4>
                <a href="mailto:vatistasdim.dev@icloud.com" className="text-xl font-bold text-[#2bee6c]">Request Demo</a>
            </div>
        </div>
    </>
);

export default App;