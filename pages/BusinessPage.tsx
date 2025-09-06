
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Membership, Business, Customer } from '../types';
import { getMembershipsForBusiness, provisionCustomerForBusiness, removeMembership } from '../services/api';
import { Spinner, CreateCustomerModal, UserAddIcon, CustomerQRModal, BusinessScannerModal } from '../components/common';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        <div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-gray-600">{title}</p>
        </div>
    </div>
);

const QuickActionCard: React.FC<{ title: string; description: string; href?: string; onClick?: () => void; icon: React.ReactNode }> = ({ title, description, href, onClick, icon }) => {
    const content = (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer h-full">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
            <div>
                <p className="font-bold text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );

    if (href) {
        return <a href={href}>{content}</a>;
    }
    return <div onClick={onClick}>{content}</div>;
};


const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCustomerQr, setNewCustomerQr] = useState('');
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);


    const fetchData = useCallback(async (businessId: string) => {
        const data = await getMembershipsForBusiness(businessId);
        setMemberships(data);
        if (loading) setLoading(false);
    }, [loading]);

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            const parsedBusiness = JSON.parse(storedBusiness);
            setBusiness(parsedBusiness);
            fetchData(parsedBusiness.id);

            const intervalId = setInterval(() => {
                fetchData(parsedBusiness.id);
            }, 5000); // Poll every 5 seconds

            return () => clearInterval(intervalId); // Cleanup on component unmount
        } else {
             window.location.href = '/business/login';
        }
    }, [fetchData]);

    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn');
        sessionStorage.removeItem('business');
        window.location.href = '/';
    };

    const handleCreateCustomer = async () => {
        if (!business) return;
        setNewCustomerQr(''); // Clear previous QR
        setIsCreateModalOpen(true); // Open modal immediately to show loading spinner
        const newCustomer = await provisionCustomerForBusiness(business.id);
        if (newCustomer && newCustomer.qr_data_url) {
            setNewCustomerQr(newCustomer.qr_data_url);
        } else {
            // Handle error, maybe close modal and show a toast
            setIsCreateModalOpen(false);
            alert('Failed to create a new customer QR code.');
        }
    };

    const handleViewQr = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsQrModalOpen(true);
    };

    const handleRemoveCustomer = async (customerId: string) => {
        if (business && window.confirm(t('removeConfirm'))) {
            const result = await removeMembership(customerId, business.id);
            if (result.success) {
                setMemberships(prev => prev.filter(m => m.customer_id !== customerId));
            } else {
                alert('Failed to remove customer. Please try again.');
            }
        }
    };

    const handleScanSuccess = () => {
        if (business) {
            fetchData(business.id);
        }
    };

    const stats = useMemo(() => {
        const totalCustomers = memberships.length;
        return { totalCustomers };
    }, [memberships]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;

    return (
        <>
            <CreateCustomerModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                qrDataUrl={newCustomerQr}
            />
            <CustomerQRModal
                isOpen={isQrModalOpen}
                onClose={() => setIsQrModalOpen(false)}
                customer={selectedCustomer}
            />
            <BusinessScannerModal
                isOpen={isScannerModalOpen}
                onClose={() => setIsScannerModalOpen(false)}
                businessId={business?.id || ''}
                onScanSuccess={handleScanSuccess}
            />
            <div className="min-h-screen bg-gray-50 p-4 md:p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{business?.public_name || t('businessDashboard')}</h1>
                        <p className="text-gray-600">Welcome back! Here's what's happening with your loyalty program.</p>
                    </div>
                    <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">{t('logout')}</button>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title={t('totalCustomers')} value={stats.totalCustomers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                     {business?.qr_data_url && (
                         <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-center gap-2">
                            <h3 className="font-bold text-gray-800">Your Business QR</h3>
                            <img src={business.qr_data_url} alt="Business QR Code" className="w-24 h-24" />
                            <p className="text-xs text-gray-500 text-center">Scan this for quick login</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                            <h2 className="text-2xl font-bold text-gray-800">{t('customerList')}</h2>
                            <input
                                type="text"
                                placeholder={t('searchByName')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 font-semibold text-gray-600">{t('name')}</th>
                                        <th className="p-3 font-semibold text-gray-600">{t('phoneNumber')}</th>
                                        <th className="p-3 font-semibold text-gray-600">{t('points')}</th>
                                        <th className="p-3 font-semibold text-gray-600">QR Code</th>
                                        <th className="p-3 font-semibold text-gray-600">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {memberships.length > 0 ? memberships.filter(m => m.customers && m.customers.name.toLowerCase().includes(searchTerm.toLowerCase())).map(membership => (
                                        <tr key={membership.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{membership.customers.name}</td>
                                            <td className="p-3">{membership.customers.phone_number || 'N/A'}</td>
                                            <td className="p-3 font-bold">{membership.points}</td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleViewQr(membership.customers)}
                                                    className="bg-gray-200 text-gray-700 font-semibold py-1 px-3 rounded-lg text-sm hover:bg-gray-300"
                                                >
                                                    View
                                                </button>
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => handleRemoveCustomer(membership.customers.id)}
                                                    className="bg-red-100 text-red-700 font-semibold py-1 px-3 rounded-lg text-sm hover:bg-red-200"
                                                >
                                                    {t('remove')}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="text-center p-6 text-gray-500">No customers have joined yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="space-y-4">
                         <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                            <div className="space-y-3">
                                <QuickActionCard 
                                    title={t('createNewCustomer')}
                                    description={t('createNewCustomerDesc')}
                                    onClick={handleCreateCustomer}
                                    icon={<UserAddIcon className="h-6 w-6" />}
                                />
                                 <QuickActionCard 
                                    title={t('scanCustomerQR')} 
                                    description="Award points or join new customers." 
                                    onClick={() => setIsScannerModalOpen(true)}
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                                />
                                 <QuickActionCard 
                                    title={t('businessSettings')}
                                    description="Edit your public profile and QR style."
                                    href="/business/editor"
                                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BusinessPage;