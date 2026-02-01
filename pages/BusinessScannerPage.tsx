
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
        return date.toLocaleTimeString(language === 'el' ? 'el-GR' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    // FIX: Changed 'class' to 'className' to resolve React error.
    if (!business) return <div className="min-h-screen bg-[#f8fcf9] flex justify-center items-center"><Spinner className="size-10 text-[#2bee6c]" /></div>;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcf9] justify-between group/design-root overflow-x-hidden font-sans">
            <div>
                <header className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                    <BackButton onClick={() => window.location.href = '/business'} className="bg-transparent border-none text-[#0d1b12]" />
                    <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Kiosk Mode</h2>
                </header>

                <div className="flex items-center justify-center gap-6 p-4 mt-8">
                    <button onClick={() => window.location.href='/business'} className="flex shrink-0 items-center justify-center rounded-full size-10 bg-black/5 text-[#0d1b12]">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <button onClick={() => setIsScannerOpen(true)} className="flex shrink-0 items-center justify-center rounded-full size-24 bg-[#0d1b12] text-[#2bee6c] shadow-2xl shadow-green-500/20 active:scale-95 transition-transform">
                        <span className="material-symbols-outlined text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                    </button>
                    <button onClick={handleCreateQr} className="flex shrink-0 items-center justify-center rounded-full size-10 bg-black/5 text-[#0d1b12]">
                        <span className="material-symbols-outlined">person_add</span>
                    </button>
                </div>

                <div className="flex gap-4 py-12 px-4 justify-center">
                    <TimeBlock value={currentTime.getHours().toString().padStart(2, '0')} label="Hours" />
                    <TimeBlock value={currentTime.getMinutes().toString().padStart(2, '0')} label="Minutes" />
                    <TimeBlock value={currentTime.getSeconds().toString().padStart(2, '0')} label="Seconds" />
                </div>

                {/* FIX: Changed 'class' to 'className' to resolve React error. */}
                <div className="flex justify-center mt-4">
                    <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 max-w-[480px] justify-center">
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#e7f3eb] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] grow"
                        >
                            <span className="truncate">Scan Member</span>
                        </button>
                        <button
                            onClick={handleCreateQr}
                            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#e7f3eb] text-[#0d1b12] text-sm font-bold leading-normal tracking-[0.015em] grow"
                        >
                            <span className="truncate">Register Guest</span>
                        </button>
                    </div>
                </div>
            </div>

            {lastScanResult && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end items-stretch bg-[#141414]/40 animate-in fade-in duration-300">
                    <div className="flex flex-col items-stretch bg-[#f8fcf9] rounded-t-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-full duration-500">
                        <button onClick={() => setLastScanResult(null)} className="flex h-8 w-full items-center justify-center pt-2">
                            <div className="h-1.5 w-12 rounded-full bg-[#cfe7d7]"></div>
                        </button>
                        <div className="flex-1 pb-10 px-6">
                            <h1 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] text-center pt-5">
                                {lastScanResult.success ? 'Points Awarded!' : 'Scan Error'}
                            </h1>
                            {lastScanResult.success && (
                                <h2 className="text-[#0d1b12] tracking-tight text-[42px] font-black leading-tight text-center py-4">
                                    +{business.points_per_scan} Points
                                </h2>
                            )}
                            <p className="text-[#4c9a66] text-base font-medium leading-normal text-center mb-8">
                                {lastScanResult.message}
                            </p>
                            
                            {lastScanResult.success && (
                                <div className="flex flex-col items-center justify-center bg-[#e7f3eb] p-6 rounded-2xl border border-[#cfe7d7]">
                                    <p className="text-[#0d1b12] text-2xl font-black leading-tight">{lastScanResult.newPointsTotal} Points</p>
                                    <p className="text-[#4c9a66] text-sm font-bold uppercase tracking-widest mt-1">Updated Wallet Balance</p>
                                </div>
                            )}

                            <div className="flex pt-10">
                                <button
                                    onClick={() => setLastScanResult(null)}
                                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 bg-[#2bee6c] text-[#0d1b12] text-lg font-black leading-normal tracking-[0.015em] shadow-xl shadow-green-200"
                                >
                                    <span className="truncate">Confirm & Done</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-10 bg-[#f8fcf9]"></div>
            
            <BusinessScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} businessId={business.id} onScanSuccess={handleScanSuccess} />
            <CreateCustomerModal isOpen={isCreateQrOpen} onClose={() => setIsCreateQrOpen(false)} qrDataUrl={newCustomerQr} />
        </div>
    );
};

const TimeBlock: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    // FIX: Changed 'class' to 'className' to resolve React error.
    <div className="flex grow basis-0 flex-col items-stretch gap-2">
        <div className="flex h-20 grow items-center justify-center rounded-2xl px-3 bg-[#e7f3eb] border border-[#cfe7d7]">
            <p className="text-[#0d1b12] text-3xl font-black leading-tight tracking-tighter">{value}</p>
        </div>
        <div className="flex items-center justify-center"><p className="text-[#4c9a66] text-xs font-bold uppercase tracking-widest">{label}</p></div>
    </div>
);

export default BusinessScannerPage;
