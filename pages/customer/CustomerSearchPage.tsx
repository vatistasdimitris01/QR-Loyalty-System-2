
import React, { useState, useEffect, useCallback } from 'react';
import { Customer, Business } from '../../types';
import { searchBusinesses, joinBusiness, getMembershipsForCustomer, getPopularBusinesses, getNearbyBusinesses } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner, SearchIcon, StarIcon } from '../../components/common';

interface CustomerSearchPageProps {
    customer: Customer;
    onJoinSuccess: () => void;
}

type SearchTab = 'popular' | 'nearby' | 'all';
type LocationStatus = 'idle' | 'pending' | 'success' | 'error';

const CustomerSearchPage: React.FC<CustomerSearchPageProps> = ({ customer, onJoinSuccess }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<SearchTab>('popular');
    
    // State for 'All' tab
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedResults, setSearchedResults] = useState<Business[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // State for 'Popular' tab
    const [popularResults, setPopularResults] = useState<Business[]>([]);
    const [loadingPopular, setLoadingPopular] = useState(true);

    // State for 'Nearby' tab
    const [nearbyResults, setNearbyResults] = useState<Business[]>([]);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
    const [locationError, setLocationError] = useState('');

    const [joinedBusinessIds, setJoinedBusinessIds] = useState<Set<string>>(new Set());

    const fetchMemberships = useCallback(async () => {
        const memberships = await getMembershipsForCustomer(customer.id);
        setJoinedBusinessIds(new Set(memberships.map(m => m.business_id)));
    }, [customer.id]);

    useEffect(() => {
        fetchMemberships();
    }, [fetchMemberships]);
    
    useEffect(() => {
        const fetchPopular = async () => {
            setLoadingPopular(true);
            const data = await getPopularBusinesses();
            setPopularResults(data);
            setLoadingPopular(false);
        };
        fetchPopular();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim().length < 2) return;
        setIsSearching(true);
        const data = await searchBusinesses(searchTerm);
        setSearchedResults(data);
        setIsSearching(false);
    };

    const handleJoin = async (businessId: string) => {
        const result = await joinBusiness(customer.id, businessId);
        if (result) {
            setJoinedBusinessIds(prev => new Set(prev).add(businessId));
            onJoinSuccess();
        }
    };
    
    const fetchNearby = () => {
        setLocationStatus('pending');
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const data = await getNearbyBusinesses(latitude, longitude);
                setNearbyResults(data);
                setLocationStatus('success');
            },
            (error) => {
                console.error("Geolocation error:", error);
                setLocationStatus('error');
                setLocationError(t('locationError'));
            },
            { timeout: 10000 }
        );
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('searchForBusinesses')}</h1>
            
            <div className="border-b border-gray-200 mb-4">
                <nav className="-mb-px flex space-x-6">
                    <TabButton label={t('popular')} isActive={activeTab === 'popular'} onClick={() => setActiveTab('popular')} />
                    <TabButton label={t('nearby')} isActive={activeTab === 'nearby'} onClick={() => setActiveTab('nearby')} />
                    <TabButton label={t('all')} isActive={activeTab === 'all'} onClick={() => setActiveTab('all')} />
                </nav>
            </div>
            
            <div>
                {activeTab === 'popular' && (
                    <BusinessList
                        loading={loadingPopular}
                        businesses={popularResults}
                        joinedBusinessIds={joinedBusinessIds}
                        onJoin={handleJoin}
                        emptyMessage={t('noBusinessesFound')}
                    />
                )}
                {activeTab === 'nearby' && (
                    <NearbyTab
                        status={locationStatus}
                        error={locationError}
                        onEnableLocation={fetchNearby}
                        businesses={nearbyResults}
                        joinedBusinessIds={joinedBusinessIds}
                        onJoin={handleJoin}
                    />
                )}
                {activeTab === 'all' && (
                    <div>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder={t('searchForBusinesses')}
                                className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
                                <SearchIcon className="h-6 w-6" />
                            </button>
                        </form>
                         <BusinessList
                            loading={isSearching}
                            businesses={searchedResults}
                            joinedBusinessIds={joinedBusinessIds}
                            onJoin={handleJoin}
                            emptyMessage={searchTerm ? t('noBusinessesFound') : 'Search for a business to get started.'}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
);

const NearbyTab: React.FC<{status: LocationStatus, error: string, onEnableLocation: () => void, businesses: Business[], joinedBusinessIds: Set<string>, onJoin: (id: string) => void}> = ({ status, error, onEnableLocation, businesses, joinedBusinessIds, onJoin }) => {
    const { t } = useLanguage();
    if (status === 'idle') {
        return <div className="text-center p-8 bg-white rounded-lg shadow-sm">
            <p className="mb-4 text-gray-600">Find businesses near your current location.</p>
            <button onClick={onEnableLocation} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700">{t('enableLocation')}</button>
        </div>;
    }
    if (status === 'pending') {
        return <div className="flex flex-col items-center justify-center p-8"><Spinner /><p className="mt-2 text-gray-500">{t('gettingLocation')}</p></div>;
    }
     if (status === 'error') {
        return <div className="text-center p-8 bg-red-50 rounded-lg text-red-700">{error}</div>;
    }
    return <BusinessList loading={false} businesses={businesses} joinedBusinessIds={joinedBusinessIds} onJoin={onJoin} emptyMessage="No businesses found nearby." />;
};

const BusinessList: React.FC<{loading: boolean, businesses: Business[], joinedBusinessIds: Set<string>, onJoin: (id: string) => void, emptyMessage: string}> = ({ loading, businesses, joinedBusinessIds, onJoin, emptyMessage }) => {
    const { t } = useLanguage();

    const formatDistance = (meters?: number) => {
        if (meters === undefined) return null;
        if (meters < 1000) return `${Math.round(meters)} m`;
        return `${(meters / 1000).toFixed(1)} km`;
    };

    if (loading) {
        return <div className="flex justify-center mt-8"><Spinner /></div>;
    }
    if (businesses.length === 0) {
        return <p className="text-center text-gray-500 mt-8">{emptyMessage}</p>
    }
    return (
        <div className="space-y-4">
            {businesses.map(business => (
                <div key={business.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-grow min-w-0">
                        <img 
                            src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                            alt={`${business.public_name} logo`}
                            className="w-12 h-12 rounded-full object-cover bg-gray-200 flex-shrink-0"
                        />
                        <div className="flex-grow min-w-0">
                            <p className="font-bold text-gray-800 truncate">{business.public_name}</p>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                               {business.membership_count !== undefined && <span className="flex items-center"><StarIcon className="w-4 h-4 mr-1 text-yellow-500"/> {business.membership_count} members</span>}
                               {business.dist_meters !== undefined && <span>• {formatDistance(business.dist_meters)}</span>}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onJoin(business.id)}
                        disabled={joinedBusinessIds.has(business.id)}
                        className="bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed flex-shrink-0 ml-2"
                    >
                        {joinedBusinessIds.has(business.id) ? t('joined') : t('join')}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default CustomerSearchPage;