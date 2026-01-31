
import React, { useState, useRef } from 'react';
import { Customer } from '../../types';
import { updateCustomer, deleteCustomerAccount, uploadProfilePicture } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';
import { Spinner, DeleteAccountModal, InputField } from '../../components/common';

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
        <div className="px-8 pt-16 animate-in fade-in duration-700">
            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                customerPhoneNumber={customer.phone_number}
                onConfirm={handleDeleteAccount}
            />
            
            <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-10">Account.</h1>
            
            <div className="space-y-12">
                {/* ID Card Section */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">Universal Digital ID</h2>
                    <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-inner flex flex-col items-center gap-8">
                        <div className="bg-white p-6 rounded-[2rem] shadow-xl border-4 border-white">
                            <img src={customer.qr_data_url} alt="ID" className="size-48 rounded-xl"/>
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-xl font-black text-slate-900 tracking-tight">{customer.name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{customer.qr_token}</p>
                        </div>
                    </div>
                </section>

                {/* Edit Section */}
                <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Personal Details</h2>
                    <form onSubmit={handleUpdate} className="space-y-8">
                        <div className="flex items-center gap-6">
                            <img
                                src={pfpPreview || 'https://i.postimg.cc/8zRZt9pM/user.png'}
                                alt="P"
                                className="size-20 rounded-[2rem] object-cover bg-slate-50 border-2 border-white shadow-lg"
                            />
                            <div className="space-y-2">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avatar Image</p>
                                <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 py-3 px-6 rounded-2xl border border-slate-200 hover:bg-white hover:border-primary/30 transition-all"
                                >
                                    {t('uploadImage')}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <InputField label={t('name')} name="profile-name" value={name} onChange={(e: any) => setName(e.target.value)} />
                            <InputField label={t('phoneNumber')} name="profile-phone" type="tel" value={phone} onChange={(e: any) => setPhone(e.target.value)} />
                        </div>

                        {message && <p className="text-emerald-600 text-xs font-black text-center animate-pulse uppercase tracking-widest">{message}</p>}
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-primary/20 active:scale-95 disabled:bg-slate-200 transition-all"
                        >
                           {loading ? <Spinner className="size-6 text-white mx-auto" /> : t('save')}
                        </button>
                    </form>
                </section>

                {/* Elite Actions */}
                <section className="pt-10 border-t border-slate-50 space-y-4">
                     <button
                        onClick={onContactUs}
                        className="w-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 py-4 hover:text-slate-900 transition-colors"
                     >
                         {t('contactUs')}
                     </button>
                     <button
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="w-full bg-rose-50 text-rose-600 font-black py-5 rounded-[1.5rem] hover:bg-rose-100 transition-all uppercase tracking-[0.2em] text-[10px] active:scale-95"
                     >
                         {t('deleteAccount')}
                     </button>
                     <a
                        href="/"
                        className="block w-full text-slate-300 text-center font-black uppercase tracking-[0.4em] text-[8px] py-8 hover:text-slate-900"
                    >
                        Sign Out Gateway
                    </a>
                </section>
            </div>
        </div>
    );
};

export default CustomerProfilePage;
