
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Business } from '../../types';
import { searchBusinesses, joinBusiness, getMembershipsForCustomer, getPopularBusinesses, getNearbyBusinesses } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from '../../components/common';

interface CustomerSearchPageProps {
    customer: Customer;
    onJoinSuccess: () => void;
}

type SearchTab = 'popular' | 'nearby' | 'all';

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

    const fetchData = async () => {
        setLoading(true);
        if (activeTab === 'popular') setResults(await getPopularBusinesses());
        else if (activeTab === 'nearby') {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                setResults(await getNearbyBusinesses(pos.coords.latitude, pos.coords.longitude));
            }, () => setLoading(false));
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, [activeTab]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResults(await searchBusinesses(searchTerm));
        setLoading(false);
    };

    return (
        <div className="flex flex-col bg-white min-h-screen text-[#111813]" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-white p-4 pb-2 justify-between">
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">{t('search')}</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="text-[#111813] p-2"><span className="material-symbols-outlined">settings</span></button>
                </div>
            </div>

            <div className="px-4 py-3">
                <form onSubmit={handleSearch} className="flex w-full h-12">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full overflow-hidden">
                        <div className="text-[#61896f] flex bg-[#f0f4f2] items-center justify-center pl-4">
                            <span className="material-symbols-outlined text-[24px]">search</span>
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 border-none bg-[#f0f4f2] focus:ring-0 px-4 text-base font-normal placeholder:text-[#61896f]"
                            placeholder="Search businesses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="flex items-center justify-center bg-[#f0f4f2] pr-4">
                            {searchTerm && (
                                <button type="button" onClick={() => setSearchTerm('')} className="text-[#61896f]">
                                    <span className="material-symbols-outlined text-[24px]">cancel</span>
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            <div className="pb-3 px-4 flex border-b border-[#dbe6df] gap-8">
                <TabItem label="Popular" active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
                <TabItem label="Nearby" active={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
            </div>

            <main className="p-4 space-y-4 pb-24">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner className="size-8 text-[#4c9a66]" /></div>
                ) : (
                    results.map(biz => (
                        <div key={biz.id} className="flex items-stretch justify-between gap-4 rounded-lg">
                            <div className="flex flex-[2_2_0px] flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-[#111813] text-base font-bold leading-tight">{biz.public_name}</p>
                                    <p className="text-[#61896f] text-sm font-normal leading-normal">{biz.bio || 'Retail'}</p>
                                </div>
                                <button
                                    onClick={async () => {
                                        await joinBusiness(customer.id, biz.id);
                                        onJoinSuccess();
                                        refreshMems();
                                    }}
                                    disabled={joinedIds.has(biz.id)}
                                    className={`flex min-w-[84px] items-center justify-center rounded-lg h-8 px-4 text-sm font-medium w-fit ${joinedIds.has(biz.id) ? 'bg-[#f0f4f2] text-[#4c9a66]' : 'bg-[#f0f4f2] text-[#111813]'}`}
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

const TabItem: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${active ? 'border-b-[#111813] text-[#111813]' : 'border-b-transparent text-[#61896f]'}`}>
        <p className="text-sm font-bold leading-normal tracking-[0.015em]">{label}</p>
    </button>
);

export default CustomerSearchPage;
