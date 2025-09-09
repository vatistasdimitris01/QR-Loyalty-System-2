
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

        } else {
             window.location.href = '/business/login';
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
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
                    <div className="flex items-center gap-4">
                        <a href="/business/scanner" title={t('kioskMode')} className="bg-gray-100 text-gray-700 p-3 rounded-full hover:bg-gray-200 transition-colors">
                           <ScreensaverIcon className="h-6 w-6" />
                        </a>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{business.public_name || t('businessDashboard')}</h1>
                            <p className="text-sm text-gray-500">{t('welcome')}, {business.name}!</p>
                        </div>
                    </div>
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300 hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <img 
                                src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} 
                                alt="Business Logo" 
                                className="w-full h-full object-cover" 
                            />
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border border-gray-200">
                                <a href="/business/editor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('businessSettings')}</a>
                                <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{t('logout')}</button>
                            </div>
                        )}
                    </div>
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
    const [isEditMode, setIsEditMode] = useState(false);
    const [isRestoreMenuOpen, setIsRestoreMenuOpen] = useState(false);
    const layoutStorageKey = `qroyal-dashboard-layout-v2-${business.id}`;
    
    const componentKeys = {
        NEW_MEMBERS: 'newMembers',
        POINTS_AWARDED: 'pointsAwarded',
        TOTAL_CUSTOMERS: 'totalCustomers',
        LOYALTY_SETTINGS: 'loyaltySettings',
        QUICK_ACTIONS: 'quickActions',
        LOGIN_QR: 'loginQr',
    };
    
    const [componentOrder, setComponentOrder] = useState<string[]>(Object.values(componentKeys));
    const [hiddenComponents, setHiddenComponents] = useState<Set<string>>(new Set());

    const componentTitles: Record<string, string> = {
        [componentKeys.NEW_MEMBERS]: 'New Members',
        [componentKeys.POINTS_AWARDED]: 'Points Awarded',
        [componentKeys.TOTAL_CUSTOMERS]: t('totalCustomers'),
        [componentKeys.QUICK_ACTIONS]: 'Quick Actions',
        [componentKeys.LOYALTY_SETTINGS]: t('loyaltyProgram'),
        [componentKeys.LOGIN_QR]: 'Business Login QR',
    };

    useEffect(() => {
        const savedLayout = localStorage.getItem(layoutStorageKey);
        if (savedLayout) {
            try {
                const parsedLayout = JSON.parse(savedLayout);
                const currentKeys = new Set(Object.values(componentKeys));
                const allSavedKeys = new Set([...(parsedLayout.order || []), ...(parsedLayout.hidden || [])]);
                const isValid = parsedLayout.order && Array.isArray(parsedLayout.order) &&
                                allSavedKeys.size === currentKeys.size &&
                                [...allSavedKeys].every(key => currentKeys.has(key));
                
                if (isValid) {
                   setComponentOrder(parsedLayout.order);
                   setHiddenComponents(new Set(parsedLayout.hidden || []));
                } else {
                   localStorage.removeItem(layoutStorageKey);
                }
            } catch (e) { 
                console.error("Failed to parse saved layout", e);
                localStorage.removeItem(layoutStorageKey);
            }
        }
    }, [layoutStorageKey]);

    const handleSaveLayout = () => {
        const layoutToSave = {
            order: componentOrder,
            hidden: Array.from(hiddenComponents)
        };
        localStorage.setItem(layoutStorageKey, JSON.stringify(layoutToSave));
        setIsEditMode(false);
    };

    const handleHideComponent = (key: string) => {
        setHiddenComponents(prev => new Set(prev).add(key));
    };

    const handleUnhideComponent = (key: string) => {
        setHiddenComponents(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
    };

    const dragItem = useRef<number | null>(null);
    const dragOverItem = useRef<number | null>(null);

    const handleDrop = () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
             dragItem.current = null;
             dragOverItem.current = null;
            return;
        };
        
        const visibleOrder = componentOrder.filter(key => !hiddenComponents.has(key));
        const draggedItemContent = visibleOrder.splice(dragItem.current, 1)[0];
        visibleOrder.splice(dragOverItem.current, 0, draggedItemContent);
        
        const hiddenOrder = componentOrder.filter(key => hiddenComponents.has(key));
        setComponentOrder([...visibleOrder, ...hiddenOrder]);

        dragItem.current = null;
        dragOverItem.current = null;
    };

    // Mouse Events
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => { dragItem.current = index; };
    const handleDragEnter = (index: number) => { dragOverItem.current = index; };

    // Touch Events for Tablets
    const handleTouchStart = (index: number) => { dragItem.current = index; };
    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        const container = element?.closest('[data-drag-index]');
        if (container) {
            const index = parseInt(container.getAttribute('data-drag-index')!, 10);
            if (!isNaN(index)) {
                dragOverItem.current = index;
            }
        }
    };
    const handleTouchEnd = () => { handleDrop(); };


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
    
    const componentsMap: Record<string, React.ReactNode> = {
        [componentKeys.NEW_MEMBERS]: <AnalyticsAreaChartCard title="New Members" total={analytics?.new_members_7d} data={dailyData} dataKey="new_members_count" color="#3b82f6" />,
        [componentKeys.POINTS_AWARDED]: <AnalyticsAreaChartCard title="Points Awarded" total={analytics?.points_awarded_7d} data={dailyData} dataKey="points_awarded_sum" color="#10b981" />,
        [componentKeys.TOTAL_CUSTOMERS]: <StatCard title={t('totalCustomers')} value={analytics?.total_customers ?? '...'} />,
        [componentKeys.LOYALTY_SETTINGS]: <LoyaltySettingsEditor business={business} onUpdate={onBusinessUpdate} />,
        [componentKeys.QUICK_ACTIONS]: (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm h-full">
                <h3 className="font-bold text-lg mb-4 text-gray-800">Quick Actions</h3>
                <div className="space-y-3">
                    <QuickActionButton title={t('scanCustomerQR')} onClick={() => setIsScannerModalOpen(true)} icon={<CameraIcon className="h-5 w-5"/>} />
                    <QuickActionButton title={t('kioskMode')} href="/business/scanner" icon={<ScreensaverIcon className="h-5 w-5" />} />
                </div>
            </div>
        ),
        [componentKeys.LOGIN_QR]: (
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center h-full">
                <h3 className="font-bold text-lg mb-2">Business Login QR</h3>
                <img src={business.qr_data_url} alt="Business Login QR Code" className="w-40 h-40 mx-auto rounded-lg" />
                <p className="text-xs text-gray-500 mt-2">Scan this to log in quickly from any device.</p>
            </div>
        )
    };
    
    const visibleComponents = componentOrder.filter(key => !hiddenComponents.has(key));
    const hiddenComponentKeys = componentOrder.filter(key => hiddenComponents.has(key));

    return (
        <>
            <BusinessScannerModal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} businessId={business.id} onScanSuccess={(result: ScanResult) => { if (result.success) fetchData(); }} />
            <div className="flex justify-end mb-4 gap-2 items-center">
                {isEditMode ? (
                    <>
                        {hiddenComponentKeys.length > 0 && (
                            <div className="relative">
                                <button onClick={() => setIsRestoreMenuOpen(prev => !prev)} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 border text-sm">Restore</button>
                                {isRestoreMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 border">
                                        {hiddenComponentKeys.map(key => (
                                            <button key={key} onClick={() => handleUnhideComponent(key)} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{componentTitles[key]}</button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <button onClick={() => setIsEditMode(false)} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 text-sm">Cancel</button>
                        <button onClick={handleSaveLayout} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 text-sm">Save Layout</button>
                    </>
                ) : (
                    <button onClick={() => setIsEditMode(true)} className="bg-white text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 border text-sm flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit Layout
                    </button>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleComponents.map((key, index) => (
                    <div
                        key={key}
                        data-drag-index={index}
                        draggable={isEditMode}
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragEnd={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onTouchStart={() => handleTouchStart(index)}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div className={`relative h-full transition-all duration-300 ${isEditMode ? 'cursor-move ring-2 ring-blue-500 ring-dashed ring-offset-2 rounded-xl bg-white p-1' : ''}`}>
                             {isEditMode && <DragHandleIcon />}
                             {isEditMode && <HideButtonIcon onClick={() => handleHideComponent(key)} />}
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
            <QRScannerModal isOpen={isSearchScannerOpen} onClose={() => setIsSearchScannerOpen(false)} onScan={handleSearchScan} facingMode="user" />
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
                    ) : memberships.length > 0 ? memberships.map(membership => {
                        if (!membership.customers) return null; // Add null check
                        return (
                            <div key={membership.id} className="bg-gray-50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <img src={membership.customers.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt={membership.customers.name || 'Customer'} className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{membership.customers.name}</p>
                                        <p className="text-sm text-gray-500">{membership.customers.phone_number || 'No phone'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full sm:w-auto">
                                    <p className="font-bold text-lg text-blue-600 sm:mx-4">{membership.points} <span className="text-sm font-medium text-gray-500">{t('points')}</span></p>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleViewQr(membership.customers as Customer)} className="bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-gray-300">View</button>
                                        <button onClick={() => membership.customers.id && handleRemoveCustomer(membership.customers.id)} className="bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-md text-sm hover:bg-red-200">{t('remove')}</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }) : (
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

const HideButtonIcon: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="absolute top-2 right-12 z-10 p-1.5 bg-white/70 rounded-full hover:bg-white transition-colors" title="Hide Widget">
        <HideIcon className="h-5 w-5 text-gray-500" />
    </button>
);

const DragHandleIcon: React.FC = () => (
    <div className="absolute top-2 right-2 z-10 p-1.5 bg-white/70 rounded-full cursor-grab active:cursor-grabbing hover:bg-white transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    </div>
);

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-1 border-b-2 font-semibold text-sm transition-colors relative ${isActive ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
        {label}
    </button>
);

const StatCard: React.FC<{ title: string; value: string | number; }> = ({ title, value }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm text-center h-full">
        <p className="text-4xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
);

const QuickActionButton: React.FC<{ title: string; href?: string; onClick?: () => void; icon: React.ReactNode }> = ({ title, href, onClick, icon }) => {
    const content = (
        <div className="p-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">
            <div className="text-gray-600">{icon}</div>
            <p className="font-semibold text-gray-800 text-sm">{title}</p>
        </div>
    );
    if (href) { return <a href={href}>{content}</a>; }
    return <button onClick={onClick} className="w-full text-left">{content}</button>;
};


const getSvgPath = (points: {x: number, y: number}[], tension: number): string => {
    if (points.length < 2) return "";
    let d = "M " + points[0].x + " " + points[0].y;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = i > 0 ? points[i - 1] : points[0];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = i < points.length - 2 ? points[i + 2] : p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6 * tension;
        const cp1y = p1.y + (p2.y - p0.y) / 6 * tension;
        const cp2x = p2.x - (p3.x - p1.x) / 6 * tension;
        const cp2y = p2.y - (p3.y - p1.y) / 6 * tension;
        d += " C " + cp1x + " " + cp1y + " " + cp2x + " " + cp2y + " " + p2.x + " " + p2.y;
    }
    return d;
}

const AnalyticsAreaChartCard: React.FC<{ 
    title: string, 
    total: number | undefined,
    data: DailyAnalyticsData[], 
    dataKey: keyof Omit<DailyAnalyticsData, 'log_date'>,
    color: string
}> = ({ title, total, data, dataKey, color }) => {
    const width = 100;
    const height = 50;

    const values = data.map(d => d[dataKey] as number);
    const firstHalfSum = values.slice(0, 3).reduce((a, b) => a + b, 0);
    const secondHalfSum = values.slice(3, 7).reduce((a, b) => a + b, 0);

    let percentageChange = 0;
    if (firstHalfSum > 0) {
        percentageChange = ((secondHalfSum - firstHalfSum) / firstHalfSum) * 100;
    } else if (secondHalfSum > 0) {
        percentageChange = 100;
    }

    const maxVal = Math.max(...values, 1);
    const points = values.map((val, i) => ({
        x: (i / (values.length - 1)) * width,
        y: height - (val / maxVal) * height
    }));
    
    const linePath = getSvgPath(points, 1);
    const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
    const gradientId = `gradient-${dataKey}`;

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm h-full">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-3xl font-bold text-gray-800">{total ?? '...'}</p>
                {total !== undefined && (
                     <p className={`text-sm font-semibold ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
                    </p>
                )}
            </div>
            <div className="mt-4 h-16">
                {points.length > 1 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.2"/>
                                <stop offset="100%" stopColor={color} stopOpacity="0"/>
                            </linearGradient>
                        </defs>
                        <path d={areaPath} fill={`url(#${gradientId})`} />
                        <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">Not enough data</div>}
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
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm h-full">
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
