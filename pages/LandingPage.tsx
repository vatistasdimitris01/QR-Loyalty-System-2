import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { QRScannerModal, Spinner } from '../components/common';
import { loginBusinessWithQrToken } from '../services/api';

const FeatureCard: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-center items-center mb-4 text-white bg-blue-600 w-12 h-12 rounded-full">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{ step: string, title: string, description: string }> = ({ step, title, description }) => (
    <div className="relative flex flex-col items-center text-center p-4">
        <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl mb-4 border-4 border-white shadow-md z-10">{step}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 max-w-xs">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string; name: string; title: string; }> = ({ quote, name, title }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
        <p className="text-gray-600 italic">"{quote}"</p>
        <p className="mt-4 font-bold text-gray-800">{name}</p>
        <p className="text-sm text-gray-500">{title}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
            // Case 1: Scanned text is a full URL
            const url = new URL(scannedText);
            const token = url.searchParams.get('token');

            if (token) {
                if (token.startsWith('biz_')) {
                    handleLoginWithToken(token);
                } else if (token.startsWith('cust_')) {
                    window.location.href = `/customer?token=${token}`;
                } else {
                     setLoginStatus({ loading: false, error: 'Invalid QR code.' });
                     setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000);
                }
            } else {
                 setLoginStatus({ loading: false, error: 'QR code does not contain a valid token.' });
                 setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000);
            }
        } catch (e) {
            // Case 2: Scanned text is just the raw token string
            if (scannedText.startsWith('biz_')) {
                handleLoginWithToken(scannedText);
            } else if (scannedText.startsWith('cust_')) {
                window.location.href = `/customer?token=${scannedText}`;
            } else {
                setLoginStatus({ loading: false, error: 'Invalid QR code format.' });
                setTimeout(() => setLoginStatus({ loading: false, error: '' }), 4000);
            }
        }
    };

    const navLinks = (
        <>
            <a href="/business/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">{t('businessLogin')}</a>
            <button onClick={() => setIsScannerOpen(true)} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Scan to Login</button>
            <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
                {language === 'en' ? 'Ελληνικά' : 'English'}
            </button>
        </>
    );

    return (
        <div className="bg-gray-50 font-sans">
            {(loginStatus.loading || loginStatus.error) && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                     <div className="bg-white rounded-lg shadow-xl p-8 text-center">
                        {loginStatus.loading && <Spinner />}
                        {loginStatus.loading && <p className="mt-4 font-semibold">Logging you in...</p>}
                        {loginStatus.error && <p className="text-red-500 font-semibold">{loginStatus.error}</p>}
                     </div>
                 </div>
            )}
            <QRScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScan={handleScan} />

            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 shadow-sm">
                <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-10 h-10" />
                        <span className="font-bold text-2xl text-gray-800">QRoyal</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks}
                        <a href="mailto:contact@qroyal.com" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            {t('landingCtaBusiness')}
                        </a>
                    </div>
                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                        </button>
                    </div>
                </nav>
                {isMenuOpen && (
                    <div className="md:hidden bg-white shadow-lg">
                        <div className="flex flex-col items-center gap-4 py-4">
                            {navLinks}
                            <a href="mailto:contact@qroyal.com" className="w-11/12 text-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                                {t('landingCtaBusiness')}
                            </a>
                        </div>
                    </div>
                )}
            </header>

            <main>
                <section className="text-center py-20 md:py-32 px-6 bg-gradient-to-br from-blue-50 via-white to-blue-100">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-4 leading-tight">{t('landingTitle')}</h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10">{t('landingSubtitle')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/signup/customer" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                            {t('landingCtaCustomer')}
                        </a>
                        <a href="mailto:contact@qroyal.com" className="bg-white text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-50 transition-transform transform hover:scale-105">
                            {t('landingForBusinesses')}
                        </a>
                    </div>
                </section>

                <section className="py-20 px-6">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">{t('howItWorks')}</h2>
                        <p className="text-center text-gray-500 mb-16 max-w-2xl mx-auto">A seamless experience for you and your customers in three simple steps.</p>
                        <div className="relative flex flex-col md:flex-row justify-center items-center gap-8 md:gap-0">
                            <div className="absolute top-8 md:top-1/2 left-1/2 md:left-0 w-1 md:w-2/3 h-2/3 md:h-1 bg-blue-200 -translate-x-1/2 md:-translate-x-0 md:-translate-y-1/2" style={{ transform: 'translateY(-50%)', top: '50%'}}></div>
                            <HowItWorksStep step="1" title={t('howStep1')} description={t('howStep1Desc')} />
                            <HowItWorksStep step="2" title={t('howStep2')} description={t('howStep2Desc')} />
                            <HowItWorksStep step="3" title={t('howStep3')} description={t('howStep3Desc')} />
                        </div>
                    </div>
                </section>

                <section className="bg-white py-20 px-6">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">{t('oneProgramAllNeeds')}</h2>
                        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">QRoyal is packed with features to help you grow your business and build lasting customer relationships.</p>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard title={t('featureConnect')} description={t('featureConnectDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
                            <FeatureCard title={t('featureUnderstand')} description={t('featureUnderstandDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} />
                            <FeatureCard title={t('featureEngage')} description={t('featureEngageDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h1m6 4l-2-2m0 0l-2 2m2-2v6" /></svg>} />
                            <FeatureCard title={t('featureRetain')} description={t('featureRetainDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        </div>
                    </div>
                </section>
                
                <section className="py-20 px-6">
                    <div className="container mx-auto">
                        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">Loved by Businesses Like Yours</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <TestimonialCard quote="QRoyal revolutionized how we interact with our customers. It's simple, effective, and our regulars love it!" name="Maria P." title="Owner, The Daily Grind Cafe" />
                            <TestimonialCard quote="We saw a 20% increase in repeat customers within three months. The analytics dashboard is a game-changer for understanding our clientele." name="John A." title="Manager, Book Haven" />
                            <TestimonialCard quote="Finally, a loyalty solution that doesn't require an app! Our customers signed up instantly. The support has been fantastic too." name="Elena V." title="Stylist, Chic Boutique" />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 text-white">
                <div className="container mx-auto py-12 px-6 text-center">
                    <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Ready to Build Your Loyalty?</h3>
                    <p className="text-gray-400 mb-8">Join hundreds of businesses growing with QRoyal.</p>
                    <a href="mailto:contact@qroyal.com" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                        {t('landingCtaBusiness')}
                    </a>
                    <p className="mt-10 text-gray-500 text-sm">&copy; {new Date().getFullYear()} QRoyal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;