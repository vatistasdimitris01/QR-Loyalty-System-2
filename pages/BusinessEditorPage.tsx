import React, { useState, useEffect } from 'react';
import { Business } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { updateBusiness } from '../services/api';
import { Spinner } from '../components/common';

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [formState, setFormState] = useState<Partial<Business>>({});
    const [previewQr, setPreviewQr] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

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
            });
        }
        setLoading(false);
    }, []);

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
    }, [business, formState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!business) return;
        setIsSaving(true);
        setSaveMessage('');
        const updatedBusiness = await updateBusiness(business.id, formState);
        setIsSaving(false);
        if (updatedBusiness) {
            sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
            setBusiness(updatedBusiness);
            setSaveMessage(t('saveSuccess'));
        } else {
            setSaveMessage(t('saveError'));
        }
        setTimeout(() => setSaveMessage(''), 5000);
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
                {/* Profile Settings */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-6">
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

                {/* QR Customization */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md space-y-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{t('qrCustomization')}</h2>
                        <p className="text-sm text-gray-500">{t('qrCustomizationDesc')}</p>
                    </div>
                     {previewQr && <img src={previewQr} alt="QR Code Preview" className="w-48 h-48 rounded-lg border mx-auto"/>}
                    <InputField label={t('logoUrl')} name="qr_logo_url" value={formState.qr_logo_url || ''} onChange={handleChange} placeholder="https://..." />
                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('qrColor')}</label>
                        <input type="color" name="qr_color" value={formState.qr_color} onChange={handleChange} className="mt-1 h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer" />
                    </div>
                    <SelectField label={t('eyeShape')} name="qr_eye_shape" value={formState.qr_eye_shape || 'square'} onChange={handleChange} options={[{value: 'square', label: 'Square'}, {value: 'rounded', label: 'Rounded'}]} />
                    <SelectField label={t('dotStyle')} name="qr_dot_style" value={formState.qr_dot_style || 'square'} onChange={handleChange} options={[
                        { value: 'square', label: 'Square' }, { value: 'dots', label: 'Dots' }, { value: 'rounded', label: 'Rounded' },
                        { value: 'classy', label: 'Classy' }, { value: 'classy-rounded', label: 'Classy Rounded' }, { value: 'extra-rounded', label: 'Extra Rounded' }
                    ]} />
                </div>
            </div>

             {/* Save Button */}
            <div className="mt-8 flex items-center justify-end gap-4">
                {saveMessage && <p className="text-green-600 text-sm font-semibold">{saveMessage}</p>}
                <button onClick={handleSave} disabled={isSaving} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2">
                    {isSaving && <Spinner className="h-5 w-5 text-white" />}
                    {isSaving ? 'Saving...' : t('saveSettings')}
                </button>
            </div>
        </div>
    );
};

// Helper components for form fields
const InputField: React.FC<{label: string, name: string, value: string, onChange: any, placeholder?: string}> = ({label, name, value, onChange, placeholder}) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <input id={name} name={name} type="text" value={value} onChange={onChange} placeholder={placeholder} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
