import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Business, BusinessQrDesign, QrStyle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { 
    updateBusiness, getBusinessQrDesigns, createBusinessQrDesign, deleteBusinessQrDesign,
    uploadBusinessAsset
} from '../services/api';
import { Spinner, InputField, TextAreaField, SelectField, TrashIcon, FlagLogo, BackButton } from '../components/common';

type EditorTab = 'profile' | 'branding' | 'location';
type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved' | 'error';

const useDebounce = <T,>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => { setDebouncedValue(value); }, delay);
        return () => { clearTimeout(handler); };
    }, [value, delay]);
    return debouncedValue;
};

const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
    switch (status) {
        case 'saving': return <div className="flex items-center gap-2 text-sm text-slate-500 font-bold"><Spinner className="h-4 w-4" /> Syncing...</div>;
        case 'saved': return <div className="text-sm text-[#2bee6c] font-bold flex items-center gap-2"><span className="material-icons-round text-sm">check_circle</span> Cloud synced</div>;
        case 'error': return <div className="text-sm text-rose-600 font-bold">Sync error</div>;
        case 'typing': return <div className="text-sm text-slate-400 font-bold">Modified</div>;
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
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{label}</label>
            <div className="flex items-center gap-6 p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:border-[#2bee6c]/30 transition-all">
                <img src={displayUrl || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="P" className="size-20 rounded-3xl object-cover border-2 border-white shadow-sm" />
                <div className="space-y-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Recommended: 800px PNG</p>
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && onFileSelect(e.target.files[0])} ref={fileInputRef} className="hidden" />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-[#163a24] py-2.5 px-6 rounded-xl text-xs font-black text-[#2bee6c] hover:opacity-90 active:scale-95 transition-all">
                        {t('uploadImage')}
                    </button>
                </div>
            </div>
        </div>
    );
};

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [formState, setFormState] = useState<Partial<Business>>({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<EditorTab>('profile');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [stagedFiles, setStagedFiles] = useState<{ logo?: File, cover?: File }>({});
    const [previews, setPreviews] = useState<{ logo?: string, cover?: string }>({});
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const isSavingRef = useRef(false);

    const debouncedFormState = useDebounce(formState, 1500);
    const debouncedStagedFiles = useDebounce(stagedFiles, 1500);

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness);
            setBusiness(parsed);
            setFormState(parsed);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        if (isSavingRef.current || loading) return;
        const hasFormChanges = JSON.stringify(formState) !== JSON.stringify(business);
        const hasFileChanges = Object.keys(stagedFiles).length > 0;
        if (hasFormChanges || hasFileChanges) setSaveStatus('typing');
    }, [formState, stagedFiles, business, loading]);

    const performSave = useCallback(async () => {
        if (!business) return;
        isSavingRef.current = true;
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
                const newState = { ...business, ...updated };
                sessionStorage.setItem('business', JSON.stringify(newState));
                setBusiness(newState);
                setFormState(newState);
                setStagedFiles({});
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            }
        } catch (error) { setSaveStatus('error'); }
        finally { isSavingRef.current = false; }
    }, [business, formState, stagedFiles]);
    
    useEffect(() => {
        if (saveStatus === 'typing' && !isSavingRef.current) performSave();
    }, [debouncedFormState, debouncedStagedFiles, saveStatus, performSave]);
    
    if (loading || !business) return <div className="flex justify-center items-center h-screen bg-white"><Spinner /></div>;

    const navItems = [
        { label: t('analytics'), icon: 'dashboard', href: '/business' },
        { label: t('customerList'), icon: 'group', href: '/business' },
        { label: t('posts'), icon: 'campaign', href: '/business' },
    ];

    return (
        <div className="flex min-h-screen bg-[#ffffff] font-sans text-[#163a24] overflow-hidden">
            <aside className={`hidden lg:flex flex-col bg-white sticky top-0 h-screen sidebar-transition overflow-hidden ${sidebarCollapsed ? 'w-0' : 'w-72'}`}>
                <div className="p-8 flex flex-col h-full w-72">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-3">
                            <FlagLogo className="w-10 h-10" />
                            <span className="text-xl font-bold font-display tracking-tight text-[#163a24]">QROYAL</span>
                        </div>
                        <button onClick={() => setSidebarCollapsed(true)} className="p-2 text-[#4c9a66] hover:text-[#163a24] transition-colors">
                             <svg width="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.47108 18.9992 8.26339 19 9.4 19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H9.4C8.26339 5 7.47108 5.00078 6.85424 5.05118ZM7 7C7.55229 7 8 7.44772 8 8V16C8 16.5523 7.55229 17 7 17C6.44772 17 6 16.5523 6 16V8C6 7.44772 6.44772 7 7 7Z" fill="currentColor"></path></svg>
                        </button>
                    </div>
                    <nav className="flex flex-col gap-2 flex-grow">
                        {navItems.map(item => (
                            <button key={item.label} onClick={() => window.location.href = item.href} className="flex items-center gap-4 w-full p-4 rounded-2xl font-bold text-slate-400 hover:text-[#163a24] hover:bg-slate-50 transition-all">
                                <span className="material-icons-round">{item.icon}</span>
                                <span className="text-sm tracking-tight">{item.label}</span>
                            </button>
                        ))}
                        <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-2">
                            <button className="flex items-center gap-4 w-full p-4 rounded-2xl font-bold bg-[#163a24] text-[#2bee6c]">
                                <span className="material-icons-round">settings</span>
                                <span className="text-sm tracking-tight">{t('businessSettings')}</span>
                            </button>
                            <button onClick={() => window.location.href = '/business/scanner'} className="flex items-center gap-4 w-full p-4 rounded-2xl font-bold text-slate-400 hover:text-[#163a24] hover:bg-slate-50">
                                <span className="material-icons-round">qr_code_scanner</span>
                                <span className="text-sm tracking-tight">{t('kioskMode')}</span>
                            </button>
                        </div>
                    </nav>
                </div>
            </aside>

            <div className="flex-grow flex flex-col h-screen overflow-y-auto">
                <header className="h-20 bg-white border-b border-slate-100 px-12 flex items-center justify-between sticky top-0 z-20">
                    <div className="flex items-center gap-8">
                        {sidebarCollapsed && (
                            <button onClick={() => setSidebarCollapsed(false)} className="p-2 text-[#4c9a66] hover:text-[#163a24] transition-colors">
                                <svg width="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.35719 3H14.6428C15.7266 2.99999 16.6007 2.99998 17.3086 3.05782C18.0375 3.11737 18.6777 3.24318 19.27 3.54497C20.2108 4.02433 20.9757 4.78924 21.455 5.73005C21.7568 6.32234 21.8826 6.96253 21.9422 7.69138C22 8.39925 22 9.27339 22 10.3572V13.6428C22 14.7266 22 15.6008 21.9422 16.3086C21.8826 17.0375 21.7568 17.6777 21.455 18.27C20.9757 19.2108 20.2108 19.9757 19.27 20.455C18.6777 20.7568 18.0375 20.8826 17.3086 20.9422C16.6008 21 15.7266 21 14.6428 21H9.35717C8.27339 21 7.39925 21 6.69138 20.9422C5.96253 20.8826 5.32234 20.7568 4.73005 20.455C3.78924 19.9757 3.02433 19.2108 2.54497 18.27C2.24318 17.6777 2.11737 17.0375 2.05782 16.3086C1.99998 15.6007 1.99999 14.7266 2 13.6428V10.3572C1.99999 9.27341 1.99998 8.39926 2.05782 7.69138C2.11737 6.96253 2.24318 6.32234 2.54497 5.73005C3.02433 4.78924 3.78924 4.02433 4.73005 3.54497C5.32234 3.24318 5.96253 3.11737 6.69138 3.05782C7.39926 2.99998 8.27341 2.99999 9.35719 3ZM6.85424 5.05118C6.24907 5.10062 5.90138 5.19279 5.63803 5.32698C5.07354 5.6146 4.6146 6.07354 4.32698 6.63803C4.19279 6.90138 4.10062 7.24907 4.05118 7.85424C4.00078 8.47108 4 9.26339 4 10.4V13.6C4 14.7366 4.00078 15.5289 4.05118 16.1458C4.10062 16.7509 4.19279 17.0986 4.32698 17.362C4.6146 17.9265 5.07354 18.3854 5.63803 18.673C5.90138 18.8072 6.24907 18.8994 6.85424 18.9488C7.17922 18.9754 7.55292 18.9882 8 18.9943V5.0057C7.55292 5.01184 7.17922 5.02462 6.85424 5.05118ZM10 5V19H14.6C15.7366 19 16.5289 18.9992 17.1458 18.9488C17.7509 18.8994 18.0986 18.8072 18.362 18.673C18.9265 18.3854 19.3854 17.9265 19.673 17.362C19.8072 17.0986 19.8994 16.7509 19.9488 16.1458C19.9992 15.5289 20 14.7366 20 13.6V10.4C20 9.26339 19.9992 8.47108 19.9488 7.85424C19.8994 7.24907 19.8072 6.90138 19.673 6.63803C19.3854 6.07354 18.9265 5.6146 18.362 5.32698C18.0986 5.19279 17.7509 5.10062 17.1458 5.05118C16.5289 5.00078 15.7366 5 14.6 5H10Z" fill="currentColor"></path></svg>
                            </button>
                        )}
                        <div className="flex items-center gap-4">
                            <BackButton className="p-2 !bg-transparent !px-0" />
                            <h2 className="text-2xl font-bold font-display tracking-tight text-[#163a24]">{t('businessSettings')}</h2>
                            <SaveStatusIndicator status={saveStatus} />
                        </div>
                    </div>
                </header>

                <main className="p-12 max-w-5xl w-full mx-auto animate-in fade-in duration-700">
                    <div className="flex gap-10 border-b border-slate-100 mb-12">
                        <TabButton label="Public Profile" isActive={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        <TabButton label="Visual Branding" isActive={activeTab === 'branding'} onClick={() => setActiveTab('branding')} />
                        <TabButton label="Global Presence" isActive={activeTab === 'location'} onClick={() => setActiveTab('location')} />
                    </div>

                    <div className="space-y-10">
                        {activeTab === 'profile' && <ProfileEditor formState={formState} setFormState={setFormState} previews={previews} onFileSelect={(type, file) => setStagedFiles(prev => ({...prev, [type]: file}))} />}
                        {activeTab === 'branding' && <BrandingEditor formState={formState} setFormState={setFormState} business={business} />}
                        {activeTab === 'location' && <LocationEditor formState={formState} setFormState={setFormState} />}
                    </div>
                </main>
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all ${isActive ? 'text-[#2bee6c] border-b-2 border-[#2bee6c]' : 'text-slate-400 hover:text-[#163a24]'}`}>
        {label}
    </button>
);

const ProfileEditor: React.FC<any> = ({ formState, setFormState, previews, onFileSelect }) => {
    const { t } = useLanguage();
    const handleChange = (e: any) => setFormState((prev: any) => ({...prev, [e.target.name]: e.target.value }));
    return (
        <div className="space-y-12">
            <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <ImageUploader label={t('logoUrl')} currentImageUrl={formState.logo_url} previewUrl={previews.logo} onFileSelect={(file: any) => onFileSelect('logo', file)} />
                <ImageUploader label={t('coverPhotoUrl')} currentImageUrl={formState.cover_photo_url} previewUrl={previews.cover} onFileSelect={(file: any) => onFileSelect('cover', file)} />
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
                {previewQr ? <img src={previewQr} alt="QR" className="w-56 h-56 rounded-2xl border-4 border-white shadow-sm"/> : <div className="w-56 h-56 bg-slate-50 rounded-2xl animate-pulse" />}
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

export default BusinessEditorPage;