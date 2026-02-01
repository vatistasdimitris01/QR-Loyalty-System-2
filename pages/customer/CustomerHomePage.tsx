
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
        <div className="bg-[#f8fcf9] min-h-screen font-sans text-[#0d1b12]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            {/* Header */}
            <header className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
                    {t('home')}
                </h2>
                <div className="flex w-12 items-center justify-end">
                    <button 
                        onClick={() => window.location.href = '/customer/profile'} 
                        className="flex cursor-pointer items-center justify-center rounded-lg h-12 bg-transparent text-[#0d1b12] p-0"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm88-29.84q.06-2.16,0-4.32l14.92-18.64a8,8,0,0,0,1.48-7.06,107.21,107.21,0,0,0-10.88-26.25,8,8,0,0,0-6-3.93l-23.72-2.64q-1.48-1.56-3-3L186,40.54a8,8,0,0,0-3.94-6,107.71,107.71,0,0,0-26.25-10.87,8,8,0,0,0-7.06,1.49L130.16,40Q128,40,125.84,40L107.2,25.11a8,8,0,0,0-7.06-1.48A107.6,107.6,0,0,0,73.89,34.51a8,8,0,0,0-3.93,6L67.32,64.27q-1.56,1.49-3,3L40.54,70a8,8,0,0,0-6,3.94,107.71,107.71,0,0,0-10.87,26.25,8,8,0,0,0,1.49,7.06L40,125.84Q40,128,40,130.16L25.11,148.8a8,8,0,0,0-1.48,7.06,107.21,107.21,0,0,0,10.88,26.25,8,8,0,0,0,6,3.93l23.72,2.64q1.49,1.56,3,3L70,215.46a8,8,0,0,0,3.94,6,107.71,107.71,0,0,0,26.25,10.87,8,8,0,0,0,7.06-1.49L125.84,216q2.16.06,4.32,0l18.64,14.92a8,8,0,0,0,7.06,1.48,107.21,107.21,0,0,0,26.25-10.88,8,8,0,0,0,3.93-6l2.64-23.72q1.56-1.48,3-3L215.46,186a8,8,0,0,0,6-3.94,107.71,107.71,0,0,0,10.87-26.25,8,8,0,0,0-1.49-7.06Zm-16.1-6.5a73.93,73.93,0,0,1,0,8.68,8,8,0,0,0,1.74,5.48l14.19,17.73a91.57,91.57,0,0,1-6.23,15L187,173.11a8,8,0,0,0-5.1,2.64,74.11,74.11,0,0,1-6.14,6.14,8,8,0,0,0-2.64,5.1l-2.51,22.58a91.32,91.32,0,0,1-15,6.23l-17.74-14.19a8,8,0,0,0-5-1.75h-.48a73.93,73.93,0,0,1-8.68,0,8,8,0,0,0-5.48,1.74L100.45,215.8a91.57,91.57,0,0,1-15-6.23L82.89,187a8,8,0,0,0-2.64-5.1,74.11,74.11,0,0,1-6.14-6.14,8,8,0,0,0-5.1-2.64L46.43,170.6a91.32,91.32,0,0,1-6.23-15l14.19-17.74a8,8,0,0,0,1.74-5.48,73.93,73.93,0,0,1,0-8.68,8,8,0,0,0-1.74-5.48L40.2,100.45a91.57,91.57,0,0,1,6.23-15L69,82.89a8,8,0,0,0,5.1-2.64,74.11,74.11,0,0,1,6.14-6.14A8,8,0,0,0,82.89,69L85.4,46.43a91.32,91.32,0,0,1,15-6.23l17.74,14.19a8,8,0,0,0,5.48,1.74,73.93,73.93,0,0,1,8.68,0,8,8,0,0,0,5.48-1.74L155.55,40.2a91.57,91.57,0,0,1,15,6.23L173.11,69a8,8,0,0,0,2.64,5.1,74.11,74.11,0,0,1,6.14,6.14,8,8,0,0,0,5.1,2.64l22.58,2.51a91.32,91.32,0,0,1,6.23,15l-14.19,17.74A8,8,0,0,0,199.87,123.66Z"></path>
                        </svg>
                    </button>
                </div>
            </header>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Points Summary */}
                <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{t('points')}</h2>
                <div className="flex items-center gap-4 bg-[#f8fcf9] px-4 min-h-14 justify-between">
                    <p className="text-[#0d1b12] text-4xl font-black leading-tight tracking-tighter flex-1 truncate">{totalPoints.toLocaleString()}</p>
                    <div className="shrink-0">
                        <div className="text-[#0d1b12] flex size-10 items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0,13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0,13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                {/* My Memberships */}
                <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">{t('myMemberships')}</h2>
                
                {memberships.length > 0 ? (
                    <div className="space-y-1">
                        {memberships.map((membership) => (
                            <div 
                                key={membership.id}
                                onClick={() => onViewBusiness(membership.businesses as Business)}
                                className="p-4 cursor-pointer"
                            >
                                <div className="flex items-stretch justify-between gap-4 rounded-lg">
                                    <div className="flex flex-col gap-1 flex-[2_2_0px]">
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal">{membership.points} {t('points')}</p>
                                        <p className="text-[#0d1b12] text-base font-bold leading-tight">{membership.businesses?.public_name}</p>
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal">
                                            {membership.businesses?.bio ? (membership.businesses.bio.slice(0, 30) + '...') : 'Member'}
                                        </p>
                                    </div>
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1 border border-[#e7f3eb]"
                                        style={{ backgroundImage: `url("${membership.businesses?.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'}")` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center px-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 leading-relaxed">
                            {t('noMemberships')}
                        </p>
                    </div>
                )}

                {/* Nearby Section */}
                <section className="px-4 py-10 pb-24">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em]">{t('nearby')}</h2>
                        <button className="text-xs font-black text-[#4c9a66] uppercase tracking-widest">{t('all')}</button>
                    </div>
                    <div className="space-y-4">
                        {loadingNearBy ? (
                            <div className="flex justify-center py-6"><Spinner className="size-6 text-slate-200" /></div>
                        ) : nearBy.slice(0, 3).map(biz => (
                            <div 
                                key={biz.id}
                                onClick={() => onViewBusiness(biz)}
                                className="flex items-center justify-between group cursor-pointer bg-white p-4 rounded-xl border border-[#e7f3eb] transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-lg bg-[#f8fcf9] overflow-hidden flex-shrink-0">
                                        <img src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} className="size-full object-cover" alt="biz"/>
                                    </div>
                                    <div className="space-y-0.5">
                                        <h4 className="font-bold text-[#0d1b12] tracking-tight leading-none">{biz.public_name}</h4>
                                        <p className="text-[10px] font-bold text-[#4c9a66] uppercase tracking-widest">{biz.membership_count || 0} Members</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-slate-300 text-lg group-hover:text-[#0d1b12] transition-all">arrow_forward_ios</span>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default CustomerHomePage;
