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

    if (loading || !business) return (
        <div className="flex justify-center items-center h-screen bg-[#f8fcf9]">
            <div className="text-center space-y-4">
                <Spinner className="size-12 text-[#2bee6c]" />
                <p className="text-[#0d1b12] font-display font-bold tracking-tight">Initializing Portal...</p>
            </div>
        </div>
    );

    const navItems = [
        { label: t('analytics'), icon: 'dashboard', id: 'analytics' as DashboardTab },
        { label: t('customerList'), icon: 'group', id: 'customers' as DashboardTab },
        { label: t('posts'), icon: 'campaign', id: 'posts' as DashboardTab },
        { label: t('discounts'), icon: 'local_offer', id: 'discounts' as DashboardTab },
    ];

    return (
        <div className="flex min-h-screen bg-[#f8fcf9] font-sans text-[#0d1b12]">
            {/* Desktop Sidebar - High-end Forest Green */}
            <aside className={`hidden lg:flex flex-col bg-[#0b110d] sticky top-0 h-screen transition-all duration-500 z-40 border-r border-white/5 ${sidebarCollapsed ? 'w-24' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 bg-[#2bee6c] rounded-xl flex items-center justify-center text-black shadow-sm transition-transform hover:scale-105">
                            <span className="material-icons-round">loyalty</span>
                        </div>
                        {!sidebarCollapsed && <span className="text-xl font-bold font-display tracking-tight text-white">QROYAL</span>}
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
                        
                        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-2">
                            <SidebarItem label={t('businessSettings')} icon="settings" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/editor'} />
                            <SidebarItem label={t('kioskMode')} icon="qr_code_scanner" collapsed={sidebarCollapsed} onClick={() => window.location.href = '/business/scanner'} />
                        </div>
                    </nav>

                    <div className="mt-auto pt-6 border-t border-white/5">
                        <button onClick={handleLogout} className={`flex items-center gap-4 w-full p-4 rounded-2xl text-rose-400 font-bold hover:bg-rose-500/10 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                            <span className="material-icons-round">logout</span>
                            {!sidebarCollapsed && <span>{t('logout')}</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-grow flex flex-col">
                <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200 px-12 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-2xl font-bold font-display tracking-tight text-[#0d1b12]">{business.public_name} Hub</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-[#4c9a66] rounded-full text-xs font-black uppercase tracking-widest border border-green-500/20">
                            <div className="size-2 bg-[#2bee6c] rounded-full animate-pulse"></div>
                            System Live
                        </div>
                        <button onClick={() => window.location.href='/business/scanner'} className="bg-[#2bee6c] text-[#0d1b12] p-3 rounded-xl active:scale-95 transition-all shadow-sm">
                             <span className="material-icons-round block">qr_code_scanner</span>
                        </button>
                    </div>
                </header>

                <main className="p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-700">
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
    <button onClick={onClick} className={`group flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-[#2bee6c] text-[#0d1b12]' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${collapsed ? 'justify-center p-3' : ''}`}>
        <span className="material-icons-round transition-transform group-hover:scale-110">{icon}</span>
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
                <StatCard title="Active Members" value={analytics?.total_customers ?? '...'} />
                <StatCard title="7D Intake" value={analytics?.new_members_7d ?? '...'} highlight />
                <StatCard title="Points Out" value={analytics?.points_awarded_7d ?? '...'} />
                <StatCard title="Claims" value={analytics?.rewards_claimed_7d ?? '...'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200">
                     <h3 className="text-[11px] font-black font-display text-slate-400 uppercase tracking-[0.2em] mb-10">Membership Growth Curve</h3>
                     <div className="h-72">
                        <SimpleAreaChart data={dailyData} color="#2bee6c" />
                     </div>
                </div>
                <div className="bg-[#0d1b12] text-[#2bee6c] p-10 rounded-[2.5rem] flex flex-col justify-between">
                    <div className="space-y-2 mb-10">
                        <span className="material-icons-round text-primary text-sm">tune</span>
                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#2bee6c]/40">Program Settings</h3>
                    </div>
                    <LoyaltySettingsInline business={business} onUpdate={onBusinessUpdate} />
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; highlight?: boolean }> = ({ title, value, highlight }) => (
    <div className={`p-8 rounded-3xl border transition-all hover:bg-white group ${highlight ? 'bg-[#0b110d] border-white/5 text-[#2bee6c]' : 'bg-white border-slate-200 text-[#0d1b12]'}`}>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-40 mb-4">{title}</p>
        <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold font-display tracking-tight">{value}</span>
        </div>
    </div>
);

const SimpleAreaChart: React.FC<{ data: DailyAnalyticsData[], color: string }> = ({ data, color }) => {
    if (data.length === 0) return <div className="size-full flex items-center justify-center"><Spinner className="text-[#2bee6c]/20"/></div>;
    const values = data.map(d => d.new_members_count);
    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({ x: (i / (values.length - 1)) * 100, y: 100 - (val / maxVal) * 80 }));
    const linePath = points.length < 2 ? "" : `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => { 
        const prev = points[i]; return `L ${p.x} ${p.y}`; 
    }).join(" ");
    return (
        <div className="relative size-full flex flex-col justify-end">
            <svg viewBox="0 0 100 100" className="w-full h-48 drop-shadow-[0_0_8px_rgba(43,238,108,0.4)]" preserveAspectRatio="none">
                <path d={`${linePath} L 100 100 L 0 100 Z`} fill="url(#chart-gradient)" opacity="0.1" />
                <path d={linePath} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="flex justify-between mt-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
            </div>
        </div>
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
            <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{t('pointsPerScan')}</label>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                    <button onClick={() => setPoints(p => Math.max(1, p - 1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                        <span className="material-icons-round text-lg">remove</span>
                    </button>
                    <span className="text-2xl font-bold font-display">{points}</span>
                    <button onClick={() => setPoints(p => p + 1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                        <span className="material-icons-round text-lg">add</span>
                    </button>
                </div>
            </div>
             <div className="space-y-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-tight">{t('rewardThreshold')}</label>
                <div className="flex items-center justify-between bg-white/5 p-2 rounded-xl border border-white/5">
                    <button onClick={() => setThreshold(t => Math.max(points, t - 1))} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                        <span className="material-icons-round text-lg">remove</span>
                    </button>
                    <span className="text-2xl font-bold font-display">{threshold}</span>
                    <button onClick={() => setThreshold(t => t + 1)} className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center">
                        <span className="material-icons-round text-lg">add</span>
                    </button>
                </div>
            </div>
            <button onClick={handleSave} disabled={isSaving} className="w-full mt-4 py-4 bg-[#2bee6c] text-[#0d1b12] font-bold rounded-xl hover:bg-opacity-90 transition-all active:scale-[0.98]">
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-3xl font-bold font-display tracking-tight text-[#0d1b12]">Customer Directory</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{memberships.length} Active Records</p>
                </div>
                <div className="relative w-full md:w-1/2">
                    <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-slate-200 rounded-2xl bg-[#f8fcf9] focus:ring-[#2bee6c] focus:border-[#2bee6c] font-medium" />
                </div>
            </div>
            <div className="overflow-hidden border border-slate-100 rounded-3xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Member</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Points Balance</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? <tr><td colSpan={3} className="py-20 text-center"><Spinner className="text-[#2bee6c] mx-auto"/></td></tr> : memberships.map(m => (
                            <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-[#e7f3eb] flex items-center justify-center font-black text-[#4c9a66]">{m.customers.name?.charAt(0)}</div>
                                        <div className="min-w-0">
                                            <p className="font-bold text-[#0d1b12] text-sm truncate">{m.customers.name}</p>
                                            <p className="text-[10px] font-bold text-[#4c9a66] tracking-widest">{m.customers.phone_number || 'STITCH ID'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-[#2bee6c] bg-[#2bee6c]/5 px-3 py-1 rounded-full">{m.points} pts</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-[#0d1b12] transition-colors material-icons-round">more_vert</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200">
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-bold font-display tracking-tight">Marketing Broadcasts</h3>
                <button className="flex items-center gap-2 bg-[#2bee6c] text-[#0d1b12] px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all">
                    <span className="material-icons-round">add</span>
                    Create New Post
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length === 0 ? <p className="col-span-full text-center py-20 text-[#4c9a66] font-bold uppercase tracking-widest opacity-30">No active broadcasts</p> : posts.map(p => (
                    <div key={p.id} className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:border-[#2bee6c]/30 transition-all">
                        <div className="relative h-48 bg-slate-50 overflow-hidden">
                            {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="size-full flex items-center justify-center text-slate-200"><span className="material-icons-round text-6xl">image</span></div>}
                            <div className="absolute top-4 left-4"><span className="px-3 py-1 bg-[#2bee6c] text-black text-[10px] font-bold uppercase rounded-full">Published</span></div>
                        </div>
                        <div className="p-6">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{new Date(p.created_at).toLocaleDateString()}</p>
                            <h4 className="text-xl font-bold text-[#0d1b12] leading-tight mb-6">{p.title}</h4>
                            <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
                                <button className="p-2 text-slate-400 hover:text-[#0d1b12] transition-colors material-icons-round">edit</button>
                                <button onClick={async () => { if(window.confirm('Delete?')){ await deletePost(p.id); fetch(); } }} className="p-2 text-rose-400 hover:text-rose-600 transition-colors material-icons-round">delete</button>
                            </div>
                        </div>
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200">
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-bold font-display tracking-tight">Active Vouchers</h3>
                <button className="bg-[#2bee6c] text-[#0d1b12] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all">
                    <span className="material-icons-round">add</span>
                    New Offer
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {discounts.length === 0 ? <p className="col-span-full text-center py-20 text-[#4c9a66] font-bold uppercase tracking-widest opacity-30">No active vouchers</p> : discounts.map(d => (
                    <div key={d.id} className="bg-[#f8fcf9] p-8 rounded-3xl border border-slate-100 flex gap-6 group hover:border-[#2bee6c]/20 transition-all">
                        <div className="w-24 h-24 bg-[#2bee6c]/10 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-[#2bee6c] text-4xl">percent</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-[#0d1b12] mb-2">{d.name}</h4>
                            <p className="text-sm text-[#4c9a66] font-medium leading-relaxed truncate mb-6">{d.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Forever</span>
                                <button onClick={async () => { if(window.confirm('Archive?')){ await deleteDiscount(d.id); fetch(); } }} className="text-rose-400 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors">Archive</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default BusinessPage;