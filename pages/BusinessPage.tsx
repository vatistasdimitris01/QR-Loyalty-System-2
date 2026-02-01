import React, { useState, useEffect, useCallback, useDeferredValue, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Post, Discount, DailyAnalyticsData, BusinessAnalytics } from '../types';
import { 
    searchMembershipsForBusiness, getBusinessAnalytics, getDailyAnalytics,
    updateBusiness, getPostsForBusiness, deletePost,
    getDiscountsForBusiness, deleteDiscount, uploadBusinessAsset
} from '../services/api';
import { generateQrCode } from '../services/qrGenerator';
import { Spinner, FlagLogo, InputField, TextAreaField, SelectField } from '../components/common';

type DashboardTab = 'analytics' | 'customers' | 'posts' | 'discounts' | 'settings';

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
        <div className="flex justify-center items-center h-screen bg-white">
            <div className="text-center space-y-4">
                <Spinner className="size-12 text-[#2bee6c]" />
                <p className="text-[#163a24] font-display font-bold tracking-tight">Accessing Business Hub...</p>
            </div>
        </div>
    );

    const navItems = [
        { label: t('analytics'), icon: 'dashboard', id: 'analytics' as DashboardTab },
        { label: t('customerList'), icon: 'group', id: 'customers' as DashboardTab },
        { label: t('posts'), icon: 'campaign', id: 'posts' as DashboardTab },
        { label: t('discounts'), icon: 'local_offer', id: 'discounts' as DashboardTab },
        { label: t('businessSettings'), icon: 'settings', id: 'settings' as DashboardTab },
    ];

    return (
        <div className="flex min-h-screen bg-white font-sans text-[#163a24] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-white sticky top-0 h-screen sidebar-transition overflow-hidden ${sidebarCollapsed ? 'w-0' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full w-72">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <FlagLogo className="w-10 h-10" />
                            <span className="text-xl font-bold font-display tracking-tight text-[#163a24]">QROYAL</span>
                        </div>
                        
                        <button onClick={() => setSidebarCollapsed(true)} className="p-2 text-[#4c9a66] hover:text-[#163a24] transition-colors">
                            <svg width="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.47108 18.9992 8.26339 19 9.4 19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H9.4C8.26339 5 7.47108 5.00078 6.85424 5.05118ZM7 7C7.55229 7 8 7.44772 8 8V16C8 16.5523 7.55229 17 7 17C6.44772 17 6 16.5523 6 16V8C6 7.44772 6.44772 7 7 7Z" fill="currentColor"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <nav className="flex flex-col gap-2 flex-grow">
                        {navItems.map(item => (
                            <SidebarItem 
                                key={item.id}
                                label={item.label} 
                                icon={item.icon} 
                                isActive={activeTab === item.id} 
                                onClick={() => setActiveTab(item.id)} 
                            />
                        ))}
                    </nav>

                    <div className="mt-auto pt-6 border-t border-slate-100">
                        <button onClick={handleLogout} className="flex items-center gap-4 w-full p-4 rounded-2xl text-rose-500 font-bold hover:bg-rose-50 transition-all">
                            <span className="material-icons-round">logout</span>
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col h-screen overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-100 px-12 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-8">
                        {sidebarCollapsed && (
                            <button onClick={() => setSidebarCollapsed(false)} className="p-2 text-[#4c9a66] hover:text-[#163a24] transition-colors">
                                <svg width="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z" fill="currentColor"></path>
                                </svg>
                            </button>
                        )}
                        <h1 className="text-2xl font-bold font-display tracking-tight text-[#163a24]">{business.public_name} Hub</h1>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-[#4c9a66] rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                            <div className="size-2 bg-[#2bee6c] rounded-full animate-pulse"></div>
                            System Online
                        </div>
                    </div>
                </header>

                <main className="p-10 max-w-7xl w-full mx-auto animate-in fade-in duration-700">
                    {activeTab === 'analytics' && <AnalyticsDashboard business={business} onBusinessUpdate={handleBusinessUpdate} />}
                    {activeTab === 'customers' && <CustomersList business={business} />}
                    {activeTab === 'posts' && <PostsManager business={business} />}
                    {activeTab === 'discounts' && <DiscountsManager business={business} />}
                    {activeTab === 'settings' && <BusinessSettingsTab business={business} onBusinessUpdate={handleBusinessUpdate} />}
                </main>
            </div>
        </div>
    );
};

