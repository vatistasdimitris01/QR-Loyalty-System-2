
import React from 'react';
import { Customer, Membership, Business } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface CustomerHomePageProps {
    customer: Customer;
    memberships: Membership[];
    onViewBusiness: (business: Business) => void;
}

const CustomerHomePage: React.FC<CustomerHomePageProps> = ({ customer, memberships, onViewBusiness }) => {
    const { t } = useLanguage();
    const totalPoints = memberships.reduce((acc, m) => acc + (m.points || 0), 0);

    return (
        <div className="flex flex-col bg-[#f8fcf9] min-h-screen text-[#0d1b12]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
            </div>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="px-4 pb-3 pt-5">
                    <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em]">My Points</h2>
                </div>
                <div className="flex items-center gap-4 bg-[#f8fcf9] px-4 min-h-14 justify-between">
                    <p className="text-[#0d1b12] text-4xl font-black leading-tight tracking-tighter flex-1 truncate">{totalPoints.toLocaleString()}</p>
                    <div className="shrink-0">
                        <div className="text-[#0d1b12] flex size-10 items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32px" height="32px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M239.2,97.29a16,16,0,0,0-13.81-11L166,81.17,142.72,25.81h0a15.95,15.95,0,0,0-29.44,0L90.07,81.17,30.61,86.32a16,16,0,0,0-9.11,28.06L66.61,153.8,53.09,212.34a16,16,0,0,0,23.84,17.34l51-31,51.11,31a16,16,0,0,0,23.84-17.34l-13.51-58.6,45.1-39.36A16,16,0,0,0,239.2,97.29Zm-15.22,5-45.1,39.36a16,16,0,0,0-5.08,15.71L187.35,216v0l-51.07-31a15.9,15.9,0,0,0-16.54,0l-51,31h0L82.2,157.4a16,16,0,0,0-5.08-15.71L32,102.35a.37.37,0,0,1,0-.09l59.44-5.14a16,16,0,0,0-13.35-9.75L128,32.08l23.2,55.29a16,16,0,0,0-13.35,9.75L224,102.26S224,102.32,224,102.33Z"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="px-4 pb-3 pt-8">
                    <h2 className="text-[#0d1b12] text-[22px] font-bold leading-tight tracking-[-0.015em]">My Memberships</h2>
                </div>
                
                {memberships.length > 0 ? (
                    <div className="flex flex-col px-4 gap-4">
                        {memberships.map((membership) => (
                            <div 
                                key={membership.id} 
                                onClick={() => onViewBusiness(membership.businesses as Business)}
                                className="group cursor-pointer active:scale-[0.98] transition-transform"
                            >
                                <div className="flex items-stretch justify-between gap-4 rounded-xl">
                                    <div className="flex flex-col gap-1 flex-[2_2_0px] py-2">
                                        <p className="text-[#4c9a66] text-sm font-bold leading-normal">{membership.points} {t('points')}</p>
                                        <p className="text-[#0d1b12] text-lg font-black leading-tight">{membership.businesses?.public_name}</p>
                                        <p className="text-[#4c9a66] text-sm font-normal leading-normal truncate opacity-70">
                                            {membership.businesses?.bio || 'Tap to view rewards'}
                                        </p>
                                    </div>
                                    <div
                                        className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-2xl flex-1 border border-[#e7f3eb] shadow-sm"
                                        style={{ backgroundImage: `url("${membership.businesses?.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'}")` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center px-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No Memberships Yet</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CustomerHomePage;
