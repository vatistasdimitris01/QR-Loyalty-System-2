import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner } from '../components/common';
import { loginBusinessWithQrToken } from '../services/api';

declare global {
  interface Window {
    tidioChatApi: any;
  }
}

// --- New Icon Components ---

const WhyIcon1: React.FC = () => ( // No App Needed
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-3.603 2.253a.375.375 0 01-.569-.328V9.747a.375.375 0 01.57-.327l3.603 2.253z" /></svg>
);
const WhyIcon2: React.FC = () => ( // Instant Setup
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.63 2.25c-5.508 0-10.099 3.218-12.37 7.625A14.98 14.98 0 009.63 21.75c3.51 0 6.73-1.173 9.25-3.162m-13.5-7.625c0-3.866 3.582-7 8-7s8 3.134 8 7-3.582 7-8 7-8-3.134-8-7z" /></svg>
);
const WhyIcon3: React.FC = () => ( // All-in-one
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125A2.25 2.25 0 014.5 4.875h15a2.25 2.25 0 012.25 2.25v9.75a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-9.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M5.25 12v3.75m13.5-3.75v3.75M9 12v3.75M12 12v3.75m3-3.75v3.75M3 12a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 12m-18 0v3.75a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 15.75V12m-1.5-6.375c.621 0 1.125-.504 1.125-1.125S20.121 3.375 19.5 3.375s-1.125.504-1.125 1.125.504 1.125 1.125 1.125zM4.5 5.625c.621 0 1.125-.504 1.125-1.125S5.121 3.375 4.5 3.375s-1.125.504-1.125 1.125.504 1.125 1.125 1.125z" /></svg>
);
const WhyIcon4: React.FC = () => ( // Powerful Analytics
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" /></svg>
);
const QuoteIcon: React.FC = () => (
    <svg className="w-10 h-10 text-blue-100" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 14"><path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 1 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 1 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z"/></svg>
);