const SidebarItem: React.FC<{ label: string, icon: string, isActive?: boolean, onClick: () => void }> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`group flex items-center gap-4 w-full p-4 rounded-2xl font-bold transition-all ${isActive ? 'bg-[#163a24] text-[#2bee6c]' : 'text-slate-400 hover:text-[#163a24] hover:bg-slate-50'}`}>
        <span className="material-icons-round transition-transform group-hover:scale-110">{icon}</span>
        <span className="text-sm tracking-tight whitespace-nowrap">{label}</span>
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
                <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-100">
                     <h3 className="text-[11px] font-black font-display text-slate-400 uppercase tracking-[0.2em] mb-10">Network Growth</h3>
                     <div className="h-72">
                        <SimpleAreaChart data={dailyData} color="#2bee6c" />
                     </div>
                </div>
                <div className="bg-[#163a24] text-[#2bee6c] p-10 rounded-[2.5rem] flex flex-col justify-between">
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
    <div className={`p-8 rounded-3xl border transition-all ${highlight ? 'bg-[#163a24] border-white/5 text-[#2bee6c]' : 'bg-white border-slate-100 text-[#163a24]'}`}>
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
    const linePath = points.length < 2 ? "" : `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p, i) => `L ${p.x} ${p.y}`).join(" ");
    return (
        <div className="relative size-full flex flex-col justify-end">
            <svg viewBox="0 0 100 100" className="w-full h-48" preserveAspectRatio="none">
                <path d={`${linePath} L 100 100 L 0 100 Z`} fill={color} fillOpacity="0.05" />
                <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <button onClick={handleSave} disabled={isSaving} className="w-full mt-4 py-4 bg-[#2bee6c] text-[#163a24] font-bold rounded-xl active:scale-[0.98]">
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h2 className="text-3xl font-bold font-display tracking-tight text-[#163a24]">Directory</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-1">{memberships.length} Active Records</p>
                </div>
                <div className="relative w-full md:w-1/2">
                    <input type="text" placeholder={t('searchByName')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full py-4 pl-6 pr-14 border border-slate-200 rounded-2xl bg-white focus:ring-[#2bee6c] focus:border-[#2bee6c] font-medium" />
                </div>
            </div>
            <div className="overflow-hidden border border-slate-100 rounded-3xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Member</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Equity (PTS)</th>
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
                                            <p className="font-bold text-[#163a24] text-sm truncate">{m.customers.name}</p>
                                            <p className="text-[10px] font-bold text-[#4c9a66] tracking-widest">{m.customers.phone_number || 'STITCH ID'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-bold text-[#2bee6c] bg-[#2bee6c]/5 px-3 py-1 rounded-full">{m.points} pts</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-[#163a24] transition-colors material-icons-round">more_vert</button>
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100">
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-bold font-display tracking-tight">Marketing Portal</h3>
                <button className="flex items-center gap-2 bg-[#2bee6c] text-[#163a24] px-6 py-3 rounded-2xl font-bold active:scale-95 transition-all">
                    <span className="material-icons-round">add</span>
                    New Broadcast
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
                            <h4 className="text-xl font-bold text-[#163a24] leading-tight mb-6">{p.title}</h4>
                            <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
                                <button className="p-2 text-slate-400 hover:text-[#163a24] transition-colors material-icons-round">edit</button>
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
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100">
            <div className="flex justify-between items-center mb-12">
                <h3 className="text-3xl font-bold font-display tracking-tight">Active Rewards</h3>
                <button className="bg-[#2bee6c] text-[#163a24] font-bold px-6 py-3 rounded-2xl flex items-center gap-2 active:scale-95 transition-all">
                    <span className="material-icons-round">add</span>
                    New Reward
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {discounts.length === 0 ? <p className="col-span-full text-center py-20 text-[#4c9a66] font-bold uppercase tracking-widest opacity-30">No active vouchers</p> : discounts.map(d => (
                    <div key={d.id} className="bg-white p-8 rounded-3xl border border-slate-100 flex gap-6 group hover:border-[#2bee6c]/20 transition-all">
                        <div className="w-24 h-24 bg-[#2bee6c]/10 rounded-2xl flex items-center justify-center shrink-0">
                            <span className="material-icons-round text-[#2bee6c] text-4xl">percent</span>
                        </div>
                        <div className="flex-1">
                            <h4 className="text-xl font-bold text-[#163a24] mb-2">{d.name}</h4>
                            <p className="text-sm text-[#4c9a66] font-medium leading-relaxed truncate mb-6">{d.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanent Offer</span>
                                <button onClick={async () => { if(window.confirm('Archive?')){ await deleteDiscount(d.id); fetch(); } }} className="text-rose-400 font-bold text-xs uppercase tracking-widest hover:text-rose-600 transition-colors">Archive</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
};

const BusinessSettingsTab: React.FC<{business: Business, onBusinessUpdate: (b: Business) => void}> = ({ business, onBusinessUpdate }) => {
    const { t } = useLanguage();
    const [activeSubTab, setActiveSubTab] = useState<'profile' | 'branding' | 'location'>('profile');
    const [formState, setFormState] = useState<Partial<Business>>(business);
    const [stagedFiles, setStagedFiles] = useState<{ logo?: File, cover?: File }>({});
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const handleSave = async () => {
        setSaveStatus('saving');
        let dataToUpdate = { ...formState };
        try {
            if (stagedFiles.logo) {
                const url = await uploadBusinessAsset(business.id, stagedFiles.logo, 'logo');
                if (url) dataToUpdate.logo_url = url;
            }
            if (stagedFiles.cover) {
                const url = await uploadBusinessAsset(business.id, stagedFiles.cover, 'cover');
                if (url) dataToUpdate.cover_photo_url = url;
            }
            const updated = await updateBusiness(business.id, dataToUpdate);
            if (updated) {
                onBusinessUpdate(updated);
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } catch (error) { setSaveStatus('error'); }
    };

    return (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
                <div className="flex gap-10 border-b border-slate-100 w-full md:w-auto">
                    <TabButton label="Public Profile" isActive={activeSubTab === 'profile'} onClick={() => setActiveSubTab('profile')} />
                    <TabButton label="Branding" isActive={activeSubTab === 'branding'} onClick={() => setActiveSubTab('branding')} />
                    <TabButton label="Location" isActive={activeSubTab === 'location'} onClick={() => setActiveSubTab('location')} />
                </div>
                <button onClick={handleSave} className="bg-[#163a24] text-[#2bee6c] px-8 py-3 rounded-2xl font-bold active:scale-95 transition-all">
                    {saveStatus === 'saving' ? 'Saving...' : 'Save Settings'}
                </button>
            </div>

            <div className="space-y-10">
                {activeSubTab === 'profile' && <ProfileEditor formState={formState} setFormState={setFormState} onFileSelect={(type: any, file: any) => setStagedFiles(prev => ({...prev, [type]: file}))} />}
                {activeSubTab === 'branding' && <BrandingEditor formState={formState} setFormState={setFormState} business={business} />}
                {activeSubTab === 'location' && <LocationEditor formState={formState} setFormState={setFormState} />}
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${isActive ? 'text-[#2bee6c] border-b-2 border-[#2bee6c]' : 'text-slate-400 hover:text-[#163a24]'}`}>
        {label}
    </button>
);

