
import React, { useState, useEffect } from 'react';
import { Customer, Membership, Business } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from '../../components/common';
import { getPopularBusinesses, getNearbyBusinesses } from '../../services/api';

interface CustomerHomePageProps {
    customer: Customer;
    memberships: Membership[];
    onViewBusiness: (business: Business) => void;
    onShowMyQr: () => void;
}

const CustomerHomePage: React.FC<CustomerHomePageProps> = ({ customer, memberships, onViewBusiness, onShowMyQr }) => {
    const { t, language } = useLanguage();
    const [nearBy, setNearBy] = useState<Business[]>([]);
    const [loadingNearBy, setLoadingNearBy] = useState(false);

    useEffect(() => {
        const fetchNearBy = async () => {
            setLoadingNearBy(true);
            let data = await getPopularBusinesses();
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const nearbyData = await getNearbyBusinesses(pos.coords.latitude, pos.coords.longitude);
                    setNearBy(nearbyData.length > 0 ? nearbyData : data);
                    setLoadingNearBy(false);
                }, () => {
                    setNearBy(data);
                    setLoadingNearBy(false);
                });
            } else {
                setNearBy(data);
                setLoadingNearBy(false);
            }
        };
        fetchNearBy();
    }, []);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return language === 'el' ? 'Καλημέρα' : 'Good morning';
        if (hour < 18) return language === 'el' ? 'Καλό απόγευμα' : 'Good afternoon';
        return language === 'el' ? 'Καλό βράδυ' : 'Good evening';
    };

    const activeMembership = [...memberships].sort((a, b) => {
        const aProg = (a.points || 0) / (a.businesses?.reward_threshold || 10);
        const bProg = (b.points || 0) / (b.businesses?.reward_threshold || 10);
        return bProg - aProg;
    })[0];

    return (
        <div className="max-w-xl mx-auto px-6 pt-12 pb-24 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <header className="mb-16 flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tighter text-black">
                        {getTimeGreeting()},<br/>{customer.name.split(' ')[0]}.
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                        {new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'short' }).format(new Date())}
                    </p>
                </div>
                <button onClick={onShowMyQr} className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-90 transition-all">
                    <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                </button>
            </header>

            {/* Main Active Card - Pure Minimalism */}
            <section className="mb-16">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Your Wallet</h2>
                </div>

                {activeMembership && activeMembership.businesses ? (
                    <div 
                        onClick={() => onViewBusiness(activeMembership.businesses as Business)}
                        className="group cursor-pointer space-y-8"
                    >
                        <div className="flex items-center gap-4">
                            <img 
                                src={activeMembership.businesses.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                alt="logo" 
                                className="w-14 h-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all border border-slate-100 p-1"
                            />
                            <div>
                                <h3 className="text-xl font-black tracking-tight">{activeMembership.businesses.public_name}</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{activeMembership.points} Points Earned</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="h-[2px] w-full bg-slate-50 overflow-hidden">
                                <div 
                                    className="h-full bg-black transition-all duration-1000" 
                                    style={{ width: `${Math.min(100, ((activeMembership.points || 0) / (activeMembership.businesses.reward_threshold || 10)) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span>{activeMembership.points} stamps</span>
                                <span>Target: {activeMembership.businesses.reward_threshold || 10}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-12 border-2 border-dashed border-slate-50 rounded-3xl text-center text-[10px] font-black uppercase tracking-widest text-slate-300">
                        No active loyalty cards
                    </div>
                )}
            </section>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-16 border-t border-slate-50 pt-10">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Power</p>
                    <p className="text-2xl font-black">{memberships.reduce((acc, m) => acc + (m.points || 0), 0)} <span className="text-xs text-slate-300">PTS</span></p>
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Cards</p>
                    <p className="text-2xl font-black">{memberships.length}</p>
                </div>
            </div>

            {/* Near You - Clean Horizontal Row */}
            <section>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8">Discover</h2>
                <div className="flex flex-col gap-6">
                    {loadingNearBy ? (
                        <Spinner className="w-5 h-5 text-slate-200" />
                    ) : nearBy.slice(0, 4).map(biz => (
                        <div 
                            key={biz.id}
                            onClick={() => onViewBusiness(biz)}
                            className="flex items-center justify-between group cursor-pointer border-b border-slate-50 pb-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 overflow-hidden">
                                    <img src={biz.logo_url || ''} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="L"/>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black tracking-tight">{biz.public_name}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{biz.membership_count || 0} Members</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-200 group-hover:text-black transition-colors">arrow_forward_ios</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CustomerHomePage;
