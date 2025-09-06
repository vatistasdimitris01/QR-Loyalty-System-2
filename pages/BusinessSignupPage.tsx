
import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { signupBusiness } from '../services/api';
import { Business } from '../types';

const BusinessSignupPage: React.FC = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [newBusiness, setNewBusiness] = useState<Business | null>(null);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        const result = await signupBusiness({ name, email, password });
        setLoading(false);

        if (result.success && result.business) {
            setNewBusiness(result.business);
        } else {
            setError(result.message || t('errorUnexpected'));
        }
    };

    if (newBusiness) {
        return (
             <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4 text-center">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-sm w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">{t('signupSuccess')}</h1>
                    <p className="text-gray-600 mb-6">Here is your business QR code for quick logins.</p>
                    <img src={newBusiness.qrDataUrl} alt="Your Business QR Code" className="w-48 h-48 mx-auto" />
                    <a href={`/business/login`} className="mt-8 inline-block bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                        Go to Login
                    </a>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">{t('businessSignup')}</h1>
                </div>
                <form onSubmit={handleSignup} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('businessName')}</label>
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email')}</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('password')}</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                            {loading ? 'Creating Account...' : t('createAccount')}
                        </button>
                    </div>
                </form>
                 <div className="text-center mt-4">
                    <a href="/business/login" className="text-sm text-blue-600 hover:underline">{t('alreadyHaveAccount')} {t('login')}</a>
                </div>
            </div>
            <a href="/" className="mt-6 text-blue-600 hover:text-blue-800 font-medium">&larr; {t('back')}</a>
        </div>
    );
};

export default BusinessSignupPage;
