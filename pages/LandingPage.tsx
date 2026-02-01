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
        <div className="bg-white min-h-screen font-sans text-[#163a24]">
            {loginStatus.loading && (
                <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[999] flex flex-col justify-center items-center">
                    <Spinner className="w-10 h-10 text-[#2bee6c]" />
                    <p className="mt-4 font-display font-bold tracking-tight">Authorizing Terminal...</p>
                </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
                    <div className="flex items-center gap-3">
                        <FlagLogo className="w-9 h-9" />
                        <h2 className="text-xl font-bold font-display tracking-tight text-[#163a24]">QROYAL</h2>
                    </div>
                    
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#features" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#2bee6c] transition-colors">Features</a>
                        <a href="#network" className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-[#2bee6c] transition-colors">Network</a>
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-xs font-bold uppercase tracking-[0.2em] text-[#4c9a66] hover:text-[#2bee6c]">
                            {language === 'en' ? 'EL' : 'EN'}
                        </button>
                    </nav>

                    <div className="flex items-center gap-4">
                        <a href="/business/login" className="hidden sm:block text-sm font-bold text-slate-400 hover:text-[#2bee6c]">{t('login')}</a>
                        <button onClick={() => setIsScannerOpen(true)} className="flex items-center gap-2 bg-[#2bee6c] text-[#163a24] px-6 py-2.5 rounded-xl text-sm font-bold active:scale-95 transition-all">
                            <span className="material-icons-round text-lg">qr_code_scanner</span>
                            {t('scanToLogin')}
                        </button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative pt-24 pb-32 overflow-hidden bg-gradient-to-b from-green-50/30 to-white">
                    <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-10 animate-in fade-in slide-in-from-left-10 duration-700">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100">
                                <span className="size-2 rounded-full bg-[#2bee6c] animate-pulse"></span>
                                <span className="text-[10px] font-black tracking-[0.3em] text-[#4c9a66] uppercase">Now Live: v2.5 Infrastructure</span>
                            </div>
                            <div className="space-y-6">
                                <h1 className="text-7xl md:text-8xl font-bold font-display leading-[0.9] tracking-tighter text-[#163a24]">
                                    Loyalty <br/>
                                    <span className="text-green-200">Reimagined.</span>
                                </h1>
                                <p className="text-xl text-slate-400 font-medium max-w-lg leading-relaxed">
                                    The enterprise-grade loyalty engine for the modern world. No apps, no friction. Just seamless QR-driven retention for businesses and customers alike.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <a href="/signup/customer" className="bg-[#2bee6c] text-[#163a24] px-10 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all">
                                    {t('landingCtaCustomer')}
                                </a>
                                <a href="/signup/business" className="bg-white border border-green-100 text-[#163a24] px-10 py-4 rounded-2xl font-bold text-lg hover:bg-green-50 active:scale-95 transition-all">
                                    {t('landingForBusinesses')}
                                </a>
                            </div>
                        </div>

                        <div className="relative group animate-in fade-in zoom-in-95 duration-1000">
                            <div className="absolute -inset-4 bg-[#2bee6c]/5 blur-3xl rounded-full"></div>
                            <div className="relative rounded-[3.5rem] border border-green-100 p-4 bg-white overflow-hidden">
                                <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-slate-50">
                                    <img 
                                        src="https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80" 
                                        className="w-full h-full object-cover grayscale brightness-110 contrast-110 opacity-90" 
                                        alt="Terminal"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[#2bee6c]/10 to-transparent"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 border-y border-slate-50 bg-white">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                            <StatItem label="Active Members" value="2.4M+" />
                            <StatItem label="Global Brands" value="120+" />
                            <StatItem label="Retention Lift" value="44%" />
                            <StatItem label="Scan Latency" value="120ms" />
                        </div>
                    </div>
                </section>

                {/* Features Bento Grid */}
                <section id="features" className="py-32 bg-white">
                    <div className="max-w-7xl mx-auto px-8 space-y-20">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl font-bold font-display tracking-tight text-[#163a24]">The Digital Standard</h2>
                            <p className="text-slate-400 font-medium uppercase tracking-[0.3em] text-xs">Everything you need to scale</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full md:h-[600px]">
                            <div className="md:col-span-7 bg-green-50/30 border border-green-100 rounded-[3rem] p-12 flex flex-col justify-between overflow-hidden relative">
                                <div className="space-y-4 relative z-10">
                                    <span className="material-icons-round text-4xl text-[#2bee6c]">insights</span>
                                    <h3 className="text-3xl font-bold font-display tracking-tight text-[#163a24]">{t('businessFeature1Title')}</h3>
                                    <p className="text-slate-400 font-medium max-w-sm">{t('businessFeature1Desc')}</p>
                                </div>
                                <div className="absolute -bottom-10 -right-10 w-2/3 h-2/3 bg-white border border-green-50 rounded-tl-[3rem] p-8 hidden md:block">
                                    <div className="space-y-4">
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full w-2/3 bg-[#2bee6c]"></div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                            <div className="h-full w-1/2 bg-green-200"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-5 bg-[#2bee6c] rounded-[3rem] p-12 flex flex-col justify-between text-[#163a24]">
                                <div className="space-y-4">
                                    <span className="material-icons-round text-4xl text-[#163a24]">auto_awesome</span>
                                    <h3 className="text-3xl font-bold font-display tracking-tight">Stitch AI Engine</h3>
                                    <p className="text-[#163a24]/70 font-medium">Predictive insights to understand when customers are most likely to return.</p>
                                </div>
                                <div className="pt-10 border-t border-[#163a24]/10 flex items-center justify-between">
                                    <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-60">Automated CRM</span>
                                    <span className="material-icons-round">bolt</span>
                                </div>
                            </div>

                            <div className="md:col-span-4 bg-white border border-slate-100 rounded-[3rem] p-10 space-y-4">
                                <span className="material-icons-round text-3xl text-green-200">devices</span>
                                <h4 className="text-xl font-bold font-display tracking-tight text-[#163a24]">Universal Wallet</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">No downloads required. Your loyalty ID lives securely in any mobile browser.</p>
                            </div>

                            <div className="md:col-span-8 bg-white border border-slate-100 rounded-[3rem] p-10 flex items-center gap-10">
                                <div className="flex-1 space-y-4">
                                    <span className="material-icons-round text-3xl text-green-200">qr_code_2</span>
                                    <h4 className="text-xl font-bold font-display tracking-tight text-[#163a24]">QR Design Lab</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">Customize your brand identity with our proprietary QR styling engine.</p>
                                </div>
                                <div className="size-24 bg-green-50 rounded-2xl flex items-center justify-center shrink-0">
                                    <span className="material-icons-round text-4xl text-[#2bee6c]">edit_attributes</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="py-32 bg-green-50/20">
                    <div className="max-w-3xl mx-auto px-8 text-center space-y-12">
                        <h2 className="text-6xl font-bold font-display tracking-tighter text-[#163a24]">Ready to upgrade your relationship with your customers?</h2>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <a href="/signup/business" className="bg-[#2bee6c] text-[#163a24] px-12 py-5 rounded-2xl font-bold text-xl w-full sm:w-auto active:scale-95 transition-all">Start Free Trial</a>
                            <a href="mailto:partners@qroyal.com" className="text-[#163a24] font-bold text-lg hover:underline">Contact Sales</a>
                        </div>
                        <p className="text-slate-400 font-medium text-sm italic">Standard platform setup in under 5 minutes.</p>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-6">
                        <div className="flex items-center gap-3">
                            <FlagLogo className="w-8 h-8" />
                            <h2 className="text-lg font-bold font-display tracking-tight text-[#163a24]">QROYAL</h2>
                        </div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.3em]">Infrastructure for the Future</p>
                    </div>
                    
                    <div className="flex gap-12">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#163a24]">Resources</p>
                            <ul className="space-y-2 text-sm font-medium text-slate-400">
                                <li><a href="#" className="hover:text-[#2bee6c]">Developer API</a></li>
                                <li><a href="#" className="hover:text-[#2bee6c]">Documentation</a></li>
                                <li><a href="#" className="hover:text-[#2bee6c]">Support</a></li>
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#163a24]">Company</p>
                            <ul className="space-y-2 text-sm font-medium text-slate-400">
                                <li><a href="#" className="hover:text-[#2bee6c]">Terms</a></li>
                                <li><a href="#" className="hover:text-[#2bee6c]">Privacy</a></li>
                                <li><a href="#" className="hover:text-[#2bee6c]">Pricing</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-8 pt-20 text-center">
                    <p className="text-[10px] font-bold text-slate-200 uppercase tracking-[0.5em]">© {new Date().getFullYear()} QROYAL SYSTEMS INC.</p>
                </div>
            </footer>
        </div>
    );
};

const StatItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="text-center space-y-1">
        <p className="text-4xl font-bold font-display tracking-tight text-[#163a24]">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">{label}</p>
    </div>
);

export default LandingPage;