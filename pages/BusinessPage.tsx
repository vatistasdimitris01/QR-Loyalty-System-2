
import React, { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Customer, Post, Discount, DailyAnalyticsData, BusinessAnalytics, ScanResult } from '../types';
import { 
    searchMembershipsForBusiness, removeMembership, getBusinessAnalytics, getDailyAnalytics,
    updateBusiness, getPostsForBusiness, createPost, updatePost, deletePost,
    getDiscountsForBusiness, createDiscount, deleteDiscount
} from '../services/api';
import { Spinner, CustomerQRModal, BusinessScannerModal, CameraIcon, QRScannerModal, PencilIcon, TrashIcon, MarkdownEditor, InputField, TextAreaField, SelectField, Logo } from '../components/common';

type DashboardTab = 'analytics' | 'customers' | 'posts' | 'discounts';

const ScreensaverIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);

const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
    
    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            setBusiness(JSON.parse(storedBusiness));
        } else { window.location.href = '/business/login'; }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn'); sessionStorage.removeItem('business'); window.location.href = '/';
    };
    
    const handleBusinessUpdate = (updatedBusiness: Business) => {
        setBusiness(updatedBusiness); sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
    }

    if (loading || !business) return <div className="flex justify-center items-center h-screen bg-slate-50"><Spinner /></div>;

    return (
        <div className="flex min-h-screen bg-[#f6f6f8] font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-slate-200 sticky top-0 h-screen p-8">
                <div className="flex items-center gap-3 mb-12">
                   <Logo className="size-10 text-primary" />
                    <h2 className="text-xl font-black tracking-tighter">QROYAL</h2>
                </div>
                
                <nav className="flex flex-col gap-2 flex-grow">
                    <SidebarItem label={t('analytics')} icon="dashboard" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
                    <SidebarItem label={t('customerList')} icon="group" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                    <SidebarItem label={t('posts')} icon="campaign" isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <SidebarItem label={t('discounts')} icon="sell" isActive={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                    
                    <div className="mt-8 pt-8 border-t border-slate-50">
                        <SidebarItem label={t('businessSettings')} icon="settings" onClick={() => window.location.href = '/business/editor'} />
                        <SidebarItem label={t('kioskMode')} icon="qr_code_scanner" onClick={() => window.location.href = '/business/scanner'} />
                    </div>
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-2xl">
                        <img src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} className="size-10 rounded-xl object-cover" />
                        <div className="min-w-0">
                            <p className="font-bold text-xs truncate">{business.public_name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Enterprise Plan</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full p-4 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 transition-all">
                        <span className="material-symbols-outlined">logout</span>
                        {t('logout')}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col">
                <header className="sticky top-0 z-10 bg-white/60 backdrop-blur-xl border-b border-slate-200 px-8 py-4 flex items-center justify-between lg:hidden">
                    <h1 className="text-xl font-black tracking-tight">{business.public_name}</h1>
                    <button onClick={handleLogout} className="p-2 text-rose-600"><span className="material-symbols-outlined">logout</span></button>
                </header>

                <main className="p-8 md:p-12 max-w-7xl">
                    {activeTab === 'analytics' && <AnalyticsDashboard business={business} onBusinessUpdate={handleBusinessUpdate} />}
                    {activeTab === 'customers' && <CustomersList business={business} />}
                    {activeTab === 'posts' && <PostsManager business={business} />}
                    {activeTab === 'discounts' && <DiscountsManager business={business} />}
                </main>
            </div>
        </div>
    );
};

const SidebarItem: React.FC<{ label: string, icon: string, isActive?: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}>
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-sm tracking-tight">{label}</span>
    </button>
);

// TAB COMPONENTS (Keeping existing functionality but enhancing aesthetic)

