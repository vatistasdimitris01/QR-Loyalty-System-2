
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    
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

    const navItems = [
        { label: t('analytics'), icon: 'dashboard', id: 'analytics' as DashboardTab },
        { label: t('customerList'), icon: 'group', id: 'customers' as DashboardTab },
        { label: t('posts'), icon: 'campaign', id: 'posts' as DashboardTab },
        { label: t('discounts'), icon: 'sell', id: 'discounts' as DashboardTab },
    ];

    return (
        <div className="flex min-h-screen bg-[#f6f6f8] font-sans text-slate-900">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen transition-all duration-500 ease-in-out z-40 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                        <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                            <Logo className="size-10" />
                            <h2 className="text-xl font-black tracking-tighter">QROYAL</h2>
                        </div>
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}
                        >
                            <span className="material-symbols-outlined">{sidebarCollapsed ? 'menu_open' : 'menu'}</span>
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-2 flex-grow">
                        {navItems.map(item => (
                            <SidebarItem 
                                key={item.id}
                                label={item.label} 
                                icon={item.icon} 
                                isActive={activeTab === item.id} 
                                collapsed={sidebarCollapsed}
                                onClick={() => setActiveTab(item.id)} 
                            />
                        ))}
                        
                        <div className="mt-8 pt-8 border-t border-slate-50 flex flex-col gap-2">
                            <SidebarItem label={t('businessSettings')} icon="settings" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/editor'} />
                            <SidebarItem label={t('kioskMode')} icon="qr_code_scanner" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/scanner'} />
                        </div>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-50">
                        <div className={`flex items-center gap-3 mb-6 p-2 bg-slate-50 rounded-2xl transition-all overflow-hidden ${sidebarCollapsed ? 'justify-center p-1' : ''}`}>
                            <img src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} className={`rounded-xl object-cover transition-all ${sidebarCollapsed ? 'size-10' : 'size-12'}`} />
                            {!sidebarCollapsed && (
                                <div className="min-w-0">
                                    <p className="font-bold text-xs truncate">{business.public_name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Enterprise Plan</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleLogout} className={`flex items-center gap-4 w-full p-4 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <span className="material-symbols-outlined">logout</span>
                            {!sidebarCollapsed && <span>{t('logout')}</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Menu Slide-over */}
            <div className={`lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <aside className={`absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl transition-transform duration-500 ease-out p-8 flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <Logo className="size-10" />
                            <h2 className="text-xl font-black tracking-tighter">QROYAL</h2>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-400">
                             <span className="material-symbols-outlined text-[28px]">close</span>
                        </button>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {navItems.map(item => (
                            <SidebarItem 
                                key={item.id}
                                label={item.label} 
                                icon={item.icon} 
                                isActive={activeTab === item.id} 
                                onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} 
                            />
                        ))}
                    </nav>
                    <div className="mt-auto">
                        <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 rounded-2xl text-rose-600 font-bold bg-rose-50 mb-4">
                            <span className="material-symbols-outlined">logout</span>
                            <span>{t('logout')}</span>
                        </button>
                        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">v2.4 Enterprise</p>
                    </div>
                </aside>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col relative">
                <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200 px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 bg-slate-50 rounded-xl text-slate-400">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-2xl font-black tracking-tight hidden lg:block">{business.public_name}</h1>
                        <h1 className="text-xl font-black tracking-tight lg:hidden truncate max-w-[200px]">{business.public_name}</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            System Live
                        </div>
                        <button onClick={() => window.location.href='/business/scanner'} className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl shadow-slate-900/10 active:scale-95 transition-all">
                             <span className="material-symbols-outlined block">qr_code_scanner</span>
                        </button>
                    </div>
                </header>

                <main className="p-8 md:p-12 max-w-7xl w-full mx-auto">
                    {activeTab === 'analytics' && <AnalyticsDashboard business={business} onBusinessUpdate={handleBusinessUpdate} />}
                    {activeTab === 'customers' && <CustomersList business={business} />}
                    {activeTab === 'posts' && <PostsManager business={business} />}
                    {activeTab === 'discounts' && <DiscountsManager business={business} />}
                </main>
            </div>
        </div>
    );
};

const SidebarItem: React.FC<{ label: string, icon: string, isActive?: boolean, collapsed?: boolean, onClick: () => void }> = ({ label, icon, isActive, collapsed, onClick }) => (
    <button onClick={onClick} className={`group flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'} ${collapsed ? 'justify-center p-3' : ''}`}>
        <span className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isActive ? 'fill-1' : ''}`} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        {!collapsed && <span className="text-sm tracking-tight whitespace-nowrap">{label}</span>}
        {collapsed && <div className="absolute left-full ml-4 px-3 py-2 bg-slate-900 text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 font-bold z-50">{label}</div>}
    </button>
);

// TAB COMPONENTS (Analytics Dashboard Bento)

const AnalyticsDashboard: React.FC<{business: Business, onBusinessUpdate: (b: Business) => void}> = ({ business, onBusinessUpdate }) => {
    const { t } = useLanguage();
    const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
    const [dailyData, setDailyData] = useState<DailyAnalyticsData[]>([]);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    
    const fetchData = useCallback(async () => {
        const [analyticsData, dailyAnalyticsData] = await Promise.all([ getBusinessAnalytics(business.id), getDailyAnalytics(business.id) ]);
        setAnalytics(analyticsData); setDailyData(dailyAnalyticsData || []);
    }, [business.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <BusinessScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} businessId={business.id} onScanSuccess={(result: ScanResult) => { if (result.success) fetchData(); }} />
            
            <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Insights</h2>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest text-[10px]">Your performance in the last 7 days</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Regulars" value={analytics?.total_customers ?? '...'} />
                <StatCard title="New Members" value={analytics?.new_members_7d ?? '...'} highlight />
                <StatCard title="Points Distributed" value={analytics?.points_awarded_7d ?? '...'} />
                <StatCard title="Rewards Given" value={analytics?.rewards_claimed_7d ?? '...'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Customer Growth (7D)</h3>
                         <div className="h-64">
                            <AnalyticsAreaChart data={dailyData} dataKey="new_members_count" color="#135bec" />
                         </div>
                    </div>
                    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Points Distributed (7D)</h3>
                         <div className="h-64">
                            <AnalyticsAreaChart data={dailyData} dataKey="points_awarded_sum" color="#10b981" />
                         </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Management Gateway</h3>
                        <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-white shadow-inner mb-6">
                            <img src={business.qr_data_url} alt="QR" className="w-40 h-40 mx-auto rounded-xl shadow-lg border-2 border-white" />
                        </div>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed px-4">Direct staff to scan this code for terminal login.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; highlight?: boolean }> = ({ title, value, highlight }) => (
    <div className={`p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-center transition-all hover:shadow-xl group ${highlight ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-slate-900'}`}>
        <p className="text-4xl font-black tracking-tighter mb-1 transition-transform group-hover:scale-105 origin-left">{value}</p>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{title}</p>
    </div>
);

const AnalyticsAreaChart: React.FC<{ data: DailyAnalyticsData[], dataKey: keyof Omit<DailyAnalyticsData, 'log_date'>, color: string }> = ({ data, dataKey, color }) => {
    if (data.length === 0) return <div className="size-full bg-slate-50 rounded-3xl animate-pulse" />;
    const values = data.map(d => d[dataKey] as number);
    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({ x: (i / (values.length - 1)) * 100, y: 100 - (val / maxVal) * 80 }));
    
    const linePath = points.length < 2 ? "" : `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => { 
        const prev = points[i]; const cx = (prev.x + p.x) / 2; return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`; 
    }).join(" ");
    
    const areaPath = `${linePath} L 100 100 L 0 100 Z`;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs><linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
            <path d={areaPath} fill={`url(#grad-${dataKey})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="1.5" fill="white" stroke={color} strokeWidth="1" />
            ))}
        </svg>
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
        if (updated) onUpdate({...business, ...updated}); 
        setIsSaving(false); 
    };

    return (
        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-10">{t('loyaltyProgram')}</h3>
            <div className="space-y-10 mb-10">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('pointsPerScan')}</p>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="size-10 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all">-</button>
                        <span className="text-3xl font-black text-white w-10 text-center">{points}</span>
                        <button onClick={() => setPoints(p => p + 1)} className="size-10 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all">+</button>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('rewardThreshold')}</p>
                    <div className="flex items-center gap-5">
                        <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="size-10 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all">-</button>
                        <span className="text-3xl font-black text-white w-10 text-center">{threshold}</span>
                        <button onClick={() => setThreshold(t => t + 1)} className="size-10 rounded-2xl bg-white/5 text-white font-black hover:bg-white/10 transition-all">+</button>
                    </div>
                </div>
            </div>
            <button 
                onClick={handleSave} 
                disabled={isSaving || (points === business.points_per_scan && threshold === business.reward_threshold)} 
                className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/20 transition-all active:scale-95 shadow-xl shadow-primary/20"
            >
                {isSaving ? '...' : t('saveSettings')}
            </button>
        </div>
    );
};


// TAB COMPONENTS - CUSTOMERS LIST

const CustomersList: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loadingMemberships, setLoadingMemberships] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    
    const fetchMemberships = useCallback(async (businessId: string, search: string) => {
        setLoadingMemberships(true);
        const membershipsData = await searchMembershipsForBusiness(businessId, search);
        setMemberships(membershipsData);
        setLoadingMemberships(false);
    }, []);

    useEffect(() => { fetchMemberships(business.id, deferredSearchTerm); },[business.id, deferredSearchTerm, fetchMemberships]);
    
    const handleRemoveCustomer = async (customerId: string) => {
        if (window.confirm(t('removeConfirm'))) {
            const result = await removeMembership(customerId, business.id);
            if (result.success) fetchMemberships(business.id, searchTerm);
        }
    };
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CustomerQRModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} customer={selectedCustomer} />
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-50 pb-10">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{t('customerList')}</h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{memberships.length} ACTIVE PARTNERSHIPS</p>
                    </div>
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-slate-200 rounded-2xl bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium" />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-300">search</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {loadingMemberships ? (
                        <div className="col-span-full text-center p-20"><Spinner /></div>
                    ) : memberships.length > 0 ? memberships.map(membership => {
                        if (!membership.customers) return null;
                        return (
                            <div key={membership.id} className="bg-slate-50 p-8 rounded-[2.5rem] border border-transparent hover:bg-white hover:border-slate-100 transition-all hover:shadow-2xl group flex flex-col justify-between">
                                <div className="flex items-center gap-6 mb-8">
                                    <img src={membership.customers.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="pfp" className="w-16 h-16 rounded-[1.5rem] object-cover bg-slate-100 shadow-sm border-2 border-white" />
                                    <div className="min-w-0">
                                        <p className="font-black text-slate-800 text-xl tracking-tight truncate">{membership.customers.name}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{membership.customers.phone_number || 'NO CONTACT'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 mb-8">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity (PTS)</p>
                                    <p className="font-black text-3xl text-primary tracking-tighter">{membership.points}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { setSelectedCustomer(membership.customers as Customer); setIsQrModalOpen(true); }} className="flex-grow bg-white text-slate-600 font-bold py-3 rounded-xl text-xs uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm">Card</button>
                                    <button onClick={() => membership.customers.id && handleRemoveCustomer(membership.customers.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><TrashIcon/></button>
                                </div>
                            </div>
                        )
                    }) : (
                        <div className="col-span-full text-center p-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                          <p className="font-bold text-slate-300 uppercase tracking-[0.3em]">No records found</p>
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
                <SettingsCard title={editingPost ? "Edit Broadcast" : "New Broadcast"} description="Engage your regular audience.">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField label={t('title')} name="title" value={formState.title} onChange={handleFormChange} />
                        <SelectField label={t('postType')} name="post_type" value={formState.post_type} onChange={handleFormChange} options={[ {value: 'standard', label: t('standardPost')}, {value: 'discount', label: t('discountOffer')} ]} />
                        <MarkdownEditor label={t('content')} name="content" value={formState.content || ''} onChange={handleMarkdownChange} />
                        <InputField label={t('imageUrl')} name="image_url" value={formState.image_url || ''} onChange={handleFormChange} />
                        <div className="flex gap-3 pt-6">
                            <button type="submit" className="flex-grow bg-primary text-white font-black py-4 rounded-2xl hover:bg-blue-700 shadow-xl shadow-primary/30 active:scale-95 transition-all">{editingPost ? t('updatePost') : t('createPost')}</button>
                            {editingPost && <button type="button" onClick={() => setEditingPost(null)} className="p-4 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-colors"><TrashIcon/></button>}
                        </div>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10">Broadcast Archive</h3>
                <div className="space-y-6">
                    {posts.length === 0 ? <p className="text-center py-24 text-slate-300 font-bold uppercase tracking-[0.3em] bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">{t('noPosts')}</p> : posts.map(p => (
                        <div key={p.id} className="bg-slate-50 p-8 rounded-[2.5rem] flex items-center gap-10 border border-transparent hover:bg-white hover:shadow-2xl transition-all group">
                            {p.image_url ? <img src={p.image_url} alt="p" className="w-32 h-32 rounded-3xl object-cover bg-white shadow-md border-2 border-white" /> : <div className="w-32 h-32 rounded-3xl bg-white border border-slate-200 flex items-center justify-center text-slate-200 font-black text-3xl tracking-tighter">QR</div>}
                            <div className="flex-grow min-w-0">
                                <p className="font-black text-slate-800 text-2xl tracking-tight truncate mb-2">{p.title}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</p>
                                <div className="mt-6 flex gap-3">
                                    <button onClick={() => setEditingPost(p)} className="text-[10px] font-black uppercase tracking-widest bg-white py-3 px-8 rounded-xl border border-slate-200 hover:border-primary hover:text-primary transition-all shadow-sm">Modify</button>
                                    <button onClick={async () => { if(window.confirm('Delete?')){ await deletePost(p.id); fetchPosts(); } }} className="text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 py-3 px-8 rounded-xl hover:bg-rose-100 transition-all">Remove</button>
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
                <SettingsCard title={t('newDiscount')} description="Launch limited offers.">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <InputField label={t('discountName')} name="name" value={newDiscount.name} onChange={(e:any) => setNewDiscount({...newDiscount, name: e.target.value})} />
                        <TextAreaField label={t('description')} name="description" value={newDiscount.description || ''} onChange={(e:any) => setNewDiscount({...newDiscount, description: e.target.value})} />
                        <InputField label={t('imageUrl')} name="image_url" value={newDiscount.image_url || ''} onChange={(e:any) => setNewDiscount({...newDiscount, image_url: e.target.value})} />
                        <button type="submit" className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] hover:bg-blue-700 shadow-xl shadow-primary/30 active:scale-95 transition-all mt-6">{t('createDiscount')}</button>
                    </form>
                </SettingsCard>
            </div>
            <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-10">Active Campaign Vouchers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {discounts.length === 0 ? <p className="col-span-full text-center py-24 text-slate-300 font-bold uppercase tracking-[0.3em] bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">No active campaigns</p> : discounts.map(d => (
                        <div key={d.id} className="bg-slate-50 p-8 rounded-[3rem] border border-transparent hover:bg-white hover:shadow-2xl hover:border-slate-100 transition-all flex flex-col group">
                            {d.image_url && <img src={d.image_url} alt="d" className="w-full h-48 rounded-2xl object-cover mb-8 bg-white shadow-md border-2 border-white" />}
                            <div className="flex-grow">
                                <p className="font-black text-slate-900 text-2xl leading-tight mb-4">{d.name}</p>
                                <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">{d.description}</p>
                            </div>
                            <button onClick={async () => { if(window.confirm('Delete?')){ await deleteDiscount(d.id); fetchDiscounts(); } }} className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-100 transition-colors">Archive Offer</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
        <div><h2 className="text-2xl font-black text-slate-900 tracking-tighter">{title}</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{description}</p></div>
        {children}
    </div>
);


export default BusinessPage;
