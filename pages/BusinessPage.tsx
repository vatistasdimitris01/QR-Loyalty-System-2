
import React, { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Customer, Post, Discount, DailyAnalyticsData, BusinessAnalytics, ScanResult } from '../types';
import { 
    searchMembershipsForBusiness, removeMembership, getBusinessAnalytics, getDailyAnalytics,
    updateBusiness, getPostsForBusiness, createPost, updatePost, deletePost,
    getDiscountsForBusiness, createDiscount, deleteDiscount
} from '../services/api';
import { Spinner, CustomerQRModal, BusinessScannerModal, CameraIcon, QRScannerModal, PencilIcon, TrashIcon, MarkdownEditor, InputField, TextAreaField, SelectField } from '../components/common';

type DashboardTab = 'analytics' | 'customers' | 'posts' | 'discounts';

const ScreensaverIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);

const HideIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
);

// Main Page Component
const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
            const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1024;
            const hasBeenToScanner = sessionStorage.getItem('scanner_auto_opened');
            if (isTablet && !hasBeenToScanner) {
                sessionStorage.setItem('scanner_auto_opened', 'true');
                window.location.href = '/business/scanner';
            }
        } else { window.location.href = '/business/login'; }
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) { setIsProfileMenuOpen(false); }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => { document.removeEventListener("mousedown", handleClickOutside); };
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn'); sessionStorage.removeItem('business'); window.location.href = '/';
    };
    
    const handleBusinessUpdate = (updatedBusiness: Business) => {
        setBusiness(updatedBusiness); sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
    }

    if (loading || !business) return <div className="flex justify-center items-center h-screen bg-slate-50"><Spinner /></div>;

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
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
                    <div className="flex items-center gap-6">
                        <a href="/business/scanner" title={t('kioskMode')} className="bg-slate-100 text-indigo-600 p-3 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95">
                           <ScreensaverIcon className="h-6 w-6" />
                        </a>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">{business.public_name || t('businessDashboard')}</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('welcome')}, {business.name}</p>
                        </div>
                    </div>
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95">
                            <img src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="Logo" className="w-full h-full object-cover" />
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl py-2 z-30 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                <a href="/business/editor" className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 border-b border-slate-50">{t('businessSettings')}</a>
                                <button onClick={handleLogout} className="w-full text-left block px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50">{t('logout')}</button>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="px-6 max-w-7xl mx-auto">
                    <nav className="flex space-x-2 overflow-x-auto no-scrollbar">
                        <TabButton label={t('analytics')} isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                        <TabButton label={t('customerList')} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                        <TabButton label={t('posts')} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                        <TabButton label={t('discounts')} isActive={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                    </nav>
                </div>
            </header>
            
            <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRestoreMenuOpen, setIsRestoreMenuOpen] = useState(false);
    const layoutStorageKey = `qroyal-dashboard-layout-v3-${business.id}`;
    
    const componentKeys = { NEW_MEMBERS: 'newMembers', POINTS_AWARDED: 'pointsAwarded', TOTAL_CUSTOMERS: 'totalCustomers', LOYALTY_SETTINGS: 'loyaltySettings', QUICK_ACTIONS: 'quickActions', LOGIN_QR: 'loginQr' };
    const [componentOrder, setComponentOrder] = useState<string[]>(Object.values(componentKeys));
    const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set());
    const componentTitles: Record<string, string> = { [componentKeys.NEW_MEMBERS]: 'New Members', [componentKeys.POINTS_AWARDED]: 'Points Awarded', [componentKeys.TOTAL_CUSTOMERS]: t('totalCustomers'), [componentKeys.QUICK_ACTIONS]: 'Quick Actions', [componentKeys.LOYALTY_SETTINGS]: t('loyaltyProgram'), [componentKeys.LOGIN_QR]: 'Business Login QR' };

    useEffect(() => {
        const savedLayout = localStorage.getItem(layoutStorageKey);
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                setComponentOrder(parsedLayout.order);
                setHiddenComponents(new Set(parsedLayout.hidden || []));
            } catch (e) { localStorage.removeItem(layoutStorageKey); }
        }
    }, [layoutStorageKey]);

    const handleSaveLayout = () => { localStorage.setItem(layoutStorageKey, JSON.stringify({ order: componentOrder, hidden: Array.from(hiddenComponents) })); setIsEditMode(false); };
    const handleHideComponent = (key: string) => setHiddenComponents(prev => new Set(prev).add(key));
    const handleUnhideComponent = (key: string) => setHiddenComponents(prev => { const newSet = new Set(prev); newSet.delete(key); return newSet; });

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);
    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) { dragItem.current = null; dragOverItem.current = null; return; };
        const visibleOrder = componentOrder.filter(key => !hiddenComponents.has(key));
        const draggedItemContent = visibleOrder.splice(dragItem.current, 1)[0];
        visibleOrder.splice(dragOverItem.current, 0, draggedItemContent);
        setComponentOrder([...visibleOrder, ...componentOrder.filter(key => hiddenComponents.has(key))]);
        dragItem.current = null; dragOverItem.current = null;
    };

    const fetchData = useCallback(async () => {
        const [analyticsData, dailyAnalyticsData] = await Promise.all([ getBusinessAnalytics(business.id), getDailyAnalytics(business.id) ]);
        setAnalytics(analyticsData); setDailyData(dailyAnalyticsData || []);
    }, [business.id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    const componentsMap: Record<string, React.ReactNode> = {
        [componentKeys.NEW_MEMBERS]: <AnalyticsAreaChartCard title="New Members" total={analytics?.new_members_7d} data={dailyData} dataKey="new_members_count" color="#6366f1" />,
        [componentKeys.POINTS_AWARDED]: <AnalyticsAreaChartCard title="Points Awarded" total={analytics?.points_awarded_7d} data={dailyData} dataKey="points_awarded_sum" color="#10b981" />,
        [componentKeys.TOTAL_CUSTOMERS]: <StatCard title={t('totalCustomers')} value={analytics?.total_customers ?? '...'} />,
        [componentKeys.LOYALTY_SETTINGS]: <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />,
        [componentKeys.QUICK_ACTIONS]: (
            <div className="bg-white p-8 rounded-3xl shadow-sm h-full border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                    <QuickActionButton title={t('scanCustomerQR')} onClick={() => setIsScannerModalOpen(true)} icon={<CameraIcon className="h-5 w-5"/>} />
                    <QuickActionButton title={t('kioskMode')} href="/business/scanner" icon={<ScreensaverIcon className="h-5 w-5" />} />
                </div>
            </div>
        ),
        [componentKeys.LOGIN_QR]: (
            <div className="bg-white p-8 rounded-3xl shadow-sm text-center h-full border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Business Login QR</h3>
                <div className="bg-slate-50 p-4 rounded-3xl inline-block border shadow-inner">
                  <img src={business.qr_data_url} alt="Login QR" className="w-32 h-32 mx-auto rounded-lg" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Scan to log in instantly</p>
            </div>
        )
    };
    
    const visibleComponents = componentOrder.filter(key => !hiddenComponents.has(key));

    return (
        <>
            <BusinessScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} businessId={business.id} onScanSuccess={(result: ScanResult) => { if (result.success) fetchData(); }} />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Overview</h2>
                <div className="flex gap-2">
                    {isEditMode ? (
                        <>
                            <button onClick={handleSaveLayout} className="bg-indigo-600 text-white font-bold py-2.5 px-6 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 text-sm">Save Layout</button>
                            <button onClick={() => setIsEditMode(false)} className="bg-slate-200 text-slate-600 font-bold py-2.5 px-6 rounded-2xl hover:bg-slate-300 text-sm">Cancel</button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditMode(true)} className="bg-white text-slate-600 font-bold py-2.5 px-5 rounded-2xl border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all text-sm flex items-center gap-2 active:scale-95">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                            Customize Widgets
                        </button>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleComponents.map((key, index) => (
                    <div
                        key={key}
                        draggable={isEditMode}
                        onDragStart={() => dragItem.current = index}
                        onDragEnter={() => dragOverItem.current = index}
                        onDragEnd={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className={`transition-all duration-300 ${isEditMode ? 'cursor-move ring-4 ring-indigo-500/20 ring-offset-4 rounded-[2rem]' : ''}`}
                    >
                        <div className="relative h-full">
                             {isEditMode && (
                               <div className="absolute top-2 right-2 z-10 flex gap-2">
                                  <button onClick={() => handleHideComponent(key)} className="bg-white/80 p-2 rounded-xl text-rose-500 shadow-sm border border-rose-100 hover:bg-rose-50"><TrashIcon /></button>
                               </div>
                             )}
                             {componentsMap[key]}
                        </div>
                    </div>
                ))}
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

    useEffect(() => { fetchMemberships(business.id, deferredSearchTerm); },[business.id, deferredSearchTerm, fetchMemberships]);
    
    const handleViewQr = (customer: Customer) => { setSelectedCustomer(customer); setIsQrModalOpen(true); };

    const handleRemoveCustomer = async (customerId: string) => {
        if (window.confirm(t('removeConfirm'))) {
            const result = await removeMembership(customerId, business.id);
            if (result.success) fetchMemberships(business.id, searchTerm);
        }
    };
    
    return (
        <>
            <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={selectedCustomer} />
            <QRScannerModal isOpen={isSearchScannerOpen} onClose={() => setIsSearchScannerOpen(false)} onScan={(s) => { setSearchTerm(s); setIsSearchScannerOpen(false); }} facingMode="user" />
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t('customerList')}</h2>
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                        <button onClick={() => setIsSearchScannerOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-600 transition-colors"><CameraIcon className="h-6 w-6" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                     {loadingMemberships ? (
                        <div className="text-center p-10"><Spinner /></div>
                    ) : memberships.length > 0 ? memberships.map(membership => {
                        if (!membership.customers) return null;
                        return (
                            <div key={membership.id} className="bg-white p-4 rounded-3xl border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-indigo-100 transition-all">
                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                    <img src={membership.customers.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="pfp" className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border shadow-sm" />
                                    <div className="min-w-0">
                                        <p className="font-bold text-slate-800 text-lg truncate">{membership.customers.name}</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{membership.customers.phone_number || 'No phone'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                                    <div className="text-center">
                                      <p className="font-black text-2xl text-indigo-600">{membership.points}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('points')}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleViewQr(membership.customers as Customer)} className="bg-slate-100 text-slate-600 font-bold py-2 px-5 rounded-2xl text-sm hover:bg-slate-200 transition-colors">View</button>
                                        <button onClick={() => membership.customers.id && handleRemoveCustomer(membership.customers.id)} className="bg-rose-50 text-rose-600 font-bold py-2 px-5 rounded-2xl text-sm hover:bg-rose-100 transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center p-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <p className="font-bold text-slate-400 uppercase tracking-widest">No customers found</p>
                        </div>
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
    const [formState, setFormState] = useState<Omit<Post, 'id' | 'business_id' | 'created_at'>>({ title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' });

    const fetchPosts = useCallback(async () => { setPosts(await getPostsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    useEffect(() => { if (editingPost) { setFormState(editingPost); } else { setFormState({ title: '', content: '', image_url: '', post_type: 'standard', video_url: '', price_text: '', external_url: '' }); } }, [editingPost]);

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleMarkdownChange = (name: string, value: string) => setFormState(prev => ({...prev, [name]: value}));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = editingPost ? await updatePost(editingPost.id, formState) : await createPost({ ...formState, business_id: business.id });
        if (result) { fetchPosts(); setEditingPost(null); }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 space-y-6">
                <SettingsCard title={editingPost ? "Edit Post" : "New Post"} description="Share updates or offers.">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                        <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                        <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                        <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="flex-grow bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all">{editingPost ? t('updatePost') : t('createPost')}</button>
                            {editingPost && <button type="button" onClick={() => setEditingPost(null)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"><TrashIcon/></button>}
                        </div>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Published Posts</h3>
                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? <p className="text-center py-12 text-slate-400 font-bold uppercase tracking-widest bg-slate-50 rounded-3xl border border-dashed border-slate-200">{t('noPosts')}</p> : posts.map(p => (
                        <div key={p.id} className="bg-slate-50 p-4 rounded-3xl flex items-center gap-6 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                            {p.image_url ? <img src={p.image_url} alt="p" className="w-24 h-24 rounded-2xl object-cover bg-white shadow-sm" /> : <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 font-black text-xl">QR</div>}
                            <div className="flex-grow min-w-0">
                                <p className="font-black text-slate-800 text-lg truncate mb-1">{p.title}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</p>
                                <div className="mt-3 flex gap-2">
                                    <button onClick={() => setEditingPost(p)} className="text-[10px] font-black uppercase tracking-widest bg-white py-1.5 px-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 transition-all">Edit</button>
                                    <button onClick={async () => { if(window.confirm('Delete?')){ await deletePost(p.id); fetchPosts(); } }} className="text-[10px] font-black uppercase tracking-widest bg-white py-1.5 px-3 rounded-lg border border-slate-200 hover:border-rose-500 hover:text-rose-600 transition-all">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const DiscountsManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [newDiscount, setNewDiscount] = useState({ name: '', description: '', image_url: '' });

    const fetchDiscounts = useCallback(async () => { setDiscounts(await getDiscountsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (await createDiscount({ ...newDiscount, business_id: business.id })) { fetchDiscounts(); setNewDiscount({ name: '', description: '', image_url: '' }); }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <SettingsCard title={t('newDiscount')} description="Create exclusive offers.">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <InputField label={t('discountName')} name="name" value={newDiscount.name} onChange={(e:any) => setNewDiscount({...newDiscount, name: e.target.value})} />
                        <TextAreaField label={t('description')} name="description" value={newDiscount.description || ''} onChange={(e:any) => setNewDiscount({...newDiscount, description: e.target.value})} />
                        <InputField label={t('imageUrl')} name="image_url" value={newDiscount.image_url || ''} onChange={(e:any) => setNewDiscount({...newDiscount, image_url: e.target.value})} />
                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all mt-4">{t('createDiscount')}</button>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-black text-slate-800 tracking-tight mb-6">Active Discounts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {discounts.length === 0 ? <p className="col-span-full text-center py-12 text-slate-400 font-bold uppercase tracking-widest bg-slate-50 rounded-3xl border border-dashed border-slate-200">No active discounts</p> : discounts.map(d => (
                        <div key={d.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full">
                                {d.image_url && <img src={d.image_url} alt="d" className="w-full h-32 rounded-2xl object-cover mb-4 bg-white shadow-sm" />}
                                <p className="font-black text-slate-800 text-xl leading-tight mb-2">{d.name}</p>
                                <p className="text-sm text-slate-500 font-medium mb-4 flex-grow">{d.description}</p>
                                <button onClick={async () => { if(window.confirm('Delete?')){ await deleteDiscount(d.id); fetchDiscounts(); } }} className="w-full py-2.5 bg-rose-50 text-rose-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


// UI & HELPER COMPONENTS

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-4 px-5 font-black text-xs uppercase tracking-widest transition-all relative ${isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
        {label}
        {isActive && <span className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full animate-in fade-in duration-300"></span>}
    </button>
);

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm h-full border border-slate-100 text-center flex flex-col justify-center">
        <p className="text-5xl font-black text-slate-800 tracking-tighter mb-2">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
    </div>
);

const QuickActionButton: React.FC<{ title: string; href?: string; onClick?: () => void; icon: React.ReactNode }> = ({ title, href, onClick, icon }) => {
    const content = (
        <div className="p-4 rounded-2xl flex items-center gap-4 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group active:scale-95">
            <div className="bg-white p-2.5 rounded-xl text-indigo-500 shadow-sm border border-slate-100 group-hover:bg-indigo-600 group-hover:text-white transition-all">{icon}</div>
            <p className="font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">{title}</p>
        </div>
    );
    return href ? <a href={href}>{content}</a> : <button onClick={onClick} className="w-full text-left">{content}</button>;
};

const AnalyticsAreaChartCard: React.FC<{ title: string, total: number | undefined, data: DailyAnalyticsData[], dataKey: keyof Omit<DailyAnalyticsData, 'log_date'>, color: string }> = ({ title, total, data, dataKey, color }) => {
    const width = 100; const height = 40;
    const values = data.map(d => d[dataKey] as number);
    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({ x: (i / (values.length - 1)) * width, y: height - (val / maxVal) * height }));
    
    const getSvgPath = (pts: {x:number, y:number}[]) => pts.length < 2 ? "" : `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((p, i) => { const prev = pts[i]; const cx = (prev.x + p.x) / 2; return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`; }).join(" ");
    const linePath = getSvgPath(points);
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm h-full border border-slate-100 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
              <p className="text-4xl font-black text-slate-800 tracking-tight">{total ?? '...'}</p>
            </div>
            <div className="mt-6 h-12">
                {points.length > 1 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs><linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
                        <path d={areaPath} fill={`url(#grad-${dataKey})`} />
                        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : <div className="h-full bg-slate-50 rounded-lg animate-pulse" />}
            </div>
        </div>
    );
};

const LoyaltySettingsEditor: React.FC<{business: Business, onUpdate: (b: Business) => void}> = ({ business, onUpdate }) => {
    const { t } = useLanguage();
    const [points, setPoints] = useState(business.points_per_scan || 1);
    const [threshold, setThreshold] = useState(business.reward_threshold || 5);
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => { setIsSaving(true); const updated = await updateBusiness(business.id, { points_per_scan: points, reward_threshold: threshold }); if (updated) onUpdate({...business, ...updated}); setIsSaving(false); };
    
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm h-full border border-slate-100 flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{t('loyaltyProgram')}</h3>
            <div className="space-y-6 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t('pointsPerScan')}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200">-</button>
                        <span className="text-2xl font-black text-slate-800 w-8 text-center">{points}</span>
                        <button onClick={() => setPoints(p => p + 1)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200">+</button>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{t('rewardThreshold')}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200">-</button>
                        <span className="text-2xl font-black text-slate-800 w-8 text-center">{threshold}</span>
                        <button onClick={() => setThreshold(t => t + 1)} className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 font-black hover:bg-slate-200">+</button>
                    </div>
                </div>
            </div>
            <button onClick={handleSave} disabled={isSaving || (points === business.points_per_scan && threshold === business.reward_threshold)} className="w-full mt-8 bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none shadow-lg shadow-indigo-100 transition-all active:scale-95">
                {isSaving ? '...' : t('save')}
            </button>
        </div>
    );
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6 h-full">
        <div><h2 className="text-xl font-black text-slate-800 tracking-tight">{title}</h2><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{description}</p></div>
        {children}
    </div>
);


export default BusinessPage;
