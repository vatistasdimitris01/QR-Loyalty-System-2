
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
        <div className="px-8 pt-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Header */}
            <header className="mb-12 flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 leading-none">
                        {getTimeGreeting()},<br/>{customer.name.split(' ')[0]}.
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                        {new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', { day: 'numeric', month: 'long' }).format(new Date())}
                    </p>
                </div>
                <img 
                    src={customer.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                    alt="pfp" 
                    className="size-12 rounded-2xl object-cover bg-slate-50 border border-slate-100 shadow-sm"
                />
            </header>

            {/* Wallet Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Current Progress</h2>
                </div>

                {activeMembership && activeMembership.businesses ? (
                    <div 
                        onClick={() => onViewBusiness(activeMembership.businesses as Business)}
                        className="group bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all cursor-pointer space-y-8"
                    >
                        <div className="flex items-center gap-5">
                            <img 
                                src={activeMembership.businesses.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                alt="logo" 
                                className="size-14 rounded-2xl grayscale group-hover:grayscale-0 transition-all border border-white p-1 bg-white shadow-sm"
                            />
                            <div>
                                <h3 className="text-2xl font-black tracking-tight text-slate-900 leading-none mb-1">{activeMembership.businesses.public_name}</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Member Tier Elite</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="h-[3px] w-full bg-slate-200/50 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-slate-900 transition-all duration-1000 ease-out" 
                                    style={{ width: `${Math.min(100, ((activeMembership.points || 0) / (activeMembership.businesses.reward_threshold || 10)) * 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="space-y-0.5">
                                    <p className="text-[32px] font-black text-slate-900 tracking-tighter leading-none">{activeMembership.points}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stamps Earned</p>
                                </div>
                                <div className="text-right space-y-0.5">
                                    <p className="text-lg font-black text-slate-400 tracking-tight leading-none">{activeMembership.businesses.reward_threshold || 10}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Reward</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center px-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-relaxed">Scan your card at any QRoyal partner to start your journey</p>
                    </div>
                )}
            </section>

            {/* Stats Bento */}
            <div className="grid grid-cols-2 gap-4 mb-12">
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
                        {memberships.reduce((acc, m) => acc + (m.points || 0), 0)}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Equity</p>
                </div>
                <div className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100 flex flex-col justify-center">
                    <p className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{memberships.length}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Digital Cards</p>
                </div>
            </div>

            {/* Quick Explore */}
            <section className="pb-10">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Nearby Favorites</h2>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest">See All</button>
                </div>
                <div className="space-y-6">
                    {loadingNearBy ? (
                        <div className="flex justify-center py-6"><Spinner className="size-6 text-slate-200" /></div>
                    ) : nearBy.slice(0, 3).map(biz => (
                        <div 
                            key={biz.id}
                            onClick={() => onViewBusiness(biz)}
                            className="flex items-center justify-between group cursor-pointer"
                        >
                            <div className="flex items-center gap-5">
                                <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                                    <img src={biz.logo_url || ''} className="size-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="L"/>
                                </div>
                                <div className="space-y-0.5">
                                    <h4 className="font-black text-slate-800 tracking-tight leading-none">{biz.public_name}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{biz.membership_count || 0} Royal Members</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-200 text-lg group-hover:text-slate-900 group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default CustomerHomePage;
