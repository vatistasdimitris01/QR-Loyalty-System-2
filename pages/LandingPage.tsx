
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner } from '../components/common';
import { loginBusinessWithQrToken } from '../services/api';

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [loginStatus, setLoginStatus] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' });
    const [howItWorksTab, setHowItWorksTab] = useState<'customer' | 'business'>('customer');

    const handleLoginWithToken = async (token: string) => {
        setLoginStatus({ loading: true, error: '' });
        try {
            const result = await loginBusinessWithQrToken(token);
            if (result.success && result.business) {
                sessionStorage.setItem('isBusinessLoggedIn', 'true');
                sessionStorage.setItem('business', JSON.stringify(result.business));
                window.location.href = '/business';
            } else {
                setLoginStatus({ loading: false, error: result.message || 'Invalid QR code.' });
                setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000);
            }
        } catch (e) {
            setLoginStatus({ loading: false, error: 'An unexpected error occurred.' });
            setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000);
        }
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        if (token && token.startsWith('biz_')) {
            handleLoginWithToken(token);
        }
    }, []);

    const handleScan = (scannedText: string) => {
        setIsScannerOpen(false);
        try {
            const url = new URL(scannedText);
            const token = url.searchParams.get('token');
            if (token) {
                if (token.startsWith('biz_')) handleLoginWithToken(token);
                else if (token.startsWith('cust_')) window.location.href = `/customer?token=${token}`;
            } else if (scannedText.startsWith('biz_')) {
                handleLoginWithToken(scannedText);
            } else if (scannedText.startsWith('cust_')) {
                window.location.href = `/customer?token=${scannedText}`;
            }
        } catch (e) {
            if (scannedText.startsWith('biz_')) handleLoginWithToken(scannedText);
            else if (scannedText.startsWith('cust_')) window.location.href = `/customer?token=${scannedText}`;
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {loginStatus.loading && (
                 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[999] flex justify-center items-center p-4">
                     <div className="bg-white rounded-3xl shadow-2xl p-8 text-center flex flex-col items-center gap-4">
                        <Spinner />
                        <p className="font-bold text-lg text-slate-800">Logging you in...</p>
                     </div>
                 </div>
            )}
            
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            {/* Navigation */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="flex h-16 items-center justify-between px-6 lg:px-20 max-w-7xl mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                        </div>
                        <h2 className="text-2xl font-black tracking-tighter text-slate-900">QRoyal</h2>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-8">
                        <a className="text-sm font-bold text-slate-500 hover:text-primary transition-colors" href="/business/login">{t('businessLogin')}</a>
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-lg">language</span>
                            {language === 'en' ? 'EL' : 'EN'}
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsScannerOpen(true)} className="hidden sm:flex h-10 items-center justify-center px-4 text-sm font-black text-slate-700 hover:text-primary transition-colors">
                            {t('scanToLogin')}
                        </button>
                        <a href="/signup/customer" className="flex h-10 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-white shadow-xl shadow-primary/20 transition-all hover:bg-blue-700 active:scale-95">
                            {t('landingCtaCustomer')}
                        </a>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 px-6 max-w-7xl mx-auto">
                    <div className="grid gap-16 lg:grid-cols-2 items-center">
                        <div className="flex flex-col gap-8">
                            <div className="flex flex-col gap-5">
                                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-[10px] font-black text-primary uppercase tracking-widest">
                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                    {t('oneProgramAllNeeds')}
                                </div>
                                <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight text-slate-900">
                                    {t('landingTitle').split(' ').slice(0, -1).join(' ')} <span className="text-primary">{t('landingTitle').split(' ').pop()}</span>
                                </h1>
                                <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-lg">
                                    {t('landingSubtitle')}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <a href="/signup/customer" className="h-14 px-10 rounded-2xl bg-primary text-white text-lg font-black shadow-2xl shadow-primary/30 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95">
                                    {t('landingCtaCustomer')}
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </a>
                                <button onClick={() => window.tidioChatApi?.open()} className="h-14 px-8 rounded-2xl border-2 border-slate-100 bg-white text-slate-900 text-lg font-black hover:bg-slate-50 transition-all flex items-center gap-3 active:scale-95">
                                    {t('landingCtaBusiness')}
                                </button>
                            </div>
                        </div>

                        {/* Phone Mockup Visual */}
                        <div className="relative flex justify-center items-center">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-blue-100/40 via-purple-100/20 to-transparent rounded-full blur-3xl"></div>
                            <div className="relative z-10 w-[300px] sm:w-[340px] rotate-[-6deg] hover:rotate-0 transition-all duration-700 ease-out">
                                <div className="rounded-[3rem] border-[10px] border-slate-900 bg-slate-900 overflow-hidden shadow-2xl">
                                    <div className="h-[640px] w-full bg-white flex flex-col relative">
                                        <div className="h-8 w-full flex justify-between px-8 pt-4 text-[10px] font-black text-slate-900">
                                            <span>9:41</span>
                                            <div className="flex gap-1.5">
                                                <span className="material-symbols-outlined text-[14px]">signal_cellular_alt</span>
                                                <span className="material-symbols-outlined text-[14px]">wifi</span>
                                            </div>
                                        </div>
                                        <div className="pt-8 px-8 pb-4">
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="material-symbols-outlined text-slate-400">menu</span>
                                                <div className="h-10 w-10 rounded-2xl bg-slate-100 bg-[url('https://i.postimg.cc/KjFxM2bz/Chat-GPT-Image-Apr-27-2025-05-14-20-PM.png')] bg-cover"></div>
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 leading-tight mb-1">Hello, Alex! 👋</h3>
                                            <p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">Your active rewards</p>
                                        </div>
                                        <div className="px-6">
                                            <div className="bg-gradient-to-br from-primary to-indigo-800 rounded-3xl p-6 text-white shadow-2xl shadow-primary/20 mb-6 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                                <div className="flex justify-between items-start mb-10 relative z-10">
                                                    <div>
                                                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-1">Urban Coffee</p>
                                                        <h4 className="text-xl font-black leading-tight">Golden Card</h4>
                                                    </div>
                                                    <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                                        <span className="material-symbols-outlined">local_cafe</span>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-5 gap-3 relative z-10">
                                                    {[1,2,3].map(i => <div key={i} className="aspect-square rounded-full bg-white text-primary flex items-center justify-center shadow-sm"><span className="material-symbols-outlined text-sm font-black">check</span></div>)}
                                                    <div className="aspect-square rounded-full bg-white/30 border-2 border-white/50 flex items-center justify-center text-xs font-black">4</div>
                                                    <div className="aspect-square rounded-full bg-white/10 border-2 border-dashed border-white/20 flex items-center justify-center"><span className="material-symbols-outlined text-[16px] opacity-40">redeem</span></div>
                                                </div>
                                            </div>
                                            <button onClick={() => setIsScannerOpen(true)} className="w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-4 active:scale-95 transition-all">
                                                <div className="h-12 w-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <span className="material-symbols-outlined">qr_code_scanner</span>
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h4 className="font-black text-slate-800 text-sm">Scan Now</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Award points instantly</p>
                                                </div>
                                                <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-8 top-32 bg-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce duration-[3000ms] border border-slate-50">
                                    <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                                        <span className="material-symbols-outlined">celebration</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Reward!</p>
                                        <p className="text-sm font-black text-slate-800">Free Coffee Unlocked</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof */}
                <div className="w-full border-y border-slate-50 bg-slate-50/30 py-10">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Trusted by local legends</p>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
                            {['UrbanEats', 'BeanBrew', 'FlexGym', 'GlowSpa', 'BistroX'].map(name => (
                                <div key={name} className="flex items-center gap-2 text-2xl font-black tracking-tighter">{name}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center max-w-2xl mx-auto mb-12">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">{t('howItWorks')}</h2>
                            <p className="text-lg text-slate-500 font-medium">{t('landingSubtitle')}</p>
                        </div>
                        
                        <div className="flex justify-center mb-16">
                            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                                <button 
                                    onClick={() => setHowItWorksTab('customer')}
                                    className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${howItWorksTab === 'customer' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {t('landingForCustomers')}
                                </button>
                                <button 
                                    onClick={() => setHowItWorksTab('business')}
                                    className={`px-8 py-3 rounded-xl text-sm font-black transition-all ${howItWorksTab === 'business' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                                >
                                    {t('landingForBusinesses')}
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-10">
                            {howItWorksTab === 'customer' ? (
                                <>
                                    <StepCard icon="qr_code_2" title={t('howStep2')} desc={t('howStep2Desc')} color="blue" />
                                    <StepCard icon="approval_delegation" title="Collect Stamps" desc="Watch your digital stamp card fill up instantly. One scan is all it takes." color="purple" />
                                    <StepCard icon="redeem" title={t('howStep3')} desc={t('howStep3Desc')} color="green" />
                                </>
                            ) : (
                                <>
                                    <StepCard icon="settings" title={t('howStep1')} desc={t('howStep1Desc')} color="blue" />
                                    <StepCard icon="dashboard" title="Live Dashboard" desc="Monitor scans, points, and member growth in real-time." color="purple" />
                                    <StepCard icon="auto_graph" title="Retention Boost" desc="Automatically identify and reward your most loyal customers." color="green" />
                                </>
                            )}
                        </div>
                    </div>
                </section>

                {/* CTA Banner */}
                <section className="py-20 px-6 max-w-7xl mx-auto">
                    <div className="bg-primary rounded-[3rem] p-10 sm:p-20 text-center lg:text-left relative overflow-hidden shadow-2xl shadow-primary/30">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                        <div className="absolute right-0 top-0 w-96 h-96 bg-white/20 blur-[120px] rounded-full pointer-events-none -mr-48 -mt-48"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="max-w-xl">
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">Ready to build your digital legacy?</h2>
                                <p className="text-blue-100 text-xl font-medium">Join 2,000+ businesses growing with QRoyal. No physical cards, no hassle.</p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <a href="/signup/customer" className="h-16 px-10 rounded-2xl bg-white text-primary text-lg font-black shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center active:scale-95">
                                    {t('landingCtaCustomer')}
                                </a>
                                <button onClick={() => window.tidioChatApi?.open()} className="h-16 px-10 rounded-2xl bg-blue-800/40 border border-blue-400/20 text-white text-lg font-black hover:bg-blue-800/60 transition-all flex items-center justify-center active:scale-95">
                                    {t('landingCtaBusiness')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 bg-white py-16 px-6 lg:px-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900">QRoyal</span>
                    </div>
                    <div className="flex gap-10 text-sm font-bold text-slate-400">
                        <a className="hover:text-primary transition-colors" href="#">Privacy</a>
                        <a className="hover:text-primary transition-colors" href="#">Terms</a>
                        <button onClick={() => window.tidioChatApi?.open()} className="hover:text-primary transition-colors">{t('contactUs')}</button>
                    </div>
                    <p className="text-sm font-bold text-slate-300">© {new Date().getFullYear()} QRoyal Inc.</p>
                </div>
            </footer>
        </div>
    );
};

const StepCard: React.FC<{ icon: string, title: string, desc: string, color: 'blue' | 'purple' | 'green' }> = ({ icon, title, desc, color }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        green: 'bg-emerald-50 text-emerald-600'
    };
    return (
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-colors ${colors[color]} group-hover:bg-primary group-hover:text-white`}>
                <span className="material-symbols-outlined text-[32px]">{icon}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-500 font-medium leading-relaxed">{desc}</p>
        </div>
    );
};

export default LandingPage;
