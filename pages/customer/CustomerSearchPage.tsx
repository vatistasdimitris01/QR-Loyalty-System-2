
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
        <div className="flex flex-col bg-white min-h-screen text-[#111813]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-white p-4 pb-2 justify-between">
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
            </div>

            <div className="px-4 py-3">
                <label className="flex flex-col min-w-40 h-12 w-full">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden">
                        <div className="text-[#61896f] flex bg-[#f0f4f2] items-center justify-center pl-4 rounded-l-lg border-none">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                            </svg>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 border-none bg-[#f0f4f2] focus:ring-0 h-full placeholder:text-[#61896f] px-4 text-base font-normal"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        {searchTerm && (
                            <div className="flex items-center justify-center rounded-r-lg bg-[#f0f4f2] pr-4">
                                <button onClick={() => handleSearch('')} className="text-[#61896f]">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                                        <path d="M165.66,101.66,139.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32L128,139.31l-26.34,26.35a8,8,0,0,1-11.32-11.32L116.69,128,90.34,101.66a8,8,0,0,1,11.32-11.32L128,116.69l26.34-26.35a8,8,0,0,1,11.32,11.32ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </label>
            </div>

            <div className="pb-3">
                <div className="flex border-b border-[#dbe6df] px-4 gap-8">
                    <button onClick={() => setActiveTab('popular')} className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${activeTab === 'popular' ? 'border-b-[#111813] text-[#111813]' : 'border-b-transparent text-[#61896f]'}`}>
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Popular</p>
                    </button>
                    <button onClick={() => setActiveTab('nearby')} className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${activeTab === 'nearby' ? 'border-b-[#111813] text-[#111813]' : 'border-b-transparent text-[#61896f]'}`}>
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">Nearby</p>
                    </button>
                </div>
            </div>

            <main className="p-4 space-y-8 pb-24">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner className="size-8 text-[#4c9a66]" /></div>
                ) : (
                    results.map(biz => (
                        <div key={biz.id} className="flex items-stretch justify-between gap-4 rounded-lg">
                            <div className="flex flex-[2_2_0px] flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#111813] text-base font-bold leading-tight">{biz.public_name}</p>
                                    <p className="text-[#61896f] text-sm font-normal leading-normal truncate">{biz.bio || 'Retail'}</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        await joinBusiness(customer.id, biz.id);
                                        onJoinSuccess();
                                        refreshMems();
                                    }}
                                    disabled={joinedIds.has(biz.id)}
                                    className={`flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-8 px-4 bg-[#f0f4f2] text-[#111813] text-sm font-medium leading-normal w-fit ${joinedIds.has(biz.id) ? 'opacity-50' : ''}`}
                                >
                                    <span className="truncate">{joinedIds.has(biz.id) ? 'Joined' : 'Join'}</span>
                                </button>
                            </div>
                            <div
                                className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1 border border-[#f0f4f2]"
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