// --- New Logo Placeholder Components ---
const LogoCafe: React.FC<{className?: string}> = ({className}) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21.008h14v-2H1v2zm18-12h-2v-2a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3zM5 6.008h8v2H5v-2zm8 8H5v-2h8v2z"></path></svg>);
const LogoBooks: React.FC<{className?: string}> = ({className}) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M21 5.008c-1.841-1.232-4.14-2-6.5-2s-4.659.768-6.5 2H4v16h18V5.008h-1zM6 19.008V7.328c1.695-.712 3.822-1.32 5.5-1.32s3.805.608 5.5 1.32v11.68c-1.695.712-3.822 1.32-5.5 1.32s-3.805-.608-5.5-1.32z"></path><path d="M12.5 17.008h3v-2h-3v-2h-2v6h2v-2zm-3-4h-2v-2h2v-2h-4v6h4v-2z"></path></svg>);
const LogoBoutique: React.FC<{className?: string}> = ({className}) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.008c-3.513 0-4.834.305-6.41 2.373C3.993 5.488 4.693 8.308 6 10.008c1.332 1.733 2.05 4.341 2 6.5l.5 4.5h7l.5-4.5c-.05-2.159.668-4.767 2-6.5 1.307-1.7 2.007-4.52 1.41-6.627C20.834 1.313 19.513 1.008 16 1.008H12z"></path></svg>);
const LogoBakery: React.FC<{className?: string}> = ({className}) => (<svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M21.579 10.008a3.15 3.15 0 0 0-3.32-3.13c-.63.02-1.22.25-1.72.63l-2.06-4.63c-.39-.88-1.26-1.46-2.22-1.46h-4.5c-.96 0-1.83.58-2.22 1.46l-2.06 4.63c-.4-.3-1-.5-1.63-.52a3.15 3.15 0 0 0-3.17 3.25c.03.7.23 1.35.6 1.92L2 12.008v7a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-7l-.66-.07c.37-.57.57-1.22.6-1.93zm-15.02-6.62c.13-.29.42-.47.74-.47h4.5c.32 0 .61.18.74.47l1.72 3.87-9.42-.02 1.72-3.85zM5 20.008a1 1 0 0 1-1-1v-6h16v6a1 1 0 0 1-1 1H5z"></path></svg>);

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [loginStatus, setLoginStatus] = useState<{ loading: boolean; error: string }>({ loading: false, error: '' });

    const handleGeneralContactClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.tidioChatApi) {
            window.tidioChatApi.open();
        }
    };

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

        if (searchParams.get('action') === 'open_chat') {
            const checkTidio = setInterval(() => {
                if (window.tidioChatApi) {
                    window.tidioChatApi.open();
                    clearInterval(checkTidio);
                    
                    // Clean up URL
                    const newSearchParams = new URLSearchParams(window.location.search);
                    newSearchParams.delete('action');
                    const newUrl = window.location.pathname + (newSearchParams.toString() ? `?${newSearchParams.toString()}` : '');
                    window.history.replaceState({}, '', newUrl);
                }
            }, 100);
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
                else { setLoginStatus({ loading: false, error: 'Invalid QR code.' }); setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000); }
            } else { setLoginStatus({ loading: false, error: 'QR code does not contain a valid token.' }); setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000); }
        } catch (e) {
            if (scannedText.startsWith('biz_')) handleLoginWithToken(scannedText);
            else if (scannedText.startsWith('cust_')) window.location.href = `/customer?token=${scannedText}`;
            else { setLoginStatus({ loading: false, error: 'Invalid QR code format.' }); setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000); }
        }
    };

    const navLinks = (
        <>
            <a href="/business/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('businessLogin')}</a>
            <button onClick={() => setIsScannerOpen(true)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('scanToLogin')}</button>
            <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                {language === 'en' ? 'Ελληνικά' : 'English'}
            </button>
        </>
    );

    return (
        <div className="bg-white font-sans text-gray-800 antialiased">
            {loginStatus.loading && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-[999] flex justify-center items-center p-4">
                     <div className="bg-white rounded-lg shadow-xl p-8 text-center flex flex-col items-center gap-4">
                        <Spinner />
                        <p className="font-semibold text-lg">Logging you in...</p>
                     </div>
                 </div>
            )}
             {loginStatus.error && (
                 <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-red-500 text-white font-semibold py-2 px-6 rounded-lg shadow-lg z-[999]">
                    {loginStatus.error}
                 </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <a href="/" className="flex items-center gap-2">
                        <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-10 h-10" />
                        <span className="font-bold text-2xl text-gray-800">QRoyal</span>
                    </a>
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks}
                        <a href="/?action=open_chat" className="bg-blue-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md">
                            {t('landingCtaBusiness')}
                        </a>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </nav>
                {isMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg"><div className="flex flex-col items-center gap-4 py-4">{navLinks}
                        <a href="/?action=open_chat" className="w-11/12 text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">{t('landingCtaBusiness')}</a>
                    </div></div>
                )}
            </header>

            <main>
                <section className="relative bg-gradient-to-br from-blue-50 via-white to-cyan-50">
                    <div className="container mx-auto px-6 py-20 md:py-32 grid md:grid-cols-2 items-center gap-12">
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">{t('landingTitle')}</h1>
                            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto md:mx-0 mb-10">{t('landingSubtitle')}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                                <a href="/signup/customer" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                                    {t('landingCtaCustomer')}
                                </a>
                                <a href="/business/login" className="bg-white text-blue-600 border-2 border-blue-200 font-bold py-3 px-8 rounded-full text-lg shadow-sm hover:bg-blue-50 transition-transform transform hover:scale-105">
                                    {t('landingForBusinesses')}
                                </a>
                            </div>
                        </div>
                        <div className="relative h-96 flex justify-center items-center">
                            <div className="absolute w-64 h-[512px] bg-gray-800 rounded-[48px] border-[14px] border-black shadow-2xl"></div>
                            <div className="absolute w-[232px] h-[484px] bg-white rounded-[34px] overflow-hidden flex flex-col items-center justify-center p-4 space-y-4">
                               <img src="https://i.postimg.cc/8zRZt9pM/user.png" alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-100" />
                               <h2 className="text-2xl font-bold">John Doe</h2>
                               <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=qroyal_customer_preview" alt="QR Code" className="w-36 h-36" />
                               <p className="text-sm text-gray-500">Your Universal QR Card</p>
                            </div>
                        </div>
                    </div>
                </section>
                
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-sm font-bold uppercase text-gray-500 tracking-widest mb-8">Trusted by local businesses</h3>
                        <div className="flex justify-center items-center gap-10 md:gap-16 flex-wrap opacity-60">
                            <LogoCafe className="h-8 text-gray-500" />
                            <LogoBooks className="h-10 text-gray-500" />
                            <LogoBoutique className="h-10 text-gray-500" />
                            <LogoBakery className="h-9 text-gray-500" />
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 px-6">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Why QRoyal is Different</h2>
                        <p className="text-lg text-gray-500 mb-16 max-w-3xl mx-auto">We skip the complexity. No apps to download, no complicated hardware. Just a simple, powerful web-based tool that works for everyone.</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-lg mb-4"><WhyIcon1 /></div><h3 className="text-xl font-bold mb-2">No App Needed</h3><p className="text-gray-600">Customers join instantly with a QR scan using their phone's camera. The highest adoption rate comes from the lowest friction.</p></div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-lg mb-4"><WhyIcon3 /></div><h3 className="text-xl font-bold mb-2">All-in-One Platform</h3><p className="text-gray-600">Combine your loyalty program, customer list (CRM), and marketing announcements into one simple dashboard.</p></div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-lg mb-4"><WhyIcon2 /></div><h3 className="text-xl font-bold mb-2">Instant Setup</h3><p className="text-gray-600">Launch your complete digital loyalty program in under 5 minutes. Customize your rules, your profile, and start rewarding.</p></div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"><div className="flex items-center justify-center bg-blue-100 text-blue-600 w-12 h-12 rounded-lg mb-4"><WhyIcon4 /></div><h3 className="text-xl font-bold mb-2">Powerful Analytics</h3><p className="text-gray-600">See your growth in real-time. Track new members, points awarded, and rewards claimed to understand your customer base.</p></div>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 px-6 bg-blue-50">
                    <div className="container mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-16">{t('howItWorks')}</h2>
                        <div className="relative grid md:grid-cols-3 gap-12">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-blue-200 hidden md:block" style={{ transform: 'translateY(-50%)' }}></div>
                            <div className="relative text-center"><div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md z-10 mx-auto">1</div><h3 className="text-xl font-semibold mb-2">{t('howStep1')}</h3><p className="text-gray-500">{t('howStep1Desc')}</p></div>
                            <div className="relative text-center"><div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md z-10 mx-auto">2</div><h3 className="text-xl font-semibold mb-2">{t('howStep2')}</h3><p className="text-gray-500">{t('howStep2Desc')}</p></div>
                            <div className="relative text-center"><div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md z-10 mx-auto">3</div><h3 className="text-xl font-semibold mb-2">{t('howStep3')}</h3><p className="text-gray-500">{t('howStep3Desc')}</p></div>
                        </div>
                    </div>
                </section>

                <section className="py-20 md:py-28 px-6 bg-gray-50">
                    <div className="container mx-auto text-center">
                         <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">Loved by Businesses Like Yours</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                            <figure className="bg-white p-8 rounded-lg shadow-sm relative"><QuoteIcon /><blockquote className="mt-4 text-gray-600 italic">"{'QRoyal revolutionized how we interact with our customers. It\'s simple, effective, and our regulars love it!'}"</blockquote><figcaption className="mt-6"><div className="font-bold text-gray-800">Maria P.</div><div className="text-sm text-gray-500">Owner, The Daily Grind Cafe</div></figcaption></figure>
                            <figure className="bg-white p-8 rounded-lg shadow-sm relative"><QuoteIcon /><blockquote className="mt-4 text-gray-600 italic">"{'We saw a 20% increase in repeat customers within three months. The analytics dashboard is a game-changer.'}"</blockquote><figcaption className="mt-6"><div className="font-bold text-gray-800">John A.</div><div className="text-sm text-gray-500">Manager, Book Haven</div></figcaption></figure>
                            <figure className="bg-white p-8 rounded-lg shadow-sm relative"><QuoteIcon /><blockquote className="mt-4 text-gray-600 italic">"{'Finally, a loyalty solution that doesn\'t require an app! Our customers signed up instantly. The support has been fantastic too.'}"</blockquote><figcaption className="mt-6"><div className="font-bold text-gray-800">Elena V.</div><div className="text-sm text-gray-500">Stylist, Chic Boutique</div></figcaption></figure>
                        </div>
                    </div>
                </section>

                <section className="bg-blue-600">
                    <div className="container mx-auto py-20 px-6 text-center text-white">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Loyalty?</h2>
                        <p className="text-blue-200 text-lg mb-8 max-w-2xl mx-auto">Join hundreds of businesses growing with QRoyal. Get started today for free.</p>
                        <a href="/?action=open_chat" className="bg-white text-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-100 transition-transform transform hover:scale-105">
                            {t('landingCtaBusiness')}
                        </a>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-900 text-gray-400">
                <div className="container mx-auto py-12 px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <a href="/" className="flex items-center gap-2 mb-4">
                                <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-10 h-10" />
                                <span className="font-bold text-2xl text-white">QRoyal</span>
                            </a>
                            <p className="text-sm max-w-xs">The Smartest Loyalty Program for Local Businesses.</p>
                        </div>
                        <div className="flex gap-10 text-sm">
                           <div>
                             <h4 className="font-bold text-white mb-3">Product</h4>
                             <ul className="space-y-2">
                                <li><a href="/business/login" className="hover:text-white">Business Login</a></li>
                                <li><a href="/signup/customer" className="hover:text-white">Get a Card</a></li>
                             </ul>
                           </div>
                            <div>
                             <h4 className="font-bold text-white mb-3">Company</h4>
                             <ul className="space-y-2">
                                <li><button onClick={handleGeneralContactClick} className="hover:text-white">Contact Us</button></li>
                             </ul>
                           </div>
                        </div>
                    </div>
                    <div className="mt-10 pt-8 border-t border-gray-800 text-center text-sm">
                        <p>&copy; {new Date().getFullYear()} QRoyal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;