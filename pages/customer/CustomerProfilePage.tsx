
import React, { useState } from 'react';
import { Customer } from '../../types';
import { updateCustomer, deleteCustomerAccount } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner, DeleteAccountModal } from '../../components/common';

interface CustomerProfilePageProps {
    customer: Customer;
    onUpdate: (updatedCustomer: Customer) => void;
}

const CustomerProfilePage: React.FC<CustomerProfilePageProps> = ({ customer, onUpdate }) => {
    const { t } = useLanguage();
    const [name, setName] = useState(customer.name);
    const [phone, setPhone] = useState(customer.phone_number);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const updated = await updateCustomer(customer.id, { name, phone_number: phone });
        setLoading(false);
        if (updated) onUpdate(updated);
    };

    const handleLogout = () => {
        window.location.href = '/';
    };

    return (
        <div className="flex flex-col bg-white min-h-screen text-[#111813] pb-24" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <DeleteAccountModal 
                isOpen={isDeleteModalOpen} 
                onClose={() => setIsDeleteModalOpen(false)} 
                customerPhoneNumber={customer.phone_number} 
                onConfirm={async () => { await deleteCustomerAccount(customer.id); window.location.href='/'; }} 
            />
            
            <div className="flex items-center bg-white p-4 pb-2 justify-between">
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
            </div>

            <div className="flex p-10 items-center flex-col gap-2">
                <p className="text-[#111813] text-[32px] font-black tracking-tight leading-none text-center">Identity Settings</p>
                <p className="text-[#61896f] text-sm font-medium text-center uppercase tracking-[0.2em] opacity-50">Secure Portal</p>
            </div>

            <form onSubmit={handleUpdate} className="px-4 space-y-6">
                <div className="flex flex-col w-full">
                    <p className="text-[#111813] text-base font-medium leading-normal pb-2">Name</p>
                    <input
                        className="form-input flex w-full border-none bg-[#f0f4f2] rounded-lg h-14 p-4 text-[#111813] focus:ring-0 placeholder:text-[#61896f]"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="flex flex-col w-full">
                    <p className="text-[#111813] text-base font-medium leading-normal pb-2">Phone</p>
                    <input
                        className="form-input flex w-full border-none bg-[#f0f4f2] rounded-lg h-14 p-4 text-[#111813] focus:ring-0 placeholder:text-[#61896f]"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black h-14 rounded-lg active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-green-100/50">
                    {loading ? <Spinner className="size-6 text-[#0d1b12]" /> : 'Save Profile'}
                </button>
            </form>

            <div className="px-4 mt-12 space-y-4">
                <button 
                    onClick={handleLogout}
                    className="w-full bg-[#f0f4f2] text-[#111813] font-black h-14 rounded-lg active:scale-95 transition-all flex items-center justify-center gap-3 border border-[#dbe6df]"
                >
                    <span className="material-symbols-outlined text-[24px]">logout</span>
                    Logout
                </button>
                
                <button 
                    onClick={() => setIsDeleteModalOpen(true)} 
                    className="w-full text-rose-500 text-xs font-black leading-normal py-4 text-center underline uppercase tracking-[0.2em]"
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
