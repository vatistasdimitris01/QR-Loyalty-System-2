import React, { useState, useEffect } from 'react';
import { Business, Discount } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountsForBusiness, leaveBusiness } from '../../services/api';
import { Spinner, FacebookIcon, InstagramIcon, WebsiteIcon, PhoneIcon } from '../../components/common';

interface BusinessProfilePageProps {
    business: Business;
    customerId: string;
    onBack: () => void;
    onLeaveSuccess: () => void;
}

const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({ business, customerId, onBack, onLeaveSuccess }) => {
    const { t } = useLanguage();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loadingDiscounts, setLoadingDiscounts] = useState(true);

    useEffect(() => {
        const fetchDiscounts = async () => {
            setLoadingDiscounts(true);
            const data = await getDiscountsForBusiness(business.id);
            setDiscounts(data);
            setLoadingDiscounts(false);
        };
        fetchDiscounts();
    }, [business.id]);

    const handleLeave = async () => {
        const confirmed = window.confirm(t('leaveConfirm'));
        if (confirmed) {
            const result = await leaveBusiness(customerId, business.id);
            if (result.success) {
                onLeaveSuccess();
            } else {
                alert('Could not leave business. Please try again.');
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <div className="p-4 max-w-2xl mx-auto">
                 <header className="flex items-center mb-6">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors mr-2">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    </button>
                    <h1 className="text-xl font-bold text-gray-800 text-center flex-grow">{t('businessProfile')}</h1>
                    <div className="w-10"></div>
                </header>
            
                {/* Business Info */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 text-center">
                    <img src={business.logo_url || 'https://via.placeholder.com/150'} alt={`${business.public_name} logo`} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover bg-gray-200 border-2 border-gray-200" />
                    <h2 className="text-3xl font-bold">{business.public_name}</h2>
                    {business.bio && <p className="text-gray-600 mt-2 text-base">{business.bio}</p>}
                </div>
                
                {/* Discounts */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-bold mb-4">{t('discounts')}</h3>
                    {loadingDiscounts ? <div className="flex justify-center"><Spinner /></div> : discounts.length > 0 ? (
                        <div className="space-y-3">
                            {discounts.map(d => (
                                <div key={d.id} className="border border-gray-200 p-3 rounded-lg bg-gray-50">
                                    <p className="font-bold text-gray-800">{d.name}</p>
                                    {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                                    {d.percentage && <p className="text-lg font-bold text-blue-600 mt-2">{d.percentage}% OFF</p>}
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-500">{t('noBusinessDiscounts')}</p>}
                </div>

                {/* Contact Info */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <h3 className="text-xl font-bold mb-4">{t('contactInfo')}</h3>
                    <div className="space-y-3">
                        {business.public_phone_number && <div className="flex items-center gap-3 text-gray-700"><PhoneIcon className="h-5 w-5 text-gray-500"/><span>{business.public_phone_number}</span></div>}
                        {business.website_url && <a href={business.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline"><WebsiteIcon className="h-5 w-5"/><span>Website</span></a>}
                        {business.facebook_url && <a href={business.facebook_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline"><FacebookIcon className="h-5 w-5"/><span>Facebook</span></a>}
                        {business.instagram_url && <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:underline"><InstagramIcon className="h-5 w-5"/><span>Instagram</span></a>}
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8">
                    <button onClick={handleLeave} className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-lg hover:bg-red-200 transition-colors">
                        {t('leaveBusiness')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessProfilePage;
