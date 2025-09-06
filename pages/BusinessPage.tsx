
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Customer, Business } from '../types';
import { getCustomersByBusiness, updateCustomer, deleteCustomer, createCustomer } from '../services/api';
import { Spinner, CustomerEditModal, ConfirmationModal, NewCustomerModal } from '../components/common';

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
    const commonProps = {
        className: "bg-white p-4 rounded-lg shadow-sm flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
    };
    if (href) {
        return (
            <a href={href} {...commonProps}>
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
                <div>
                    <p className="font-bold text-gray-800">{title}</p>
                    <p className="text-sm text-gray-600">{description}</p>
                </div>
            </a>
        );
    }
    return (
        <div onClick={onClick} {...commonProps}>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
            <div>
                <p className="font-bold text-gray-800">{title}</p>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    );
};


const BusinessPage: React.FC = () => {
    const { t } = useLanguage();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [business, setBusiness] = useState<Business | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
    const [newCustomerQR, setNewCustomerQR] = useState<Customer | null>(null);
    const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

    const fetchData = useCallback(async (businessId: string) => {
        setLoading(true);
        const data = await getCustomersByBusiness(businessId);
        setCustomers(data);
        setLoading(false);
    }, []);

    useEffect(() => {
        const storedBusiness = sessionStorage.getItem('business');
        if (storedBusiness) {
            const parsedBusiness = JSON.parse(storedBusiness);
            setBusiness(parsedBusiness);
            fetchData(parsedBusiness.id);
        } else {
             window.location.href = '/business/login';
        }
    }, [fetchData]);

    const handleUpdateCustomer = async (customer: Customer) => {
        await updateCustomer(customer.id, customer);
        if (business) fetchData(business.id);
    };

    const handleDeleteCustomer = async () => {
        if (deletingCustomer) {
            await deleteCustomer(deletingCustomer.id);
            setDeletingCustomer(null);
            if (business) fetchData(business.id);
        }
    };

    const handleCreateCustomer = async (name: string) => {
        if (!business) return;
        const newCustomer = await createCustomer(name, business.id);
        if(newCustomer) {
            setNewCustomerQR(newCustomer);
            fetchData(business.id);
        }
    };
    
    const handleLogout = () => {
        sessionStorage.removeItem('isBusinessLoggedIn');
        sessionStorage.removeItem('business');
        window.location.href = '/';
    };

    const filteredCustomers = useMemo(() =>
        customers.filter(c => c.phone_number?.includes(searchTerm) || c.name.toLowerCase().includes(searchTerm.toLowerCase())),
        [customers, searchTerm]
    );

    const stats = useMemo(() => {
        const totalCustomers = customers.length;
        const totalPoints = customers.reduce((sum, c) => sum + c.points, 0);
        const avgPoints = totalCustomers > 0 ? (totalPoints / totalCustomers).toFixed(1) : 0;
        return { totalCustomers, totalPoints, avgPoints };
    }, [customers]);

    if (loading) return <div className="flex justify-center items-center h-screen"><Spinner /></div>;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <CustomerEditModal isOpen={!!editingCustomer} onClose={() => setEditingCustomer(null)} customer={editingCustomer} onUpdate={handleUpdateCustomer} />
            <ConfirmationModal 
                isOpen={!!deletingCustomer} 
                onClose={() => setDeletingCustomer(null)} 
                onConfirm={handleDeleteCustomer}
                title={t('confirmDelete')}
                message={t('confirmDeleteMessage')}
            />
             <NewCustomerModal
                isOpen={isNewCustomerModalOpen}
                onClose={() => setIsNewCustomerModalOpen(false)}
                onCreate={handleCreateCustomer}
            />
            {newCustomerQR && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={() => setNewCustomerQR(null)}>
                    <div className="bg-white p-8 rounded-lg text-center" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4">New QR Code for {newCustomerQR.name}</h3>
                        <img src={newCustomerQR.qr_data_url} alt="New Customer QR Code" className="w-64 h-64 mx-auto" />
                        <p className="mt-4 text-gray-600">Share this with the new customer.</p>
                        <button onClick={() => setNewCustomerQR(null)} className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg">Close</button>
                    </div>
                </div>
            )}

            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{business?.name || t('businessDashboard')}</h1>
                    <p className="text-gray-600">Welcome back! Here's what's happening with your loyalty program.</p>
                </div>
                <button onClick={handleLogout} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600">{t('logout')}</button>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title={t('totalCustomers')} value={stats.totalCustomers} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>} />
                <StatCard title={t('totalPoints')} value={stats.totalPoints} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4M17 3v4m-2 2h4M17 17v4m2-2h-4M12 5v14m-4-7h8" /></svg>} />
                <StatCard title={t('avgPoints')} value={stats.avgPoints} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} />
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
                            placeholder={t('searchByPhone')}
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
                                {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3">{customer.name}</td>
                                        <td className="p-3">{customer.phone_number || 'N/A'}</td>
                                        <td className="p-3">{customer.points}</td>
                                        <td className="p-3">
                                            <img src={customer.qr_data_url} alt="Customer QR" className="w-12 h-12" />
                                        </td>
                                        <td className="p-3 flex items-center gap-2">
                                            <button onClick={() => setEditingCustomer(customer)} className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100">{t('edit')}</button>
                                            <button onClick={() => setDeletingCustomer(customer)} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100">{t('delete')}</button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="text-center p-6 text-gray-500">No customers found.</td>
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
                                title={t('addNewCustomer')} 
                                description="Create a new QR code for a customer." 
                                onClick={() => setIsNewCustomerModalOpen(true)}
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                            />
                             <QuickActionCard 
                                title={t('scanCustomerQR')} 
                                description="Award points by scanning a customer's QR." 
                                href="/business/scanner"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>}
                            />
                             <QuickActionCard 
                                title={t('qrEditor')}
                                description={t('qrEditorDesc')}
                                href="/business/editor"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessPage;
