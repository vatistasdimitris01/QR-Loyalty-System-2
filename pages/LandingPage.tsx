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
        <div className="bg-white dark:bg-background-dark min-h-screen selection:bg-blue-100 font-display transition-colors duration-300">
            {loginStatus.loading && (
                <div className="fixed inset-0 bg-white/90 dark:bg-background-dark/90 backdrop-blur-sm z-[999] flex flex-col justify-center items-center">
                    <Spinner className="w-8 h-8 text-primary" />
                </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            <!-- TopNavBar -->
            <header className="sticky top-0 z-50 w-full border-b border-solid border-[#dbdfe6] dark:border-[#2d3748] bg-white/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="size-8 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-black tracking-tighter">QROYAL</h2>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                            {language === 'en' ? 'Ελληνικά' : 'English'}
                        </button>
                        <a className="text-sm font-semibold hover:text-primary transition-colors" href="#solutions">Solutions</a>
                        <a className="text-sm font-semibold hover:text-primary transition-colors" href="/business/login">{t('businessLogin')}</a>
                    </nav>
                    <div className="flex items-center gap-3">
                        <a href="/business/login" className="hidden sm:flex min-w-[110px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 border border-[#dbdfe6] dark:border-[#2d3748] text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800">
                            {t('businessLogin')}
                        </a>
                        <button onClick={() => setIsScannerOpen(true)} className="flex min-w-[130px] cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                            {t('scanToLogin')}
                        </button>
                    </div>
                </div>
            </header>

            <main>
                <!-- HeroSection -->
                <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32">
                    <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col gap-8 z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Elite Loyalty Solutions</span>
                            </div>
                            <div className="flex flex-col gap-4">
                                <h1 className="text-[#111318] dark:text-white text-5xl md:text-7xl font-black leading-[1.1] tracking-tight">
                                    Empower Your Brand with <span className="gold-gradient-text">Royal-Grade</span> Loyalty.
                                </h1>
                                <p className="text-lg text-[#616f89] dark:text-gray-400 max-w-lg leading-relaxed">
                                    {t('landingSubtitle')}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <a href="/signup/customer" className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-6 bg-primary text-white text-base font-bold shadow-xl shadow-primary/30 hover:bg-blue-700 transition-all">
                                    {t('landingCtaCustomer')}
                                </a>
                                <a href="/signup/business" className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-6 bg-white dark:bg-gray-800 border border-[#dbdfe6] dark:border-[#2d3748] text-base font-bold hover:bg-gray-50 transition-all">
                                    {t('landingForBusinesses')}
                                </a>
                            </div>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex -space-x-3">
                                    <img className="size-10 rounded-full border-2 border-white dark:border-background-dark object-cover" src="https://i.pravatar.cc/100?u=1" />
                                    <img className="size-10 rounded-full border-2 border-white dark:border-background-dark object-cover" src="https://i.pravatar.cc/100?u=2" />
                                    <img className="size-10 rounded-full border-2 border-white dark:border-background-dark object-cover" src="https://i.pravatar.cc/100?u=3" />
                                </div>
                                <p className="text-sm font-medium text-[#616f89]"><span className="text-[#111318] dark:text-white font-bold">500+</span> Enterprises trust QROYAL</p>
                            </div>
                        </div>
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-gold rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
                            <div className="relative w-full aspect-[4/3] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-[#dbdfe6] dark:border-[#2d3748]">
                                <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&q=80")' }}></div>
                                <div className="absolute top-4 left-4 right-4 h-8 bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur rounded-md flex items-center px-4 gap-2">
                                    <div className="size-2 rounded-full bg-red-400"></div>
                                    <div className="size-2 rounded-full bg-yellow-400"></div>
                                    <div className="size-2 rounded-full bg-green-400"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- FeatureSection: Benefit Cards -->
                <section className="py-24 max-w-[1280px] mx-auto px-6">
                    <div className="flex flex-col gap-16">
                        <div className="text-center max-w-2xl mx-auto flex flex-col gap-4">
                            <h2 className="text-[#111318] dark:text-white text-4xl md:text-5xl font-black tracking-tight">
                                {t('oneProgramAllNeeds')}
                            </h2>
                            <p className="text-[#616f89] dark:text-gray-400 text-lg">
                                {t('howItWorks')}
                            </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <BenefitCard 
                                icon="trending_up" 
                                title={t('businessFeature1Title')} 
                                desc={t('businessFeature1Desc')} 
                                color="bg-primary/10 text-primary" 
                            />
                            <BenefitCard 
                                icon="analytics" 
                                title={t('businessFeature4Title')} 
                                desc={t('businessFeature4Desc')} 
                                color="bg-accent-gold/10 text-accent-gold" 
                            />
                            <BenefitCard 
                                icon="workspace_premium" 
                                title={t('businessFeature3Title')} 
                                desc={t('businessFeature3Desc')} 
                                color="bg-primary/10 text-primary" 
                            />
                        </div>
                    </div>
                </section>

                <!-- CTA Section -->
                <section className="py-24 px-6">
                    <div className="max-w-[1280px] mx-auto bg-primary rounded-3xl p-12 md:p-20 relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-accent-gold/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
                            <h2 className="text-white text-4xl md:text-6xl font-black tracking-tight">Ready to build your royal legacy?</h2>
                            <p className="text-white/80 text-lg md:text-xl">Join hundreds of global brands scaling their growth through QROYAL's elite B2B infrastructure.</p>
                            <div className="flex flex-wrap justify-center gap-4 pt-4">
                                <a href="/signup/business" className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg">
                                    {t('landingCtaBusiness')}
                                </a>
                                <button onClick={() => setIsScannerOpen(true)} className="bg-primary border-2 border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                                    {t('scanToLogin')}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-white dark:bg-background-dark border-t border-[#dbdfe6] dark:border-[#2d3748] py-16">
                <div className="max-w-[1280px] mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="size-6 text-primary">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                                </svg>
                            </div>
                            <h2 className="text-lg font-black tracking-tighter">QROYAL</h2>
                        </div>
                        <p className="text-sm text-[#616f89] dark:text-gray-400 leading-relaxed">The premier B2B ecosystem for retention and brand excellence. Build loyalty that lasts generations.</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Platform</h4>
                        <ul className="flex flex-col gap-4 text-sm text-[#616f89] dark:text-gray-400">
                            <li><a className="hover:text-primary transition-colors" href="#">Rewards Engine</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Analytics Suite</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Brand Control</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Company</h4>
                        <ul className="flex flex-col gap-4 text-sm text-[#616f89] dark:text-gray-400">
                            <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
                            <li><a className="hover:text-primary transition-colors" href="#">Security</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6">Subscribe</h4>
                        <p className="text-sm text-[#616f89] dark:text-gray-400 mb-4">Get the latest B2B growth insights.</p>
                        <div className="flex gap-2">
                            <input className="flex-1 rounded-lg border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-sm focus:ring-primary focus:border-primary" placeholder="Email address" type="email"/>
                            <button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-[1280px] mx-auto px-6 mt-16 pt-8 border-t border-[#dbdfe6] dark:border-[#2d3748] flex flex-col md:flex-row justify-between gap-4">
                    <p className="text-xs text-[#616f89]">© {new Date().getFullYear()} QROYAL Global Solutions Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a className="text-xs text-[#616f89] hover:text-primary" href="#">Privacy Policy</a>
                        <a className="text-xs text-[#616f89] hover:text-primary" href="#">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const BenefitCard: React.FC<{icon: string, title: string, desc: string, color: string}> = ({icon, title, desc, color}) => (
    <div className="group flex flex-col gap-6 rounded-2xl border border-[#dbdfe6] dark:border-[#2d3748] bg-white dark:bg-gray-900 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all">
        <div className={`size-14 rounded-xl flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white ${color}`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="flex flex-col gap-3">
            <h3 className="text-xl font-bold leading-tight">{title}</h3>
            <p className="text-[#616f89] dark:text-gray-400 text-base leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default LandingPage;