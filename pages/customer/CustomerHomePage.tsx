
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
            // Default to popular if location not provided
            let data = await getPopularBusinesses();
            
            // Try to get actual nearby if location is enabled
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (pos) => {
                    const nearbyData = await getNearbyBusinesses(pos.coords.latitude, pos.coords.longitude);
                    if (nearbyData.length > 0) setNearBy(nearbyData);
                    else setNearBy(data);
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
        if (hour < 12) return t('hello').includes('Γειά') ? 'Καλημέρα' : 'Good morning';
        if (hour < 18) return t('hello').includes('Γειά') ? 'Καλό απόγευμα' : 'Good afternoon';
        return t('hello').includes('Γειά') ? 'Καλό βράδυ' : 'Good evening';
    };

    const dateStr = new Intl.DateTimeFormat(language === 'el' ? 'el-GR' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
    }).format(new Date());

    // Get the membership closest to reward
    const activeMembership = [...memberships].sort((a, b) => {
        const aProgress = (a.points || 0) / (a.businesses?.reward_threshold || 10);
        const bProgress = (b.points || 0) / (b.businesses?.reward_threshold || 10);
        return bProgress - aProgress;
    })[0];

    const formatDistance = (meters?: number) => {
        if (meters === undefined) return null;
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    return (
        <div className="animate-in fade-in duration-700 pb-10">
            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* Header Section */}
            <header className="bg-white pt-6 px-6 pb-8 rounded-b-[2.5rem] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] mb-8">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{dateStr}</span>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">
                            {getTimeGreeting()},<br/>{customer.name.split(' ')[0]} 👋
                        </h1>
                    </div>
                    <div className="relative">
                        <img 
                            src={customer.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                            alt="pfp" 
                            className="size-14 rounded-2xl object-cover ring-4 ring-slate-50 shadow-lg"
                        />
                        <div className="absolute -top-1 -right-1 size-4 bg-rose-500 border-2 border-white rounded-full"></div>
                    </div>
                </div>
                
                {/* Universal QR Action */}
                <button 
                    onClick={onShowMyQr}
                    className="w-full bg-primary hover:bg-blue-700 active:scale-[0.98] transition-all duration-300 h-18 py-4 rounded-[1.5rem] flex items-center justify-between px-6 text-white shadow-[0_10px_25px_-5px_rgba(19,55,236,0.3)] group"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md">
                            <span className="material-symbols-outlined text-[28px]">qr_code_scanner</span>
                        </div>
                        <div className="flex flex-col items-start">
                            <span className="font-black text-lg leading-none">Universal QR</span>
                            <span className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-1 opacity-80">Earn & Redeem instantly</span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
            </header>

            {/* Active Card Section */}
            <section className="px-6 mb-10">
                <div className="flex justify-between items-end mb-5 px-1">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Card</h2>
                    <button className="text-primary text-sm font-bold hover:underline">Details</button>
                </div>

                {activeMembership && activeMembership.businesses ? (
                    <div 
                        onClick={() => onViewBusiness(activeMembership.businesses as Business)}
                        className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-50 relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
                    >
                        <div className="absolute -top-10 -right-10 size-32 bg-primary/5 rounded-full blur-3xl"></div>
                        <div className="flex items-center gap-5 mb-6 relative z-10">
                            <img 
                                src={activeMembership.businesses.logo_url || 'https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png'} 
                                alt="logo" 
                                className="size-16 rounded-2xl object-cover shadow-sm bg-slate-50"
                            />
                            <div className="flex flex-col flex-1 truncate">
                                <h3 className="text-slate-900 text-lg font-black leading-tight truncate">
                                    {activeMembership.businesses.public_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">Gold Member</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative z-10">
                            <div className="flex justify-between items-center mb-3">
                                <p className="text-slate-900 text-sm font-black uppercase tracking-tighter">
                                    {activeMembership.points} / {activeMembership.businesses.reward_threshold || 10} Stamps
                                </p>
                                <p className="text-primary text-sm font-black">
                                    {Math.round(((activeMembership.points || 0) / (activeMembership.businesses.reward_threshold || 10)) * 100)}%
                                </p>
                            </div>
                            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden mb-3 shadow-inner">
                                <div 
                                    className="h-full bg-primary rounded-full relative transition-all duration-1000 ease-out" 
                                    style={{ width: `${Math.min(100, ((activeMembership.points || 0) / (activeMembership.businesses.reward_threshold || 10)) * 100)}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                </div>
                            </div>
                            <p className="text-slate-400 text-[11px] font-bold flex items-center gap-2 uppercase tracking-tight">
                                <span className="material-symbols-outlined text-[16px] text-primary">redeem</span>
                                {(activeMembership.businesses.reward_threshold || 10) - (activeMembership.points || 0)} more for a reward!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center text-slate-400">
                        <p className="font-bold mb-2">No active cards</p>
                        <p className="text-xs">Scan a business to start earning points!</p>
                    </div>
                )}
            </section>

            {/* Discovery Section */}
            <section className="pl-6 mb-6">
                <div className="flex justify-between items-end mb-5 pr-6">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Near You</h2>
                    <span className="text-slate-400 text-xs font-bold flex items-center gap-1 uppercase tracking-tighter">
                        <span className="material-symbols-outlined text-[14px]">location_on</span> Current Location
                    </span>
                </div>
                
                <div className="flex overflow-x-auto gap-5 pb-6 pr-6 no-scrollbar snap-x snap-mandatory">
                    {loadingNearBy ? (
                        [1,2,3].map(i => <div key={i} className="min-w-[220px] h-48 bg-slate-100 rounded-3xl animate-pulse" />)
                    ) : nearBy.length > 0 ? (
                        nearBy.map(biz => (
                            <div 
                                key={biz.id}
                                onClick={() => onViewBusiness(biz)}
                                className="min-w-[220px] bg-white rounded-3xl p-4 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] snap-start border border-slate-50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer group"
                            >
                                <div className="h-32 w-full rounded-2xl bg-slate-100 mb-4 relative overflow-hidden">
                                    <img 
                                        src={biz.cover_photo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                        alt="cover" 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    {biz.dist_meters && (
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-slate-900 shadow-sm uppercase tracking-tighter">
                                            {formatDistance(biz.dist_meters)}
                                        </div>
                                    )}
                                </div>
                                <h4 className="font-black text-slate-900 text-sm truncate">{biz.public_name}</h4>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
                                    {biz.membership_count || 0} Members • {biz.bio?.slice(0, 20) || 'Local Shop'}
                                </p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm italic">No businesses found nearby.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CustomerHomePage;
