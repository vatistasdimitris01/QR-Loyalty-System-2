
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
    const { t } = useLanguage();
    const totalPoints = memberships.reduce((acc, m) => acc + (m.points || 0), 0);

    return (
        <div className="flex flex-col bg-[#f8fcf9] min-h-screen text-[#0d1b12]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">{t('home')}</h2>
                <div className="flex w-12 items-center justify-end">
                    <button onClick={() => window.location.href='/customer/profile'} className="text-[#0d1b12] p-2 hover:bg-black/5 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-[24px]">settings</span>
                    </button>
                </div>
            </div>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">My Points</h2>
                <div className="flex items-center gap-4 bg-[#f8fcf9] px-4 min-h-14 justify-between">
                    <p className="text-[#0d1b12] text-4xl font-black leading-tight tracking-tighter flex-1 truncate">
                        {totalPoints.toLocaleString()}
                    </p>
                    <div className="shrink-0">
                        <div className="text-[#0d1b12] flex size-10 items-center justify-center">
                            <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">My Memberships</h2>
                
                {memberships.length > 0 ? (
                    <div className="flex flex-col">
                        {memberships.map((membership) => (
                            <div 
                                key={membership.id} 
                                onClick={() => onViewBusiness(membership.businesses as Business)}
                                className="p-4 active:scale-[0.98] transition-transform cursor-pointer"
                            >
                                <div className="flex items-stretch justify-between gap-4 rounded-lg">
                                    <div className="flex flex-col gap-1 flex-[2_2_0px]">
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal">{membership.points} {t('points')}</p>
                                        <p className="text-[#0d1b12] text-base font-bold leading-tight">{membership.businesses?.public_name}</p>
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal truncate">
                                            {membership.businesses?.bio || 'Coffee & Rewards'}
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
                    <div className="py-20 text-center px-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                            {t('noMemberships')}
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerHomePage;
