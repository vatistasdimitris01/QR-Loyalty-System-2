
import React, { useState } from 'react';
import { Customer } from '../../types';
import { updateCustomer, deleteCustomerAccount } from '../../services/api';
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
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const updated = await updateCustomer(customer.id, { name, phone_number: phone });
        setLoading(false);
        if (updated) onUpdate(updated);
    };

    return (
        <div className="flex flex-col bg-white min-h-screen text-[#111813] pb-24" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <DeleteAccountModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} customerPhoneNumber={customer.phone_number} onConfirm={async () => { await deleteCustomerAccount(customer.id); window.location.href='/'; }} />
            
            <div className="flex items-center bg-white p-4 pb-2 justify-between">
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">Loyalty</h2>
            </div>

            <div className="flex p-4 items-center flex-col gap-4">
                <div 
                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border border-slate-100"
                    style={{ backgroundImage: `url("${customer.profile_picture_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPMeJHcasc_99ZunBOCY5TelqVMz3lDlh4naCjY1Ue6cEcmjHTfeCeSRGUvVPq2PHzV6vp7I9BdRgjp0y_BAyQQi5RfbjAIl0eFShnrzmxCGS6ITg77OVYES0i5G9niiVbzokst0ryayaHGdfPl8KCap6CyCFWwBZwxBmnb1h4YhWajeZ_8tmZ0d42hqnzFt242LFPfB-4AygvHCeTcNDtT0jmvUjfJdVBAohz52RmSPah-Hu54qGUbitfqHDPVhXlPcDOhMESrcBR'}")` }}
                />
                <div className="text-center">
                    <p className="text-[#111813] text-[22px] font-bold leading-tight tracking-[-0.015em]">{customer.name}</p>
                    <p className="text-[#61896f] text-base font-normal leading-normal">Edit Profile</p>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="px-4 space-y-6 mt-4">
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
                
                <button type="submit" disabled={loading} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black h-14 rounded-lg active:scale-95 transition-all flex items-center justify-center">
                    {loading ? <Spinner className="size-6 text-[#0d1b12]" /> : 'Save Profile'}
                </button>
            </form>

            <button onClick={() => setIsDeleteModalOpen(true)} className="text-[#61896f] text-sm font-normal leading-normal py-8 text-center underline w-full">
                Delete Account
            </button>
        </div>
    );
};

export default CustomerProfilePage;