const AnalyticsDashboard: React.FC<{business: Business, onBusinessUpdate: (b: Business) => void}> = ({ business, onBusinessUpdate }) => {
    const { t } = useLanguage();
    const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
    const [dailyData, setDailyData] = useState<DailyAnalyticsData[]>([]);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    const componentKeys = { NEW_MEMBERS: 'newMembers', POINTS_AWARDED: 'pointsAwarded', TOTAL_CUSTOMERS: 'totalCustomers', LOYALTY_SETTINGS: 'loyaltySettings', QUICK_ACTIONS: 'quickActions', LOGIN_QR: 'loginQr' };
    const [componentOrder, setComponentOrder] = useState<string[]>(Object.values(componentKeys));
    const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set());

    const fetchData = useCallback(async () => {
        const [analyticsData, dailyAnalyticsData] = await Promise.all([ getBusinessAnalytics(business.id), getDailyAnalytics(business.id) ]);
        setAnalytics(analyticsData); setDailyData(dailyAnalyticsData || []);
    }, [business.id]);

    useEffect(() => { fetchData(); }, [fetchData]);
    
    const componentsMap: Record<string, React.ReactNode> = {
        [componentKeys.NEW_MEMBERS]: <AnalyticsAreaChartCard title="New Members" total={analytics?.new_members_7d} data={dailyData} dataKey="new_members_count" color="#135bec" />,
        [componentKeys.POINTS_AWARDED]: <AnalyticsAreaChartCard title="Points Awarded" total={analytics?.points_awarded_7d} data={dailyData} dataKey="points_awarded_sum" color="#10b981" />,
        [componentKeys.TOTAL_CUSTOMERS]: <StatCard title={t('totalCustomers')} value={analytics?.total_customers ?? '...'} />,
        [componentKeys.LOYALTY_SETTINGS]: <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />,
        [componentKeys.QUICK_ACTIONS]: (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm h-full border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                    <QuickActionButton title={t('scanCustomerQR')} onClick={() => setIsScannerModalOpen(true)} icon={<CameraIcon className="h-5 w-5"/>} />
                    <QuickActionButton title={t('kioskMode')} href="/business/scanner" icon={<ScreensaverIcon className="h-5 w-5" />} />
                </div>
            </div>
        ),
        [componentKeys.LOGIN_QR]: (
            <div className="bg-white p-8 rounded-[2rem] shadow-sm text-center h-full border border-slate-100">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Business Login QR</h3>
                <div className="bg-slate-50 p-4 rounded-[1.5rem] inline-block border shadow-inner">
                  <img src={business.qr_data_url} alt="Login QR" className="w-32 h-32 mx-auto rounded-lg" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-tighter">Scan to log in instantly</p>
            </div>
        )
    };
    
    const visibleComponents = componentOrder.filter(key => !hiddenComponents.has(key));

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BusinessScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} businessId={business.id} onScanSuccess={(result: ScanResult) => { if (result.success) fetchData(); }} />
            <div className="flex justify-between items-center mb-10">
                <div className="flex flex-col gap-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Overview</h2>
                    <p className="text-slate-400 text-sm font-medium">Real-time performance metrics for your loyalty program.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visibleComponents.map((key) => (
                    <div key={key} className="h-full">{componentsMap[key]}</div>
                ))}
            </div>
        </div>
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={selectedCustomer} />
            <QRScannerModal isOpen={isSearchScannerOpen} onClose={() => setIsSearchScannerOpen(false)} onScan={(s) => { setSearchTerm(s); setIsSearchScannerOpen(false); }} facingMode="user" />
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t('customerList')}</h2>
                        <p className="text-slate-400 text-sm font-medium">Manage your loyal regulars.</p>
                    </div>
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                        <button onClick={() => setIsSearchScannerOpen(true)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-indigo-400 hover:text-indigo-600 transition-colors"><CameraIcon className="h-6 w-6" /></button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                     {loadingMemberships ? (
                        <div className="text-center p-10"><Spinner /></div>
                    ) : memberships.length > 0 ? memberships.map(membership => {
                        if (!membership.customers) return null;
                        return (
                            <div key={membership.id} className="bg-slate-50 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white hover:border-indigo-100 border border-transparent transition-all hover:shadow-xl group">
                                <div className="flex items-center gap-6 w-full sm:w-auto">
                                    <img src={membership.customers.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="pfp" className="w-16 h-16 rounded-[1.25rem] object-cover bg-slate-100 border border-white shadow-sm" />
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 text-xl tracking-tight truncate">{membership.customers.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{membership.customers.phone_number || 'No phone'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto gap-12">
                                    <div className="text-center">
                                      <p className="font-black text-3xl text-primary tracking-tighter">{membership.points}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('points')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => handleViewQr(membership.customers as Customer)} className="bg-white text-slate-600 font-bold py-3 px-6 rounded-2xl text-sm border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">View Profile</button>
                                        <button onClick={() => membership.customers.id && handleRemoveCustomer(membership.customers.id)} className="bg-rose-50 text-rose-600 font-bold py-3 px-6 rounded-2xl text-sm hover:bg-rose-100 transition-colors">Remove</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="text-center p-16 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                          <p className="font-bold text-slate-400 uppercase tracking-[0.2em]">No customers found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1 space-y-6">
                <SettingsCard title={editingPost ? "Edit Post" : "New Post"} description="Share updates or offers.">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                        <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                        <div className="relative">
                            <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                        </div>
                        <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                        <div className="flex gap-3 pt-6">
                            <button type="submit" className="flex-grow bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-primary/30 active:scale-95 transition-all">{editingPost ? t('updatePost') : t('createPost')}</button>
                            {editingPost && <button type="button" onClick={() => setEditingPost(null)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"><TrashIcon/></button>}
                        </div>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8">Published Posts</h3>
                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? <p className="text-center py-20 text-slate-400 font-bold uppercase tracking-[0.2em] bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">{t('noPosts')}</p> : posts.map(p => (
                        <div key={p.id} className="bg-slate-50 p-6 rounded-[2rem] flex items-center gap-8 border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                            {p.image_url ? <img src={p.image_url} alt="p" className="w-28 h-28 rounded-2xl object-cover bg-white shadow-md" /> : <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 font-black text-2xl tracking-tighter">QR</div>}
                            <div className="flex-grow min-w-0">
                                <p className="font-black text-slate-800 text-2xl tracking-tight truncate mb-1">{p.title}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</p>
                                <div className="mt-4 flex gap-3">
                                    <button onClick={() => setEditingPost(p)} className="text-[10px] font-black uppercase tracking-widest bg-white py-2 px-5 rounded-xl border border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm">Edit Content</button>
                                    <button onClick={async () => { if(window.confirm('Delete?')){ await deletePost(p.id); fetchPosts(); } }} className="text-[10px] font-black uppercase tracking-widest bg-white py-2 px-5 rounded-xl border border-slate-200 hover:border-rose-500 hover:text-rose-600 transition-all shadow-sm">Delete</button>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-1">
                <SettingsCard title={t('newDiscount')} description="Create exclusive offers.">
                    <form onSubmit={handleCreate} className="space-y-5">
                        <InputField label={t('discountName')} name="name" value={newDiscount.name} onChange={(e:any) => setNewDiscount({...newDiscount, name: e.target.value})} />
                        <TextAreaField label={t('description')} name="description" value={newDiscount.description || ''} onChange={(e:any) => setNewDiscount({...newDiscount, description: e.target.value})} />
                        <InputField label={t('imageUrl')} name="image_url" value={newDiscount.image_url || ''} onChange={(e:any) => setNewDiscount({...newDiscount, image_url: e.target.value})} />
                        <button type="submit" className="w-full bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-primary/30 active:scale-95 transition-all mt-4">{t('createDiscount')}</button>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-8">Active Discounts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {discounts.length === 0 ? <p className="col-span-full text-center py-20 text-slate-400 font-bold uppercase tracking-[0.2em] bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">No active discounts</p> : discounts.map(d => (
                        <div key={d.id} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group relative overflow-hidden">
                            <div className="relative z-10 flex flex-col h-full">
                                {d.image_url && <img src={d.image_url} alt="d" className="w-full h-40 rounded-2xl object-cover mb-6 bg-white shadow-md" />}
                                <p className="font-black text-slate-900 text-2xl leading-tight mb-3">{d.name}</p>
                                <p className="text-sm text-slate-500 font-medium mb-6 flex-grow">{d.description}</p>
                                <button onClick={async () => { if(window.confirm('Delete?')){ await deleteDiscount(d.id); fetchDiscounts(); } }} className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">Remove Offer</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};


// UI & HELPER COMPONENTS

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-10 rounded-[2rem] shadow-sm h-full border border-slate-100 text-center flex flex-col justify-center">
        <p className="text-6xl font-black text-slate-900 tracking-tighter mb-2">{value}</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
    </div>
);

const QuickActionButton: React.FC<{ title: string; href?: string; onClick?: () => void; icon: React.ReactNode }> = ({ title, href, onClick, icon }) => {
    const content = (
        <div className="p-5 rounded-2xl flex items-center gap-5 bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all cursor-pointer group active:scale-95">
            <div className="bg-white p-3 rounded-xl text-primary shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">{icon}</div>
            <p className="font-black text-slate-800 tracking-tight group-hover:text-primary transition-colors">{title}</p>
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
        <div className="bg-white p-10 rounded-[2rem] shadow-sm h-full border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</h3>
              <p className="text-5xl font-black text-slate-900 tracking-tighter">{total ?? '...'}</p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity">
                {points.length > 1 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs><linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.4"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
                        <path d={areaPath} fill={`url(#grad-${dataKey})`} />
                        <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
    const [rewardMessage, setRewardMessage] = useState(business.reward_message || '');
    const [isSaving, setIsSaving] = useState(false);
    
    const handleSave = async () => { 
        setIsSaving(true); 
        const updated = await updateBusiness(business.id, { 
            points_per_scan: points, 
            reward_threshold: threshold,
            reward_message: rewardMessage
        }); 
        if (updated) onUpdate({...business, ...updated}); 
        setIsSaving(false); 
    };

    return (
        <div className="bg-white p-10 rounded-[2rem] shadow-sm h-full border border-slate-100 flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">{t('loyaltyProgram')}</h3>
            <div className="space-y-8 flex-grow flex flex-col justify-center">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('pointsPerScan')}</p>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="size-10 rounded-2xl bg-slate-100 text-slate-800 font-black hover:bg-slate-200 transition-all">-</button>
                        <span className="text-3xl font-black text-slate-900 w-10 text-center">{points}</span>
                        <button onClick={() => setPoints(p => p + 1)} className="size-10 rounded-2xl bg-slate-100 text-slate-800 font-black hover:bg-slate-200 transition-all">+</button>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest">{t('rewardThreshold')}</p>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="size-10 rounded-2xl bg-slate-100 text-slate-800 font-black hover:bg-slate-200 transition-all">-</button>
                        <span className="text-3xl font-black text-slate-900 w-10 text-center">{threshold}</span>
                        <button onClick={() => setThreshold(t => t + 1)} className="size-10 rounded-2xl bg-slate-100 text-slate-800 font-black hover:bg-slate-200 transition-all">+</button>
                    </div>
                </div>
                <InputField label={t('rewardMessage')} name="reward_message" value={rewardMessage} onChange={(e: any) => setRewardMessage(e.target.value)} placeholder={t('rewardMessagePlaceholder')} />
            </div>
            <button 
                onClick={handleSave} 
                disabled={isSaving || (points === business.points_per_scan && threshold === business.reward_threshold && rewardMessage === business.reward_message)} 
                className="w-full mt-10 bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none shadow-xl shadow-primary/30 transition-all active:scale-95"
            >
                {isSaving ? '...' : t('saveSettings')}
            </button>
        </div>
    );
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8 h-full">
        <div><h2 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p></div>
        {children}
    </div>
);


export default BusinessPage;
