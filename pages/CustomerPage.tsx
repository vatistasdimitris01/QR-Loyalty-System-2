
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getCustomerByQrToken, updateCustomer, joinBusiness, getMembershipsForCustomer } from '../services/api';
import { Customer, Membership, Business } from '../types';
import { Spinner, CustomerSetupModal, HomeIcon, SearchIcon, UserIcon, CustomerQRModal } from '../components/common';
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

type ActiveTab = 'home' | 'search' | 'profile';

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
    fetchCustomerAndMemberships(true); // Initial fetch
    
    const intervalId = setInterval(() => {
        fetchCustomerAndMemberships(false); // Subsequent fetches
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId); // Cleanup on component unmount
  }, [fetchCustomerAndMemberships]);

  const handleJoinSuccess = async () => {
    if (customer) {
        const membershipData = await getMembershipsForCustomer(customer.id);
        setMemberships(membershipData);
    }
  };

    useEffect(() => {
        const hideChat = () => {
            if (window.tidioChatApi) {
                window.tidioChatApi.hide();
            }
        };

        if (window.tidioChatApi) {
            hideChat();
        } else {
            document.addEventListener('tidioChat-ready', hideChat, { once: true });
        }
        
        return () => {
            document.removeEventListener('tidioChat-ready', hideChat);
            if (window.tidioChatApi) {
                window.tidioChatApi.show();
            }
        };
    }, []);


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

    if (customer) {
      handleAutoJoin();
    }
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

  if (loading) return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><Spinner /></div>;
  
  if (error || !customer) return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center text-red-500 text-center p-4">
      <div>
          <p className="font-bold text-lg">{t('error')}</p>
          <p>{error || t('customerNotFound')}</p>
      </div>
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
    <div className="min-h-screen bg-[#f6f6f8] font-sans">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={customer} />
        
        {joinMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg z-50 animate-bounce">
                {joinMessage}
            </div>
        )}

        <main className="pb-24">
            {renderContent()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] flex justify-around items-center px-4 py-2 md:py-4 z-40">
            <NavItem icon={<HomeIcon className="h-6 w-6" />} label={t('home')} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<SearchIcon className="h-6 w-6" />} label={t('search')} isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
            
            <button 
                onClick={() => setIsQrModalOpen(true)}
                className="relative -top-8 bg-primary hover:bg-blue-700 text-white rounded-full p-4 shadow-xl shadow-primary/40 border-4 border-white transition-all active:scale-90"
            >
                <span className="material-symbols-outlined text-2xl">qr_code_scanner</span>
            </button>

            <NavItem icon={<UserIcon className="h-6 w-6" />} label={t('profile')} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            <NavItem 
                icon={<span className="material-symbols-outlined">wallet</span>} 
                label="Cards" 
                isActive={false} 
                onClick={() => setActiveTab('home')} 
            />
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'text-primary' : 'text-slate-400';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-full transition-all hover:text-primary ${activeClass}`}>
            <div className="mb-0.5">{icon}</div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{label}</span>
        </button>
    )
}

export default CustomerPage;
