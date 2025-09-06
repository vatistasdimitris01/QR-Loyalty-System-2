import React, { useState } from 'react';
import { Customer } from '../../types';
import { updateCustomer } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner } from '../../components/common';

interface CustomerProfilePageProps {
    customer: Customer;
    onUpdate: (updatedCustomer: Customer) => void;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer, onUpdate }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(customer.name);
    const [phone, setPhone] = useState(customer.phone_number);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        const updated = await updateCustomer(customer.id, { name, phone_number: phone });
        setLoading(false);
        if (updated) {
            onUpdate(updated);
            setMessage(t('updateSuccess'));
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
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
        </div>
    );
};

export default CustomerProfilePage;
