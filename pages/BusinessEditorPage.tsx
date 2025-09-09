import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Business, BusinessQrDesign, QrStyle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { 
    updateBusiness, getBusinessQrDesigns, createBusinessQrDesign, deleteBusinessQrDesign,
    uploadBusinessAsset
} from '../services/api';
import { Spinner, InputField, TextAreaField, SelectField, TrashIcon } from '../components/common';

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
        case 'saving': return <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner className="h-4 w-4" /> Saving...</div>;
        case 'saved': return <div className="text-sm text-green-600 font-semibold">All changes saved</div>;
        case 'error': return <div className="text-sm text-red-600 font-semibold">Save failed. Please try again.</div>;
        case 'typing': return <div className="text-sm text-gray-500">Unsaved changes...</div>;
        default: return <div className="h-5"></div>; // Placeholder to prevent layout shift
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
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <div className="mt-2 flex items-center gap-4">
                <img
                    src={displayUrl || 'https://via.placeholder.com/150'}
                    alt="Preview"
                    className="h-16 w-16 rounded-md object-cover bg-gray-200"
                />
                <input type="file" accept="image/*" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} ref={fileInputRef} className="hidden" />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                >
                    {t('uploadImage')}
                </button>
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

    // Effect to update previews when files are staged
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
    
    // Effect to detect user typing
    useEffect(() => {
        if (isSavingRef.current || loading) return;
         // Check if there are actual changes
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
    
    // Trigger save on debounced changes
    useEffect(() => {
        if (saveStatus === 'typing' && !isSavingRef.current) {
            performSave();
        }
    }, [debouncedFormState, debouncedStagedFiles, saveStatus, performSave]);
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    if (!business) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="sticky top-0 z-10 bg-white shadow-sm p-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800 text-center sm:text-left">{t('businessSettings')}</h1>
                    <div className="flex items-center justify-center sm:justify-end gap-4 flex-wrap">
                        <SaveStatusIndicator status={saveStatus} />
                        <a href="/business" className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 text-sm md:text-base">&larr; {t('back')}</a>
                    </div>
                </div>
            </header>
            
            <main className="p-4 md:p-8">
                 <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        <TabButton label={t('publicProfile')} isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <TabButton label={t('qrCustomization')} isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
                        <TabButton label={t('location')} isActive={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    </nav>
                </div>

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
            <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
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
                            <input type="color" name="qr_color" value={formState.qr_color || '#000000'} onChange={handleChange} className="mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer" />
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
                    <input type="color" name="qr_color" value={newDesign.qr_color || '#000000'} onChange={handleNewDesignChange} className="mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer" />
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


// --- UI & Helper Components ---
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

export default BusinessEditorPage;