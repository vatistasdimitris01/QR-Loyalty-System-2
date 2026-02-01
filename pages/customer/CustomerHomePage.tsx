
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

    const totalPoints = memberships.reduce((acc, m) => acc + (m.points || 0), 0);

    return (
        <div className="bg-[#f8fcf9] min-h-screen font-sans text-[#0d1b12]">
            {/* Header */}
            <header className="flex items-center p-4 pb-2 justify-between">
                <div className="flex w-12 items-center">
                    <img 
                        src={customer.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                        alt="pfp" 
                        className="size-8 rounded-full object-cover border border-[#e7f3eb]"
                    />
                </div>
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
                    {t('home')}
                </h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={onShowMyQr} className="p-2 text-[#0d1b12] hover:bg-black/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[24px]">qr_code_2</span>
                    </button>
                </div>
            </header>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Points Summary */}
                <section className="px-4 pt-8">
                    <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-3">
                        {t('totalCustomers').replace('Total Customers', 'My Points')}
                    </h2>
                    <div className="flex items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-[#e7f3eb] justify-between">
                        <p className="text-[#0d1b12] text-4xl font-black leading-tight tracking-tighter">
                            {totalPoints.toLocaleString()}
                        </p>
                        <div className="shrink-0 text-primary">
                            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                    </div>
                </section>

                {/* My Memberships */}
                <section className="px-4 pt-8">
                    <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                        {t('myMemberships')}
                    </h2>
                    
                    {memberships.length > 0 ? (
                        <div className="space-y-4">
                            {memberships.map((membership) => (
                                <div 
                                    key={membership.id}
                                    onClick={() => onViewBusiness(membership.businesses as Business)}
                                    className="bg-white p-4 rounded-[2rem] border border-[#e7f3eb] hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col gap-1 flex-[2_2_0px]">
                                            <p className="text-[#4c9a66] text-xs font-black uppercase tracking-widest">
                                                {membership.points} {t('points')}
                                            </p>
                                            <p className="text-[#0d1b12] text-lg font-black leading-tight tracking-tight">
                                                {membership.businesses?.public_name}
                                            </p>
                                            <p className="text-[#4c9a66] text-xs font-bold opacity-60">
                                                {membership.businesses?.bio ? (membership.businesses.bio.slice(0, 30) + '...') : 'Member Reward Program'}
                                            </p>
                                        </div>
                                        <div
                                            className="w-24 h-24 bg-center bg-no-repeat bg-cover rounded-2xl flex-shrink-0 border-2 border-[#f8fcf9] shadow-sm"
                                            style={{ backgroundImage: `url("${membership.businesses?.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'}")` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Progress Bar Mini */}
                                    <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${Math.min(100, ((membership.points || 0) / (membership.businesses?.reward_threshold || 10)) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 bg-white border-2 border-dashed border-[#e7f3eb] rounded-[2.5rem] text-center px-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-relaxed">
                                {t('noMemberships')}
                            </p>
                        </div>
                    )}
                </section>

                {/* Discover / Nearby */}
                <section className="px-4 py-10 pb-24">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em]">{t('nearby')}</h2>
                        <button className="text-xs font-black text-primary uppercase tracking-widest">{t('all')}</button>
                    </div>
                    <div className="space-y-4">
                        {loadingNearBy ? (
                            <div className="flex justify-center py-6"><Spinner className="size-6 text-slate-200" /></div>
                        ) : nearBy.slice(0, 3).map(biz => (
                            <div 
                                key={biz.id}
                                onClick={() => onViewBusiness(biz)}
                                className="flex items-center justify-between group cursor-pointer bg-white p-4 rounded-2xl border border-[#e7f3eb] hover:shadow-md transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-[#f8fcf9] border border-[#e7f3eb] overflow-hidden flex-shrink-0">
                                        <img src={biz.logo_url || ''} className="size-full object-cover" alt="L"/>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-[#0d1b12] tracking-tight leading-none">{biz.public_name}</h4>
                                        <p className="text-[10px] font-bold text-[#4c9a66] uppercase tracking-widest">{biz.membership_count || 0} Members</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-[#0d1b12] group-hover:translate-x-1 transition-all">arrow_forward_ios</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CustomerHomePage;
