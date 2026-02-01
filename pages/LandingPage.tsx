
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner, Logo } from '../components/common';
import { loginBusinessWithQrToken } from '../services/api';

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [loginStatus, setLoginStatus] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' });

    const handleLoginWithToken = async (token: string) => {
        setLoginStatus({ loading: true, error: '' });
        try {
            const result = await loginBusinessWithQrToken(token);
            if (result.success && result.business) {
                sessionStorage.setItem('isBusinessLoggedIn', 'true');
                sessionStorage.setItem('business', JSON.stringify(result.business));
                window.location.href = '/business';
            } else {
                setLoginStatus({ loading: false, error: result.message || 'Invalid' });
            }
        } catch (e) {
            setLoginStatus({ loading: false, error: 'Error' });
        }
    };

    useEffect(() => {
        const token = new URLSearchParams(window.location.search).get('token');
        if (token && token.startsWith('biz_')) handleLoginWithToken(token);
    }, []);

    const handleScan = (scannedText: string) => {
        setIsScannerOpen(false);
        try {
            const url = new URL(scannedText);
            const token = url.searchParams.get('token');
            if (token) {
                if (token.startsWith('biz_')) handleLoginWithToken(token);
                else if (token.startsWith('cust_')) window.location.href = `/customer?token=${token}`;
            } else {
                 if (scannedText.startsWith('biz_')) handleLoginWithToken(scannedText);
                 else if (scannedText.startsWith('cust_')) window.location.href = `/customer?token=${scannedText}`;
            }
        } catch (e) {
            if (scannedText.startsWith('biz_')) handleLoginWithToken(scannedText);
            else if (scannedText.startsWith('cust_')) window.location.href = `/customer?token=${scannedText}`;
        }
    };

    return (
        <div className="bg-[#f8fcf9] min-h-screen selection:bg-green-100 font-sans transition-colors duration-300 text-[#0d1b12]">
            {loginStatus.loading && (
                <div className="fixed inset-0 bg-[#f8fcf9]/90 backdrop-blur-sm z-[999] flex flex-col justify-center items-center">
                    <Spinner className="w-8 h-8 text-[#2bee6c]" />
                </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            <header className="sticky top-0 z-50 w-full border-b border-[#e7f3eb] bg-[#f8fcf9]/80 backdrop-blur-md">
                <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                        <Logo className="size-9 bg-[#0d1b12] text-[#2bee6c]" />
                        <h2 className="text-xl font-black tracking-tighter text-[#0d1b12]">QROYAL</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-xs font-bold uppercase tracking-widest text-[#4c9a66] hover:text-[#0d1b12] transition-colors">
                            {language === 'en' ? 'Ελληνικά' : 'English'}
                        </button>
                        <a className="text-sm font-bold text-[#0d1b12] hover:opacity-70 transition-colors" href="/business/login">{t('businessLogin')}</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsScannerOpen(true)} className="flex min-w-[130px] cursor-pointer items-center justify-center rounded-xl h-11 px-6 bg-[#0d1b12] text-[#2bee6c] text-sm font-black shadow-xl shadow-green-500/10 hover:scale-105 transition-transform">
                            {t('scanToLogin')}
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-40">
                    <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col gap-8 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e7f3eb] border border-[#cfe7d7] w-fit">
                                <span className="text-[10px] font-black tracking-widest text-[#4c9a66] uppercase">Stitch Design Infrastructure</span>
                            </div>
                            <div className="flex flex-col gap-6">
                                <h1 className="text-[#0d1b12] text-6xl md:text-8xl font-black leading-[0.95] tracking-tight">
                                    Loyalty <span className="text-[#4c9a66]">Simplified.</span>
                                </h1>
                                <p className="text-xl text-[#4c9a66] font-medium max-w-lg leading-relaxed">
                                    Turn every visitor into a lifetime member with our browser-first digital wallet and kiosk infrastructure.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <a href="/signup/customer" className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-2xl h-14 px-8 bg-[#2bee6c] text-[#0d1b12] text-base font-black shadow-2xl shadow-green-400/20 hover:opacity-90 transition-all">
                                    {t('landingCtaCustomer')}
                                </a>
                                <a href="/signup/business" className="flex min-w-[180px] cursor-pointer items-center justify-center rounded-2xl h-14 px-8 bg-white border border-[#e7f3eb] text-[#0d1b12] text-base font-black hover:bg-white shadow-sm transition-all">
                                    {t('landingForBusinesses')}
                                </a>
                            </div>
                        </div>
                        <div className="relative group p-4 bg-[#e7f3eb] rounded-[3rem]">
                            <div className="relative w-full aspect-[4/3] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-[#cfe7d7]">
                                <img src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover grayscale brightness-110" />
                                <div className="absolute inset-0 bg-[#2bee6c]/10 mix-blend-multiply"></div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white border-t border-[#e7f3eb] py-20">
                <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <Logo className="size-8 bg-[#0d1b12] text-[#2bee6c]" />
                        <h2 className="text-lg font-black tracking-tighter text-[#0d1b12]">QROYAL</h2>
                    </div>
                    <p className="text-sm text-[#4c9a66] font-bold">© {new Date().getFullYear()} QROYAL | Stitch Design v2.5</p>
                    <div className="flex gap-8">
                        <a className="text-xs font-black text-[#0d1b12] uppercase tracking-widest" href="#">Privacy</a>
                        <a className="text-xs font-black text-[#0d1b12] uppercase tracking-widest" href="#">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
