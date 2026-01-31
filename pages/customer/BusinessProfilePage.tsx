
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Business, Discount, Post } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { getDiscountsForBusiness, leaveBusiness, getPostsForBusiness } from '../../services/api';
import { Spinner, FacebookIcon, InstagramIcon, WebsiteIcon, PhoneIcon } from '../../components/common';

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
    const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
    const [visibleTabs, setVisibleTabs] = useState<ProfileTab[]>(['posts', 'discounts', 'about']);

    const handleLeave = async () => {
        const confirmed = window.confirm(t('leaveConfirm'));
        if (confirmed) {
            const result = await leaveBusiness(customerId, business.id);
            if (result.success) onLeaveSuccess();
        }
    };
    
    const renderContent = () => {
        switch(activeTab) {
            case 'posts': return <PostsTab businessId={business.id} />;
            case 'discounts': return <DiscountsTab businessId={business.id} />;
            case 'about': return <AboutTab business={business} onLeave={handleLeave} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans animate-in fade-in duration-300 pb-20">
            {/* Transparent Header */}
            <header className="fixed top-0 left-0 right-0 bg-white/60 backdrop-blur-xl z-30 flex items-center p-4 border-b border-white/20 transition-all">
                <button onClick={onBack} className="p-3 bg-white/80 rounded-2xl text-slate-800 shadow-sm border border-slate-100 active:scale-95 transition-all">
                   <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h1 className="text-lg font-black text-slate-800 text-center flex-grow truncate px-4">{business.public_name}</h1>
                <div className="w-11"></div>
            </header>
            
            <div className="pt-20">
                {/* Hero Header */}
                <div className="px-4 max-w-2xl mx-auto">
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl h-52 sm:h-64 bg-slate-200">
                      {business.cover_photo_url ? (
                        <img src={business.cover_photo_url} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-indigo-800" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                      <div className="absolute -bottom-1 right-8 translate-y-1/2">
                          <img src={business.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="Logo" className="w-24 h-24 rounded-3xl object-cover bg-white border-4 border-white shadow-xl" />
                      </div>
                  </div>

                  {/* Profile Header Stats */}
                  <div className="mt-14 mb-8 text-center sm:text-left px-2">
                      <h2 className="text-4xl font-black text-slate-800 tracking-tight leading-none">{business.public_name}</h2>
                      {business.bio && <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed">{business.bio}</p>}
                  </div>
                </div>
                
                {/* Sticky Tabbar */}
                <div className="sticky top-[76px] z-20 px-4 max-w-2xl mx-auto mb-8">
                    <nav className="bg-white p-1.5 rounded-[1.5rem] shadow-lg border border-slate-100 flex justify-between overflow-hidden">
                        {visibleTabs.map(tab => (
                             <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                             >
                                {t(tab)}
                             </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <main className="px-4 max-w-2xl mx-auto space-y-8 min-h-[50vh]">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

// --- TAB COMPONENTS ---

const PostsTab: React.FC<{businessId: string}> = ({ businessId }) => {
    const { t } = useLanguage();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { getPostsForBusiness(businessId).then(data => { setPosts(data); setLoading(false); }); }, [businessId]);

    const getYouTubeEmbedUrl = (url: string) => {
        try { const urlObj = new URL(url); let videoId = urlObj.searchParams.get('v') || (urlObj.hostname === 'youtu.be' ? urlObj.pathname.slice(1) : null); return videoId ? `https://www.youtube.com/embed/${videoId}` : null; } catch { return null; }
    };

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
    if (posts.length === 0) return <div className="bg-white p-12 rounded-[2.5rem] text-center text-slate-300 font-bold uppercase tracking-widest border border-dashed">{t('noBusinessPosts')}</div>;

    return (
        <div className="space-y-8">
            {posts.map(post => {
                const embedUrl = post.video_url ? getYouTubeEmbedUrl(post.video_url) : null;
                return (
                    <div key={post.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all group">
                        {post.image_url && <img src={post.image_url} alt="p" className="w-full h-auto max-h-[30rem] object-cover transition-transform group-hover:scale-[1.01]" />}
                        {embedUrl && <div className="aspect-video"><iframe className="w-full h-full" src={embedUrl} frameBorder="0" allowFullScreen></iframe></div>}
                        <div className="p-8">
                            <h3 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{post.title}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{new Date(post.created_at).toLocaleDateString()}</p>
                            {post.content && <div className="prose prose-slate prose-sm max-w-none text-slate-600 font-medium leading-relaxed"><ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown></div>}
                             {(post.price_text || post.external_url) && (
                                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                    {post.price_text && <span className="text-3xl font-black text-indigo-600 tracking-tight">{post.price_text}</span>}
                                    {post.external_url && <a href={post.external_url} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-2xl text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95">{t('learnMore')}</a>}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const DiscountsTab: React.FC<{businessId: string}> = ({ businessId }) => {
    const { t } = useLanguage();
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => { getDiscountsForBusiness(businessId).then(data => { setDiscounts(data); setLoading(false); }); }, [businessId]);

    if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
    if (discounts.length === 0) return <div className="bg-white p-12 rounded-[2.5rem] text-center text-slate-300 font-bold uppercase tracking-widest border border-dashed">{t('noBusinessDiscounts')}</div>;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {discounts.map(d => (
                <div key={d.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col gap-4 hover:shadow-xl transition-all group">
                    {d.image_url ? (
                        <img src={d.image_url} alt="d" className="w-full h-32 rounded-2xl object-cover bg-slate-100 transition-transform group-hover:scale-[1.02]" />
                    ) : (
                        <div className="w-full h-32 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-300 font-black text-2xl uppercase tracking-tighter">OFFER</div>
                    )}
                    <div>
                        <p className="font-black text-slate-800 text-xl leading-none mb-2">{d.name}</p>
                        {d.description && <p className="text-xs text-slate-500 font-bold leading-relaxed">{d.description}</p>}
                    </div>
                </div>
            ))}
        </div>
    );
};

const AboutTab: React.FC<{business: Business; onLeave: () => void}> = ({ business, onLeave }) => {
    const { t } = useLanguage();
    return (
        <div className="space-y-8">
            {business.address_text && (
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{t('location')}</h3>
                    <p className="text-slate-800 font-bold text-lg mb-6 leading-tight">{business.address_text}</p>
                    <div className="rounded-3xl overflow-hidden border-4 border-white shadow-lg">
                         <iframe className="w-full h-64 grayscale contrast-125" loading="lazy" src={`https://www.google.com/maps?q=${encodeURIComponent(business.address_text)}&output=embed`}></iframe>
                    </div>
                </div>
            )}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{t('contactInfo')}</h3>
                <div className="grid grid-cols-1 gap-4">
                    {business.public_phone_number && <div className="flex items-center gap-4 text-slate-700 font-bold bg-slate-50 p-4 rounded-2xl"><PhoneIcon className="h-6 w-6 text-indigo-400"/><span className="flex-grow">{business.public_phone_number}</span></div>}
                    <div className="flex flex-wrap gap-3 mt-2">
                        {business.website_url && <SocialLink href={business.website_url} icon={<WebsiteIcon className="h-5 w-5"/>}/>}
                        {business.facebook_url && <SocialLink href={business.facebook_url} icon={<FacebookIcon className="h-5 w-5"/>}/>}
                        {business.instagram_url && <SocialLink href={business.instagram_url} icon={<InstagramIcon className="h-5 w-5"/>}/>}
                    </div>
                </div>
            </div>
            <button onClick={onLeave} className="w-full bg-rose-50 text-rose-600 font-black py-4 rounded-[1.5rem] hover:bg-rose-100 transition-all uppercase tracking-widest text-xs active:scale-95">{t('leaveBusiness')}</button>
        </div>
    );
};

const SocialLink: React.FC<{href: string, icon: React.ReactNode}> = ({href, icon}) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="bg-slate-50 p-4 rounded-2xl text-indigo-500 hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-90">{icon}</a>
);

export default BusinessProfilePage;
