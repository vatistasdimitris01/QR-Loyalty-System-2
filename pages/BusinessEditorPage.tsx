
import React, { useState, useEffect, useCallback } from 'react';
import { Business, BusinessQrDesign, QrStyle, Post, Product, Discount } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { 
    updateBusiness, getBusinessQrDesigns, createBusinessQrDesign, deleteBusinessQrDesign,
    getPostsForBusiness, createPost, deletePost,
    getProductsForBusiness, createProduct, deleteProduct,
    getDiscountsForBusiness, createDiscount, deleteDiscount
} from '../services/api';
import { Spinner } from '../components/common';

type EditorTab = 'profile' | 'branding' | 'loyalty' | 'location' | 'posts' | 'shop' | 'discounts';

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [formState, setFormState] = useState<Partial<Business>>({});
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [activeTab, setActiveTab] = useState<EditorTab>('profile');

    useEffect(() => {
        setLoading(true);
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness);
            setBusiness(parsed);
            setFormState(parsed);
        }
        setLoading(false);
    }, []);

    const handleSave = async () => {
        if (!business) return;
        setIsSaving(true);
        setSaveMessage('');
        try {
            const updatedBusiness = await updateBusiness(business.id, formState);
            if (updatedBusiness) {
                const newBusinessState = { ...business, ...updatedBusiness };
                sessionStorage.setItem('business', JSON.stringify(newBusinessState));
                setBusiness(newBusinessState);
                setFormState(newBusinessState);
                setSaveMessage(t('saveSuccess'));
            } else {
                setSaveMessage(t('saveError'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage(t('saveError'));
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 4000);
        }
    };
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (!business) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white shadow-sm flex justify-between items-center p-4">
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">{t('businessSettings')}</h1>
                <div className="flex items-center gap-4">
                     {saveMessage && <p className={`text-sm font-semibold ${saveMessage === t('saveSuccess') ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</p>}
                    <a href="/business" className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 text-sm md:text-base">&larr; {t('back')}</a>
                    <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2 text-sm md:text-base">
                        {isSaving ? <Spinner className="h-5 w-5 text-white" /> : null}
                        {isSaving ? 'Saving...' : t('saveSettings')}
                    </button>
                </div>
            </header>
            
            <main className="p-4 md:p-8">
                 <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        <TabButton label={t('publicProfile')} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        {/* FIX: Changed t('branding') to a valid translation key t('qrCustomization') */}
                        <TabButton label={t('qrCustomization')} isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
                        <TabButton label={t('loyaltyProgram')} isActive={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} />
                        <TabButton label={t('location')} isActive={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                        <TabButton label={t('posts')} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                        <TabButton label={t('shop')} isActive={activeTab === 'shop'} onClick={() => setActiveTab('shop')} />
                        <TabButton label={t('discounts')} isActive={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                    </nav>
                </div>

                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && <ProfileSettings formState={formState} setFormState={setFormState} />}
                    {activeTab === 'branding' && <BrandingSettings formState={formState} setFormState={setFormState} business={business} />}
                    {activeTab === 'loyalty' && <LoyaltySettings formState={formState} setFormState={setFormState} />}
                    {activeTab === 'location' && <LocationSettings formState={formState} setFormState={setFormState} />}
                    {activeTab === 'posts' && <PostsManager business={business} />}
                    {activeTab === 'shop' && <ShopManager business={business} />}
                    {activeTab === 'discounts' && <DiscountsManager business={business} />}
                </div>
            </main>
        </div>
    );
};

// --- Child Components for Tabs ---

const ProfileSettings: React.FC<{formState: Partial<Business>, setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>}> = ({ formState, setFormState }) => {
    const { t } = useLanguage();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormState(prev => ({...prev, [e.target.name]: e.target.value }));
    
    return (
        <SettingsCard title={t('publicProfile')} description={t('publicProfileDesc')}>
            <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
            <InputField label={t('logoUrl')} name="logo_url" value={formState.logo_url || ''} onChange={handleChange} placeholder="https://..." />
            <InputField label={t('coverPhotoUrl')} name="cover_photo_url" value={formState.cover_photo_url || ''} onChange={handleChange} placeholder="https://..." />
            <TextAreaField label={t('bio')} name="bio" value={formState.bio || ''} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label={t('website')} name="website_url" value={formState.website_url || ''} onChange={handleChange} placeholder="https://..." />
                <InputField label={t('contactPhone')} name="public_phone_number" value={formState.public_phone_number || ''} onChange={handleChange} />
                <InputField label={t('facebook')} name="facebook_url" value={formState.facebook_url || ''} onChange={handleChange} placeholder="https://facebook.com/..." />
                <InputField label={t('instagram')} name="instagram_url" value={formState.instagram_url || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
            </div>
        </SettingsCard>
    );
};

const BrandingSettings: React.FC<{formState: Partial<Business>, setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>, business: Business}> = ({ formState, setFormState, business }) => {
    const { t } = useLanguage();
    const [previewQr, setPreviewQr] = useState('');
    
    useEffect(() => {
        const qrOptions = {
            qr_logo_url: formState.qr_logo_url,
            qr_color: formState.qr_color,
            qr_eye_shape: formState.qr_eye_shape,
            qr_dot_style: formState.qr_dot_style,
        };
        generateQrCode(business.qr_token, qrOptions).then(setPreviewQr);
    }, [business.qr_token, formState.qr_logo_url, formState.qr_color, formState.qr_eye_shape, formState.qr_dot_style]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormState(prev => ({...prev, [e.target.name]: e.target.value }));

    return (
        <>
            <SettingsCard title={t('qrCustomization')} description={t('qrCustomizationDesc')}>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-shrink-0">
                        {previewQr ? <img src={previewQr} alt="QR Code Preview" className="w-48 h-48 rounded-lg border"/> : <div className="w-48 h-48 bg-gray-200 rounded-lg animate-pulse" />}
                    </div>
                    <div className="flex-grow space-y-4">
                        <InputField label={t('logoUrl')} name="qr_logo_url" value={formState.qr_logo_url || ''} onChange={handleChange} placeholder="https://..." />
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('qrColor')}</label>
                            <input type="color" name="qr_color" value={formState.qr_color} onChange={handleChange} className="mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer" />
                        </div>
                        <SelectField label={t('eyeShape')} name="qr_eye_shape" value={formState.qr_eye_shape || 'square'} onChange={handleChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                        <SelectField label={t('dotStyle')} name="qr_dot_style" value={formState.qr_dot_style || 'square'} onChange={handleChange} options={[
                            { value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' },
                            { value: 'classy', label: 'Classy' }, { value: 'classy-rounded', label: 'Classy Rounded' }, { value: 'extra-rounded', label: 'Extra Rounded' }
                        ]} />
                    </div>
                </div>
            </SettingsCard>
            <CustomerQrDesigns business={business} />
        </>
    );
};

const LoyaltySettings: React.FC<{formState: Partial<Business>, setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>}> = ({ formState, setFormState }) => {
    const { t } = useLanguage();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'points_per_scan' || name === 'reward_threshold') {
             setFormState(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
        } else {
            setFormState(prev => ({ ...prev, [name]: value }));
        }
    };

    return (
        <SettingsCard title={t('loyaltyProgram')} description={t('loyaltyProgramDesc')}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField type="number" label={t('pointsPerScan')} name="points_per_scan" value={String(formState.points_per_scan || 1)} onChange={handleChange} />
                <InputField type="number" label={t('rewardThreshold')} name="reward_threshold" value={String(formState.reward_threshold || 5)} onChange={handleChange} />
            </div>
            <InputField label={t('rewardMessage')} name="reward_message" value={formState.reward_message || ''} onChange={handleChange} placeholder={t('rewardMessagePlaceholder')} />
        </SettingsCard>
    );
};

const LocationSettings: React.FC<{formState: Partial<Business>, setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>}> = ({ formState, setFormState }) => {
    const { t } = useLanguage();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    return (
        <SettingsCard title={t('businessLocation')} description="Enter your full business address for the map.">
            <InputField label={t('address')} name="address_text" value={formState.address_text || ''} onChange={handleChange} placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA" />
        </SettingsCard>
    );
};

const CustomerQrDesigns: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [designs, setDesigns] = useState<BusinessQrDesign[]>([]);
    const [newDesign, setNewDesign] = useState<QrStyle>({ qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square', qr_logo_url: '' });

    const fetchDesigns = useCallback(async (businessId: string) => {
        const fetchedDesigns = await getBusinessQrDesigns(businessId);
        setDesigns(fetchedDesigns);
    }, []);

    useEffect(() => {
        fetchDesigns(business.id);
    }, [business.id, fetchDesigns]);

    const handleNewDesignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewDesign({ ...newDesign, [e.target.name]: e.target.value });
    
    const handleAddDesign = async () => {
        const result = await createBusinessQrDesign({ business_id: business.id, ...newDesign });
        if (result) {
            setDesigns([result, ...designs]);
            setNewDesign({ qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square', qr_logo_url: '' }); // Reset form
        }
    };

    const handleDeleteDesign = async (designId: string) => {
        const result = await deleteBusinessQrDesign(designId);
        if (result.success) {
            setDesigns(designs.filter(d => d.id !== designId));
        }
    };

    return (
        <SettingsCard title={t('customerQrDesigns')} description={t('customerQrDesignsDesc')}>
            <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">Add New Design</h3>
                <InputField label={t('logoUrl')} name="qr_logo_url" value={newDesign.qr_logo_url || ''} onChange={handleNewDesignChange} placeholder="https://..." />
                <div>
                    <label className="block text-sm font-medium text-gray-700">{t('qrColor')}</label>
                    <input type="color" name="qr_color" value={newDesign.qr_color} onChange={handleNewDesignChange} className="mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer" />
                </div>
                <SelectField label={t('eyeShape')} name="qr_eye_shape" value={newDesign.qr_eye_shape || 'square'} onChange={handleNewDesignChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                <SelectField label={t('dotStyle')} name="qr_dot_style" value={newDesign.qr_dot_style || 'square'} onChange={handleNewDesignChange} options={[{ value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' }]} />
                <button onClick={handleAddDesign} className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">{t('addDesign')}</button>
            </div>
            <div className="space-y-2 mt-4">
                <h3 className="font-semibold text-gray-800">Your Designs</h3>
                {designs.length === 0 ? <p className="text-sm text-gray-500">{t('noDesigns')}</p> : designs.map(d => <QrDesignItem key={d.id} design={d} onDelete={handleDeleteDesign} />)}
            </div>
        </SettingsCard>
    );
};

const PostsManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState({ title: '', content: '', image_url: '' });

    const fetchPosts = useCallback(async () => {
        const data = await getPostsForBusiness(business.id);
        setPosts(data);
    }, [business.id]);

    useEffect(() => { fetchPosts(); }, [fetchPosts]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createPost({ ...newPost, business_id: business.id });
        if(result) {
            fetchPosts();
            setNewPost({ title: '', content: '', image_url: '' });
        }
    };
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure?')) {
            const success = await deletePost(id);
            if(success) fetchPosts();
        }
    };

    return (
        <SettingsCard title={t('managePosts')} description={t('managePostsDesc')}>
            <form onSubmit={handleCreate} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{t('newPost')}</h3>
                <InputField label={t('title')} name="title" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                <TextAreaField label={t('content')} name="content" value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})} />
                <InputField label={t('imageUrl')} name="image_url" value={newPost.image_url} onChange={(e) => setNewPost({...newPost, image_url: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{t('createPost')}</button>
            </form>
            <div className="space-y-2 mt-4">
                {posts.length === 0 ? <p className="text-sm text-gray-500">{t('noPosts')}</p> : posts.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 border rounded-lg bg-white">
                        {p.image_url && <img src={p.image_url} alt="post preview" className="w-12 h-12 rounded object-cover" />}
                        <p className="flex-grow font-semibold">{p.title}</p>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </SettingsCard>
    )
};

const ShopManager: React.FC<{business: Business}> = ({ business }) => {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', image_url: '', product_url: '' });

    const fetchProducts = useCallback(async () => {
        const data = await getProductsForBusiness(business.id);
        setProducts(data);
    }, [business.id]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await createProduct({ 
            ...newProduct, 
            business_id: business.id,
            price: parseFloat(newProduct.price) || 0
        });
        if(result) {
            fetchProducts();
            setNewProduct({ name: '', description: '', price: '', image_url: '', product_url: '' });
        }
    };
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure?')) {
            const success = await deleteProduct(id);
            if(success) fetchProducts();
        }
    };

    return (
        <SettingsCard title={t('manageProducts')} description={t('manageProductsDesc')}>
            <form onSubmit={handleCreate} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800">{t('newProduct')}</h3>
                <InputField label={t('productName')} name="name" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} />
                <TextAreaField label={t('description')} name="description" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} />
                <InputField label={t('price')} name="price" type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} />
                <InputField label={t('imageUrl')} name="image_url" value={newProduct.image_url} onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})} />
                <InputField label={t('productUrl')} name="product_url" value={newProduct.product_url} onChange={(e) => setNewProduct({...newProduct, product_url: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{t('createProduct')}</button>
            </form>
            <div className="space-y-2 mt-4">
                {products.length === 0 ? <p className="text-sm text-gray-500">{t('noProducts')}</p> : products.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 border rounded-lg bg-white">
                        {p.image_url && <img src={p.image_url} alt="product preview" className="w-12 h-12 rounded object-cover" />}
                        <p className="flex-grow font-semibold">{p.name}</p>
                        <span className="font-bold">${p.price}</span>
                        <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
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
                <TextAreaField label={t('description')} name="description" value={newDiscount.description} onChange={(e) => setNewDiscount({...newDiscount, description: e.target.value})} />
                <InputField label={t('imageUrl')} name="image_url" value={newDiscount.image_url} onChange={(e) => setNewDiscount({...newDiscount, image_url: e.target.value})} />
                <button type="submit" className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">{t('createDiscount')}</button>
            </form>
            <div className="space-y-2 mt-4">
                {discounts.length === 0 ? <p className="text-sm text-gray-500">{t('noManageDiscounts')}</p> : discounts.map(d => (
                    <div key={d.id} className="flex items-center gap-2 p-2 border rounded-lg bg-white">
                         {d.image_url && <img src={d.image_url} alt="discount preview" className="w-12 h-12 rounded object-cover" />}
                        <p className="flex-grow font-semibold">{d.name}</p>
                        <button onClick={() => handleDelete(d.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
                    </div>
                ))}
            </div>
        </SettingsCard>
    )
};


// --- UI & Helper Components ---
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>

const QrDesignItem: React.FC<{ design: BusinessQrDesign, onDelete: (id: string) => void }> = ({ design, onDelete }) => {
    const [preview, setPreview] = useState('');
    useEffect(() => {
        generateQrCode('preview', design).then(setPreview);
    }, [design]);

    return (
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-white">
            {preview ? <img src={preview} alt="design preview" className="w-12 h-12 rounded" /> : <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />}
            <div className="flex-grow">
                <p className="text-xs">Color: <span className="font-mono">{design.qr_color}</span></p>
                <p className="text-xs">Style: {design.qr_dot_style}</p>
            </div>
            <button onClick={() => onDelete(design.id)} className="text-red-500 hover:text-red-700 p-1"><TrashIcon /></button>
        </div>
    );
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-6 rounded-lg shadow-md space-y-6 mb-8">
        <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        {children}
    </div>
);

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-2 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
);

const InputField: React.FC<{label: string, name: string, value: string, onChange: any, placeholder?: string, type?: string}> = ({label, name, value, onChange, placeholder, type = 'text'}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
    </div>
);
const TextAreaField: React.FC<{label: string, name: string, value: string, onChange: any}> = ({label, name, value, onChange}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"></textarea>
    </div>
);
const SelectField: React.FC<{label: string, name: string, value: string, onChange: any, options: {value: string, label: string}[]}> = ({label, name, value, onChange, options}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <select id={name} name={name} value={value} onChange={onChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default BusinessEditorPage;