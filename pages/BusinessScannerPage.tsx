import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Business, ScanResult } from '../types';
import { BusinessScannerModal, CreateCustomerModal, Spinner, BackButton, FlagLogo } from '../components/common';
import { provisionCustomerForBusiness } from '../services/api';

const BusinessScannerPage: React.FC = () => {
    const { t } = useLanguage();
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

    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn'); 
        sessionStorage.removeItem('business'); 
        window.location.href = '/';
    };

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
    };

    if (!business) return <div className="min-h-screen bg-[#f8fcf9] flex justify-center items-center"><Spinner className="size-10 text-[#2bee6c]" /></div>;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcf9] justify-between group/design-root overflow-x-hidden font-sans">
            <div className="flex-grow">
                {/* Header with Back Navigation & Branding */}
                <header className="flex items-center bg-[#f8fcf9] p-4 pb-2 border-b border-[#e7f3eb]">
                    <BackButton />
                    <div className="flex-1 flex justify-center items-center gap-3">
                        <FlagLogo className="size-8" />
                        <h2 className="text-[#163a24] text-lg font-bold leading-tight tracking-[-0.015em]">
                            Terminal
                        </h2>
                    </div>
                    <button 
                        onClick={handleLogout} 
                        className="text-[#4c9a66] text-xs font-bold uppercase tracking-widest px-4 py-2 hover:text-[#163a24]"
                    >
                        {t('logout')}
                    </button>
                </header>

                <div className="px-6 pt-10 text-center">
                    <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.4em] mb-2">{business.public_name}</p>
                    <h1 className="text-3xl font-black text-[#163a24] tracking-tighter">Identity Validator</h1>
                </div>

                <div className="flex items-center justify-center gap-8 p-4 mt-10">
                    <button onClick={() => setIsScannerOpen(true)} className="flex shrink-0 items-center justify-center rounded-[2.5rem] size-32 bg-[#2bee6c] text-[#163a24] active:scale-95 transition-all">
                      <span className="material-symbols-outlined text-[56px]">qr_code_scanner</span>
                    </button>
                </div>

                <div className="flex gap-4 py-12 px-6 justify-center">
                    <TimeBlock value={currentTime.getHours().toString().padStart(2, '0')} label="Hrs" />
                    <div className="text-2xl font-black text-[#2bee6c]/30 mt-2">:</div>
                    <TimeBlock value={currentTime.getMinutes().toString().padStart(2, '0')} label="Min" />
                    <div className="text-2xl font-black text-[#2bee6c]/30 mt-2">:</div>
                    <TimeBlock value={currentTime.getSeconds().toString().padStart(2, '0')} label="Sec" />
                </div>

                <div className="flex justify-center mt-4">
                    <div className="flex flex-col gap-4 px-6 w-full max-w-[440px]">
                        <button
                            onClick={handleCreateQr}
                            className="flex items-center justify-center gap-3 rounded-2xl h-14 bg-white border border-[#e7f3eb] text-[#163a24] text-sm font-black uppercase tracking-widest active:scale-95 transition-all"
                        >
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            Issue New Identity
                        </button>
                    </div>
                </div>
            </div>

            {/* Points Transferred / Success Modal Redesign */}
            {lastScanResult && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end items-stretch bg-[#163a24]/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="flex flex-col items-stretch bg-white rounded-t-[3.5rem] animate-in slide-in-from-bottom-full duration-500">
                        <button onClick={() => setLastScanResult(null)} className="flex h-8 w-full items-center justify-center pt-2">
                            <div className="h-1.5 w-12 rounded-full bg-slate-100"></div>
                        </button>
                        <div className="px-8 pb-12 pt-6">
                            <div className="flex flex-col items-center gap-6 text-center">
                                <div className="size-20 bg-green-50 text-[#2bee6c] rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[40px] font-bold">check_circle</span>
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-[#163a24] text-3xl font-black tracking-tighter">
                                        {lastScanResult.success ? 'Transaction Verified' : 'Scan Error'}
                                    </h1>
                                    <p className="text-slate-400 font-medium">{lastScanResult.message}</p>
                                </div>
                                
                                {lastScanResult.success && (
                                    <div className="w-full bg-green-50/50 p-8 rounded-[2.5rem] border border-green-50">
                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-[0.4em] mb-4">Identity Balance</p>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-6xl font-black text-[#163a24] tracking-tighter">{lastScanResult.newPointsTotal}</span>
                                            <span className="text-sm font-bold text-green-600 uppercase">Points</span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setLastScanResult(null)}
                                    className="w-full h-16 bg-[#163a24] text-[#2bee6c] rounded-2xl font-black text-lg tracking-tight active:scale-95 transition-all"
                                >
                                    Complete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <BusinessScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} businessId={business.id} onScanSuccess={handleScanSuccess} />
            <CreateCustomerModal isOpen={isCreateQrOpen} onClose={() => setIsCreateQrOpen(false)} qrDataUrl={newCustomerQr} />
        </div>
    );
};

const TimeBlock: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-white border border-[#e7f3eb]">
            <p className="text-[#163a24] text-2xl font-black leading-tight tracking-tighter">{value}</p>
        </div>
        <p className="text-[#4c9a66] text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
    </div>
);

export default BusinessScannerPage;