const ProfileEditor: React.FC<any> = ({ formState, setFormState, onFileSelect }) => {
    const { t } = useLanguage();
    const handleChange = (e: any) => setFormState((prev: any) => ({...prev, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-12">
            <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ImageUploader label={t('logoUrl')} currentImageUrl={formState.logo_url} onFileSelect={(file: any) => onFileSelect('logo', file)} />
                <ImageUploader label={t('coverPhotoUrl')} currentImageUrl={formState.cover_photo_url} onFileSelect={(file: any) => onFileSelect('cover', file)} />
            </div>
            <TextAreaField label={t('bio')} name="bio" value={formState.bio || ''} onChange={handleChange} />
        </div>
    );
}

const BrandingEditor: React.FC<any> = ({ formState, setFormState, business }) => {
    const { t } = useLanguage();
    const [previewQr, setPreviewQr] = useState('');
    useEffect(() => {
        generateQrCode(business.qr_token, { qr_logo_url: formState.qr_logo_url, qr_color: formState.qr_color, qr_eye_shape: formState.qr_eye_shape, qr_dot_style: formState.qr_dot_style }).then(setPreviewQr);
    }, [business.qr_token, formState.qr_logo_url, formState.qr_color, formState.qr_eye_shape, formState.qr_dot_style]);
    const handleChange = (e: any) => setFormState((prev: any) => ({...prev, [e.target.name]: e.target.value }));
    return (
        <div className="flex flex-col md:flex-row gap-16 items-start">
             <div className="flex-shrink-0 bg-white p-8 rounded-[3rem] border border-slate-100">
                {previewQr ? <img src={previewQr} alt="QR" className="w-56 h-56 rounded-2xl"/> : <div className="w-56 h-56 bg-slate-50 rounded-2xl animate-pulse" />}
                <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Login Identity Code</p>
            </div>
            <div className="flex-grow space-y-10 w-full">
                <div className="space-y-4">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{t('qrColor')}</label>
                    <input type="color" name="qr_color" value={formState.qr_color || '#000000'} onChange={handleChange} className="h-14 w-full p-1 bg-white border border-slate-100 rounded-2xl cursor-pointer" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                   <SelectField label={t('eyeShape')} name="qr_eye_shape" value={formState.qr_eye_shape || 'square'} onChange={handleChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                   <SelectField label={t('dotStyle')} name="qr_dot_style" value={formState.qr_dot_style || 'square'} onChange={handleChange} options={[{ value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' }]} />
                </div>
            </div>
        </div>
    );
}

const LocationEditor: React.FC<any> = ({ formState, setFormState }) => {
    const { t } = useLanguage();
    const handleChange = (e: any) => setFormState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-10">
            <InputField label={t('address')} name="address_text" value={formState.address_text || ''} onChange={handleChange} placeholder="Physical store address..." />
            {formState.address_text && (
                 <div className="rounded-[3rem] overflow-hidden border border-slate-100 grayscale contrast-125 opacity-80">
                    <iframe className="w-full h-96" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(formState.address_text)}&output=embed`}></iframe>
                </div>
            )}
        </div>
    );
}

const ImageUploader: React.FC<{ label: string; currentImageUrl?: string | null; onFileSelect: (file: File) => void; }> = ({ label, currentImageUrl, onFileSelect }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    return (
        <div className="group">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{label}</label>
            <div className="flex items-center gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-[#2bee6c]/30 transition-all">
                <img src={currentImageUrl || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="P" className="size-20 rounded-3xl object-cover" />
                <div className="space-y-3">
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} ref={fileInputRef} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#163a24] py-2.5 px-6 rounded-xl text-xs font-black text-[#2bee6c] active:scale-95 transition-all">
                        {t('uploadImage')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessPage;