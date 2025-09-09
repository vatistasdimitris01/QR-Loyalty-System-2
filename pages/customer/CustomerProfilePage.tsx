import React, { useState, useRef } from 'react';
import { Customer } from '../../types';
import { updateCustomer, deleteCustomerAccount, uploadProfilePicture } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner, DeleteAccountModal } from '../../components/common';

interface CustomerProfilePageProps {
    customer: Customer;
    onUpdate: (updatedCustomer: Customer) => void;
    onContactUs: () => void;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer, onUpdate, onContactUs }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(customer.name);
    const [phone, setPhone] = useState(customer.phone_number);
    const [pfpFile, setPfpFile] = useState<File | null>(null);
    const [pfpPreview, setPfpPreview] = useState<string | null>(customer.profile_picture_url || null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPfpFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPfpPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        let finalPfpUrl = customer.profile_picture_url;

        if (pfpFile) {
            const uploadedUrl = await uploadProfilePicture(customer.id, pfpFile);
            if (uploadedUrl) {
                finalPfpUrl = uploadedUrl;
            } else {
                setMessage('Failed to upload image.');
                setLoading(false);
                return;
            }
        }

        const updated = await updateCustomer(customer.id, { name, phone_number: phone, profile_picture_url: finalPfpUrl || undefined });
        setLoading(false);
        if (updated) {
            onUpdate(updated);
            setPfpFile(null); // Reset file input state
            setMessage(t('updateSuccess'));
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const handleDeleteAccount = async () => {
        const result = await deleteCustomerAccount(customer.id);
        if (result.success) {
            alert(t('deleteSuccess'));
            window.location.href = '/'; // Log out and redirect
        } else {
            alert(t('deleteAccountError'));
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <>
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                customerPhoneNumber={customer.phone_number}
                onConfirm={handleDeleteAccount}
            />
            <div className="p-4 max-w-md mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">{t('yourProfile')}</h1>
                
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <h2 className="text-lg font-semibold text-center mb-4">{t('yourUniversalQr')}</h2>
                    <img src={customer.qr_data_url} alt="Your QR Code" className="w-48 h-48 mx-auto rounded-lg"/>
                    <p className="text-center text-sm text-gray-500 mt-4">{t('scanThisToLogin')}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">{t('updateProfile')}</h2>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">{t('profilePicture')}</label>
                            <div className="mt-2 flex items-center gap-4">
                                <img
                                    src={pfpPreview || 'https://i.postimg.cc/8zRZt9pM/user.png'}
                                    alt="Profile preview"
                                    className="h-16 w-16 rounded-full object-cover bg-gray-200"
                                />
                                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    {t('uploadImage')}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700">{t('name')}</label>
                            <input
                                id="profile-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700">{t('phoneNumber')}</label>
                            <input
                                id="profile-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {message && <p className="text-green-600 text-sm">{message}</p>}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex justify-center items-center"
                        >
                           {loading ? <Spinner className="h-5 w-5 text-white" /> : t('save')}
                        </button>
                    </form>
                </div>

                <div className="mt-8 border-t pt-6 space-y-4">
                     <button
                        onClick={onContactUs}
                        className="w-full bg-blue-50 text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-100"
                     >
                         {t('contactUs')}
                     </button>
                     <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full bg-red-50 text-red-700 font-bold py-3 rounded-lg hover:bg-red-100"
                     >
                         {t('deleteAccount')}
                     </button>
                     <a
                        href="/"
                        className="block w-full text-gray-600 text-center font-semibold py-3 rounded-lg hover:bg-gray-100"
                    >
                        {t('logout')}
                    </a>
                </div>
            </div>
        </>
    );
};

export default CustomerProfilePage;