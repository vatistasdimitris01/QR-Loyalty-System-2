
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { loginBusiness } from '../services/api';
import { Logo } from '../components/common';

declare global {
  interface Window {
    tidioChatApi: any;
  }
}

const BusinessLoginPage: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        const result = await loginBusiness(email, password);
        setLoading(false);

        if (result.success) {
            sessionStorage.setItem('isBusinessLoggedIn', 'true');
            sessionStorage.setItem('business', JSON.stringify(result.business));
            window.location.href = '/business';
        } else {
            setError(t('invalidCredentials'));
        }
    };

    const handleOpenChat = (e: React.MouseEvent) => {
        e.preventDefault();
        if (window.tidioChatApi) {
            window.tidioChatApi.open();
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen font-display">
            <div className="flex min-h-screen w-full flex-col lg:flex-row">
                {/* Left Side: Hero & Social Proof */}
                <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-white overflow-hidden">
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    
                    {/* Header/Logo Area */}
                    <div className="relative z-10 flex items-center gap-3">
                        <Logo className="size-8 text-white" />
                        <h2 className="text-xl font-bold leading-tight tracking-tight">QROYAL Business</h2>
                    </div>

                    {/* Main Value Prop */}
                    <div className="relative z-10 max-w-lg">
                        <h1 className="text-5xl font-black leading-tight tracking-[-0.033em] mb-6">
                            Elevate Customer Loyalty with QROYAL
                        </h1>
                        <p className="text-lg font-normal leading-relaxed text-white/90 mb-8">
                            Manage rewards, track engagement, and grow your brand with our all-in-one B2B loyalty engine. Join thousands of brands scaling their customer relationships.
                        </p>
                        {/* Social Proof Widget */}
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-medium uppercase tracking-widest text-white/70">Trusted by 500+ global brands</p>
                            <div className="flex items-center gap-6 opacity-60 grayscale brightness-200">
                                <span className="text-xl font-bold italic">LuxeFlow</span>
                                <span className="text-xl font-black">VELOCITY</span>
                                <span className="text-xl font-serif font-bold">Aurelius</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer Quote */}
                    <div className="relative z-10 border-l-4 border-white/30 pl-6 py-2">
                        <p className="italic text-white/80">"QROYAL transformed how we interact with our top-tier clients. The automation is seamless."</p>
                        <p className="mt-2 font-bold text-sm">— Sarah Jenkins, Head of Growth at GlobalTech</p>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 bg-white dark:bg-background-dark">
                    <div className="mx-auto w-full max-w-[440px]">
                        {/* Mobile Logo */}
                        <div className="flex lg:hidden items-center gap-3 mb-10">
                            <Logo className="size-8 text-primary" />
                            <h2 className="text-xl font-bold text-[#111318] dark:text-white">QROYAL</h2>
                        </div>

                        <div className="mb-10">
                            <h2 className="text-3xl font-bold tracking-tight text-[#111318] dark:text-white">{t('businessAreaLogin')}</h2>
                            <p className="mt-2 text-base text-[#616f89] dark:text-gray-400">Welcome back! Please enter your details.</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* Email Field */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[#111318] dark:text-white text-sm font-semibold leading-normal">{t('email')}</label>
                                <div className="relative">
                                    <input 
                                        type="email" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="form-input flex w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 placeholder:text-[#616f89] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                        placeholder="name@company.com" 
                                        required 
                                    />
                                </div>
                            </div>
                            {/* Password Field */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[#111318] dark:text-white text-sm font-semibold leading-normal">{t('password')}</label>
                                    <a className="text-sm font-medium text-primary hover:underline" href="#">Forgot password?</a>
                                </div>
                                <div className="relative">
                                    <input 
                                        type="password" 
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-input flex w-full rounded-lg border border-[#dbdfe6] dark:border-gray-700 bg-white dark:bg-gray-800 text-[#111318] dark:text-white h-12 px-4 placeholder:text-[#616f89] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" 
                                        placeholder="••••••••" 
                                        required 
                                    />
                                </div>
                            </div>
                            
                            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}
                            
                            {/* Sign In Button */}
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary h-12 px-5 text-white text-base font-bold transition-opacity hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                            >
                                {loading ? 'Signing In...' : t('login')}
                            </button>
                        </form>

                        <div className="mt-10 pt-8 border-t border-[#f0f2f4] dark:border-gray-800">
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-sm text-[#616f89] dark:text-gray-400">New to QROYAL?</p>
                                <button 
                                    onClick={handleOpenChat}
                                    className="group flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 h-12 px-5 text-primary text-sm font-bold transition-all hover:bg-primary/10 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                                    Contact Support to Join
                                </button>
                                <p className="text-[12px] text-center text-[#616f89] dark:text-gray-500 max-w-[300px]">
                                    Becoming a partner is easy. Our dedicated team will guide you through the setup and onboarding process.
                                </p>
                            </div>
                        </div>

                        {/* Footer Links */}
                        <div className="mt-12 flex justify-center gap-6 text-[12px] text-[#616f89] dark:text-gray-500">
                            <a className="hover:underline" href="/">Back to Home</a>
                            <a className="hover:underline" href="#">Privacy Policy</a>
                            <a className="hover:underline" href="#">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </div>
            {/* Onboarding Chat Trigger (Floating UI) */}
            <div className="fixed bottom-6 right-6 z-50">
                <button onClick={handleOpenChat} className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-xl hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[28px]">support_agent</span>
                </button>
            </div>
        </div>
    );
};

export default BusinessLoginPage;
