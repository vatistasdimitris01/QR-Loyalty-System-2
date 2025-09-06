
import React, { useState, useEffect } from 'react';
import { Business, Discount, Post, Product } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountsForBusiness, leaveBusiness, getPostsForBusiness, getProductsForBusiness } from '../../services/api';
import { Spinner, FacebookIcon, InstagramIcon, WebsiteIcon, PhoneIcon } from '../../components/common';

interface BusinessProfilePageProps {
    business: Business;
    customerId: string;
    onBack: () => void;
    onLeaveSuccess: () => void;
}
type ProfileTab = 'posts' | 'shop' | 'discounts' | 'about';

const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({ business, customerId, onBack, onLeaveSuccess }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ProfileTab>('posts');

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
    
    const renderContent = () => {
        switch(activeTab) {
            case 'posts': return <PostsTab businessId={business.id} />;
            case 'shop': return <ShopTab businessId={business.id} />;
            case 'discounts': return <DiscountsTab businessId={business.id} />;
            case 'about': return <AboutTab business={business} onLeave={handleLeave} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-80 backdrop-blur-sm z-10 flex items-center p-2 shadow-sm">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7 7zM8 12h11" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7 7-7-7h11" transform="rotate(180 11.5 12)"/></svg>
                </button>
                <h1 className="text-lg font-bold text-gray-800 text-center flex-grow truncate px-2">{business.public_name}</h1>
                <div className="w-10"></div>
            </header>
            
            <div className="pt-14">
                {/* Cover and Profile Picture */}
                <div className="relative bg-gray-300 h-40 sm:h-56">
                    {business.cover_photo_url && <img src={business.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <img src={business.logo_url || 'https://via.placeholder.com/150'} alt="Logo" className="w-24 h-24 rounded-full object-cover bg-gray-200 border-4 border-white shadow-md" />
                    </div>
                </div>

                {/* Name and Bio */}
                <div className="text-center pt-16 pb-4 px-4 bg-white">
                    <h2 className="text-3xl font-bold">{business.public_name}</h2>
                    {business.bio && <p className="text-gray-600 mt-2 text-base max-w-xl mx-auto">{business.bio}</p>}
                </div>
                
                {/* Tabs */}
                <div className="sticky top-[56px] z-10 bg-white shadow-sm border-t border-b">
                    <nav className="flex justify-center">
                        <TabButton label={t('posts')} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                        <TabButton label={t('shop')} isActive={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
                        <TabButton label={t('discounts')} isActive={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                        <TabButton label={t('about')} isActive={activeTab === 'about'} onClick={() => setActiveTab('about')} />
                    </nav>
                </div>

                {/* Content */}
                <main className="p-4 max-w-2xl mx-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-4 font-medium text-sm transition-colors relative ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
        {label}
        {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></span>}
    </button>
);

// --- TAB COMPONENTS ---

const PostsTab: React.FC<{businessId: string}> = ({ businessId }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPostsForBusiness(businessId).then(data => {
            setPosts(data);
            setLoading(false);
        });
    }, [businessId]);

    if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
    if (posts.length === 0) return <p className="text-center text-gray-500 py-8">{t('noBusinessPosts')}</p>;

    return (
        <div className="space-y-6">
            {posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {post.image_url && <img src={post.image_url} alt={post.title} className="w-full h-56 object-cover" />}
                    <div className="p-4">
                        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                        <p className="text-gray-500 text-xs mb-2 uppercase">{new Date(post.created_at).toLocaleString()}</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ShopTab: React.FC<{businessId: string}> = ({ businessId }) => {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProductsForBusiness(businessId).then(data => {
            setProducts(data);
            setLoading(false);
        });
    }, [businessId]);

    if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
    if (products.length === 0) return <p className="text-center text-gray-500 py-8">{t('noBusinessProducts')}</p>;

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                    {product.image_url && <img src={product.image_url} alt={product.name} className="w-full h-32 object-cover" />}
                    <div className="p-3 flex-grow flex flex-col">
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-gray-600 flex-grow">{product.description}</p>
                        <p className="text-lg font-bold text-blue-600 mt-2">${product.price?.toFixed(2)}</p>
                    </div>
                    {product.product_url && (
                        <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="block bg-blue-50 text-blue-700 text-center font-semibold py-2 text-sm hover:bg-blue-100">
                           {t('viewOnSite')}
                        </a>
                    )}
                </div>
            ))}
        </div>
    );
};

const DiscountsTab: React.FC<{businessId: string}> = ({ businessId }) => {
    const { t } = useLanguage();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDiscountsForBusiness(businessId).then(data => {
            setDiscounts(data);
            setLoading(false);
        });
    }, [businessId]);

    if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
    if (discounts.length === 0) return <p className="text-center text-gray-500 py-8">{t('noBusinessDiscounts')}</p>;

    return (
        <div className="space-y-4">
            {discounts.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-lg shadow-md flex items-center gap-4">
                    {d.image_url && <img src={d.image_url} alt={d.name} className="w-20 h-20 rounded-md object-cover" />}
                    <div className="flex-grow">
                        <p className="font-bold text-gray-800 text-lg">{d.name}</p>
                        {d.description && <p className="text-sm text-gray-600 mt-1">{d.description}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AboutTab: React.FC<{business: Business; onLeave: () => void}> = ({ business, onLeave }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-6">
            {/* Location */}
            {business.address_text && (
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4">{t('location')}</h3>
                    <p className="text-gray-700 mb-4">{business.address_text}</p>
                    <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border">
                         <iframe
                            className="w-full h-full"
                            style={{ height: '250px' }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps?q=${encodeURIComponent(business.address_text)}&output=embed`}
                          ></iframe>
                    </div>
                </div>
            )}
            {/* Contact Info */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
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
                <button onClick={onLeave} className="w-full bg-red-100 text-red-700 font-bold py-3 rounded-lg hover:bg-red-200 transition-colors">
                    {t('leaveBusiness')}
                </button>
            </div>
        </div>
    );
};


export default BusinessProfilePage;
