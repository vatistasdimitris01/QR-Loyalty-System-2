
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { createCustomer, getCustomerByQrToken } from '../services/api';
import { Customer } from '../types';
import { Spinner, InputField, BackButton, Logo } from '../components/common';

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
            // Logic for existing user find (simplified to token approach)
            setError("Scan your QR code to login instantly.");
        }
        setLoading(false);
    };

    if (newCustomer) {
        return (
            <div className="min-h-screen bg-[#f8fcf9] flex flex-col justify-center items-center p-6 text-center font-sans">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full space-y-8 animate-in zoom-in-95 duration-500 border border-[#e7f3eb]">
                    <h1 className="text-4xl font-black text-[#0d1b12] tracking-tighter leading-none">Identity Created</h1>
                    <div className="bg-[#f8fcf9] p-6 rounded-2xl border border-[#e7f3eb] shadow-inner">
                        <img src={newCustomer.qr_data_url} alt="QR" className="w-48 h-48 mx-auto rounded-xl border-4 border-white shadow-xl" />
                    </div>
                    <a href={`/customer?token=${newCustomer.qr_token}`} className="block w-full bg-[#2bee6c] text-[#0d1b12] font-black py-5 rounded-lg shadow-xl shadow-green-100 hover:opacity-90 transition-all active:scale-95">
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
                    <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
                </div>

                <div className="flex px-4 py-3">
                    <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-[#e7f3eb] p-1">
                        <button 
                            onClick={() => setMode('register')}
                            className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all ${mode === 'register' ? 'bg-[#f8fcf9] shadow-[0_0_4px_rgba(0,0,0,0.1)] text-[#0d1b12]' : 'text-[#4c9a66]'}`}
                        >
                            Register
                        </button>
                        <button 
                            onClick={() => setMode('login')}
                            className={`flex h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-medium leading-normal transition-all ${mode === 'login' ? 'bg-[#f8fcf9] shadow-[0_0_4px_rgba(0,0,0,0.1)] text-[#0d1b12]' : 'text-[#4c9a66]'}`}
                        >
                            Login
                        </button>
                    </div>
                </div>

                <form onSubmit={handleAction} className="px-4 space-y-4">
                    {mode === 'register' && (
                        <input
                            placeholder="Name"
                            className="form-input flex w-full border-none bg-[#e7f3eb] rounded-lg h-14 p-4 text-[#0d1b12] focus:ring-0 placeholder:text-[#4c9a66]"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        placeholder="Mobile Phone"
                        className="form-input flex w-full border-none bg-[#e7f3eb] rounded-lg h-14 p-4 text-[#0d1b12] focus:ring-0 placeholder:text-[#4c9a66]"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                    
                    {error && <p className="text-rose-500 text-xs font-bold text-center px-4">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black h-14 rounded-lg shadow-xl shadow-green-100 active:scale-95 transition-all disabled:opacity-50">
                        {loading ? <Spinner className="size-6 text-[#0d1b12] mx-auto" /> : mode === 'register' ? 'Register' : 'Access Card'}
                    </button>
                </form>
                
                {mode === 'login' && (
                    <div className="p-8 text-center space-y-4">
                        <div className="size-16 bg-[#e7f3eb] rounded-full flex items-center justify-center mx-auto text-[#4c9a66]">
                            <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
                        </div>
                        <p className="text-sm font-medium text-[#4c9a66]">Scanning your physical QR code is the fastest way to login.</p>
                    </div>
                )}
            </div>

            <div className="flex gap-2 border-t border-[#e7f3eb] bg-[#f8fcf9] px-4 pb-8 pt-2">
                <NavItem icon="house" active={true} onClick={() => {}} />
                <NavItem icon="search" active={false} onClick={() => {}} />
                <NavItem icon="wallet" active={false} onClick={() => {}} />
                <NavItem icon="person" active={false} onClick={() => {}} />
            </div>
        </div>
    );
};

const NavItem: React.FC<{ icon: string, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
    <div className={`flex flex-1 flex-col items-center justify-end gap-1 rounded-full ${active ? 'text-[#0d1b12]' : 'text-[#4c9a66]'}`}>
        <div className="flex h-8 items-center justify-center">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        </div>
    </div>
);

export default CustomerSignupPage;
