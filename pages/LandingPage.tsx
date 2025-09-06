import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const FeatureCard: React.FC<{ title: string, description: string, icon: React.ReactNode }> = ({ title, description, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
        <div className="flex justify-center items-center mb-4 text-blue-600">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const HowItWorksStep: React.FC<{ step: string, title: string, description: string }> = ({ step, title, description }) => (
     <div className="flex flex-col items-center text-center">
        <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4">{step}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 max-w-xs">{description}</p>
    </div>
);

const LandingPage: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();

    return (
        <div className="bg-gray-50 font-sans">
            <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-10 h-10" />
                         <span className="font-bold text-xl text-gray-800">QRoyal</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setLanguage(language === 'en' ? 'el' : 'en')} className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                            {language === 'en' ? 'Ελληνικά' : 'English'}
                        </button>
                        <a href="/business/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">{t('businessLogin')}</a>
                        <a href="/signup/business" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            {t('landingCtaBusiness')}
                        </a>
                    </div>
                </nav>
            </header>

            <main>
                {/* Hero Section */}
                <section className="text-center py-20 px-6 bg-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t('landingTitle')}</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">{t('landingSubtitle')}</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="/signup/customer" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
                            {t('landingCtaCustomer')}
                        </a>
                        <a href="/signup/business" className="bg-white text-blue-600 border-2 border-blue-600 font-bold py-3 px-8 rounded-lg text-lg shadow-md hover:bg-blue-50 transition-transform transform hover:scale-105">
                            {t('landingForBusinesses')}
                        </a>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-20 px-6">
                    <div className="container mx-auto">
                        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t('howItWorks')}</h2>
                        <div className="flex flex-col md:flex-row justify-center items-start gap-12 md:gap-20">
                           <HowItWorksStep step="1" title={t('howStep1')} description={t('howStep1Desc')} />
                           <HowItWorksStep step="2" title={t('howStep2')} description={t('howStep2Desc')} />
                           <HowItWorksStep step="3" title={t('howStep3')} description={t('howStep3Desc')} />
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="bg-white py-20 px-6">
                    <div className="container mx-auto">
                         <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t('oneProgramAllNeeds')}</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <FeatureCard title={t('featureConnect')} description={t('featureConnectDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.596a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>} />
                            <FeatureCard title={t('featureUnderstand')} description={t('featureUnderstandDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} />
                            <FeatureCard title={t('featureEngage')} description={t('featureEngageDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V7a2 2 0 012-2h1m6 4l-2-2m0 0l-2 2m2-2v6" /></svg>} />
                            <FeatureCard title={t('featureRetain')} description={t('featureRetainDesc')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                        </div>
                    </div>
                </section>
            </main>

            <footer className="bg-gray-800 text-white py-12 px-6">
                <div className="container mx-auto text-center">
                    <p>&copy; {new Date().getFullYear()} QRoyal. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;