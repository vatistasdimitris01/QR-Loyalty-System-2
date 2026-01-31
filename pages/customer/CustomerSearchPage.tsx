
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
    const [searchedResults, setSearchedResults] = useState<Business[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [popularResults, setPopularResults] = useState<Business[]>([]);
    const [loadingPopular, setLoadingPopular] = useState(true);
    const [nearbyResults, setNearbyResults] = useState<Business[]>([]);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
    const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

    const fetchMems = useCallback(async () => {
        const m = await getMembershipsForCustomer(customer.id);
        setJoinedIds(new Set(m.map(x => x.business_id)));
    }, [customer.id]);

    useEffect(() => { fetchMems(); }, [fetchMems]);
    
    useEffect(() => {
        const fetchPop = async () => {
            setLoadingPopular(true);
            setPopularResults(await getPopularBusinesses());
            setLoadingPopular(false);
        };
        fetchPop();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim().length < 2) return;
        setIsSearching(true);
        setSearchedResults(await searchBusinesses(searchTerm));
        setIsSearching(false);
    };

    const handleJoin = async (id: string) => {
        const res = await joinBusiness(customer.id, id);
        if (res) { setJoinedIds(new Set(joinedIds).add(id)); onJoinSuccess(); }
    };
    
    const fetchNearby = () => {
        setLocationStatus('pending');
        navigator.geolocation.getCurrentPosition(async (pos) => {
            setNearbyResults(await getNearbyBusinesses(pos.coords.latitude, pos.coords.longitude));
            setLocationStatus('success');
        }, () => setLocationStatus('error'), { timeout: 10000 });
    };

    return (
        <div className="px-8 pt-16 animate-in fade-in duration-700">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-10">Discover.</h1>
            
            <div className="flex gap-8 mb-10 border-b border-slate-100">
                <TabButton label="Popular" active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
                <TabButton label="Nearby" active={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
                <TabButton label="Search" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
            </div>
            
            <div className="space-y-8">
                {activeTab === 'all' && (
                    <form onSubmit={handleSearch} className="mb-10 animate-in slide-in-from-top-2 duration-500">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Find your next brand..."
                                className="w-full bg-slate-50 border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                            />
                            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        </div>
                    </form>
                )}

                {activeTab === 'nearby' && locationStatus === 'idle' && (
                    <div className="text-center py-20 bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] animate-in zoom-in-95 duration-500">
                        <button 
                            onClick={fetchNearby} 
                            className="bg-primary text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
                        >
                            Enable Location Access
                        </button>
                        <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Find participating shops around you</p>
                    </div>
                )}

                <BusinessList
                    loading={loadingPopular || isSearching || locationStatus === 'pending'}
                    items={activeTab === 'popular' ? popularResults : activeTab === 'nearby' ? nearbyResults : searchedResults}
                    joinedIds={joinedIds}
                    onJoin={handleJoin}
                />
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, active: boolean, onClick: () => void}> = ({label, active, onClick}) => (
    <button onClick={onClick} className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${active ? 'text-slate-900' : 'text-slate-300 hover:text-slate-500'}`}>
        {label}
        {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-full animate-in slide-in-from-left duration-300"></div>}
    </button>
);

const BusinessList: React.FC<{loading: boolean, items: Business[], joinedIds: Set<string>, onJoin: (id: string) => void}> = ({ loading, items, joinedIds, onJoin }) => {
    if (loading) return <div className="py-20 flex justify-center"><Spinner className="size-8 text-primary/30" /></div>;
    if (items.length === 0) return <div className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No results found</div>;
    
    return (
        <div className="space-y-6 pb-20">
            {items.map(biz => (
                <div key={biz.id} className="flex items-center justify-between group animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-5">
                        <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700 shadow-sm overflow-hidden p-1">
                             <img src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} className="size-full object-cover rounded-xl bg-white" alt="L"/>
                        </div>
                        <div className="space-y-0.5">
                            <p className="font-black text-slate-800 tracking-tight leading-none">{biz.public_name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{biz.membership_count || 0} Regulars</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onJoin(biz.id)}
                        disabled={joinedIds.has(biz.id)}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-2xl transition-all ${joinedIds.has(biz.id) ? 'bg-slate-50 text-slate-300' : 'bg-slate-900 text-white active:scale-95 shadow-lg shadow-slate-900/10'}`}
                    >
                        {joinedIds.has(biz.id) ? 'Active' : 'Enroll'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default CustomerSearchPage;
