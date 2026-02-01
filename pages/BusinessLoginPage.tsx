import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { loginBusiness } from '../services/api';
import { FlagLogo, BackButton } from '../components/common';

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

    return (
        <div className="bg-white min-h-screen font-sans flex flex-col items-center justify-center p-6">
            <div className="fixed top-8 left-8">
                <BackButton />
            </div>

            <div className="w-full max-w-md space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex flex-col items-center gap-6">
                    <FlagLogo className="w-16 h-16" />
                    <div className="text-center space-y-2">
                        <h2 className="text-4xl font-bold font-display tracking-tighter text-[#163a24]">Terminal Auth</h2>
                        <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.4em]">{t('businessAreaLogin')}</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-6">
                        <div className="group">
                            <label className="text-[#163a24] text-[10px] font-black uppercase tracking-[0.2em] pl-1">{t('email')}</label>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex w-full rounded-2xl border border-slate-100 bg-green-50/30 text-[#163a24] h-16 px-6 focus:border-[#2bee6c] focus:ring-0 outline-none transition-all placeholder:text-[#4c9a66]/30 font-bold" 
                                placeholder="manager@qroyal.com" 
                                required 
                            />
                        </div>
                        <div className="group">
                            <label className="text-[#163a24] text-[10px] font-black uppercase tracking-[0.2em] pl-1">{t('password')}</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="flex w-full rounded-2xl border border-slate-100 bg-green-50/30 text-[#163a24] h-16 px-6 focus:border-[#2bee6c] focus:ring-0 outline-none transition-all placeholder:text-[#4c9a66]/30 font-bold" 
                                placeholder="••••••••" 
                                required 
                            />
                        </div>
                    </div>
                    
                    {error && <p className="text-rose-500 text-xs font-black uppercase tracking-widest text-center">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-[#163a24] h-16 px-5 text-[#2bee6c] text-lg font-black tracking-tight transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Authorizing...' : t('login')}
                    </button>
                </form>

                <div className="pt-8 border-t border-slate-50 text-center">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Proprietary Gateway System</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessLoginPage;