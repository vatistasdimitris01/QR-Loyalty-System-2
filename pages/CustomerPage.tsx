
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Spinner className="size-8 text-primary/40" /></div>;
  if (error || !customer) return <div className="h-screen flex items-center justify-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{error || 'Access Denied'}</div>;
  
  if (viewingBusiness) return <BusinessProfilePage business={viewingBusiness} customerId={customer.id} onBack={() => setViewingBusiness(null)} onLeaveSuccess={() => { setViewingBusiness(null); fetchData(); }} />;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-primary/10">
        <CustomerSetupModal isOpen={isSetupModalOpen} onSave={handleSetupSave} />
        <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={customer} />
        
        {joinMessage && (
            <div className="fixed top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.25em] py-4 px-10 rounded-full z-[100] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500">
                {joinMessage}
            </div>
        )}

        <main className="pb-32 max-w-md mx-auto">
            {activeTab === 'home' && <CustomerHomePage customer={customer} memberships={memberships} onViewBusiness={setViewingBusiness} onShowMyQr={() => setIsQrModalOpen(true)} />}
            {activeTab === 'search' && <CustomerSearchPage customer={customer} onJoinSuccess={handleJoinSuccess} />}
            {activeTab === 'profile' && <CustomerProfilePage customer={customer} onUpdate={setCustomer} onContactUs={() => window.tidioChatApi?.open()} />}
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] bg-white/80 backdrop-blur-2xl border border-slate-200/50 p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50">
            <div className="flex justify-between items-center px-2">
                <NavItem icon="home" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                <NavItem icon="explore" label="Explore" active={activeTab === 'search'} onClick={() => setActiveTab('search')} />
                
                <button 
                  onClick={() => setIsQrModalOpen(true)} 
                  className="size-14 -mt-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-xl shadow-slate-900/20 active:scale-90 transition-all border-4 border-white"
                >
                    <span className="material-symbols-outlined text-[28px]">qr_code_2</span>
                </button>

                <NavItem icon="person" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                <button 
                  onClick={() => window.tidioChatApi?.open()}
                  className="flex flex-col items-center gap-1 min-w-[64px] text-slate-300 hover:text-primary transition-all"
                >
                    <span className="material-symbols-outlined text-[24px]">support_agent</span>
                    <span className="text-[8px] font-black uppercase tracking-tighter">Support</span>
                </button>
            </div>
        </nav>
    </div>
  );
};

const NavItem: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[64px] transition-all ${active ? 'text-primary' : 'text-slate-300 hover:text-slate-400'}`}>
        <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
        {active && <div className="size-1 bg-primary rounded-full -mb-2 mt-0.5 animate-in zoom-in duration-300"></div>}
    </button>
)

export default CustomerPage;
