
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
    const [pfpPreview, setPfpPreview] = useState<string | null>(customer.profile_picture_url || null);
    const [loading, setLoading] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                <h2 className="text-[#111813] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">{t('profile')}</h2>
                <div className="flex w-12 items-center justify-end">
                    <button className="text-[#111813] p-2"><span className="material-symbols-outlined">settings</span></button>
                </div>
            </div>

            <div className="flex p-4 items-center flex-col gap-4">
                <div 
                    className="size-32 rounded-full bg-center bg-cover bg-no-repeat border border-slate-100 shadow-sm"
                    style={{ backgroundImage: `url("${pfpPreview || 'https://i.postimg.cc/8zRZt9pM/user.png'}")` }}
                />
                <div className="text-center">
                    <p className="text-[#111813] text-[22px] font-bold leading-tight tracking-[-0.015em]">{customer.name}</p>
                    <p className="text-[#61896f] text-base font-normal leading-normal">Edit Profile</p>
                </div>
            </div>

            <div className="p-4">
                <div className="flex flex-col items-stretch justify-start rounded-lg border border-[#f0f4f2] overflow-hidden">
                    <div className="w-full aspect-square bg-[#f0f4f2] flex items-center justify-center p-6">
                        <img src={customer.qr_data_url} alt="QR" className="w-full h-full object-contain rounded-xl shadow-lg border-4 border-white" />
                    </div>
                    <div className="flex w-full flex-col gap-1 p-4 bg-white">
                        <p className="text-[#111813] text-lg font-bold leading-tight">My Identity Code</p>
                        <div className="flex items-end gap-3 justify-between">
                            <p className="text-[#61896f] text-sm font-normal">Scan this code at participating stores to earn points.</p>
                            <button className="flex min-w-[84px] items-center justify-center rounded-lg h-8 px-4 bg-[#2bee6c] text-[#111813] text-sm font-medium">Print</button>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="px-4 space-y-4 mt-4">
                <label className="flex flex-col w-full">
                    <p className="text-[#111813] text-base font-medium pb-2">Name</p>
                    <input
                        className="form-input flex w-full border-none bg-[#f0f4f2] rounded-lg h-14 p-4 text-[#111813] focus:ring-0"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </label>
                <label className="flex flex-col w-full">
                    <p className="text-[#111813] text-base font-medium pb-2">Phone</p>
                    <input
                        className="form-input flex w-full border-none bg-[#f0f4f2] rounded-lg h-14 p-4 text-[#111813] focus:ring-0"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </label>
                <button type="submit" disabled={loading} className="w-full bg-[#2bee6c] text-[#0d1b12] font-black h-14 rounded-lg active:scale-95 transition-all">
                    {loading ? <Spinner className="size-6 text-[#0d1b12] mx-auto" /> : 'Save Profile'}
                </button>
            </form>

            <button onClick={() => setIsDeleteModalOpen(true)} className="text-[#61896f] text-sm font-normal leading-normal py-8 text-center underline w-full">
                Delete Account
            </button>
        </div>
    );
};

export default CustomerProfilePage;
