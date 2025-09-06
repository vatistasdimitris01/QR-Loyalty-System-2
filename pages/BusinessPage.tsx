import React, { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Customer, Post, Discount, DailyAnalyticsData, BusinessAnalytics } from '../types';
import { 
    searchMembershipsForBusiness, removeMembership, getBusinessAnalytics, getDailyAnalytics,
    updateBusiness, getPostsForBusiness, createPost, updatePost, deletePost,
    getDiscountsForBusiness, createDiscount, deleteDiscount
} from '../services/api';
import { Spinner, CustomerQRModal, BusinessScannerModal, CameraIcon, QRScannerModal, PencilIcon, TrashIcon, MarkdownEditor, InputField, TextAreaField, SelectField } from '../components/common';

type DashboardTab = 'analytics' | 'customers' | 'posts' | 'discounts';

// Main Page Component
const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
        } else {
             window.location.href = '/business/login';
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn');
        sessionStorage.removeItem('business');
        window.location.href = '/';
    };
    
    const handleBusinessUpdate = (updatedBusiness: Business) => {
        setBusiness(updatedBusiness);
        sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
    }

    if (loading || !business) return <div className="flex justify-center items-center h-screen bg-gray-100"><Spinner /></div>;

    const renderContent = () => {
        switch (activeTab) {
            case 'analytics': return <AnalyticsDashboard business={business} onBusinessUpdate={handleBusinessUpdate} />;
            case 'customers': return <CustomersList business={business} />;
            case 'posts': return <PostsManager business={business} />;
            case 'discounts': return <DiscountsManager business={business} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
                <div className="p-4 flex justify-between items-center max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">{business.public_name || t('businessDashboard')}</h1>
                        <p className="text-sm text-gray-500">{t('welcome')}, {business.name}!</p>
                    </div>
                    <button onClick={handleLogout} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">{t('logout')}</button>
                </div>
                 <div className="px-4 border-t border-gray-200">
                    <nav className="flex space-x-4 overflow-x-auto max-w-7xl mx-auto">
                        <TabButton label={t('analytics')} isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        <TabButton label={t('customerList')} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                        <TabButton label={t('posts')} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                        <TabButton label={t('discounts')} isActive={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                    </nav>
                </div>
            </header>
            
            <main className="p-4 md:p-6 max-w-7xl mx-auto">
                {renderContent()}
            </main>
        </div>
    );
};


// TAB COMPONENTS

const AnalyticsDashboard: React.FC<{business: Business, onBusinessUpdate: (b: Business) => void}> = ({ business, onBusinessUpdate }) => {
    const { t } = useLanguage();
    const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
    const [dailyData, setDailyData] = useState<DailyAnalyticsData[]>([]);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);

    const fetchData = useCallback(async () => {
        const [analyticsData, dailyAnalyticsData] = await Promise.all([
            getBusinessAnalytics(business.id),
            getDailyAnalytics(business.id)
        ]);
        setAnalytics(analyticsData);
        setDailyData(dailyAnalyticsData || []);
    }, [business.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return (
        <>
            <BusinessScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} businessId={business.id} onScanSuccess={fetchData} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">New Members & Rewards</h3>
                        <p className="text-sm text-gray-500 mb-4">Activity over the last 7 days.</p>
                        {dailyData.length > 0 ? <AnalyticsChart data={dailyData} dataKey="new_members_count" dataKey2="rewards_claimed_count" label1="New Members" label2="Rewards Claimed" color1="#3b82f6" color2="#f59e0b" /> : <div className="h-48 flex justify-center items-center"><Spinner /></div>}
                    </div>
                     <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-1">Points Activity</h3>
                        <p className="text-sm text-gray-500 mb-4">Total points awarded in the last 7 days.</p>
                        {dailyData.length > 0 ? <AnalyticsChart data={dailyData} dataKey="points_awarded_sum" label1="Points Awarded" color1="#10b981" /> : <div className="h-48 flex justify-center items-center"><Spinner /></div>}
                    </div>
                </div>
                <div className="space-y-6">
                    <StatCard title={t('totalCustomers')} value={analytics?.total_customers ?? '...'} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                    <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />
                    <QuickActionCard title={t('scanCustomerQR')} description="Award points to a customer." onClick={() => setIsScannerModalOpen(true)} icon={<CameraIcon className="h-6 w-6"/>} />
                    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center">
                        <h3 className="font-bold text-lg mb-2">Business Login QR</h3>
                        <img src={business.qr_data_url} alt="Business Login QR Code" className="w-40 h-40 mx-auto rounded-lg" />
                        <p className="text-xs text-gray-500 mt-2">Scan this to log in quickly from any device.</p>
                    </div>
                    <QuickActionCard title={t('manageContent')} description={t('manageContentDesc')} href="/business/editor" icon={<PencilIcon />} />
                </div>
            </div>
        </>
    );
};

const CustomersList: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loadingMemberships, setLoadingMemberships] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isSearchScannerOpen, setIsSearchScannerOpen] = useState(false);
    
    const fetchMemberships = useCallback(async (businessId: string, search: string) => {
        setLoadingMemberships(true);
        const membershipsData = await searchMembershipsForBusiness(businessId, search);
        setMemberships(membershipsData);
        setLoadingMemberships(false);
    }, []);

    useEffect(() => {
        fetchMemberships(business.id, deferredSearchTerm);
    },[business.id, deferredSearchTerm, fetchMemberships]);
    
    const handleViewQr = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsQrModalOpen(true);
    };

    const handleRemoveCustomer = async (customerId: string) => {
        if (window.confirm(t('removeConfirm'))) {
            const result = await removeMembership(customerId, business.id);
            if (result.success) {
                fetchMemberships(business.id, searchTerm);
            } else {
                alert('Failed to remove customer. Please try again.');
            }
        }
    };
    
    const handleSearchScan = (scannedText: string) => {
        let token = scannedText;
        try {
            const url = new URL(scannedText);
            token = url.searchParams.get('token') || '';
        } catch (e) {}

        if (token.startsWith('cust_')) {
            setSearchTerm(token);
        }
        setIsSearchScannerOpen(false);
    };

    return (
        <>
            <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={selectedCustomer} />
            <QRScannerModal isOpen={isSearchScannerOpen} onClose={() => setIsSearchScannerOpen(false)} onScan={handleSearchScan} />
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                    <h2 className="text-xl font-bold text-gray-800">{t('customerList')}</h2>
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                        <button onClick={() => setIsSearchScannerOpen(true)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-600"><CameraIcon className="h-6 w-6" /></button>
                    </div>
                </div>
                <div className="space-y-3">
                     {loadingMemberships ? (
                        <div className="text-center p-6"><Spinner /></div>
                    ) : memberships.length > 0 ? memberships.map(membership => (
                        <div key={membership.id} className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <img src={membership.customers.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt={membership.customers.name} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                                <div>
                                    <p className="font-semibold text-gray-800">{membership.customers.name}</p>
                                    <p className="text-sm text-gray-500">{membership.customers.phone_number || 'No phone'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between w-full sm:w-auto">
                                <p className="font-bold text-lg text-blue-600 sm:mx-4">{membership.points} <span className="text-sm font-medium text-gray-500">{t('points')}</span></p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleViewQr(membership.customers)} className="bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-gray-300">View</button>
                                    <button onClick={() => handleRemoveCustomer(membership.customers.id)} className="bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-red-200">{t('remove')}</button>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center p-6 text-gray-500">No customers found.</div>
                    )}
                </div>
            </div>
        </>
    )
}

const PostsManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const emptyForm: Omit<Post, 'id' | 'business_id' | 'created_at'> = { title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' };
    const [formState, setFormState] = useState(emptyForm);

    const fetchPosts = useCallback(async () => {
        const data = await getPostsForBusiness(business.id);
        setPosts(data);
    }, [business.id]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    useEffect(() => {
        if (editingPost) {
            setFormState(editingPost);
        } else {
            setFormState(emptyForm);
        }
    }, [editingPost]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMarkdownChange = (name: string, value: string) => setFormState(prev => ({...prev, [name]: value}));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let result;
        if (editingPost) {
            result = await updatePost(editingPost.id, formState);
        } else {
            result = await createPost({ ...formState, business_id: business.id });
        }
        if (result) {
            fetchPosts();
            setEditingPost(null);
        }
    };
    
    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure?')) {
            const success = await deletePost(id);
            if (success) fetchPosts();
        }
    };

    return (
        <SettingsCard title={t('managePosts')} description={t('managePostsDesc')}>
            <form onSubmit={handleSubmit} className="border border-gray-200 p-4 rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{editingPost ? t('editPost') : t('newPost')}</h3>
                <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                <InputField label={t('videoUrl')} name="video_url" value={formState.video_url || ''} onChange={handleFormChange} placeholder="https://youtube.com/..." />
                <InputField label={t('priceOffer')} name="price_text" value={formState.price_text || ''} onChange={handleFormChange} placeholder="e.g., $19.99 or 50% OFF" />
                <InputField label={t('externalLink')} name="external_url" value={formState.external_url || ''} onChange={handleFormChange} placeholder="https://yoursite.com/product" />
                <div className="flex gap-4">
                    {editingPost && <button type="button" onClick={() => setEditingPost(null)} className="w-full bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">{t('cancel')}</button>}
                    <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{editingPost ? t('updatePost') : t('createPost')}</button>
                </div>
            </form>
            <div className="space-y-3 mt-6">
                <h3 className="font-semibold text-gray-800">Your Posts</h3>
                {posts.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">{t('noPosts')}</p> : posts.map(p => (
                    <div key={p.id} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
                        {p.image_url ? <img src={p.image_url} alt="post preview" className="w-14 h-14 rounded object-cover bg-gray-200" /> : <div className="w-14 h-14 rounded bg-gray-200 flex-shrink-0" />}
                        <p className="flex-grow font-semibold text-gray-800 truncate">{p.title}</p>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={() => setEditingPost(p)} className="text-blue-600 hover:text-blue-800 p-2 rounded-md hover:bg-gray-100"><PencilIcon /></button>
                            <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-gray-100"><TrashIcon /></button>
                        </div>
                    </div>
                ))}
            </div>
        </SettingsCard>
    )
};

const DiscountsManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [newDiscount, setNewDiscount] = useState({ name: '', description: '', image_url: '' });

    const fetchDiscounts = useCallback(async () => {
        const data = await getDiscountsForBusiness(business.id);
        setDiscounts(data);
    }, [business.id]);

    useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createDiscount({ ...newDiscount, business_id: business.id });
        if(result) {
            fetchDiscounts();
            setNewDiscount({ name: '', description: '', image_url: '' });
        }
    };
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure?')) {
            const success = await deleteDiscount(id);
            if(success) fetchDiscounts();
        }
    };

    return (
        <SettingsCard title={t('manageDiscounts')} description={t('manageDiscountsDesc')}>
            <form onSubmit={handleCreate} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{t('newDiscount')}</h3>
                <InputField label={t('discountName')} name="name" value={newDiscount.name} onChange={(e) => setNewDiscount({...newDiscount, name: e.target.value})} />
                <TextAreaField label={t('description')} name="description" value={newDiscount.description || ''} onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})} />
                <InputField label={t('imageUrl')} name="image_url" value={newDiscount.image_url || ''} onChange={(e) => setNewDiscount({...newDiscount, image_url: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{t('createDiscount')}</button>
            </form>
            <div className="space-y-3 mt-6">
                 <h3 className="font-semibold text-gray-800">Your Discounts</h3>
                {discounts.length === 0 ? <p className="text-sm text-gray-500 py-4 text-center">{t('noManageDiscounts')}</p> : discounts.map(d => (
                    <div key={d.id} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
                         {d.image_url ? <img src={d.image_url} alt="discount preview" className="w-14 h-14 rounded object-cover bg-gray-200" /> : <div className="w-14 h-14 rounded bg-gray-200 flex-shrink-0" />}
                        <p className="flex-grow font-semibold text-gray-800 truncate">{d.name}</p>
                        <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 p-2 rounded-md hover:bg-gray-100 flex-shrink-0"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </SettingsCard>
    )
};


// UI & HELPER COMPONENTS

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors relative ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {label}
    </button>
);

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500">{title}</p>
        </div>
    </div>
);

const QuickActionCard: React.FC<{ title: string; description: string; href?: string; onClick?: () => void; icon: React.ReactNode }> = ({ title, description, href, onClick, icon }) => {
    const content = ( <div className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer h-full"> <div className="bg-gray-100 text-gray-600 p-3 rounded-full">{icon}</div> <div> <p className="font-bold text-gray-800">{title}</p> <p className="text-sm text-gray-500">{description}</p> </div> </div> );
    if (href) { return <a href={href}>{content}</a>; }
    return <div onClick={onClick}>{content}</div>;
};

const AnalyticsChart: React.FC<{ data: DailyAnalyticsData[], dataKey: keyof DailyAnalyticsData, dataKey2?: keyof DailyAnalyticsData, label1: string, label2?: string, color1: string, color2?: string }> = ({ data, dataKey, dataKey2, label1, label2, color1, color2 }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DailyAnalyticsData; dataKey: string; dataKey2?: string } | null>(null);
    const width = 300;
    const height = 150;
    const padding = { top: 10, bottom: 20, left: 10, right: 10 };

    const maxVal1 = Math.max(...data.map(d => d[dataKey] as number), 1);
    const maxVal2 = dataKey2 ? Math.max(...data.map(d => d[dataKey2] as number), 1) : 0;
    const maxVal = Math.max(maxVal1, maxVal2);

    const getCoords = (val: number, index: number) => {
        const x = padding.left + (index / (data.length - 1)) * (width - padding.left - padding.right);
        const y = height - padding.bottom - (val / maxVal) * (height - padding.top - padding.bottom);
        return { x, y };
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        const index = Math.round(((mouseX - padding.left) / (width - padding.left - padding.right)) * (data.length - 1));
        if (index >= 0 && index < data.length) {
            const pointData = data[index];
            const y1 = getCoords(pointData[dataKey] as number, index).y;
            const y2 = dataKey2 ? getCoords(pointData[dataKey2] as number, index).y : 0;
            
            setTooltip({
                x: getCoords(0, index).x,
                y: Math.min(y1, y2 > 0 ? y2 : Infinity),
                data: pointData,
                dataKey,
                dataKey2
            });
        }
    };

    const linePath1 = data.map((d, i) => {
        const { x, y } = getCoords(d[dataKey] as number, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    const linePath2 = dataKey2 ? data.map((d, i) => {
        const { x, y } = getCoords(d[dataKey2] as number, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ') : '';
    
    const xLabels = data.map(d => new Date(d.log_date).toLocaleDateString(navigator.language, { weekday: 'short' }));

    return (
        <div className="relative">
            <svg ref={svgRef} viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" onMouseMove={handleMouseMove} onMouseLeave={() => setTooltip(null)}>
                <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" strokeWidth="1" />
                <path d={linePath1} fill="none" stroke={color1} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {dataKey2 && <path d={linePath2} fill="none" stroke={color2} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}
                
                {xLabels.map((label, i) => (
                    <text key={i} x={getCoords(0, i).x} y={height - 5} textAnchor="middle" fontSize="10" fill="#9ca3af">{label}</text>
                ))}
                
                {tooltip && (
                    <line x1={tooltip.x} y1={padding.top} x2={tooltip.x} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
                )}
            </svg>
            
            {tooltip && (
                <div className="absolute p-2 text-xs bg-gray-800 text-white rounded-md shadow-lg pointer-events-none" style={{ left: `${(tooltip.x / width * 100)}%`, top: `0px`, transform: 'translateX(-50%) translateY(-110%)' }}>
                    <p className="font-bold mb-1">{new Date(tooltip.data.log_date).toLocaleDateString(navigator.language, { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: color1}}></span>{label1}: <strong>{tooltip.data[dataKey] as number}</strong></div>
                    {tooltip.dataKey2 && <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{backgroundColor: color2}}></span>{label2}: <strong>{tooltip.data[tooltip.dataKey2] as number}</strong></div>}
                </div>
            )}
            
            <div className="flex justify-center gap-4 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{backgroundColor: color1}}></span>{label1}</div>
                {label2 && <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full" style={{backgroundColor: color2}}></span>{label2}</div>}
            </div>
        </div>
    );
};

const LoyaltySettingsEditor: React.FC<{business: Business, onUpdate: (b: Business) => void}> = ({ business, onUpdate }) => {
    const { t } = useLanguage();
    const [points, setPoints] = useState(business.points_per_scan || 1);
    const [threshold, setThreshold] = useState(business.reward_threshold || 5);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => {
        setIsSaving(true);
        const updated = await updateBusiness(business.id, { points_per_scan: points, reward_threshold: threshold });
        if (updated) {
            onUpdate({...business, ...updated});
        }
        setIsSaving(false);
    };
    
    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg mb-2 text-gray-800">{t('loyaltyProgram')}</h3>
            <div className="text-center bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-500">{t('pointsPerScan')}</p>
                <div className="flex items-center justify-center gap-4 my-2">
                    <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition-colors">-</button>
                    <span className="text-5xl font-bold text-gray-800 w-20">{points}</span>
                    <button onClick={() => setPoints(p => p + 1)} className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition-colors">+</button>
                </div>
                 <p className="text-sm font-medium text-gray-500 mt-4">{t('rewardThreshold')}</p>
                <div className="flex items-center justify-center gap-4 my-2">
                    <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition-colors">-</button>
                    <span className="text-5xl font-bold text-gray-800 w-20">{threshold}</span>
                    <button onClick={() => setThreshold(t => t + 1)} className="w-9 h-9 rounded-full bg-gray-200 text-lg font-bold hover:bg-gray-300 transition-colors">+</button>
                </div>
            </div>
            <div className="flex items-center justify-center gap-1 h-2 mt-4">
                {[...Array(threshold)].map((_, i) => <div key={i} className={`h-full flex-1 rounded-full ${i < points ? 'bg-blue-500' : 'bg-gray-200'}`}></div>)}
            </div>
            <button onClick={handleSave} disabled={isSaving || (points === business.points_per_scan && threshold === business.reward_threshold)} className="w-full mt-4 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors">
                {isSaving ? t('save')+'...' : t('save')}
            </button>
        </div>
    );
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm space-y-6">
        <div><h2 className="text-xl font-bold text-gray-800">{title}</h2><p className="text-sm text-gray-500 mt-1">{description}</p></div>
        {children}
    </div>
);


export default BusinessPage;