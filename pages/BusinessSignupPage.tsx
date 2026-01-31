
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signupBusiness } from '../services/api';
import { Business } from '../types';
import { Spinner, InputField, Logo } from '../components/common';

const BusinessSignupPage: React.FC = () => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [newBusiness, setNewBusiness] = useState<Business | null>(null);

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (step === 1 && !formData.name) return setError('Business name is required.');
        if (step === 2 && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))) return setError('Valid email is required.');
        if (step === 1 || step === 2) setStep(step + 1);
        else handleSignup();
    };

    const handleSignup = async () => {
        if (formData.password.length < 6) return setError('Password too short.');
        setLoading(true);
        const result = await signupBusiness(formData);
        setLoading(false);
        if (result.success && result.business) setNewBusiness(result.business);
        else setError(result.message || t('errorUnexpected'));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });

    if (newBusiness) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-10 animate-in zoom-in-95 duration-500 border border-slate-100">
                    <div className="size-20 bg-emerald-50 text-emerald-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[40px]">check_circle</span>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Your Royal Portal is Ready</h1>
                        <p className="text-slate-500 font-medium">Use this unique QR code to access your business dashboard anytime.</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[2.5rem] shadow-inner inline-block border border-slate-100">
                        <img src={newBusiness.qr_data_url} alt="QR" className="w-48 h-48 rounded-xl border-4 border-white shadow-lg" />
                    </div>
                    <a href="/business/login" className="block w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95">Go to Login</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans flex flex-col lg:flex-row">
             <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between bg-slate-900 p-16 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                <div className="relative z-10 flex items-center gap-3">
                   <Logo className="size-10 text-primary" />
                    <h2 className="text-2xl font-black tracking-tighter">QROYAL</h2>
                </div>
                <div className="relative z-10 max-w-lg">
                    <h1 className="text-6xl font-black leading-[1.1] tracking-tight mb-8">Scale Your Enterprise Loyalty.</h1>
                    <div className="space-y-6 text-slate-400 text-lg font-medium">
                        <p className="flex items-center gap-4"><span className="size-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">1</span> Account Creation</p>
                        <p className={`flex items-center gap-4 ${step > 1 ? 'text-white' : ''}`}><span className={`size-8 rounded-full flex items-center justify-center font-bold ${step > 1 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>2</span> Brand Configuration</p>
                        <p className={`flex items-center gap-4 ${step > 2 ? 'text-white' : ''}`}><span className={`size-8 rounded-full flex items-center justify-center font-bold ${step > 2 ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>3</span> Launch Program</p>
                    </div>
                </div>
                <div className="relative z-10 pt-10 border-t border-slate-800">
                    <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Standard Partner Plan</p>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center px-8 lg:px-24 py-16 bg-white">
                <div className="max-w-[440px] w-full mx-auto space-y-12 animate-in slide-in-from-right-10 duration-700">
                    <div className="space-y-3">
                        <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Onboarding Step {step}</p>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{step === 1 ? 'Whats your brand called?' : step === 2 ? 'Direct contact email' : 'Secure your gateway'}</h2>
                    </div>

                    <form onSubmit={handleNext} className="space-y-10">
                        {step === 1 && <InputField label="Public Business Name" name="name" value={formData.name} onChange={handleChange} placeholder="The Coffee Club" />}
                        {step === 2 && <InputField label="Enterprise Email" name="email" value={formData.email} onChange={handleChange} placeholder="partners@yourbrand.com" type="email" />}
                        {step === 3 && <InputField label="Portal Password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" type="password" />}
                        
                        {error && <p className="text-rose-500 text-sm font-bold bg-rose-50 p-4 rounded-2xl">{error}</p>}

                        <div className="flex flex-col gap-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all flex items-center justify-center active:scale-95 disabled:bg-slate-200"
                            >
                                {loading ? <Spinner className="size-6 text-white" /> : (step === 3 ? t('createAccount') : 'Continue Journey')}
                            </button>
                            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] hover:text-slate-900 transition-colors py-2">Go Back</button>}
                        </div>
                    </form>

                    <div className="pt-12 border-t border-slate-50 text-center">
                        <p className="text-sm text-slate-500 font-medium">Already managing a program? <a href="/business/login" className="text-primary font-black ml-1">Log in here</a></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessSignupPage;
