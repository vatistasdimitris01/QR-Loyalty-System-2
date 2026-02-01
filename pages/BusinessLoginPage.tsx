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

    return (
        <div className="bg-[#f8fcf9] min-h-screen font-sans flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 border border-[#e7f3eb]">
                <div className="flex flex-col items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-[#0b110d] rounded-2xl flex items-center justify-center text-[#2bee6c]">
                        <span className="material-icons-round text-3xl">loyalty</span>
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold font-display tracking-tighter text-[#0d1b12]">QROYAL</h2>
                        <p className="text-xs font-bold text-[#4c9a66] uppercase tracking-[0.2em]">{t('businessAreaLogin')}</p>
                    </div>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[#0d1b12] text-xs font-black uppercase tracking-widest pl-1">{t('email')}</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex w-full rounded-2xl border border-[#e7f3eb] bg-[#f8fcf9] text-[#0d1b12] h-14 px-5 focus:border-[#2bee6c] focus:ring-0 outline-none transition-all placeholder:text-[#4c9a66]/50 font-medium" 
                            placeholder="manager@business.com" 
                            required 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[#0d1b12] text-xs font-black uppercase tracking-widest pl-1">{t('password')}</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="flex w-full rounded-2xl border border-[#e7f3eb] bg-[#f8fcf9] text-[#0d1b12] h-14 px-5 focus:border-[#2bee6c] focus:ring-0 outline-none transition-all placeholder:text-[#4c9a66]/50 font-medium" 
                            placeholder="••••••••" 
                            required 
                        />
                    </div>
                    
                    {error && <p className="text-rose-500 text-xs font-bold text-center">{error}</p>}
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="flex w-full cursor-pointer items-center justify-center rounded-2xl bg-[#0b110d] h-14 px-5 text-[#2bee6c] text-base font-bold tracking-tight transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Verifying Gateway...' : t('login')}
                    </button>
                </form>

                <div className="mt-10 pt-8 border-t border-[#e7f3eb] text-center">
                    <p className="text-xs text-[#4c9a66] font-bold">Partner Access Only</p>
                </div>
            </div>
        </div>
    );
};

export default BusinessLoginPage;