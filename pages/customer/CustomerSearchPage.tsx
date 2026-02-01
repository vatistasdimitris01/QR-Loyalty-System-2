
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Business } from '../../types';
import { searchBusinesses, joinBusiness, getMembershipsForCustomer, getPopularBusinesses, getNearbyBusinesses } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from '../../components/common';

interface CustomerSearchPageProps {
    customer: Customer;
    onJoinSuccess: () => void;
}

type SearchTab = 'popular' | 'nearby';

const CustomerSearchPage: React.FC<CustomerSearchPageProps> = ({ customer, onJoinSuccess }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<SearchTab>('popular');
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

    const refreshMems = useCallback(async () => {
        const m = await getMembershipsForCustomer(customer.id);
        setJoinedIds(new Set(m.map(x => x.business_id)));
    }, [customer.id]);

    useEffect(() => { refreshMems(); }, [refreshMems]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        if (activeTab === 'popular') setResults(await getPopularBusinesses());
        else if (activeTab === 'nearby') {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                setResults(await getNearbyBusinesses(pos.coords.latitude, pos.coords.longitude));
                setLoading(false);
            }, () => setLoading(false));
            return;
        }
        setLoading(false);
    }, [activeTab]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length > 2) {
            setLoading(true);
            setResults(await searchBusinesses(val));
            setLoading(false);
        } else if (val === '') {
            fetchData();
        }
    };

    return (
        <div className="flex flex-col bg-[#f8fcf9] min-h-screen text-[#0d1b12]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
            </div>

            <div className="px-4 py-3">
                <div className="flex w-full h-12 items-stretch rounded-xl bg-[#e7f3eb] overflow-hidden">
                    <div className="text-[#4c9a66] flex items-center justify-center pl-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                        </svg>
                    </div>
                    <input
                        className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 h-full placeholder:text-[#4c9a66] px-4 text-base font-normal"
                        placeholder="Search for businesses..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="pb-3 border-b border-[#e7f3eb]">
                <div className="flex px-4 gap-8">
                    <button onClick={() => setActiveTab('popular')} className={`flex flex-col items-center justify-center border-b-[3px] pb-2 pt-4 transition-all ${activeTab === 'popular' ? 'border-b-[#2bee6c] text-[#0d1b12]' : 'border-b-transparent text-[#4c9a66]'}`}>
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Popular</p>
                    </button>
                    <button onClick={() => setActiveTab('nearby')} className={`flex flex-col items-center justify-center border-b-[3px] pb-2 pt-4 transition-all ${activeTab === 'nearby' ? 'border-b-[#2bee6c] text-[#0d1b12]' : 'border-b-transparent text-[#4c9a66]'}`}>
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Nearby</p>
                    </button>
                </div>
            </div>

            <main className="p-4 space-y-6 pb-24">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner className="size-8 text-[#2bee6c]" /></div>
                ) : (
                    results.map(biz => (
                        <div key={biz.id} className="flex items-stretch justify-between gap-4">
                            <div className="flex flex-[2_2_0px] flex-col gap-3 py-1">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#0d1b12] text-lg font-black leading-tight">{biz.public_name}</p>
                                    <p className="text-[#4c9a66] text-sm font-normal leading-normal truncate">{biz.bio || 'Local Favorite'}</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        await joinBusiness(customer.id, biz.id);
                                        onJoinSuccess();
                                        refreshMems();
                                    }}
                                    disabled={joinedIds.has(biz.id)}
                                    className={`flex min-w-[84px] items-center justify-center rounded-lg h-9 px-4 text-sm font-bold leading-normal w-fit transition-all ${joinedIds.has(biz.id) ? 'bg-[#e7f3eb] text-[#4c9a66]' : 'bg-[#2bee6c] text-[#0d1b12] shadow-sm active:scale-95'}`}
                                >
                                    <span className="truncate">{joinedIds.has(biz.id) ? 'Joined' : 'Join'}</span>
                                </button>
                            </div>
                            <div
                                className="w-full bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-2xl flex-1 border border-[#e7f3eb]"
                                style={{ backgroundImage: `url("${biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'}")` }}
                            ></div>
                        </div>
                    ))
                )}
            </main>
        </div>
    );
};

export default CustomerSearchPage;
