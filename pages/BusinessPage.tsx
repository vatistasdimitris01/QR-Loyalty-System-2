
import React, { useState, useEffect, useCallback, useDeferredValue } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Post, Discount, DailyAnalyticsData, BusinessAnalytics } from '../types';
import { 
    searchMembershipsForBusiness, getBusinessAnalytics, getDailyAnalytics,
    updateBusiness, getPostsForBusiness, deletePost,
    getDiscountsForBusiness, deleteDiscount
} from '../services/api';
import { Spinner, Logo } from '../components/common';

type DashboardTab = 'analytics' | 'customers' | 'posts' | 'discounts';

const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    
    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) setBusiness(JSON.parse(storedBusiness));
        else window.location.href = '/business/login';
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
            {/* Desktop Sidebar - High-end Forest Green */}
            <aside className={`hidden lg:flex flex-col bg-[#0d1b12] sticky top-0 h-screen transition-all duration-500 z-40 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-12">
                        <div className={`flex items-center gap-3 transition-opacity duration-300 ${sidebarCollapsed ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}>
                            <Logo className="size-10 bg-[#2bee6c] text-[#0d1b12]" />
                            <h2 className="text-xl font-black tracking-tighter text-white">QROYAL</h2>
                        </div>
                        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-[#4c9a66] hover:text-white transition-colors">
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
                        
                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col gap-2">
                            <SidebarItem label={t('businessSettings')} icon="settings" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/editor'} />
                            <SidebarItem label={t('kioskMode')} icon="qr_code_scanner" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/scanner'} />
                        </div>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/10">
                        <button onClick={handleLogout} className={`flex items-center gap-4 w-full p-4 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <span className="material-symbols-outlined">logout</span>
                            {!sidebarCollapsed && <span>{t('logout')}</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow flex flex-col">
                <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-[#e7f3eb] px-12 py-8 flex items-center justify-between">
                    <h1 className="text-3xl font-black tracking-tight text-[#0d1b12]">{business.public_name} Hub</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-[#e7f3eb] text-[#4c9a66] rounded-full text-xs font-black uppercase tracking-widest border border-[#cfe7d7]">
                            <div className="size-2 bg-[#2bee6c] rounded-full"></div>
                            System Live
                        </div>
                        <button onClick={() => window.location.href='/business/scanner'} className="bg-[#2bee6c] text-[#0d1b12] p-4 rounded-2xl active:scale-95 transition-all shadow-sm">
                             <span className="material-symbols-outlined block">qr_code_scanner</span>
                        </button>
                    </div>
                </header>

                <main className="p-12 max-w-7xl w-full mx-auto animate-in fade-in duration-700">
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
    <button onClick={onClick} className={`group flex items-center gap-4 w-full p-4 rounded-2xl font-black transition-all ${isActive ? 'bg-[#2bee6c] text-[#0d1b12]' : 'text-[#4c9a66] hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center p-3' : ''}`}>
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
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Members" value={analytics?.total_customers ?? '...'} />
                <StatCard title="7D New Intake" value={analytics?.new_members_7d ?? '...'} highlight />
                <StatCard title="Points Out (7D)" value={analytics?.points_awarded_7d ?? '...'} />
                <StatCard title="Voucher Claims" value={analytics?.rewards_claimed_7d ?? '...'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-[#e7f3eb]">
                     <h3 className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest mb-10">Membership Growth Curve</h3>
                     <div className="h-72">
                        <SimpleAreaChart data={dailyData} color="#2bee6c" />
                     </div>
                </div>
                <div className="bg-[#0d1b12] text-[#2bee6c] p-10 rounded-[2.5rem] flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-[#2bee6c]/40 uppercase tracking-widest mb-10">Loyalty Settings</h3>
                    <LoyaltySettingsInline business={business} onUpdate={onBusinessUpdate} />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; highlight?: boolean }> = ({ title, value, highlight }) => (
    <div className={`p-10 rounded-[2.5rem] border border-[#e7f3eb] transition-all hover:bg-white group ${highlight ? 'bg-[#0d1b12] text-[#2bee6c]' : 'bg-white text-[#0d1b12]'}`}>
        <p className="text-5xl font-black tracking-tighter mb-1">{value}</p>
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${highlight ? 'text-[#2bee6c]/60' : 'text-[#4c9a66]'}`}>{title}</p>
    </div>
);

const SimpleAreaChart: React.FC<{ data: DailyAnalyticsData[], color: string }> = ({ data, color }) => {
    if (data.length === 0) return <div className="size-full flex items-center justify-center"><Spinner className="text-[#2bee6c]/20"/></div>;
    const values = data.map(d => d.new_members_count);
    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({ x: (i / (values.length - 1)) * 100, y: 100 - (val / maxVal) * 80 }));
    const linePath = points.length < 2 ? "" : `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => { 
        const prev = points[i]; const cx = (prev.x + p.x) / 2; return `L ${p.x} ${p.y}`; 
    }).join(" ");
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <path d={`${linePath} L 100 100 L 0 100 Z`} fill={color} fillOpacity="0.1" />
            <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
};

const LoyaltySettingsInline: React.FC<{business: Business, onUpdate: (b: Business) => void}> = ({ business, onUpdate }) => {
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
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{t('pointsPerScan')}</p>
                <div className="flex items-center gap-4">
                    <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="size-8 rounded-lg bg-white/5 text-[#2bee6c] hover:bg-white/10">-</button>
                    <span className="text-xl font-black w-6 text-center">{points}</span>
                    <button onClick={() => setPoints(p => p + 1)} className="size-8 rounded-lg bg-white/5 text-[#2bee6c] hover:bg-white/10">+</button>
                </div>
            </div>
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-widest">{t('rewardThreshold')}</p>
                <div className="flex items-center gap-4">
                    <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="size-8 rounded-lg bg-white/5 text-[#2bee6c] hover:bg-white/10">-</button>
                    <span className="text-xl font-black w-6 text-center">{threshold}</span>
                    <button onClick={() => setThreshold(t => t + 1)} className="size-8 rounded-lg bg-white/5 text-[#2bee6c] hover:bg-white/10">+</button>
                </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black py-4 rounded-2xl shadow-xl shadow-[#2bee6c]/10 active:scale-95 mt-4">
                {isSaving ? 'Saving...' : 'Update Rules'}
            </button>
        </div>
    );
};

const CustomersList: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const deferredSearch = useDeferredValue(searchTerm);
    
    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            setMemberships(await searchMembershipsForBusiness(business.id, deferredSearch));
            setLoading(false);
        };
        fetch();
    }, [business.id, deferredSearch]);
    
    return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-[#e7f3eb] space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-[#0d1b12]">Directory</h2>
                    <p className="text-[10px] font-black text-[#4c9a66] uppercase tracking-[0.4em] mt-1">{memberships.length} Total Members</p>
                </div>
                <div className="relative w-full md:w-1/2">
                    <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-[#e7f3eb] rounded-[1.5rem] bg-[#f8fcf9] focus:ring-[#2bee6c] focus:border-[#2bee6c] font-medium" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {loading ? <div className="col-span-full py-20 text-center"><Spinner className="text-[#2bee6c]"/></div> : memberships.map(m => (
                    <div key={m.id} className="bg-[#f8fcf9] p-8 rounded-[2.5rem] border border-transparent hover:border-[#cfe7d7] transition-all">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-full bg-[#e7f3eb] flex items-center justify-center font-black text-[#4c9a66]">{m.customers.name?.charAt(0)}</div>
                            <div className="min-w-0">
                                <p className="font-black text-[#0d1b12] text-lg truncate">{m.customers.name}</p>
                                <p className="text-[10px] font-bold text-[#4c9a66] tracking-widest">{m.customers.phone_number || 'STITCH ID'}</p>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[9px] font-black text-[#4c9a66] uppercase tracking-widest mb-1">Total Points</p>
                                <p className="text-4xl font-black text-[#0d1b12] tracking-tighter">{m.points}</p>
                            </div>
                            <button className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[#4c9a66] hover:text-[#0d1b12] transition-colors">Details</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const PostsManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const fetch = useCallback(async () => { setPosts(await getPostsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetch(); }, [fetch]);
    return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-[#e7f3eb]">
            <h3 className="text-4xl font-black tracking-tight mb-10">Broadcast Archive</h3>
            <div className="space-y-4">
                {posts.length === 0 ? <p className="text-center py-20 text-[#4c9a66] font-bold uppercase tracking-widest opacity-30">No active broadcasts</p> : posts.map(p => (
                    <div key={p.id} className="bg-[#f8fcf9] p-6 rounded-[2rem] flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            {p.image_url ? <img src={p.image_url} className="size-16 rounded-2xl object-cover" /> : <div className="size-16 rounded-2xl bg-[#e7f3eb]"></div>}
                            <div>
                                <p className="font-black text-xl text-[#0d1b12]">{p.title}</p>
                                <p className="text-[10px] font-bold text-[#4c9a66] tracking-widest">{new Date(p.created_at).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <button onClick={async () => { if(window.confirm('Delete?')){ await deletePost(p.id); fetch(); } }} className="text-rose-400 hover:text-rose-600 transition-colors material-symbols-outlined">delete</button>
                    </div>
                ))}
            </div>
        </div>
    )
};

const DiscountsManager: React.FC<{business: Business}> = ({ business }) => {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const fetch = useCallback(async () => { setDiscounts(await getDiscountsForBusiness(business.id)); }, [business.id]);
    useEffect(() => { fetch(); }, [fetch]);
    return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-[#e7f3eb]">
            <h3 className="text-4xl font-black tracking-tight mb-10">Active Vouchers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {discounts.length === 0 ? <p className="col-span-full text-center py-20 text-[#4c9a66] font-bold uppercase tracking-widest opacity-30">No active vouchers</p> : discounts.map(d => (
                    <div key={d.id} className="bg-[#f8fcf9] p-8 rounded-[2.5rem] border border-transparent hover:border-[#cfe7d7] transition-all">
                        <p className="font-black text-2xl text-[#0d1b12] mb-2">{d.name}</p>
                        <p className="text-sm text-[#4c9a66] font-medium mb-8 leading-relaxed truncate">{d.description}</p>
                        <button onClick={async () => { if(window.confirm('Archive?')){ await deleteDiscount(d.id); fetch(); } }} className="w-full py-4 text-[#4c9a66] font-black text-[10px] uppercase tracking-widest bg-forest/5 rounded-xl hover:bg-forest/10">Archive Voucher</button>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default BusinessPage;
