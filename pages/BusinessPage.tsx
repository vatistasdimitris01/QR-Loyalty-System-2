
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

    if (loading || !business) return <div className="flex justify-center items-center h-screen bg-[#f8fcf9]"><Spinner className="text-[#2bee6c]" /></div>;

    const navItems = [
        { label: t('analytics'), icon: 'dashboard', id: 'analytics' as DashboardTab },
        { label: t('customerList'), icon: 'group', id: 'customers' as DashboardTab },
        { label: t('posts'), icon: 'campaign', id: 'posts' as DashboardTab },
        { label: t('discounts'), icon: 'sell', id: 'discounts' as DashboardTab },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8fcf9] font-sans text-[#0d1b12]">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white border-r border-[#e7f3eb] sticky top-0 h-screen transition-all duration-500 ease-in-out z-40 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                        <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                            <Logo className="size-10 bg-[#0d1b12] text-[#2bee6c]" />
                            <h2 className="text-xl font-black tracking-tighter text-[#0d1b12]">QROYAL</h2>
                        </div>
                        <button 
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            className={`p-2 hover:bg-[#e7f3eb] rounded-xl text-[#4c9a66] transition-all ${sidebarCollapsed ? 'mx-auto' : ''}`}
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
                        
                        <div className="mt-8 pt-8 border-t border-[#e7f3eb] flex flex-col gap-2">
                            <SidebarItem label={t('businessSettings')} icon="settings" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/editor'} />
                            <SidebarItem label={t('kioskMode')} icon="qr_code_scanner" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/scanner'} />
                        </div>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-[#e7f3eb]">
                        <button onClick={handleLogout} className={`flex items-center gap-4 w-full p-4 rounded-2xl text-rose-600 font-bold hover:bg-rose-50 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <span className="material-symbols-outlined">logout</span>
                            {!sidebarCollapsed && <span>{t('logout')}</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col relative">
                <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-[#e7f3eb] px-8 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 bg-[#e7f3eb] rounded-xl text-[#4c9a66]">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                        <h1 className="text-2xl font-black tracking-tight text-[#0d1b12]">{business.public_name} Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-50 text-[#4c9a66] rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
                            <div className="size-2 bg-[#2bee6c] rounded-full animate-pulse"></div>
                            System Online
                        </div>
                        <button onClick={() => window.location.href='/business/scanner'} className="bg-[#0d1b12] text-[#2bee6c] p-3 rounded-2xl shadow-xl active:scale-95 transition-all">
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
    <button onClick={onClick} className={`group flex items-center gap-4 w-full p-4 rounded-2xl font-black transition-all ${isActive ? 'bg-[#0d1b12] text-[#2bee6c] shadow-2xl' : 'text-[#4c9a66] hover:text-[#0d1b12] hover:bg-[#e7f3eb]'} ${collapsed ? 'justify-center p-3' : ''}`}>
        <span className="material-symbols-outlined transition-transform group-hover:scale-110" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
        {!collapsed && <span className="text-sm tracking-tight whitespace-nowrap">{label}</span>}
    </button>
);

const AnalyticsDashboard: React.FC<{business: Business, onBusinessUpdate: (b: Business) => void}> = ({ business, onBusinessUpdate }) => {
    const [analytics, setAnalytics] = useState<BusinessAnalytics | null>(null);
    const [dailyData, setDailyData] = useState<DailyAnalyticsData[]>([]);
    
    const fetchData = useCallback(async () => {
        const [analyticsData, dailyAnalyticsData] = await Promise.all([ getBusinessAnalytics(business.id), getDailyAnalytics(business.id) ]);
        setAnalytics(analyticsData); setDailyData(dailyAnalyticsData || []);
    }, [business.id]);

    useEffect(() => { fetchData(); }, [fetchData]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-10">
                <h2 className="text-4xl font-black text-[#0d1b12] tracking-tighter">Growth</h2>
                <p className="text-[#4c9a66] text-[10px] font-black uppercase tracking-[0.4em] mt-1">Stitch Insight Hub</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard title="Active Members" value={analytics?.total_customers ?? '...'} />
                <StatCard title="7D Intake" value={analytics?.new_members_7d ?? '...'} highlight />
                <StatCard title="Points Out" value={analytics?.points_awarded_7d ?? '...'} />
                <StatCard title="Claims" value={analytics?.rewards_claimed_7d ?? '...'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white p-10 rounded-[2.5rem] border border-[#e7f3eb] shadow-sm">
                         <h3 className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest mb-10">Retention Curve</h3>
                         <div className="h-64">
                            <AnalyticsAreaChart data={dailyData} dataKey="new_members_count" color="#2bee6c" />
                         </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; highlight?: boolean }> = ({ title, value, highlight }) => (
    <div className={`p-8 rounded-[2.5rem] border border-[#e7f3eb] shadow-sm transition-all hover:shadow-xl group ${highlight ? 'bg-[#0d1b12] text-[#2bee6c]' : 'bg-white text-[#0d1b12]'}`}>
        <p className="text-4xl font-black tracking-tighter mb-1">{value}</p>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-[#2bee6c]/60' : 'text-[#4c9a66]'}`}>{title}</p>
    </div>
);

const AnalyticsAreaChart: React.FC<{ data: DailyAnalyticsData[], dataKey: keyof Omit<DailyAnalyticsData, 'log_date'>, color: string }> = ({ data, dataKey, color }) => {
    if (data.length === 0) return <div className="size-full bg-[#f8fcf9] rounded-[2.5rem] animate-pulse" />;
    const values = data.map(d => d[dataKey] as number);
    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({ x: (i / (values.length - 1)) * 100, y: 100 - (val / maxVal) * 80 }));
    const linePath = points.length < 2 ? "" : `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => { 
        const prev = points[i]; const cx = (prev.x + p.x) / 2; return `C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`; 
    }).join(" ");
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <defs><linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity="0.3"/><stop offset="100%" stopColor={color} stopOpacity="0"/></linearGradient></defs>
            <path d={`${linePath} L 100 100 L 0 100 Z`} fill={`url(#grad-${dataKey})`} />
            <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="bg-[#0d1b12] text-[#2bee6c] p-10 rounded-[3rem] shadow-2xl flex flex-col justify-between">
            <h3 className="text-[10px] font-black text-[#2bee6c]/40 uppercase tracking-widest mb-10">Program Core</h3>
            <div className="space-y-10 mb-10">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{t('pointsPerScan')}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="size-10 rounded-xl bg-white/5 text-[#2bee6c] font-black hover:bg-white/10">-</button>
                        <span className="text-2xl font-black w-8 text-center">{points}</span>
                        <button onClick={() => setPoints(p => p + 1)} className="size-10 rounded-xl bg-white/5 text-[#2bee6c] font-black hover:bg-white/10">+</button>
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{t('rewardThreshold')}</p>
                    <div className="flex items-center gap-4">
                        <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="size-10 rounded-xl bg-white/5 text-[#2bee6c] font-black hover:bg-white/10">-</button>
                        <span className="text-2xl font-black w-8 text-center">{threshold}</span>
                        <button onClick={() => setThreshold(t => t + 1)} className="size-10 rounded-xl bg-white/5 text-[#2bee6c] font-black hover:bg-white/10">+</button>
                    </div>
                </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black py-5 rounded-[1.5rem] shadow-xl shadow-green-500/20 transition-all hover:scale-[1.02] active:scale-95">
                {isSaving ? 'Saving...' : 'Lock Rules'}
            </button>
        </div>
    );
};

const CustomersList: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loadingMemberships, setLoadingMemberships] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearchTerm = useDeferredValue(searchTerm);
    
    const fetchMemberships = useCallback(async (businessId: string, search: string) => {
        setLoadingMemberships(true);
        const membershipsData = await searchMembershipsForBusiness(businessId, search);
        setMemberships(membershipsData);
        setLoadingMemberships(false);
    }, []);

    useEffect(() => { fetchMemberships(business.id, deferredSearchTerm); },[business.id, deferredSearchTerm, fetchMemberships]);
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#e7f3eb] space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-[#f8fcf9] pb-10">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-[#0d1b12] tracking-tighter">Directory</h2>
                        <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.4em]">{memberships.length} ACTIVE MEMBERS</p>
                    </div>
                    <div className="relative w-full md:w-1/2">
                        <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-[#e7f3eb] rounded-2xl bg-[#f8fcf9] focus:ring-[#2bee6c] focus:border-[#2bee6c] transition-all font-medium text-[#0d1b12]" />
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-[#4c9a66]/40">search</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                     {loadingMemberships ? (
                        <div className="col-span-full text-center p-20"><Spinner className="text-[#2bee6c]"/></div>
                    ) : memberships.length > 0 ? memberships.map(membership => (
                        <div key={membership.id} className="bg-[#f8fcf9] p-8 rounded-[2.5rem] border border-[#e7f3eb] hover:bg-white hover:shadow-2xl transition-all group">
                            <div className="flex items-center gap-6 mb-8">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-[#e7f3eb] border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                                  <span className="material-symbols-outlined text-[#4c9a66]">person</span>
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-[#0d1b12] text-xl tracking-tight truncate">{membership.customers.name}</p>
                                    <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{membership.customers.phone_number || 'NO CONTACT'}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#e7f3eb] mb-8">
                                <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">Points</p>
                                <p className="font-black text-3xl text-[#0d1b12] tracking-tighter">{membership.points}</p>
                            </div>
                            <button className="w-full bg-white text-[#0d1b12] font-black py-3 rounded-xl text-xs uppercase tracking-widest border border-[#e7f3eb] hover:bg-[#2bee6c] hover:border-[#2bee6c] transition-all shadow-sm">Review Member</button>
                        </div>
                    )) : (
                        <div className="col-span-full text-center p-24 bg-[#f8fcf9] rounded-[3rem] border-2 border-dashed border-[#e7f3eb]">
                          <p className="font-bold text-[#4c9a66] uppercase tracking-[0.4em] opacity-40">No records found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const PostsManager: React.FC<{business: Business}> = ({ business }) => {
    // FIX: Add t translation helper using useLanguage hook.
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const fetchPosts = useCallback(async () => { setPosts(await getPostsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetchPosts(); }, [fetchPosts]);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#e7f3eb]">
                <h3 className="text-2xl font-black text-[#0d1b12] tracking-tighter mb-10">Broadcast Archive</h3>
                <div className="space-y-6">
                    {posts.length === 0 ? <p className="text-center py-24 text-[#4c9a66] font-bold uppercase tracking-[0.3em] bg-[#f8fcf9] rounded-[3rem] border border-dashed border-[#e7f3eb]">{t('noPosts')}</p> : posts.map(p => (
                        <div key={p.id} className="bg-[#f8fcf9] p-8 rounded-[2.5rem] flex items-center gap-10 border border-transparent hover:bg-white hover:shadow-2xl transition-all group">
                            {p.image_url ? <img src={p.image_url} alt="p" className="w-32 h-32 rounded-3xl object-cover bg-white shadow-md border-2 border-white" /> : <div className="w-32 h-32 rounded-3xl bg-white border border-[#e7f3eb] flex items-center justify-center text-[#e7f3eb] font-black text-3xl tracking-tighter">QR</div>}
                            <div className="flex-grow min-w-0">
                                <p className="font-black text-[#0d1b12] text-2xl tracking-tight truncate mb-2">{p.title}</p>
                                <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{new Date(p.created_at).toLocaleDateString()}</p>
                                <div className="mt-6 flex gap-3">
                                    <button className="text-[10px] font-black uppercase tracking-widest bg-white py-3 px-8 rounded-xl border border-[#e7f3eb] hover:border-[#2bee6c] hover:text-[#0d1b12] transition-all">Modify</button>
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
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const fetchDiscounts = useCallback(async () => { setDiscounts(await getDiscountsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetchDiscounts(); }, [fetchDiscounts]);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-[#e7f3eb]">
                <h3 className="text-2xl font-black text-[#0d1b12] tracking-tighter mb-10">Active Vouchers</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {discounts.length === 0 ? <p className="col-span-full text-center py-24 text-[#4c9a66] font-bold uppercase tracking-[0.3em] bg-[#f8fcf9] rounded-[3rem] border border-dashed border-[#e7f3eb]">No active vouchers</p> : discounts.map(d => (
                        <div key={d.id} className="bg-[#f8fcf9] p-8 rounded-[3rem] border border-transparent hover:bg-white hover:shadow-2xl hover:border-[#e7f3eb] transition-all flex flex-col group">
                            {d.image_url && <img src={d.image_url} alt="d" className="w-full h-48 rounded-2xl object-cover mb-8 bg-white shadow-md border-2 border-white" />}
                            <div className="flex-grow">
                                <p className="font-black text-[#0d1b12] text-2xl leading-tight mb-4">{d.name}</p>
                                <p className="text-sm text-[#4c9a66] font-medium mb-8 leading-relaxed truncate">{d.description}</p>
                            </div>
                            <button onClick={async () => { if(window.confirm('Delete?')){ await deleteDiscount(d.id); fetchDiscounts(); } }} className="w-full py-4 bg-white text-[#0d1b12] rounded-2xl font-black text-xs uppercase tracking-widest border border-[#e7f3eb] hover:bg-[#2bee6c] hover:border-[#2bee6c] transition-colors">Archive</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

export default BusinessPage;
