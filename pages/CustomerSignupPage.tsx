import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createCustomer } from '../services/api';
import { Customer } from '../types';
import { Spinner, BackButton, Logo } from '../components/common';

const CustomerSignupPage: React.FC = () => {
    const { t } = useLanguage();
    const [mode, setMode] = useState<'register' | 'login'>('register');
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer | null>(null);

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        if (mode === 'register') {
            const result = await createCustomer({ name, phone_number: phoneNumber });
            if (result) setNewCustomer(result);
            else setError(t('errorUnexpected'));
        } else {
            setError("Scan your QR code to login instantly.");
        }
        setLoading(false);
    };

    if (newCustomer) {
        return (
            <div className="min-h-screen bg-[#f8fcf9] flex flex-col justify-center items-center p-6 text-center font-sans">
                <div className="bg-white p-10 rounded-[2.5rem] max-w-sm w-full space-y-8 animate-in zoom-in-95 duration-500 border border-[#e7f3eb]">
                    <h1 className="text-4xl font-black text-[#0d1b12] tracking-tighter leading-none">Identity Created</h1>
                    <div className="bg-[#f8fcf9] p-6 rounded-2xl border border-[#e7f3eb]">
                        <img src={newCustomer.qr_data_url} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-lg" />
                    </div>
                    <a href={`/customer?token=${newCustomer.qr_token}`} className="block w-full bg-[#2bee6c] text-[#0d1b12] font-black py-5 rounded-lg active:scale-95 transition-all shadow-xl shadow-green-100">
                        Go to My Card
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex h-auto w-full flex-col bg-[#f8fcf9] justify-between font-sans overflow-x-hidden">
            <div>
                <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                    <BackButton />
                    <div className="flex-1 flex justify-center items-center gap-2">
                        <Logo className="size-8" />
                        <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em]">QRoyal</h2>
                    </div>
                    <div className="w-12"></div>
                </div>

                <div className="flex px-4 py-8 items-center flex-col gap-2">
                    <h1 className="text-3xl font-black text-[#0d1b12] tracking-tighter text-center">{mode === 'register' ? 'Join the Network' : 'Access Identity'}</h1>
                    <p className="text-[#4c9a66] text-sm font-medium text-center uppercase tracking-[0.2em] opacity-50">Loyalty Passport</p>
                </div>

                <div className="flex px-4 py-3">
                    <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-[#e7f3eb] p-1.5">
                        <button 
                            onClick={() => setMode('register')}
                            className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${mode === 'register' ? 'bg-white text-[#0d1b12]' : 'text-[#4c9a66]'}`}
                        >
                            Register
                        </button>
                        <button 
                            onClick={() => setMode('login')}
                            className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-[#0d1b12]' : 'text-[#4c9a66]'}`}
                        >
                            Login
                        </button>
                    </div>
                </div>

                <form onSubmit={handleAction} className="px-4 space-y-6 pt-4">
                    {mode === 'register' && (
                        <div className="group">
                             <label className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] pl-1 mb-2 block">Your Name</label>
                             <input
                                placeholder="Full Name"
                                className="form-input flex w-full border-none bg-[#e7f3eb] rounded-xl h-14 p-4 text-[#0d1b12] focus:ring-0 placeholder:text-[#4c9a66]/40 font-bold"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="group">
                        <label className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.2em] pl-1 mb-2 block">Mobile Phone</label>
                        <input
                            type="tel"
                            placeholder="+30 69..."
                            className="form-input flex w-full border-none bg-[#e7f3eb] rounded-xl h-14 p-4 text-[#0d1b12] focus:ring-0 placeholder:text-[#4c9a66]/40 font-bold"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && <p className="text-rose-500 text-xs font-bold text-center px-4 uppercase tracking-widest">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#163a24] text-[#2bee6c] font-black h-16 rounded-xl active:scale-95 transition-all disabled:opacity-50 mt-4 shadow-xl shadow-green-100">
                        {loading ? <Spinner className="size-6 text-[#2bee6c] mx-auto" /> : mode === 'register' ? 'Create Identity' : 'Authorize Card'}
                    </button>
                </form>
                
                {mode === 'login' && (
                    <div className="p-10 text-center space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        <div className="size-20 bg-[#e7f3eb] rounded-full flex items-center justify-center mx-auto text-[#4c9a66]">
                            <span className="material-symbols-outlined text-[40px]">qr_code_scanner</span>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-[#0d1b12]">Fast Authorization</p>
                            <p className="text-xs font-medium text-[#4c9a66] px-8">Scanning your physical QR code is the fastest way to access your wallet.</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-8 text-center">
                 <p className="text-[8px] font-black text-[#4c9a66] uppercase tracking-[0.4em] opacity-30">QRoyal Infrastructure v2.5</p>
            </div>
        </div>
    );
};

export default CustomerSignupPage;