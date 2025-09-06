import React, { useState, useEffect, useCallback } from 'react';
import { Business, BusinessQrDesign, QrStyle } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { updateBusiness, getBusinessQrDesigns, createBusinessQrDesign, deleteBusinessQrDesign } from '../services/api';
import { Spinner } from '../components/common';

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [formState, setFormState] = useState<Partial<Business>>({});
    const [previewQr, setPreviewQr] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // State for QR Designs
    const [designs, setDesigns] = useState<BusinessQrDesign[]>([]);
    const [newDesign, setNewDesign] = useState<QrStyle>({ qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square', qr_logo_url: '' });

    const fetchDesigns = useCallback(async (businessId: string) => {
        const fetchedDesigns = await getBusinessQrDesigns(businessId);
        setDesigns(fetchedDesigns);
    }, []);

    useEffect(() => {
        setLoading(true);
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            const parsed = JSON.parse(storedBusiness);
            setBusiness(parsed);
            setFormState({
                public_name: parsed.public_name || parsed.name,
                logo_url: parsed.logo_url || '',
                bio: parsed.bio || '',
                website_url: parsed.website_url || '',
                facebook_url: parsed.facebook_url || '',
                instagram_url: parsed.instagram_url || '',
                public_phone_number: parsed.public_phone_number || '',
                qr_logo_url: parsed.qr_logo_url || '',
                qr_color: parsed.qr_color || '#000000',
                qr_eye_shape: parsed.qr_eye_shape || 'square',
                qr_dot_style: parsed.qr_dot_style || 'square',
                points_per_scan: parsed.points_per_scan || 1,
                reward_threshold: parsed.reward_threshold || 5,
                reward_message: parsed.reward_message || '',
            });
            fetchDesigns(parsed.id);
        }
        setLoading(false);
    }, [fetchDesigns]);

    useEffect(() => {
        if (business) {
            const qrOptions = {
                qr_logo_url: formState.qr_logo_url,
                qr_color: formState.qr_color,
                qr_eye_shape: formState.qr_eye_shape,
                qr_dot_style: formState.qr_dot_style,
            };
            generateQrCode(business.qr_token, qrOptions).then(setPreviewQr);
        }
    }, [business, formState.qr_logo_url, formState.qr_color, formState.qr_eye_shape, formState.qr_dot_style]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        // Ensure numeric fields are stored as numbers
        if (name === 'points_per_scan' || name === 'reward_threshold') {
             setFormState({ ...formState, [name]: parseInt(value, 10) || 0 });
        } else {
            setFormState({ ...formState, [name]: value });
        }
    };

    const handleSave = async () => {
        if (!business) return;
        setIsSaving(true);
        setSaveMessage('');
        try {
            const updatedBusiness = await updateBusiness(business.id, formState);
            if (updatedBusiness) {
                sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
                setBusiness(updatedBusiness);
                setSaveMessage(t('saveSuccess'));
            } else {
                setSaveMessage(t('saveError'));
            }
        } catch (error) {
            console.error('Failed to save settings:', error);
            setSaveMessage(t('saveError'));
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(''), 5000);
        }
    };

    const handleNewDesignChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewDesign({ ...newDesign, [e.target.name]: e.target.value });
    };

    const handleAddDesign = async () => {
        if (!business) return;
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
    
    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('businessSettings')}</h1>
                </div>
                <a href="/business" className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">&larr; {t('back')}</a>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile & Loyalty */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Public Profile */}
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{t('publicProfile')}</h2>
                            <p className="text-sm text-gray-500">{t('publicProfileDesc')}</p>
                        </div>
                        <InputField label={t('publicBusinessName')} name="public_name" value={formState.public_name || ''} onChange={handleChange} />
                        <InputField label={t('logoUrl')} name="logo_url" value={formState.logo_url || ''} onChange={handleChange} placeholder="https://..." />
                        <TextAreaField label={t('bio')} name="bio" value={formState.bio || ''} onChange={handleChange} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField label={t('website')} name="website_url" value={formState.website_url || ''} onChange={handleChange} placeholder="https://..." />
                            <InputField label={t('contactPhone')} name="public_phone_number" value={formState.public_phone_number || ''} onChange={handleChange} />
                            <InputField label={t('facebook')} name="facebook_url" value={formState.facebook_url || ''} onChange={handleChange} placeholder="https://facebook.com/..." />
                            <InputField label={t('instagram')} name="instagram_url" value={formState.instagram_url || ''} onChange={handleChange} placeholder="https://instagram.com/..." />
                        </div>
                    </div>

                    {/* Loyalty Program */}
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                         <div>
                            <h2 className="text-xl font-bold text-gray-800">{t('loyaltyProgram')}</h2>
                            <p className="text-sm text-gray-500">{t('loyaltyProgramDesc')}</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <InputField type="number" label={t('pointsPerScan')} name="points_per_scan" value={String(formState.points_per_scan || 1)} onChange={handleChange} />
                            <InputField type="number" label={t('rewardThreshold')} name="reward_threshold" value={String(formState.reward_threshold || 5)} onChange={handleChange} />
                        </div>
                        <InputField label={t('rewardMessage')} name="reward_message" value={formState.reward_message || ''} onChange={handleChange} placeholder={t('rewardMessagePlaceholder')} />
                    </div>
                </div>

                {/* Right Column: QR Customizations */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Business QR */}
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{t('qrCustomization')}</h2>
                            <p className="text-sm text-gray-500">{t('qrCustomizationDesc')}</p>
                        </div>
                         {previewQr && <img src={previewQr} alt="QR Code Preview" className="w-48 h-48 rounded-lg border mx-auto"/>}
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

                    {/* Customer QR Designs */}
                    <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">{t('customerQrDesigns')}</h2>
                            <p className="text-sm text-gray-500">{t('customerQrDesignsDesc')}</p>
                        </div>
                        <div className="border p-4 rounded-lg space-y-4">
                            <h3 className="font-semibold">Add New Design</h3>
                             <InputField label={t('logoUrl')} name="qr_logo_url" value={newDesign.qr_logo_url || ''} onChange={handleNewDesignChange} placeholder="https://..." />
                             <div>
                                <label className="block text-sm font-medium text-gray-700">{t('qrColor')}</label>
                                <input type="color" name="qr_color" value={newDesign.qr_color} onChange={handleNewDesignChange} className="mt-1 h-10 w-full p-1 border border-gray-300 rounded-md cursor-pointer" />
                            </div>
                            <SelectField label={t('eyeShape')} name="qr_eye_shape" value={newDesign.qr_eye_shape || 'square'} onChange={handleNewDesignChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                            <SelectField label={t('dotStyle')} name="qr_dot_style" value={newDesign.qr_dot_style || 'square'} onChange={handleNewDesignChange} options={[
                                { value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' }
                            ]} />
                            <button onClick={handleAddDesign} className="w-full bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700">{t('addDesign')}</button>
                        </div>
                        <div className="space-y-2">
                             {designs.length === 0 ? <p className="text-sm text-gray-500">{t('noDesigns')}</p> : designs.map(d => <QrDesignItem key={d.id} design={d} onDelete={handleDeleteDesign} />)}
                        </div>
                    </div>
                </div>
            </div>

             {/* Save Button */}
            <div className="mt-8 flex items-center justify-end gap-4">
                {saveMessage && <p className={`text-sm font-semibold ${saveMessage === t('saveSuccess') ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</p>}
                <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2">
                    {isSaving && <Spinner className="h-5 w-5 text-white" />}
                    {isSaving ? 'Saving...' : t('saveSettings')}
                </button>
            </div>
        </div>
    );
};

const QrDesignItem: React.FC<{ design: BusinessQrDesign, onDelete: (id: string) => void }> = ({ design, onDelete }) => {
    const { t } = useLanguage();
    const [preview, setPreview] = useState('');
    useEffect(() => {
        generateQrCode('preview', design).then(setPreview);
    }, [design]);

    return (
        <div className="flex items-center gap-2 p-2 border rounded-lg">
            {preview ? <img src={preview} alt="design preview" className="w-12 h-12 rounded" /> : <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />}
            <div className="flex-grow">
                <p className="text-xs">Color: <span className="font-mono">{design.qr_color}</span></p>
                <p className="text-xs">Style: {design.qr_dot_style}</p>
            </div>
            <button onClick={() => onDelete(design.id)} className="text-red-500 hover:text-red-700 p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
}

// Helper components for form fields
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
