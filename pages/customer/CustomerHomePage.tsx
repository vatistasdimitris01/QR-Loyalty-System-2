import React from 'react';
import { Customer, Membership, Business } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StarIcon } from '../../components/common';

interface CustomerHomePageProps {
    customer: Customer;
    memberships: Membership[];
    onViewBusiness: (business: Business) => void;
}

const CustomerHomePage: React.FC<CustomerHomePageProps> = ({ customer, memberships, onViewBusiness }) => {
    const { t } = useLanguage();
    
    return (
        <div className="p-4">
            <header className="text-center mb-6">
                 <h1 className="text-3xl font-bold text-gray-800">{t('welcome')}, {customer.name.split(' ')[0]}!</h1>
            </header>
            
            {/* Customer QR Code Card */}
            <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col items-center">
                 <h2 className="text-lg font-semibold text-gray-800 mb-2">{t('yourUniversalQr')}</h2>
                 {customer.qr_data_url ? (
                    <img src={customer.qr_data_url} alt="Your Universal QR Code" className="w-48 h-48 rounded-lg border" />
                 ) : (
                    <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />
                 )}
                 <p className="text-sm text-gray-500 mt-3 text-center max-w-xs">{t('scanThisToLogin')}</p>
            </div>


            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('myMemberships')}</h2>

            {memberships.length === 0 ? (
                <div className="bg-white p-6 rounded-lg shadow-sm text-center text-gray-600">
                    <p>{t('noMemberships')}</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {memberships.map(membership => (
                        <div 
                            key={membership.id} 
                            // FIX: Cast partial business object to a full Business, as the API returns all fields.
                            onClick={() => onViewBusiness(membership.businesses as Business)}
                            className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-95 transition-all"
                            role="button"
                            tabIndex={0}
                            aria-label={`View profile for ${membership.businesses.public_name}`}
                        >
                            <div className="flex items-center gap-4">
                                <img 
                                    src={membership.businesses.logo_url || 'https://via.placeholder.com/150'} 
                                    alt={`${membership.businesses.public_name} logo`}
                                    className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                />
                                <div>
                                    <p className="font-bold text-gray-800">{membership.businesses.public_name}</p>
                                    <p className="text-sm text-gray-500">Joined on {new Date(membership.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-amber-500">
                                <StarIcon className="h-6 w-6" />
                                <span className="font-bold text-lg">{membership.points}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerHomePage;