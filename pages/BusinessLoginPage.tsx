import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { loginBusiness } from '../services/api';

const BusinessLoginPage: React.FC = () => {
    const { t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please enter both email and password.');
            return;
        }
        setLoading(true);
        const result = await loginBusiness(email, password);
        setLoading(false);

        if (result.success) {
            sessionStorage.setItem('isBusinessLoggedIn', 'true');
            sessionStorage.setItem('business', JSON.stringify(result.business));
            window.location.href = '/business';
        } else {
            setError(t('invalidCredentials'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-lg shadow-md p-8">
                <div className="text-center mb-6">
                    <img src="https://i.postimg.cc/bJwnZhs9/Chat-GPT-Image-Aug-31-2025-06-45-18-AM.png" alt="QRoyal Logo" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800">{t('businessAreaLogin')}</h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text--gray-700">{t('password')}</label>
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
                        <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
                            {loading ? 'Logging in...' : t('login')}
                        </button>
                    </div>
                </form>
            </div>
             <a href="/" className="mt-6 text-blue-600 hover:text-blue-800 font-medium">&larr; {t('back')}</a>
        </div>
    );
};

export default BusinessLoginPage;