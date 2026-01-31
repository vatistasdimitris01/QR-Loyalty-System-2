
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Business, BusinessQrDesign, QrStyle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { 
    updateBusiness, getBusinessQrDesigns, createBusinessQrDesign, deleteBusinessQrDesign,
    uploadBusinessAsset
} from '../services/api';
import { Spinner, InputField, TextAreaField, SelectField, TrashIcon, BackButton } from '../components/common';

type EditorTab = 'profile' | 'branding' | 'location';
type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';


// --- Custom Hooks & Helper Components ---

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
    switch (status) {
        case 'saving': return <div className="flex items-center gap-2 text-sm text-gray-500 font-bold"><Spinner className="h-4 w-4" /> Saving changes...</div>;
        case 'saved': return <div className="text-sm text-green-600 font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sm">check_circle</span> All changes saved</div>;
        case 'error': return <div className="text-sm text-rose-600 font-bold">Save failed. Please try again.</div>;
        case 'typing': return <div className="text-sm text-slate-400 font-bold">Unsaved changes...</div>;
        default: return <div className="h-5"></div>;
    }
};

const ImageUploader: React.FC<{
    label: string;
    currentImageUrl?: string | null;
    previewUrl?: string;
    onFileSelect: (file: File) => void;
}> = ({ label, currentImageUrl, previewUrl, onFileSelect }) => {
    const { t } = useLanguage();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const displayUrl = previewUrl || currentImageUrl;

    return (
        <div className="group">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
            <div className="flex items-center gap-6 p-6 bg-slate-50 border border-slate-200 rounded-[2rem] group-hover:bg-white group-hover:border-primary/30 transition-all">
                <img
                    src={displayUrl || 'https://i.postimg.cc/8zRZt9pM/user.png'}
                    alt="Preview"
                    className="size-20 rounded-3xl object-cover bg-white shadow-md border-2 border-white"
                />
                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recommended: 800x800 PNG</p>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} ref={fileInputRef} className="hidden" />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white py-2 px-6 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all"
                    >
                        {t('uploadImage')}
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Main Component ---

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [formState, setFormState] = useState<Partial<Business>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<EditorTab>('profile');

    // State for image uploads and auto-save
    const [stagedFiles, setStagedFiles] = useState<{ logo?: File, cover?: File }>({});
    const [previews, setPreviews] = useState<{ logo?: string, cover?: string }>({});
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const isSavingRef = useRef(false);

    // Debounce state for auto-saving
    const debouncedFormState = useDebounce(formState, 1500);
    const debouncedStagedFiles = useDebounce(stagedFiles, 1500);

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

    useEffect(() => {
        const newPreviews: { logo?: string, cover?: string } = {};
        if (stagedFiles.logo) newPreviews.logo = URL.createObjectURL(stagedFiles.logo);
        if (stagedFiles.cover) newPreviews.cover = URL.createObjectURL(stagedFiles.cover);
        
        if (Object.keys(newPreviews).length > 0) {
            setPreviews(prev => ({...prev, ...newPreviews}));
        }
        
        return () => {
            if (newPreviews.logo) URL.revokeObjectURL(newPreviews.logo);
            if (newPreviews.cover) URL.revokeObjectURL(newPreviews.cover);
        };
    }, [stagedFiles]);
    
    useEffect(() => {
        if (isSavingRef.current || loading) return;
        const hasFormChanges = JSON.stringify(formState) !== JSON.stringify(business);
        const hasFileChanges = Object.keys(stagedFiles).length > 0;
        if (hasFormChanges || hasFileChanges) {
            setSaveStatus('typing');
        }
    }, [formState, stagedFiles, business, loading]);


    const performSave = useCallback(async () => {
        if (!business) return;
        
        isSavingRef.current = true;
        setSaveStatus('saving');
        
        let dataToUpdate = { ...formState };

        try {
            if (stagedFiles.logo) {
                const newLogoUrl = await uploadBusinessAsset(business.id, stagedFiles.logo, 'logo');
                if (newLogoUrl) dataToUpdate.logo_url = newLogoUrl;
                else throw new Error('Logo upload failed');
            }

            if (stagedFiles.cover) {
                const newCoverUrl = await uploadBusinessAsset(business.id, stagedFiles.cover, 'cover');
                if (newCoverUrl) dataToUpdate.cover_photo_url = newCoverUrl;
                else throw new Error('Cover photo upload failed');
            }
            
            const updatedBusiness = await updateBusiness(business.id, dataToUpdate);

            if (updatedBusiness) {
                const newBusinessState = { ...business, ...updatedBusiness };
                sessionStorage.setItem('business', JSON.stringify(newBusinessState));
                setBusiness(newBusinessState);
                setFormState(newBusinessState);
                setStagedFiles({});
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                throw new Error('Business update failed');
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveStatus('error');
        } finally {
            isSavingRef.current = false;
        }
    }, [business, formState, stagedFiles]);
    
    useEffect(() => {
        if (saveStatus === 'typing' && !isSavingRef.current) {
            performSave();
        }
    }, [debouncedFormState, debouncedStagedFiles, saveStatus, performSave]);
    
    if (loading) return <div className="flex justify-center items-center h-screen bg-[#f6f6f8]"><Spinner /></div>;
    if (!business) return null;

    return (
        <div className="min-h-screen bg-[#f6f6f8] font-sans">
            <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200 p-6 md:px-12">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <BackButton onClick={() => window.location.href = '/business'} />
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{t('businessSettings')}</h1>
                            <SaveStatusIndicator status={saveStatus} />
                        </div>
                    </div>
                    <nav className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
                        <TabButton label={t('publicProfile')} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <TabButton label={t('qrCustomization')} isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
                        <TabButton label={t('location')} isActive={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    </nav>
                </div>
            </header>
            
            <main className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'profile' && 
                        <ProfileSettings 
                            formState={formState} 
                            setFormState={setFormState}
                            previews={previews}
                            onFileSelect={(type, file) => setStagedFiles(prev => ({...prev, [type]: file}))}
                        />}
                    {activeTab === 'branding' && <BrandingSettings formState={formState} setFormState={setFormState} business={business} />}
                    {activeTab === 'location' && <LocationSettings formState={formState} setFormState={setFormState} />}
                </div>
            </main>
        </div>
    );
};

// --- Child Components for Tabs ---

const ProfileSettings: React.FC<{
    formState: Partial<Business>, 
    setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>,
    previews: { logo?: string, cover?: string },
    onFileSelect: (type: 'logo' | 'cover', file: File) => void
}> = ({ formState, setFormState, previews, onFileSelect }) => {
    const { t } = useLanguage();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setFormState(prev => ({...prev, [e.target.name]: e.target.value }));
    
    return (
        <SettingsCard title={t('publicProfile')} description={t('publicProfileDesc')}>
            <div className="space-y-10">
                <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageUploader 
                        label={t('logoUrl')} 
                        currentImageUrl={formState.logo_url}
                        previewUrl={previews.logo}
                        onFileSelect={(file) => onFileSelect('logo', file)} 
                    />
                    <ImageUploader 
                        label={t('coverPhotoUrl')} 
                        currentImageUrl={formState.cover_photo_url}
                        previewUrl={previews.cover}
                        onFileSelect={(file) => onFileSelect('cover', file)} 
                    />
                </div>
                <SelectField
                    label={t('defaultProfileTab')}
                    name="default_profile_tab"
                    value={formState.default_profile_tab || 'posts'}
                    onChange={handleChange}
                    options={[
                        { value: 'posts', label: t('posts') },
                        { value: 'discounts', label: t('discounts') },
                        { value: 'about', label: t('about') },
                    ]}
                />
                <TextAreaField label={t('bio')} name="bio" value={formState.bio || ''} onChange={handleChange} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                    <InputField label={t('website')} name="website_url" value={formState.website_url || ''} onChange={handleChange} placeholder="https://..." />
                    <InputField label={t('contactPhone')} name="public_phone_number" value={formState.public_phone_number || ''} onChange={handleChange} />
                    <InputField label={t('facebook')} name="facebook_url" value={formState.facebook_url || ''} onChange={handleChange} placeholder="https://facebook.com/..." />
                    <InputField label={t('instagram')} name="instagram_url" value={formState.instagram_url || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
                </div>
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
        <div className="space-y-10">
            <SettingsCard title={t('qrCustomization')} description={t('qrCustomizationDesc')}>
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-shrink-0 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 shadow-inner">
                        {previewQr ? <img src={previewQr} alt="QR Code Preview" className="w-56 h-56 rounded-2xl shadow-xl border-4 border-white"/> : <div className="w-56 h-56 bg-gray-200 rounded-2xl animate-pulse" />}
                        <p className="text-center text-[10px] font-black uppercase tracking-widest text-slate-400 mt-6">Scan to test login</p>
                    </div>
                    <div className="flex-grow space-y-8 w-full">
                        <InputField label={t('logoUrl')} name="qr_logo_url" value={formState.qr_logo_url || ''} onChange={handleChange} placeholder="https://..." />
                        <div className="group">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('qrColor')}</label>
                            <input type="color" name="qr_color" value={formState.qr_color || '#000000'} onChange={handleChange} className="h-14 w-full p-1 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <SelectField label={t('eyeShape')} name="qr_eye_shape" value={formState.qr_eye_shape || 'square'} onChange={handleChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                           <SelectField label={t('dotStyle')} name="qr_dot_style" value={formState.qr_dot_style || 'square'} onChange={handleChange} options={[
                                { value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' },
                                { value: 'classy', label: 'Classy' }, { value: 'classy-rounded', label: 'Classy Rounded' }, { value: 'extra-rounded', label: 'Extra Rounded' }
                           ]} />
                        </div>
                    </div>
                </div>
            </SettingsCard>
            <CustomerQrDesigns business={business} />
        </div>
    );
};

