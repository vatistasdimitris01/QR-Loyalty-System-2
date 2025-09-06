import React, { useState, useEffect, useCallback } from 'react';
import { getCustomerByQrToken, updateCustomer, joinBusiness } from '../services/api';
import { Customer } from '../types';
import { Spinner, CustomerSetupModal, HomeIcon, SearchIcon, UserIcon } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import CustomerHomePage from './customer/CustomerHomePage';
import CustomerSearchPage from './customer/CustomerSearchPage';
import CustomerProfilePage from './customer/CustomerProfilePage';


interface CustomerPageProps {
  qrToken: string;
}

type ActiveTab = 'home' | 'search' | 'profile';

const CustomerPage: React.FC<CustomerPageProps> = ({ qrToken }) => {
  const { t } = useLanguage();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [joinMessage, setJoinMessage] = useState('');

  const fetchCustomer = useCallback(async () => {
    try {
      const customerData = await getCustomerByQrToken(qrToken);
      if (customerData) {
        setCustomer(customerData);
        if (!customerData.phone_number || customerData.name === 'New Customer') {
            setIsSetupModalOpen(true);
        }
      } else {
        setError(t('customerNotFound'));
      }
    } catch {
      setError(t('errorUnexpected'));
    } finally {
      setLoading(false);
    }
  }, [qrToken, t]);

  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  useEffect(() => {
    const handleAutoJoin = async () => {
        if (!customer) return;

        const searchParams = new URLSearchParams(window.location.search);
        const businessIdToJoin = searchParams.get('join');

        if (businessIdToJoin) {
            const result = await joinBusiness(customer.id, businessIdToJoin);
            if (result) {
                setJoinMessage(`${t('joinSuccess')} ${result.business.public_name}!`);
                setTimeout(() => setJoinMessage(''), 5000); // Hide message after 5s
            }
            // Remove join param from URL to prevent re-joining on refresh
            const newUrl = `${window.location.pathname}?token=${qrToken}`;
            window.history.replaceState({}, document.title, newUrl);
        }
    };

    handleAutoJoin();
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

  const renderContent = () => {
      if (!customer) return null;
      switch (activeTab) {
          case 'home':
              return <CustomerHomePage customer={customer} />;
          case 'search':
              return <CustomerSearchPage customer={customer} />;
          case 'profile':
              return <CustomerProfilePage customer={customer} onUpdate={setCustomer} />;
          default:
              return <CustomerHomePage customer={customer} />;
      }
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

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        
        {joinMessage && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg z-50">
                {joinMessage}
            </div>
        )}

        <main className="pb-24">
            {renderContent()}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around">
            <NavItem icon={<HomeIcon className="h-6 w-6" />} label={t('home')} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon={<SearchIcon className="h-6 w-6" />} label={t('search')} isActive={activeTab === 'search'} onClick={() => setActiveTab('search')} />
            <NavItem icon={<UserIcon className="h-6 w-6" />} label={t('profile')} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }> = ({ icon, label, isActive, onClick }) => {
    const activeClass = isActive ? 'text-blue-600' : 'text-gray-500';
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 ${activeClass} hover:text-blue-600 transition-colors`}>
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    )
}

export default CustomerPage;