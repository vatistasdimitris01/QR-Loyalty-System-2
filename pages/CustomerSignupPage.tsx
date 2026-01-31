
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createCustomer } from '../services/api';
import { Customer } from '../types';
import { Spinner, InputField, BackButton, Logo } from '../components/common';

const CustomerSignupPage: React.FC = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !phoneNumber.trim()) return setError('Please fill out all fields.');
        setLoading(true);
        const result = await createCustomer({ name, phone_number: phoneNumber });
        setLoading(false);
        if (result) setNewCustomer(result);
        else setError(t('errorUnexpected'));
    };

    if (newCustomer) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center font-sans">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl max-w-sm w-full space-y-10 animate-in zoom-in-95 duration-500 border border-slate-100">
                    <div className="size-20 bg-primary/10 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[40px]">identity_platform</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{t('yourQRCodeIsReady')}</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">{t('scanThisToLogin')}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        <img src={newCustomer.qr_data_url} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-xl" />
                    </div>
                    <a href={`/customer?token=${newCustomer.qr_token}`} className="block w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95">
                        {t('goToMyCard')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl p-12 space-y-12 animate-in slide-in-from-bottom-10 duration-700 border border-slate-100 relative">
                <div className="absolute top-10 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <Logo className="size-6 text-primary" />
                    <p className="text-sm font-black tracking-tighter">QROYAL</p>
                </div>

                <div className="text-center space-y-3 pt-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">{t('customerSignup')}</h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Create Your Elite Digital Identity</p>
                </div>

                <form onSubmit={handleSignup} className="space-y-8">
                    <InputField label={t('name')} name="name" value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g. John Doe" />
                    <InputField label={t('phoneNumber')} name="phone" value={phoneNumber} onChange={(e: any) => setPhoneNumber(e.target.value)} placeholder="+30 69..." type="tel" />
                    
                    {error && <p className="text-rose-500 text-xs font-bold text-center uppercase tracking-widest">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95 disabled:bg-slate-200">
                        {loading ? <Spinner className="size-6 text-white mx-auto" /> : t('getYourQRCode')}
                    </button>
                </form>
            </div>
            <div className="mt-12">
                <BackButton className="bg-transparent border-none text-slate-400 hover:text-slate-900" />
            </div>
        </div>
    );
};

export default CustomerSignupPage;
