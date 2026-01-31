
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
        <div className="max-w-xl mx-auto px-6 pt-12">
            <h1 className="text-4xl font-black tracking-tighter mb-12">Discover.</h1>
            
            <div className="flex gap-8 mb-10 border-b border-slate-50">
                <TabButton label="Popular" active={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
                <TabButton label="Nearby" active={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
                <TabButton label="Search" active={activeTab === 'all'} onClick={() => setActiveTab('all')} />
            </div>
            
            <div className="space-y-8">
                {activeTab === 'all' && (
                    <form onSubmit={handleSearch} className="relative mb-12">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Find a business..."
                            className="w-full bg-slate-50 border-none rounded-full py-4 px-8 text-sm font-bold focus:ring-1 focus:ring-black transition-all"
                        />
                    </form>
                )}

                {activeTab === 'nearby' && locationStatus === 'idle' && (
                    <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-3xl">
                        <button onClick={fetchNearby} className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Enable Location Access</button>
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
    <button onClick={onClick} className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all border-b-2 ${active ? 'border-black text-black' : 'border-transparent text-slate-300'}`}>
        {label}
    </button>
);

const BusinessList: React.FC<{loading: boolean, items: Business[], joinedIds: Set<string>, onJoin: (id: string) => void}> = ({ loading, items, joinedIds, onJoin }) => {
    if (loading) return <div className="py-20 flex justify-center"><Spinner className="w-5 h-5 text-black" /></div>;
    return (
        <div className="space-y-6">
            {items.map(biz => (
                <div key={biz.id} className="flex items-center justify-between py-2 border-b border-slate-50 group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-full flex-shrink-0 grayscale">
                             <img src={biz.logo_url || ''} className="w-full h-full object-cover rounded-full" alt="L"/>
                        </div>
                        <div>
                            <p className="font-black tracking-tight">{biz.public_name}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{biz.membership_count || 0} Members</p>
                        </div>
                    </div>
                    <button
                        onClick={() => onJoin(biz.id)}
                        disabled={joinedIds.has(biz.id)}
                        className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${joinedIds.has(biz.id) ? 'bg-slate-50 text-slate-300' : 'bg-black text-white active:scale-95'}`}
                    >
                        {joinedIds.has(biz.id) ? 'Joined' : 'Join'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default CustomerSearchPage;
