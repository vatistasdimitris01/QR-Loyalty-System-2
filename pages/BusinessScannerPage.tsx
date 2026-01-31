
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Business, ScanResult } from '../types';
import { BusinessScannerModal, CreateCustomerModal, Spinner, BackButton } from '../components/common';
import { provisionCustomerForBusiness } from '../services/api';

const BusinessScannerPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isCreateQrOpen, setIsCreateQrOpen] = useState(false);
    const [newCustomerQr, setNewCustomerQr] = useState('');
    const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) setBusiness(JSON.parse(storedBusiness));
        else window.location.href = '/business/login';
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCreateQr = async () => {
        if (business) {
            setNewCustomerQr('');
            setIsCreateQrOpen(true);
            const customer = await provisionCustomerForBusiness(business.id);
            if (customer) setNewCustomerQr(customer.qr_data_url);
        }
    };
    
    const handleScanSuccess = (result: ScanResult) => {
        setLastScanResult(result);
        setTimeout(() => setLastScanResult(null), 8000);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    if (!business) return <div className="min-h-screen bg-black flex justify-center items-center"><Spinner className="size-10 text-primary" /></div>;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-primary selection:text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #135bec 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
            
            <header className="relative z-10 p-8 flex justify-between items-center">
                <BackButton onClick={() => window.location.href = '/business'} className="bg-white/5 border-white/10 text-white hover:bg-white/10" />
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-1">Terminal Active</p>
                    <p className="text-xs font-bold text-slate-300">{business.public_name}</p>
                </div>
            </header>

            <main className="flex-grow flex flex-col items-center justify-center p-8 relative z-10">
                <div className="text-center space-y-4 mb-20">
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary mb-6 animate-pulse">System Live</p>
                    <h1 className="text-[140px] md:text-[200px] font-black tracking-[-0.08em] leading-none text-white/90 drop-shadow-2xl">
                        {formatTime(currentTime)}
                    </h1>
                    <p className="text-lg font-black uppercase tracking-[0.3em] text-slate-500">
                        {new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long' }).format(currentTime)}
                    </p>
                </div>

                <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ScannerAction 
                        onClick={() => setIsScannerOpen(true)}
                        icon="qr_code_scanner"
                        title="Scan Member"
                        desc="Award points or claim gifts"
                        variant="primary"
                    />
                    <ScannerAction 
                        onClick={handleCreateQr}
                        icon="person_add"
                        title="New Member"
                        desc="Provision instant digital ID"
                        variant="secondary"
                    />
                </div>
            </main>

            {lastScanResult && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div className={`w-full max-w-md p-12 rounded-[3.5rem] border-4 text-center space-y-8 shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 ${lastScanResult.success ? 'bg-emerald-600 border-white/20' : 'bg-rose-600 border-white/20'}`}>
                        <div className="size-24 bg-white/20 rounded-full flex items-center justify-center mx-auto border-2 border-white/30">
                            <span className="material-symbols-outlined text-[48px] text-white">{lastScanResult.success ? 'check' : 'warning'}</span>
                        </div>
                        <div className="space-y-2">
                             <h2 className="text-4xl font-black tracking-tighter text-white">{lastScanResult.success ? lastScanResult.customer?.name : 'Error'}</h2>
                             <p className="text-white/80 font-bold uppercase tracking-widest text-xs">{lastScanResult.message}</p>
                        </div>
                        {lastScanResult.success && (
                            <div className="text-7xl font-black text-white tracking-tighter leading-none py-6 border-y border-white/10">
                                {lastScanResult.newPointsTotal} <span className="text-lg uppercase tracking-widest block opacity-60">Balance</span>
                            </div>
                        )}
                        <button onClick={() => setLastScanResult(null)} className="w-full py-5 bg-white text-black font-black rounded-3xl active:scale-95 transition-all">Clear Screen</button>
                    </div>
                </div>
            )}

            <footer className="p-8 text-center relative z-10">
                 <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">QRoyal Kiosk Engine v2.4</p>
            </footer>
            
            <BusinessScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} businessId={business.id} onScanSuccess={handleScanSuccess} />
            <CreateCustomerModal isOpen={isCreateQrOpen} onClose={() => setIsCreateQrOpen(false)} qrDataUrl={newCustomerQr} />
        </div>
    );
};

const ScannerAction: React.FC<{ onClick: () => void, icon: string, title: string, desc: string, variant: 'primary' | 'secondary' }> = ({ onClick, icon, title, desc, variant }) => (
    <button 
        onClick={onClick}
        className={`group p-10 rounded-[3rem] text-left transition-all active:scale-95 flex items-center gap-8 ${variant === 'primary' ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
    >
        <div className={`size-20 rounded-[1.5rem] flex items-center justify-center ${variant === 'primary' ? 'bg-white/20' : 'bg-primary/20 text-primary'}`}>
            <span className="material-symbols-outlined text-[40px]">{icon}</span>
        </div>
        <div>
            <h3 className="text-2xl font-black tracking-tight">{title}</h3>
            <p className={`text-sm font-medium ${variant === 'primary' ? 'text-white/70' : 'text-slate-500'}`}>{desc}</p>
        </div>
    </button>
);

export default BusinessScannerPage;
