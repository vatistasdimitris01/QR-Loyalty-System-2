
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Business, ScanResult } from '../types';
import { BusinessScannerModal, CreateCustomerModal, Spinner } from '../components/common';
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
        sessionStorage.removeItem('isBusinessLoggedIn'); sessionStorage.removeItem('business'); window.location.href = '/';
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
        // Do not auto-close so staff can see confirmation. Done button resets it.
    };

    if (!business) return <div className="min-h-screen bg-[#f8fcf9] flex justify-center items-center"><Spinner className="size-10 text-[#2bee6c]" /></div>;

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f8fcf9] justify-between group/design-root overflow-x-hidden font-sans">
            <div>
                {/* Header with Logout instead of Back for mobile kiosk */}
                <header className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                    <button onClick={handleLogout} className="text-[#0d1b12] text-sm font-bold uppercase tracking-widest px-4 h-10 flex items-center rounded-xl bg-forest/5">
                        {t('logout')}
                    </button>
                    <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
                        {business.public_name}
                    </h2>
                </header>

                <div className="flex items-center justify-center gap-6 p-4 mt-12">
                    <button onClick={() => window.location.href='/business'} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-[#0d1b12]/10 text-[#0d1b12] hover:bg-[#0d1b12]/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,40H72A16,16,0,0,0,56,56V72H40A16,16,0,0,0,24,88V200a16,16,0,0,0,16,16H184a16,16,0,0,0,16-16V184h16a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM72,56H216v62.75l-10.07-10.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L72,109.37ZM184,200H40V88H56v80a16,16,0,0,0,16,16H184Zm32-32H72V132l36-36,49.66,49.66a8,8,0,0,0,11.31,0L194.63,120,216,141.38V168ZM160,84a12,12,0,1,1,12,12A12,12,0,0,1,160,84Z"></path>
                      </svg>
                    </button>
                    <button onClick={() => setIsScannerOpen(true)} className="flex shrink-0 items-center justify-center rounded-full size-24 bg-[#0d1b12]/10 text-[#0d1b12] active:scale-95 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48px" height="48px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M208,56H180.28L166.65,35.56A8,8,0,0,0,160,32H96a8,8,0,0,0-6.65,3.56L75.71,56H48A24,24,0,0,0,24,80V192a24,24,0,0,0,24,24H208a24,24,0,0,0,24-24V80A24,24,0,0,0,208,56Zm-44,76a36,36,0,1,1-36-36A36,36,0,0,1,164,132Z"></path>
                      </svg>
                    </button>
                    <button onClick={handleCreateQr} className="flex shrink-0 items-center justify-center rounded-full size-12 bg-[#0d1b12]/10 text-[#0d1b12] hover:bg-[#0d1b12]/20 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M248,144a8,8,0,0,1-16,0,96.11,96.11,0,0,0-96-96,88.1,88.1,0,0,0-88,88,80.09,80.09,0,0,0,80,80,72.08,72.08,0,0,0,72-72,64.07,64.07,0,0,0-64-64,56.06,56.06,0,0,0-56,56,48.05,48.05,0,0,0,48,48,40,40,0,0,0,40-40,32,32,0,0,0-32-32,24,24,0,0,0-24,24,16,16,0,0,0,16,16,8,8,0,0,0,8-8,8,8,0,0,1,0-16,16,16,0,0,1,16,16,24,24,0,0,1-24,24,32,32,0,0,1-32-32,40,40,0,0,1,40-40,48.05,48.05,0,0,1,48,48,56.06,56.06,0,0,1-56,56,64.07,64.07,0,0,1-64-64,72.08,72.08,0,0,1,72-72,80.09,80.09,0,0,1,80,80,88.1,88.1,0,0,1-88,88,96.11,96.11,0,0,1-96-96A104.11,104.11,0,0,1,136,32,112.12,112.12,0,0,1,248,144Z"></path>
                      </svg>
                    </button>
                </div>

                <div className="flex gap-4 py-12 px-4 justify-center">
                    <TimeBlock value={currentTime.getHours().toString().padStart(2, '0')} label="Hours" />
                    <TimeBlock value={currentTime.getMinutes().toString().padStart(2, '0')} label="Minutes" />
                    <TimeBlock value={currentTime.getSeconds().toString().padStart(2, '0')} label="Seconds" />
                </div>

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
                            <span className="truncate">Register New Customer</span>
                        </button>
                    </div>
                </div>
            </div>

            {lastScanResult && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end items-stretch bg-[#141414]/40 animate-in fade-in duration-300">
                    <div className="flex flex-col items-stretch bg-[#f8fcf9] rounded-t-[2.5rem] animate-in slide-in-from-bottom-full duration-500">
                        <button onClick={() => setLastScanResult(null)} className="flex h-5 w-full items-center justify-center pt-1">
                            <div className="h-1 w-9 rounded-full bg-[#cfe7d7]"></div>
                        </button>
                        <div className="flex-1 pb-10">
                            <h1 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-center pb-3 pt-5">
                                {lastScanResult.success ? 'Points Transferred!' : 'Scan Error'}
                            </h1>
                            {lastScanResult.success && (
                                <h2 className="text-[#0d1b12] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
                                    +{business.points_per_scan} Points
                                </h2>
                            )}
                            <p className="text-[#0d1b12] text-base font-normal leading-normal pb-3 pt-1 px-4 text-center">
                                {lastScanResult.message}
                            </p>
                            
                            {lastScanResult.success && (
                                <div className="flex items-center gap-4 bg-[#f8fcf9] px-4 min-h-[72px] py-2 justify-center">
                                    <div className="flex flex-col justify-center text-center">
                                        <p className="text-[#0d1b12] text-base font-medium leading-normal line-clamp-1">{lastScanResult.newPointsTotal} Points</p>
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal line-clamp-2">Updated Balance</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex px-4 pt-10">
                                <button
                                    onClick={() => setLastScanResult(null)}
                                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 flex-1 bg-[#2bee6c] text-[#0d1b12] text-base font-bold leading-normal tracking-[0.015em]"
                                >
                                    <span className="truncate">Done</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-5 bg-[#f8fcf9]"></div>
            
            <BusinessScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} businessId={business.id} onScanSuccess={handleScanSuccess} />
            <CreateCustomerModal isOpen={isCreateQrOpen} onClose={() => setIsCreateQrOpen(false)} qrDataUrl={newCustomerQr} />
        </div>
    );
};

const TimeBlock: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="flex grow basis-0 flex-col items-stretch gap-4">
        <div className="flex h-14 grow items-center justify-center rounded-lg px-3 bg-[#e7f3eb]">
            <p className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em]">{value}</p>
        </div>
        <div className="flex items-center justify-center"><p className="text-[#0d1b12] text-sm font-normal leading-normal">{label}</p></div>
    </div>
);

export default BusinessScannerPage;
