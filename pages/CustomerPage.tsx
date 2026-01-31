
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCustomerByQrToken, updateCustomer, joinBusiness, getMembershipsForCustomer } from '../services/api';
import { Customer, Membership, Business } from '../types';
import { Spinner, CustomerSetupModal, CustomerQRModal } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import CustomerHomePage from './customer/CustomerHomePage';
import CustomerSearchPage from './customer/CustomerSearchPage';
import CustomerProfilePage from './customer/CustomerProfilePage';
import BusinessProfilePage from './customer/BusinessProfilePage';

declare global {
  interface Window {
    tidioChatApi: any;
  }
}

interface CustomerPageProps {
  qrToken: string;
}

type ActiveTab = 'home' | 'search' | 'profile' | 'wallet';

const CustomerPage: React.FC<CustomerPageProps> = ({ qrToken }) => {
  const { t } = useLanguage();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [joinMessage, setJoinMessage] = useState('');
  const [viewingBusiness, setViewingBusiness] = useState<Business | null>(null);

  const fetchCustomerAndMemberships = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setLoading(true);
    try {
      const customerData = await getCustomerByQrToken(qrToken);
      if (customerData) {
        setCustomer(customerData);
        if (isInitialLoad && (!customerData.phone_number || customerData.name === 'New Customer')) {
            setIsSetupModalOpen(true);
        }
        const membershipData = await getMembershipsForCustomer(customerData.id);
        setMemberships(membershipData);
      } else {
        setError(t('customerNotFound'));
      }
    } catch {
      setError(t('errorUnexpected'));
    } finally {
      if (isInitialLoad) setLoading(false);
    }
  }, [qrToken, t]);

  useEffect(() => {
    fetchCustomerAndMemberships(true);
    const intervalId = setInterval(() => fetchCustomerAndMemberships(false), 15000);
    return () => clearInterval(intervalId);
  }, [fetchCustomerAndMemberships]);

  const handleJoinSuccess = async () => {
    if (customer) {
        const membershipData = await getMembershipsForCustomer(customer.id);
        setMemberships(membershipData);
    }
  };

  useEffect(() => {
    const handleAutoJoin = async () => {
        if (!customer) return;
        const searchParams = new URLSearchParams(window.location.search);
        const businessIdToJoin = searchParams.get('join');
        if (businessIdToJoin) {
            const result = await joinBusiness(customer.id, businessIdToJoin);
            if (result) {
                setJoinMessage(`${t('joinSuccess')} ${result.business.public_name}!`);
                handleJoinSuccess();
                setTimeout(() => setJoinMessage(''), 5000);
            }
            const newUrl = `${window.location.pathname}?token=${qrToken}`;
            window.history.replaceState({}, document.title, newUrl);
        }
    };
    if (customer) handleAutoJoin();
  }, [customer, qrToken, t]);

  const handleSetupSave = async (details: { name: string; phone: string }) => {
    if (customer) {
      const updatedCustomer = await updateCustomer(customer.id, { name: details.name, phone_number: details.phone });
      if (updatedCustomer) {
        setCustomer(updatedCustomer);
        setIsSetupModalOpen(false);
      }
    }
  };
  
  const handleLeaveBusiness = () => {
      setViewingBusiness(null);
      fetchCustomerAndMemberships();
  }

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center items-center"><Spinner /></div>;
  if (error || !customer) return (
    <div className="min-h-screen bg-slate-50 flex justify-center items-center text-red-500 text-center p-4">
      <div><p className="font-bold text-lg">{t('error')}</p><p>{error || t('customerNotFound')}</p></div>
    </div>
  );
  
  if (viewingBusiness) {
      return (
          <BusinessProfilePage
            business={viewingBusiness}
            customerId={customer.id}
            onBack={() => setViewingBusiness(null)}
            onLeaveSuccess={handleLeaveBusiness}
          />
      )
  }

  const renderContent = () => {
      if (!customer) return null;
      switch (activeTab) {
          case 'home':
              return <CustomerHomePage 
                        customer={customer} 
                        memberships={memberships} 
                        onViewBusiness={setViewingBusiness} 
                        onShowMyQr={() => setIsQrModalOpen(true)} 
                      />;
          case 'search':
              return <CustomerSearchPage customer={customer} onJoinSuccess={handleJoinSuccess} />;
          case 'profile':
              return <CustomerProfilePage customer={customer} onUpdate={setCustomer} onContactUs={() => window.tidioChatApi?.open()} />;
          case 'wallet':
              return <CustomerHomePage 
                        customer={customer} 
                        memberships={memberships} 
                        onViewBusiness={setViewingBusiness}
                        onShowMyQr={() => setIsQrModalOpen(true)}
                      />;
          default:
              return <CustomerHomePage 
                        customer={customer} 
                        memberships={memberships} 
                        onViewBusiness={setViewingBusiness}
                        onShowMyQr={() => setIsQrModalOpen(true)}
                      />;
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-primary selection:text-white">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={customer} />
        
        {joinMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-black py-3 px-6 rounded-2xl shadow-xl z-[60] animate-in slide-in-from-top duration-500">
                {joinMessage}
            </div>
        )}

        <main className="pb-28">
            {renderContent()}
        </main>

        {/* Persistent Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 pt-3 pb-8 px-6 z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center max-w-lg mx-auto">
                <NavItem 
                    icon="home" 
                    label={t('home')} 
                    isActive={activeTab === 'home'} 
                    onClick={() => setActiveTab('home')} 
                />
                <NavItem 
                    icon="explore" 
                    label="Discover" 
                    isActive={activeTab === 'search'} 
                    onClick={() => setActiveTab('search')} 
                />
                
                {/* Floating Action Button Placeholder */}
                <div className="relative -top-8">
                    <button 
                        onClick={() => setIsQrModalOpen(true)}
                        className="bg-primary hover:bg-blue-700 text-white rounded-3xl p-5 shadow-[0_15px_30px_-5px_rgba(19,55,236,0.4)] border-4 border-white transition-all active:scale-90"
                    >
                        <span className="material-symbols-outlined text-[32px] block">qr_code_scanner</span>
                    </button>
                </div>

                <NavItem 
                    icon="wallet" 
                    label="Cards" 
                    isActive={activeTab === 'wallet'} 
                    onClick={() => setActiveTab('wallet')} 
                />
                <NavItem 
                    icon="person" 
                    label={t('profile')} 
                    isActive={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')} 
                />
            </div>
            
            {/* iOS Style Home Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-900/10 rounded-full"></div>
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    return (
        <button 
            onClick={onClick} 
            className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? 'text-primary scale-110' : 'text-slate-400 hover:text-slate-600'}`}
        >
            <span 
                className="material-symbols-outlined text-[26px]"
                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
            >
                {icon}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
        </button>
    )
}

export default CustomerPage;