const LocationSettings: React.FC<{formState: Partial<Business>, setFormState: React.Dispatch<React.SetStateAction<Partial<Business>>>}> = ({ formState, setFormState }) => {
    const { t } = useLanguage();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    return (
        <SettingsCard title={t('businessLocation')} description="Enter your full business address for the map.">
            <div className="space-y-8">
                <InputField label={t('address')} name="address_text" value={formState.address_text || ''} onChange={handleChange} placeholder="e.g., 1600 Amphitheatre Parkway, Mountain View, CA" />
                {formState.address_text && (
                     <div className="rounded-[2rem] overflow-hidden border border-slate-200 shadow-xl">
                        <iframe className="w-full h-80 grayscale contrast-125" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(formState.address_text)}&output=embed`}></iframe>
                    </div>
                )}
            </div>
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

    const handleNewDesignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setNewDesign({ ...newDesign, [newDesign.qr_color ? 'qr_color' : e.target.name]: e.target.value });
    
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="p-8 rounded-[2rem] space-y-6 bg-slate-50 border border-slate-100">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight uppercase">Add New Style</h3>
                    <InputField label={t('logoUrl')} name="qr_logo_url" value={newDesign.qr_logo_url || ''} onChange={(e:any) => setNewDesign({...newDesign, qr_logo_url: e.target.value})} placeholder="https://..." />
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t('qrColor')}</label>
                        <input type="color" name="qr_color" value={newDesign.qr_color || '#000000'} onChange={(e:any) => setNewDesign({...newDesign, qr_color: e.target.value})} className="h-12 w-full p-1 border border-slate-200 rounded-xl cursor-pointer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label={t('eyeShape')} name="qr_eye_shape" value={newDesign.qr_eye_shape || 'square'} onChange={(e:any) => setNewDesign({...newDesign, qr_eye_shape: e.target.value})} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                        <SelectField label={t('dotStyle')} name="qr_dot_style" value={newDesign.qr_dot_style || 'square'} onChange={(e:any) => setNewDesign({...newDesign, qr_dot_style: e.target.value})} options={[{ value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' }]} />
                    </div>
                    <button onClick={handleAddDesign} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95 transition-all">{t('addDesign')}</button>
                </div>
                <div className="space-y-6">
                    <h3 className="font-black text-slate-800 text-lg tracking-tight uppercase">Branded Library</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {designs.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-300 font-bold uppercase tracking-widest bg-slate-50 rounded-2xl border border-dashed border-slate-200">Empty</div>
                        ) : designs.map(d => <QrDesignItem key={d.id} design={d} onDelete={handleDeleteDesign} />)}
                    </div>
                </div>
            </div>
        </SettingsCard>
    );
};


// --- UI & Helper Components ---
const QrDesignItem: React.FC<{ design: BusinessQrDesign, onDelete: (id: string) => void }> = ({ design, onDelete }) => {
    const [preview, setPreview] = useState('');
    useEffect(() => {
        generateQrCode('preview', design).then(setPreview);
    }, [design]);

    return (
        <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-[1.5rem] bg-white hover:shadow-lg transition-all group">
            <div className="relative">
               {preview ? <img src={preview} alt="design" className="size-16 rounded-xl shadow-sm" /> : <div className="size-16 bg-slate-50 rounded-xl animate-pulse" />}
               <button onClick={() => onDelete(design.id)} className="absolute -top-2 -right-2 size-8 bg-rose-50 text-rose-600 rounded-full border border-rose-100 flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-sm"><TrashIcon /></button>
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">HEX</p>
                <p className="text-xs font-bold text-slate-800 truncate">{design.qr_color}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">STYLE</p>
                <p className="text-xs font-bold text-slate-800 truncate capitalize">{design.qr_dot_style}</p>
            </div>
        </div>
    );
};

const SettingsCard: React.FC<{title: string, description: string, children: React.ReactNode}> = ({ title, description, children }) => (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-10 mb-10">
        <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{title}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{description}</p>
        </div>
        {children}
    </div>
);

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-6 rounded-xl font-bold text-sm transition-all ${isActive ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
        {label}
    </button>
);

export default BusinessEditorPage;
