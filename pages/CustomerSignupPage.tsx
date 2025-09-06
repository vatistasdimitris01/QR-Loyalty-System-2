
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signupCustomer } from '../services/api';
import { Customer } from '../types';
import { Spinner } from '../components/common';

const CustomerSignupPage: React.FC = () => {
    const { t } = useLanguage();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newCustomer, setNewCustomer] = useState<Customer | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!phoneNumber.trim() || !password.trim()) {
            setError('Please enter a phone number and password.');
            return;
        }
        setLoading(true);
        const result = await signupCustomer(phoneNumber, password);
        setLoading(false);

        if (result.success && result.customer) {
            setNewCustomer(result.customer);
        } else {
            setError(result.message || t('errorUnexpected'));
        }
    };

    if (newCustomer) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('yourQRCodeIsReady')}</h1>
                    <p className="text-gray-600 mb-6">{t('scanThisToLogin')}</p>
                    <img src={newCustomer.qr_data_url} alt="Your QR Code" className="w-48 h-48 mx-auto" />
                    <a href={`/customer?token=${newCustomer.qr_token}`} className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        {t('goToMyCard')}
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <img src="https://i.postimg.cc/ZKVbR9tP/305767183-771222654127324-7320768528390147926-n.jpg" alt="Business Logo" className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">{t('customerSignup')}</h1>
                    <p className="text-gray-600 mt-2">{t('enterPhoneNumberToJoin')}</p>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">{t('phoneNumber')}</label>
                        <input
                            id="phone"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+30 69..."
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400">
                            {loading ? <Spinner className="h-5 w-5 text-white" /> : t('getYourQRCode')}
                        </button>
                    </div>
                </form>
            </div>
            <a href="/" className="mt-6 text-blue-600 hover:text-blue-800 font-medium">&larr; {t('back')}</a>
        </div>
    );
};

export default CustomerSignupPage;