
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner } from '../components/common';
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
        <div className="bg-white min-h-screen selection:bg-indigo-50">
            {loginStatus.loading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[999] flex flex-col justify-center items-center">
                    <Spinner className="w-6 h-6 text-black" />
                </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            <nav className="h-20 border-b border-slate-50 flex items-center justify-between px-6 lg:px-20">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-black font-light text-[24px]">qr_code_2</span>
                    <span className="text-lg font-black tracking-tighter uppercase">QRoyal</span>
                </div>
                <div className="flex items-center gap-8">
                    <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-black transition-colors">
                        {language === 'en' ? 'Greek' : 'English'}
                    </button>
                    <a href="/business/login" className="text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">{t('login')}</a>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 pt-24 pb-40">
                <section className="text-center space-y-10">
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                            The loyalty <br/> <span className="text-primary">Standard.</span>
                        </h1>
                        <p className="text-lg text-slate-400 font-medium max-w-lg mx-auto">
                            {t('landingSubtitle')}
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                        <a href="/signup/customer" className="h-16 px-12 bg-black text-white rounded-full flex items-center justify-center text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            {t('landingCtaCustomer')}
                        </a>
                        <button onClick={() => setIsScannerOpen(true)} className="h-16 px-12 border border-slate-200 rounded-full flex items-center justify-center text-sm font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                            {t('scanToLogin')}
                        </button>
                    </div>
                </section>

                <section className="mt-40 grid md:grid-cols-2 gap-20">
                    <div className="space-y-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">For Customers</span>
                        <h2 className="text-4xl font-black tracking-tighter">{t('customerFeature1Title')}</h2>
                        <p className="text-slate-500 leading-relaxed font-medium">{t('customerFeature1Desc')}</p>
                    </div>
                    <div className="space-y-6">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">For Business</span>
                        <h2 className="text-4xl font-black tracking-tighter">{t('businessFeature1Title')}</h2>
                        <p className="text-slate-500 leading-relaxed font-medium">{t('businessFeature1Desc')}</p>
                    </div>
                </section>
            </main>

            <footer className="py-20 border-t border-slate-50 px-6 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">© {new Date().getFullYear()} QRoyal Digital</p>
            </footer>
        </div>
    );
};

export default LandingPage;
