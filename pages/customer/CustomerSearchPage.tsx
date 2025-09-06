import React, { useState, useEffect } from 'react';
import { Customer, Business, Membership } from '../../types';
import { searchBusinesses, joinBusiness, getMembershipsForCustomer } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner, SearchIcon } from '../../components/common';

interface CustomerSearchPageProps {
    customer: Customer;
}

const CustomerSearchPage: React.FC<CustomerSearchPageProps> = ({ customer }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Business[]>([]);
    const [loading, setLoading] = useState(false);
    const [joinedBusinessIds, setJoinedBusinessIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        const fetchMemberships = async () => {
            const memberships = await getMembershipsForCustomer(customer.id);
            setJoinedBusinessIds(new Set(memberships.map(m => m.business_id)));
        };
        fetchMemberships();
    }, [customer.id]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim().length < 2) return;
        setLoading(true);
        const data = await searchBusinesses(searchTerm);
        setResults(data);
        setLoading(false);
    };

    const handleJoin = async (businessId: string) => {
        const result = await joinBusiness(customer.id, businessId);
        if (result) {
            setJoinedBusinessIds(prev => new Set(prev).add(businessId));
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('searchForBusinesses')}</h1>
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

            {loading ? (
                <div className="flex justify-center mt-8"><Spinner /></div>
            ) : results.length > 0 ? (
                 <div className="space-y-4">
                    {results.map(business => (
                        <div key={business.id} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img 
                                    src={business.logo_url || 'https://via.placeholder.com/150'} 
                                    alt={`${business.public_name} logo`}
                                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                />
                                <div>
                                    <p className="font-bold text-gray-800">{business.public_name}</p>
                                    <p className="text-sm text-gray-500">{business.bio?.substring(0, 40)}...</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleJoin(business.id)}
                                disabled={joinedBusinessIds.has(business.id)}
                                className="bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-lg text-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                {joinedBusinessIds.has(business.id) ? t('joined') : t('join')}
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 mt-8">{t('noBusinessesFound')}</p>
            )}
        </div>
    );
};

export default CustomerSearchPage;
