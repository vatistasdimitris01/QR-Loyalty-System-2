import React, { useState, useEffect, useCallback } from 'react';
import { getCustomerByQrToken, updateCustomer, joinBusiness, getMembershipsForCustomer } from '../services/api';
import { Customer, Membership, Business } from '../types';
import { Spinner, CustomerSetupModal } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import CustomerHomePage from './customer/CustomerHomePage';
import CustomerSearchPage from './customer/CustomerSearchPage';
import CustomerProfilePage from './customer/CustomerProfilePage';
import CustomerQRPage from './customer/CustomerQRPage';
import BusinessProfilePage from './customer/BusinessProfilePage';

interface CustomerPageProps {
  qrToken: string;
}

type ActiveTab = 'home' | 'qr' | 'search' | 'profile';

const CustomerPage: React.FC<CustomerPageProps> = ({ qrToken }) => {
  const { t } = useLanguage();
  
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [viewingBusiness, setViewingBusiness] = useState<Business | null>(null);

  const fetchData = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const data = await getCustomerByQrToken(qrToken);
      if (data) {
        setCustomer(data);
        if (initial && (!data.phone_number || data.name === 'New Customer')) setIsSetupModalOpen(true);
        const m = await getMembershipsForCustomer(data.id);
        setMemberships(m);
      } else setError(t('customerNotFound'));
    } catch { setError(t('errorUnexpected')); }
    finally { if (initial) setLoading(false); }
  }, [qrToken, t]);

  useEffect(() => {
    fetchData(true);
    const id = setInterval(() => fetchData(false), 30000);
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    const joinId = new URLSearchParams(window.location.search).get('join');
    if (customer && joinId) {
        joinBusiness(customer.id, joinId).then(() => {
            fetchData(false);
            window.history.replaceState({}, '', `${window.location.pathname}?token=${qrToken}`);
        });
    }
  }, [customer, qrToken, fetchData]);

  const handleSetupSave = async (d: { name: string; phone: string }) => {
    if (customer) {
      const up = await updateCustomer(customer.id, { name: d.name, phone_number: d.phone });
      if (up) { setCustomer(up); setIsSetupModalOpen(false); }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f8fcf9]"><Spinner className="size-10 text-[#2bee6c]" /></div>;
  if (error || !customer) return <div className="h-screen flex items-center justify-center p-12 text-center text-slate-400 font-bold uppercase tracking-widest bg-[#f8fcf9]">{error || 'Session Expired'}</div>;
  
  if (viewingBusiness) return <BusinessProfilePage business={viewingBusiness} customerId={customer.id} onBack={() => setViewingBusiness(null)} onLeaveSuccess={() => { setViewingBusiness(null); fetchData(); }} />;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcf9] justify-between overflow-x-hidden font-sans">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        
        <main className="flex-grow">
            {activeTab === 'home' && <CustomerHomePage customer={customer} memberships={memberships} onViewBusiness={setViewingBusiness} />}
            {activeTab === 'qr' && <CustomerQRPage customer={customer} />}
            {activeTab === 'search' && <CustomerSearchPage customer={customer} onJoinSuccess={() => fetchData(false)} />}
            {activeTab === 'profile' && <CustomerProfilePage customer={customer} onUpdate={setCustomer} />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-[#f8fcf9] border-t border-[#e7f3eb] px-4 pb-8 pt-2 z-50 flex justify-between items-center">
            <NavItem 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0,1.14,1.14,0,0,0,.11.11l80,75.48A16,16,0,0,1,224,115.55Z"></path></svg>} 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
            />
            <NavItem 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M232,48V88a8,8,0,0,1-16,0V56H184a8,8,0,0,1,0-16h40A8,8,0,0,1,232,48ZM72,200H40V168a8,8,0,0,0-16,0v40a8,8,0,0,0,8,8H72a8,8,0,0,0,0-16Zm152-40a8,8,0,0,0-8,8v32H184a8,8,0,0,0,0,16h40a8,8,0,0,0,8-8V168A8,8,0,0,0,224,160ZM32,96a8,8,0,0,0,8-8V56H72a8,8,0,0,0,0-16H32a8,8,0,0,0-8,8V88A8,8,0,0,0,32,96ZM80,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,80,80Zm104,88V88a8,8,0,0,0-16,0v80a8,8,0,0,0,16,0ZM144,80a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,144,80Zm-32,0a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,112,80Z"></path></svg>} 
              active={activeTab === 'qr'} 
              onClick={() => setActiveTab('qr')} 
            />
            <NavItem 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M216,72H56a8,8,0,0,1,0-16H192a8,8,0,0,0,0-16H56A24,24,0,0,0,32,64V192a24,24,0,0,0,24,24H216a16,16,0,0,0,16-16V88A16,16,0,0,0,216,72Zm0,128H56a8,8,0,0,1-8-8V86.63A23.84,23.84,0,0,0,56,88H216Zm-48-60a12,12,0,1,1,12,12A12,12,0,0,1,168,140Z"></path></svg>} 
              active={activeTab === 'search'} 
              onClick={() => setActiveTab('search')} 
            />
            <NavItem 
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256"><path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path></svg>} 
              active={activeTab === 'profile'} 
              onClick={() => setActiveTab('profile')} 
            />
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
    <button 
      onClick={onClick} 
      className={`flex flex-col items-center justify-end gap-1 flex-1 transition-all h-8 ${active ? 'text-[#0d1b12]' : 'text-[#4c9a66]'}`}
    >
        <div className="flex size-6 items-center justify-center">
            {icon}
        </div>
    </button>
);

export default CustomerPage;