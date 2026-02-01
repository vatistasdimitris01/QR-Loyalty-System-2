
import React, { useState, useEffect, useCallback } from 'react';
import { getCustomerByQrToken, updateCustomer, joinBusiness, getMembershipsForCustomer } from '../services/api';
import { Customer, Membership, Business } from '../types';
import { Spinner, CustomerSetupModal, CustomerQRModal } from '../components/common';
import { useLanguage } from '../context/LanguageContext';
import CustomerHomePage from './customer/CustomerHomePage';
import CustomerSearchPage from './customer/CustomerSearchPage';
import CustomerProfilePage from './customer/CustomerProfilePage';
import BusinessProfilePage from './customer/BusinessProfilePage';

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
    // Hide Tidio chatbot in the wallet for maximum minimalism
    const tidio = (window as any).tidioChatApi;
    if (tidio) tidio.hide();
    return () => {
        clearInterval(id);
        if (tidio) tidio.show();
    };
  }, [fetchData]);

  useEffect(() => {
    const joinId = new URLSearchParams(window.location.search).get('join');
    if (customer && joinId) {
        joinBusiness(customer.id, joinId).then(() => {
            fetchData(false);
            window.history.replaceState({}, '', `${window.location.pathname}?token=${qrToken}`);
        });
    }
  }, [customer, qrToken]);

  const handleSetupSave = async (d: { name: string; phone: string }) => {
    if (customer) {
      const up = await updateCustomer(customer.id, { name: d.name, phone_number: d.phone });
      if (up) { setCustomer(up); setIsSetupModalOpen(false); }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Spinner className="size-10 text-primary/20" /></div>;
  if (error || !customer) return <div className="h-screen flex items-center justify-center p-12 text-center text-slate-400 font-bold uppercase tracking-widest">{error || 'Session Expired'}</div>;
  
  if (viewingBusiness) return <BusinessProfilePage business={viewingBusiness} customerId={customer.id} onBack={() => setViewingBusiness(null)} onLeaveSuccess={() => { setViewingBusiness(null); fetchData(); }} />;

  return (
    <div className="min-h-screen bg-[#f8fcf9] text-slate-900 font-sans">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={customer} />
        
        <main className="pb-36 animate-in fade-in duration-500">
            {activeTab === 'home' && <CustomerHomePage customer={customer} memberships={memberships} onViewBusiness={setViewingBusiness} onShowMyQr={() => setIsQrModalOpen(true)} />}
            {activeTab === 'search' && <CustomerSearchPage customer={customer} onJoinSuccess={() => fetchData(false)} />}
            {activeTab === 'profile' && <CustomerProfilePage customer={customer} onUpdate={setCustomer} onContactUs={() => window.tidioChatApi?.open()} />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#e7f3eb] px-4 pb-8 pt-2 z-50 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <NavItem icon="house" label={t('home')} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
            <NavItem icon="barcode_scanner" label="Scan" active={false} onClick={() => setIsQrModalOpen(true)} />
            <NavItem icon="explore" label={t('search')} active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
            <NavItem icon="person" label={t('profile')} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 flex-1 transition-all ${active ? 'text-[#0d1b12]' : 'text-[#4c9a66] hover:text-[#0d1b12]'}`}>
        <div className="h-8 flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest scale-75 origin-top">{label}</span>
    </button>
);

export default CustomerPage;
