
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Business, Discount, Post } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountsForBusiness, leaveBusiness, getPostsForBusiness } from '../../services/api';
import { Spinner } from '../../components/common';

interface BusinessProfilePageProps {
    business: Business;
    customerId: string;
    onBack: () => void;
    onLeaveSuccess: () => void;
}
type ProfileTab = 'posts' | 'discounts' | 'about';

const BusinessProfilePage: React.FC<BusinessProfilePageProps> = ({ business, customerId, onBack, onLeaveSuccess }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<ProfileTab>(business.default_profile_tab || 'posts');
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            setLoading(true);
            const [d, p] = await Promise.all([getDiscountsForBusiness(business.id), getPostsForBusiness(business.id)]);
            setDiscounts(d);
            setPosts(p);
            setLoading(false);
        };
        fetchContent();
    }, [business.id]);

    const handleLeave = async () => {
        if (window.confirm(t('leaveConfirm'))) {
            const result = await leaveBusiness(customerId, business.id);
            if (result.success) onLeaveSuccess();
        }
    };

    return (
        <div className="flex flex-col bg-[#f8fcf9] min-h-screen text-[#0d1b12] pb-24" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
            <div className="flex items-center bg-[#f8fcf9] p-4 pb-2 justify-between">
                <button onClick={onBack} className="w-12 flex justify-start text-[#0d1b12]">
                    <span className="material-symbols-outlined text-[24px]">arrow_back</span>
                </button>
                <h2 className="text-[#0d1b12] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">{business.public_name}</h2>
                <div className="w-12"></div>
            </div>

            <div className="px-0 sm:px-4 py-3">
                <div 
                    className="w-full bg-center bg-cover bg-no-repeat min-h-[218px] sm:rounded-lg shadow-sm border-b border-[#e7f3eb]"
                    style={{ backgroundImage: `url("${business.cover_photo_url || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=80'}")` }}
                />
            </div>

            <div className="flex px-4 items-center gap-4 -mt-12 mb-4">
                <div className="size-24 rounded-2xl bg-white p-1 shadow-xl border border-[#e7f3eb] flex-shrink-0">
                    <img src={business.logo_url || ''} className="size-full object-cover rounded-xl" alt="L" />
                </div>
                <div className="pt-10">
                    <h3 className="text-2xl font-black tracking-tight">{business.public_name}</h3>
                </div>
            </div>

            <div className="sticky top-0 bg-[#f8fcf9] z-10 border-b border-[#cfe7d7] px-4 flex gap-8 mb-4">
                <TabItem label="Posts" active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                <TabItem label="Discounts" active={activeTab === 'discounts'} onClick={() => setActiveTab('discounts')} />
                <TabItem label="About" active={activeTab === 'about'} onClick={() => setActiveTab('about')} />
            </div>

            <main className="p-4 space-y-4">
                {loading ? (
                    <div className="flex justify-center py-10"><Spinner className="size-8 text-[#4c9a66]" /></div>
                ) : activeTab === 'posts' ? (
                    posts.map(p => (
                        <div key={p.id} className="bg-white p-6 rounded-2xl border border-[#e7f3eb] shadow-sm space-y-4">
                            {p.image_url && <img src={p.image_url} className="w-full h-48 object-cover rounded-xl" />}
                            <h4 className="text-xl font-bold">{p.title}</h4>
                            <div className="text-[#61896f] text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{p.content || ''}</ReactMarkdown></div>
                        </div>
                    ))
                ) : activeTab === 'discounts' ? (
                    discounts.map(d => (
                        <div 
                            key={d.id}
                            className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-lg pt-[132px] overflow-hidden relative shadow-lg"
                            style={{ backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%), url("${d.image_url || 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&w=800&q=80'}")` }}
                        >
                            <div className="flex w-full items-end justify-between gap-4 p-4 z-10">
                                <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                                    <p className="text-white tracking-light text-2xl font-bold leading-tight">{d.name}</p>
                                    <p className="text-white/80 text-base font-medium">{d.description}</p>
                                </div>
                                <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-[#2bee6c] text-[#0d1b12] text-sm font-bold">Redeem</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white p-8 rounded-2xl border border-[#e7f3eb] space-y-6">
                        <p className="text-[#61896f] leading-relaxed">{business.bio}</p>
                        <div className="space-y-2 text-sm font-bold text-[#0d1b12]">
                            <p>{business.address_text}</p>
                            <p>{business.public_phone_number}</p>
                        </div>
                        <button onClick={handleLeave} className="w-full text-rose-500 font-bold py-4 bg-rose-50 rounded-xl">Leave Membership</button>
                    </div>
                )}
            </main>
        </div>
    );
};

const TabItem: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 transition-all ${active ? 'border-b-[#2bee6c] text-[#0d1b12]' : 'border-b-transparent text-[#4c9a66]'}`}>
        <p className="text-sm font-bold leading-normal tracking-[0.015em]">{label}</p>
    </button>
);

export default BusinessProfilePage;
