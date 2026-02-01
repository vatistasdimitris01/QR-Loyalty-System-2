import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner, FlagLogo } from '../components/common';
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
        <div className="bg-white min-h-screen font-sans text-[#163a24] overflow-x-hidden">
            {loginStatus.loading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[999] flex flex-col justify-center items-center">
                    <Spinner className="w-10 h-10 text-[#2bee6c]" />
                    <p className="mt-4 font-display font-bold tracking-tight">Verifying Credentials...</p>
                </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-8 py-5">
                    <div className="flex items-center gap-3">
                        <FlagLogo className="w-9 h-9" />
                        <h2 className="text-xl md:text-2xl font-bold font-display tracking-tighter text-[#163a24]">QROYAL</h2>
                    </div>
                    
                    <nav className="hidden lg:flex items-center gap-12">
                        <a href="#solutions" className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#2bee6c] transition-colors">Solutions</a>
                        <a href="#infrastructure" className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#2bee6c] transition-colors">Infrastructure</a>
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-xs font-black uppercase tracking-[0.3em] text-[#4c9a66] hover:text-[#2bee6c] transition-all">
                            {language === 'en' ? 'EL' : 'EN'}
                        </button>
                    </nav>

                    <div className="flex items-center gap-3 md:gap-5">
                        <a href="/business/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-[#163a24] transition-colors">{t('login')}</a>
                        <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 md:gap-3 bg-[#2bee6c] text-[#163a24] px-4 md:px-8 py-2 md:py-3 rounded-xl text-xs md:text-sm font-black active:scale-95 transition-all">
                            <span className="material-icons-round text-base md:text-lg">qr_code_scanner</span>
                            {t('scanToLogin')}
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative pt-20 md:pt-28 pb-32 md:pb-40 px-6 md:px-8">
                    <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 md:space-y-12">
                        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-green-50 border border-green-100">
                            <span className="size-2 rounded-full bg-[#2bee6c]"></span>
                            <span className="text-[9px] md:text-[10px] font-black tracking-[0.4em] text-[#4c9a66] uppercase">Identity Infrastructure v2.5</span>
                        </div>
                        
                        <div className="space-y-6 md:space-y-8 max-w-4xl">
                            <h1 className="text-5xl md:text-7xl lg:text-[100px] font-bold font-display leading-[0.9] md:leading-[0.85] tracking-tighter text-[#163a24]">
                                Loyalty that <br className="hidden md:block"/>
                                <span className="text-green-200">flows effortlessly.</span>
                            </h1>
                            <p className="text-lg md:text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed px-4 md:px-0">
                                The universal digital wallet for modern businesses. One QR identity. Endless rewards. Zero friction.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-6 w-full">
                            <a href="/signup/customer" className="w-full sm:w-auto bg-[#163a24] text-[#2bee6c] px-12 py-5 rounded-2xl font-black text-lg md:text-xl active:scale-95 transition-all text-center">
                                {t('landingCtaCustomer')}
                            </a>
                            <a href="/signup/business" className="w-full sm:w-auto bg-white border border-green-100 text-[#163a24] px-12 py-5 rounded-2xl font-black text-lg md:text-xl hover:bg-green-50 active:scale-95 transition-all text-center">
                                {t('landingForBusinesses')}
                            </a>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Features */}
                <section id="solutions" className="py-24 md:py-32 px-6 md:px-8 bg-green-50/20">
                    <div className="max-w-7xl mx-auto space-y-16 md:space-y-20">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 text-left md:text-right">
                            <div className="space-y-2 md:space-y-4 text-left">
                                <h2 className="text-4xl md:text-5xl font-bold font-display tracking-tighter text-[#163a24]">Modern Retention.</h2>
                                <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">A new standard for customer engagement</p>
                            </div>
                            <div className="h-px flex-1 bg-green-100 hidden md:block mb-4"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                            <div className="md:col-span-8 bg-white border border-green-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-16 flex flex-col justify-between overflow-hidden relative group">
                                <div className="space-y-6 relative z-10">
                                    <div className="size-14 md:size-16 bg-green-50 rounded-2xl flex items-center justify-center text-[#2bee6c]">
                                        <span className="material-icons-round text-3xl md:text-4xl">analytics</span>
                                    </div>
                                    <h3 className="text-3xl md:text-4xl font-bold font-display tracking-tight text-[#163a24]">{t('businessFeature1Title')}</h3>
                                    <p className="text-slate-400 text-base md:text-lg font-medium max-w-md">{t('businessFeature1Desc')}</p>
                                </div>
                                <div className="hidden md:block absolute -bottom-10 right-10 w-1/3 opacity-50 group-hover:opacity-100 transition-all">
                                    <img src="https://images.unsplash.com/photo-1551288049-bbbda546697a?auto=format&fit=crop&w=400" className="rounded-3xl border-8 border-green-50" />
                                </div>
                            </div>

                            <div className="md:col-span-4 bg-[#2bee6c] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 flex flex-col justify-between text-[#163a24]">
                                <div className="space-y-6">
                                    <span className="material-icons-round text-4xl md:text-5xl">auto_awesome</span>
                                    <h3 className="text-2xl md:text-3xl font-bold font-display tracking-tight leading-none">Automated <br/>Growth</h3>
                                    <p className="text-[#163a24]/60 text-sm md:text-base font-medium">Systematic rewards that keep users returning without manual effort.</p>
                                </div>
                                <div className="pt-8 md:pt-10 border-t border-[#163a24]/10 flex items-center justify-between">
                                    <span className="text-[9px] md:text-[10px] font-black tracking-[0.5em] uppercase">STITCH ENGINE</span>
                                    <span className="material-icons-round text-xl md:text-2xl">bolt</span>
                                </div>
                            </div>

                            <div className="md:col-span-4 bg-white border border-green-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 space-y-4 md:space-y-6 hover:border-[#2bee6c] transition-all">
                                <span className="material-icons-round text-3xl md:text-4xl text-green-200">smartphone</span>
                                <h4 className="text-xl md:text-2xl font-bold font-display tracking-tight text-[#163a24]">Universal Access</h4>
                                <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">No apps to download. The entire QRoyal experience lives in any standard mobile browser.</p>
                            </div>

                            <div className="md:col-span-8 bg-white border border-green-100 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center gap-8 md:gap-12 group">
                                <div className="flex-1 space-y-4 md:space-y-6">
                                    <span className="material-icons-round text-3xl md:text-4xl text-green-200">brush</span>
                                    <h4 className="text-xl md:text-3xl font-bold font-display tracking-tight text-[#163a24]">Branding Hub</h4>
                                    <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">Customize your loyalty identity with specific colors, logos, and custom QR designs.</p>
                                </div>
                                <div className="size-28 md:size-40 bg-green-50 rounded-full flex items-center justify-center shrink-0 mx-auto md:mx-0">
                                    <FlagLogo className="size-14 md:size-20 !bg-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Infrastructure Stats */}
                <section id="infrastructure" className="py-24 md:py-40 px-6 md:px-8 bg-white">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
                            <StatCard value="240ms" label="Scan Speed" />
                            <StatCard value="99.9%" label="Uptime" />
                            <StatCard value="12M+" label="Points Sync" />
                            <StatCard value="0" label="App Downloads" />
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-24 md:py-40 px-6 md:px-8 bg-[#f8fcf9]">
                    <div className="max-w-4xl mx-auto text-center space-y-12 md:space-y-16">
                        <h2 className="text-4xl md:text-8xl font-bold font-display tracking-tighter text-[#163a24]">Upgrade to <br className="hidden md:block"/>Royal Grade.</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 w-full">
                            <a href="/signup/business" className="w-full sm:w-auto bg-[#163a24] text-[#2bee6c] px-14 py-6 rounded-2xl font-black text-xl md:text-2xl active:scale-95 transition-all text-center">Start Free Pilot</a>
                            <a href="mailto:hq@qroyal.com" className="w-full sm:w-auto text-[#163a24] font-black text-lg md:text-xl hover:underline tracking-tight transition-all text-center">Request Enterprise Demo</a>
                        </div>
                        <p className="text-slate-400 font-medium text-xs md:text-sm italic">Deployed globally in under 5 minutes.</p>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-24 md:py-32 border-t border-slate-100 px-6 md:px-8">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-20">
                    <div className="col-span-2 md:col-span-1 space-y-6 md:space-y-8">
                        <div className="flex items-center gap-3">
                            <FlagLogo className="w-8 h-8" />
                            <h2 className="text-xl font-bold font-display tracking-tighter text-[#163a24]">QROYAL</h2>
                        </div>
                        <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em]">Infrastructure for loyalty.</p>
                    </div>
                    
                    <div className="space-y-4 md:space-y-6">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#163a24]">Technology</p>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm font-medium text-slate-400">
                            <li><a href="#" className="hover:text-[#2bee6c]">API Reference</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Scanner SDK</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Wallet Protocol</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#163a24]">Company</p>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm font-medium text-slate-400">
                            <li><a href="#" className="hover:text-[#2bee6c]">Partners</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Privacy Hub</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4 md:space-y-6">
                        <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-[#163a24]">Support</p>
                        <ul className="space-y-2 md:space-y-3 text-xs md:text-sm font-medium text-slate-400">
                            <li><a href="#" className="hover:text-[#2bee6c]">Status Page</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Contact Engine</a></li>
                            <li><a href="#" className="hover:text-[#2bee6c]">Documentation</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-24 md:pt-40 text-center">
                    <p className="text-[8px] md:text-[10px] font-black text-slate-200 uppercase tracking-[0.4em] md:tracking-[0.6em]">© {new Date().getFullYear()} QROYAL SYSTEMS CORP. ALL RIGHTS RESERVED.</p>
                </div>
            </footer>
        </div>
    );
};

const StatCard: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center space-y-1 md:space-y-2">
        <p className="text-3xl md:text-5xl font-bold font-display tracking-tight text-[#163a24]">{value}</p>
        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">{label}</p>
    </div>
);

export default LandingPage;