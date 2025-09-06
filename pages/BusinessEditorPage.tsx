import React, { useState, useEffect, useMemo } from 'react';
import { Business } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { generateQrCode } from '../services/qrGenerator';
import { updateBusiness, regenerateAllCustomerQrsForBusiness } from '../services/api';
import { Spinner } from '../components/common';

const BusinessEditorPage: React.FC = () => {
    const { t } = useLanguage();
    const [business, setBusiness] = useState<Business | null>(null);
    const [logoUrl, setLogoUrl] = useState('');
    const [qrColor, setQrColor] = useState('#000000');
    const [eyeShape, setEyeShape] = useState('square');
    const [dotStyle, setDotStyle] = useState('square');
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
            setLogoUrl(parsed.qr_logo_url || '');
            setQrColor(parsed.qr_color || '#000000');
            setEyeShape(parsed.qr_eye_shape || 'square');
            setDotStyle(parsed.qr_dot_style || 'square');
        }
        setLoading(false);
    }, []);

    const qrOptions = useMemo(() => ({
        qr_logo_url: logoUrl,
        qr_color: qrColor,
        qr_eye_shape: eyeShape,
        qr_dot_style: dotStyle,
    }), [logoUrl, qrColor, eyeShape, dotStyle]);

    useEffect(() => {
        if (business) {
            generateQrCode(business.qr_token, qrOptions).then(setPreviewQr);
        }
    }, [business, qrOptions]);
    
    const handleSave = async () => {
        if (!business) return;

        setIsSaving(true);
        setSaveMessage('');

        const updatedBusinessData: Partial<Business> = { ...qrOptions };
        
        const updatedBusiness = await updateBusiness(business.id, updatedBusinessData);
        
        if (updatedBusiness) {
            // Update session storage with latest business data including new QR URL for the business itself
            sessionStorage.setItem('business', JSON.stringify(updatedBusiness));
            const { success } = await regenerateAllCustomerQrsForBusiness(business.id);
            if (success) {
                setSaveMessage(t('saveSuccess'));
            } else {
                setSaveMessage(t('saveErrorCustomers'));
            }
        } else {
            setSaveMessage(t('saveError'));
        }

        setIsSaving(false);
        setTimeout(() => setSaveMessage(''), 5000);
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{t('qrEditor')}</h1>
                    <p className="text-gray-600">{t('customizeYourQr')}</p>
                </div>
                <a href="/business" className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">&larr; {t('back')}</a>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Preview Panel */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center order-first lg:order-last">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Live Preview</h2>
                    {previewQr ? (
                        <img src={previewQr} alt="QR Code Preview" className="w-64 h-64 rounded-lg border"/>
                    ) : (
                        <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Spinner />
                        </div>
                    )}
                    <p className="text-sm text-gray-500 mt-4 text-center">This is how your QR codes will look for all customers.</p>
                </div>

                {/* Settings Panel */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                     <h2 className="text-xl font-bold text-gray-800 mb-6">Customization Settings</h2>
                     <div className="space-y-6">
                        {/* Logo URL */}
                        <div>
                            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700">{t('logoUrl')}</label>
                            <input
                                id="logoUrl"
                                type="text"
                                value={logoUrl}
                                onChange={(e) => setLogoUrl(e.target.value)}
                                placeholder="https://example.com/logo.png"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Must be a direct link to a PNG or JPG file. Ensure CORS is enabled.</p>
                        </div>

                        {/* QR Color */}
                        <div>
                            <label htmlFor="qrColor" className="block text-sm font-medium text-gray-700">{t('qrColor')}</label>
                            <div className="mt-1 flex items-center gap-2">
                                <input
                                    id="qrColor"
                                    type="color"
                                    value={qrColor}
                                    onChange={(e) => setQrColor(e.target.value)}
                                    className="h-10 w-10 p-1 border border-gray-300 rounded-md cursor-pointer"
                                />
                                <span className="text-gray-700 font-mono">{qrColor}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Eye Shape */}
                             <div>
                                <label htmlFor="eyeShape" className="block text-sm font-medium text-gray-700">{t('eyeShape')}</label>
                                <select id="eyeShape" value={eyeShape} onChange={(e) => setEyeShape(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option value="square">Square</option>
                                    <option value="rounded">Rounded</option>
                                </select>
                            </div>

                            {/* Dot Style */}
                            <div>
                                <label htmlFor="dotStyle" className="block text-sm font-medium text-gray-700">{t('dotStyle')}</label>
                                <select id="dotStyle" value={dotStyle} onChange={(e) => setDotStyle(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                    <option value="square">Square</option>
                                    <option value="dots">Dots</option>
                                    <option value="rounded">Rounded</option>
                                    <option value="classy">Classy</option>
                                    <option value="classy-rounded">Classy Rounded</option>
                                    <option value="extra-rounded">Extra Rounded</option>
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="pt-4 border-t">
                             <div className="flex items-center justify-end gap-4">
                                {saveMessage && <p className="text-green-600 text-sm">{saveMessage}</p>}
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center gap-2"
                                >
                                    {isSaving && <Spinner className="h-5 w-5 text-white" />}
                                    {isSaving ? 'Saving...' : t('saveAndApply')}
                                </button>
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessEditorPage;
