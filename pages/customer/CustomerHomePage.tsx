
import React, { useState, useEffect } from 'react';
import { Customer, Membership, Business } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StarIcon, Spinner } from '../../components/common';
import { getPopularBusinesses } from '../../services/api';

interface CustomerHomePageProps {
    customer: Customer;
    memberships: Membership[];
    onViewBusiness: (business: Business) => void;
    onShowMyQr: () => void;
}

const CustomerHomePage: React.FC<CustomerHomePageProps> = ({ customer, memberships, onViewBusiness, onShowMyQr }) => {
    const { t, language } = useLanguage();
    const [popular, setPopular] = useState<Business[]>([]);
    const [loadingPopular, setLoadingPopular] = useState(false);

    useEffect(() => {
        const fetchPopular = async () => {
            setLoadingPopular(true);
            const data = await getPopularBusinesses();
            setPopular(data);
            setLoadingPopular(false);
        };
        fetchPopular();
    }, []);

    const dateStr = new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    }).format(new Date());

    const activeMembership = memberships.length > 0 ? memberships[0] : null;
    const totalPoints = memberships.reduce((acc, m) => acc + (m.points || 0), 0);

    return (
        <div className="max-w-6xl mx-auto px-4 md:px-10 lg:px-20 py-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <img 
                            src={customer.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                            alt="pfp" 
                            className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-lg transition-transform group-hover:scale-105"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">{dateStr}</p>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                            {t('welcome')}, {customer.name.split(' ')[0]} 👋
                        </h1>
                    </div>
                </div>
                
                <button 
                    onClick={onShowMyQr}
                    className="flex items-center justify-between md:justify-center gap-4 bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-3xl shadow-xl shadow-primary/30 transition-all active:scale-95 group"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-2xl bg-white/20 p-1.5 rounded-xl">qr_code_scanner</span>
                        <span className="font-black text-lg">Universal QR</span>
                    </div>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Left Column: Active Card & Stats */}
                <div className="lg:col-span-7 space-y-10">
                    <section>
                        <div className="flex items-center justify-between px-2 mb-4">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Card</h2>
                            <button className="text-primary text-sm font-bold hover:underline">View All</button>
                        </div>

                        {activeMembership && activeMembership.businesses ? (
                            <div className="relative bg-gradient-to-br from-indigo-600 via-primary to-indigo-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl shadow-primary/30 overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl -ml-24 -mb-24"></div>
                                
                                <div className="relative z-10 flex justify-between items-start mb-10">
                                    <div className="flex items-center gap-5">
                                        <img 
                                            src={activeMembership.businesses.logo_url || 'https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png'} 
                                            alt="logo" 
                                            className="w-14 h-14 rounded-2xl object-cover bg-white p-1"
                                        />
                                        <div>
                                            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Loyalty Card</p>
                                            <h3 className="text-2xl font-black leading-tight truncate max-w-[200px] md:max-w-none">
                                                {activeMembership.businesses.public_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">Premium</span>
                                </div>

                                <div className="relative z-10 bg-black/10 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-4xl font-black">{activeMembership.points}<span className="text-xl text-blue-200 font-bold ml-1">/ {activeMembership.businesses.reward_threshold || 10}</span></p>
                                            <p className="text-blue-100 text-xs font-bold uppercase mt-1">Stamps Collected</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-white">{(activeMembership.businesses.reward_threshold || 10) - (activeMembership.points || 0)} more</p>
                                            <p className="text-[10px] text-blue-200 font-bold uppercase">To Reward</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
                                        <div 
                                            className="h-full bg-white rounded-full transition-all duration-1000 ease-out relative" 
                                            style={{ width: `${Math.min(100, ((activeMembership.points || 0) / (activeMembership.businesses.reward_threshold || 10)) * 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-16 text-center text-slate-400 space-y-4">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                                    <StarIcon className="w-8 h-8 text-slate-200" />
                                </div>
                                <p className="font-bold text-slate-600">{t('noMemberships')}</p>
                                <button className="text-primary font-black text-sm uppercase tracking-widest hover:underline">Scan a shop to start</button>
                            </div>
                        )}
                    </section>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 text-slate-400 mb-3 group-hover:text-primary transition-colors">
                                <span className="material-symbols-outlined text-2xl">stars</span>
                                <p className="text-[10px] font-black uppercase tracking-widest">Total Points</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{totalPoints.toLocaleString()}</p>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 group transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 text-slate-400 mb-3 group-hover:text-emerald-500 transition-colors">
                                <span className="material-symbols-outlined text-2xl">celebration</span>
                                <p className="text-[10px] font-black uppercase tracking-widest">Rewards Won</p>
                            </div>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{memberships.length}</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Discovery & Recent */}
                <div className="lg:col-span-5 space-y-10">
                    <section>
                        <div className="flex items-center justify-between px-2 mb-6">
                            <h2 className="text-xl font-black text-slate-900 tracking-tight">Discovery</h2>
                            <button className="text-primary text-sm font-bold hover:underline">Explore All</button>
                        </div>
                        
                        <div className="space-y-4">
                            {loadingPopular ? (
                                <div className="flex justify-center p-10"><Spinner /></div>
                            ) : popular.slice(0, 3).map((biz, idx) => (
                                <div 
                                    key={biz.id}
                                    onClick={() => onViewBusiness(biz)}
                                    className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all group animate-in slide-in-from-right duration-500"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    <img 
                                        src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                        alt="logo" 
                                        className="w-14 h-14 rounded-2xl object-cover bg-slate-50 transition-transform group-hover:scale-110"
                                    />
                                    <div className="flex-grow">
                                        <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{biz.public_name}</h4>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter mt-0.5">
                                            {biz.membership_count || 0} Members • Near You
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-300">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
                        <h3 className="text-lg font-black mb-4 relative z-10">Earn Bonus Points</h3>
                        <p className="text-slate-400 text-sm mb-6 relative z-10">Invite friends and get 5 bonus points for every business you both join!</p>
                        <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl text-sm uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 relative z-10">
                            Invite Friends
                        </button>
                    </section>
                </div>
            </div>
            
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

export default CustomerHomePage;
