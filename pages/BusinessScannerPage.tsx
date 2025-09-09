import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Business, ScanResult } from '../types';
import { BusinessScannerModal, CreateCustomerModal, Spinner } from '../components/common';
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
        if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
        } else {
            window.location.href = '/business/login';
        }

        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleCreateQr = async () => {
        if (business) {
            setNewCustomerQr(''); // clear previous
            setIsCreateQrOpen(true);
            const customer = await provisionCustomerForBusiness(business.id);
            if (customer) {
                setNewCustomerQr(customer.qr_data_url);
            }
        }
    };
    
    const handleScanSuccess = (result: ScanResult) => {
        setIsScannerOpen(false);
        setLastScanResult(result);
        setTimeout(() => {
            setLastScanResult(null);
        }, 5000);
    };

    const dateFormatter = new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formatTime = (date: Date) => {
        if (language === 'el') {
            let hours = date.getHours();
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const period = hours >= 12 ? 'μ.μ.' : 'π.μ.';
            hours = hours % 12;
            hours = hours ? hours : 12;
            const paddedHours = hours.toString().padStart(2, '0');
            return `${paddedHours}:${minutes} ${period}`;
        }
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    if (!business) return <div className="min-h-screen bg-gray-100 flex justify-center items-center"><Spinner /></div>;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <a href="/business" className="absolute top-4 left-4 bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg shadow hover:bg-gray-200 z-10">
                &larr; {t('exitKiosk')}
            </a>
            
            <div className="text-center w-full max-w-md">
                <p className="text-xl md:text-2xl text-gray-600">{dateFormatter.format(currentTime)}</p>
                <p className="text-6xl md:text-7xl font-bold my-4">{formatTime(currentTime)}</p>

                <img 
                    src={business.logo_url || 'https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png'} 
                    alt="Business Logo"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full mx-auto my-8 border-4 border-white shadow-lg"
                />

                <div className="bg-white p-6 rounded-lg shadow-md mb-6 min-h-[110px] flex flex-col justify-center transition-all duration-300">
                    {lastScanResult ? (
                        lastScanResult.success ? (
                            <div>
                                <p className="text-lg text-gray-600">{t('welcome')},</p>
                                <p className="text-2xl font-bold text-green-600">{lastScanResult.customer?.name}</p>
                                <p className="font-bold text-2xl text-blue-600 mt-1">{lastScanResult.newPointsTotal} {t('points')}</p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-xl font-semibold text-red-600">{t('error')}</p>
                                <p className="text-gray-600">{lastScanResult.message}</p>
                            </div>
                        )
                    ) : (
                        <div>
                            <p className="text-lg text-gray-600">{t('hello')},</p>
                            <p className="text-2xl font-semibold text-gray-800">{business.public_name}</p>
                        </div>
                    )}
                </div>
                
                <div className="space-y-4">
                    <button 
                        onClick={() => setIsScannerOpen(true)}
                        className="w-full bg-blue-600 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105"
                    >
                        {t('scanQr')}
                    </button>
                    <button 
                        onClick={handleCreateQr}
                        className="w-full bg-gray-700 text-white font-bold py-4 px-6 rounded-lg text-xl shadow-md hover:bg-gray-800 transition-transform transform hover:scale-105"
                    >
                        {t('createQr')}
                    </button>
                </div>
            </div>
            
            <BusinessScannerModal 
                isOpen={isScannerOpen}
                onClose={() => setIsScannerOpen(false)}
                businessId={business.id}
                onScanSuccess={handleScanSuccess}
            />
            
            <CreateCustomerModal
                isOpen={isCreateQrOpen}
                onClose={() => setIsCreateQrOpen(false)}
                qrDataUrl={newCustomerQr}
            />
        </div>
    );
};

export default BusinessScannerPage;