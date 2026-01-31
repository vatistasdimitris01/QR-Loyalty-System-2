
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
  const [joinMessage, setJoinMessage] = useState('');
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
    const id = setInterval(() => fetchData(false), 20000);
    return () => clearInterval(id);
  }, [fetchData]);

  const handleJoinSuccess = () => fetchData(false);

  useEffect(() => {
    const join = async () => {
        if (!customer) return;
        const bid = new URLSearchParams(window.location.search).get('join');
        if (bid) {
            const res = await joinBusiness(customer.id, bid);
            if (res) {
                setJoinMessage(`${t('joinSuccess')}!`);
                handleJoinSuccess();
                setTimeout(() => setJoinMessage(''), 3000);
            }
            window.history.replaceState({}, '', `${window.location.pathname}?token=${qrToken}`);
        }
    };
    join();
  }, [customer, qrToken, t]);

  const handleSetupSave = async (d: { name: string; phone: string }) => {
    if (customer) {
      const up = await updateCustomer(customer.id, { name: d.name, phone_number: d.phone });
      if (up) { setCustomer(up); setIsSetupModalOpen(false); }
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Spinner className="w-5 h-5 text-black" /></div>;
  if (error || !customer) return <div className="h-screen flex items-center justify-center text-xs font-black uppercase tracking-widest">{error || '404'}</div>;
  
  if (viewingBusiness) return <BusinessProfilePage business={viewingBusiness} customerId={customer.id} onBack={() => setViewingBusiness(null)} onLeaveSuccess={() => { setViewingBusiness(null); fetchData(); }} />;

  return (
    <div className="min-h-screen bg-white text-black font-sans">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={customer} />
        
        {joinMessage && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-3 px-8 rounded-full z-[100] animate-in fade-in slide-in-from-top duration-300">
                {joinMessage}
            </div>
        )}

        <main className="pb-32">
            {activeTab === 'home' && <CustomerHomePage customer={customer} memberships={memberships} onViewBusiness={setViewingBusiness} onShowMyQr={() => setIsQrModalOpen(true)} />}
            {activeTab === 'search' && <CustomerSearchPage customer={customer} onJoinSuccess={handleJoinSuccess} />}
            {activeTab === 'profile' && <CustomerProfilePage customer={customer} onUpdate={setCustomer} onContactUs={() => window.tidioChatApi?.open()} />}
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-50 pt-4 pb-10 px-8 z-50">
            <div className="max-w-md mx-auto flex justify-between items-center">
                <NavItem icon="home" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavItem icon="explore" label="Discover" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                <button onClick={() => setIsQrModalOpen(true)} className="w-10 h-10 bg-slate-50 text-black border border-slate-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">
                    <span className="material-symbols-outlined text-[20px]">qr_code</span>
                </button>
                <NavItem icon="person" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
            </div>
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary scale-110' : 'text-slate-300'}`}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </button>
)

export default CustomerPage;
