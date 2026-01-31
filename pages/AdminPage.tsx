
import React, { useState, useEffect } from 'react';
import { Business, Customer, Post, Membership } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
    getAllBusinesses, getAllCustomers, getAllPosts, getAllMemberships,
    updateBusiness, deleteBusiness, updateCustomer, deleteCustomerAccount,
    updatePost, deletePost, updateMembership, deleteMembershipById,
    createBusinessByAdmin
} from '../services/api';
import { Spinner, InputField, TextAreaField, PencilIcon, TrashIcon, BackButton } from '../components/common';

type AdminTab = 'businesses' | 'customers' | 'posts' | 'memberships';
type ModalState = {
    isOpen: boolean;
    type: AdminTab | null;
    item: any | null;
};

const AdminPage: React.FC = () => {
    const { t } = useLanguage();
    const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAdminAuthenticated') === 'true');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [activeTab, setActiveTab] = useState<AdminTab>('businesses');
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);

    const [editModal, setEditModal] = useState<ModalState>({ isOpen: false, type: null, item: null });
    const [deleteModal, setDeleteModal] = useState<ModalState>({ isOpen: false, type: null, item: null });
    const [createBusinessModalOpen, setCreateBusinessModalOpen] = useState(false);
    const [newBusinessResult, setNewBusinessResult] = useState<Business | null>(null);


    const fetchData = async () => {
        setLoading(true);
        const [bizData, custData, postData, memberData] = await Promise.all([
            getAllBusinesses(),
            getAllCustomers(),
            getAllPosts(),
            getAllMemberships(),
        ]);
        setBusinesses(bizData);
        setCustomers(custData);
        setPosts(postData);
        setMemberships(memberData);
        setLoading(false);
    };
    
    useEffect(() => {
        if (isAuthenticated) fetchData();
    }, [isAuthenticated]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'batman') {
            setIsAuthenticated(true);
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            setError('');
        } else {
            setError('Incorrect password');
        }
    };
    
    const handleSave = async (type: AdminTab, item: any) => {
        switch (type) {
            case 'businesses': await updateBusiness(item.id, item); break;
            case 'customers': await updateCustomer(item.id, item); break;
            case 'posts': await updatePost(item.id, item); break;
            case 'memberships': await updateMembership(item.id, { points: item.points }); break;
        }
        setEditModal({ isOpen: false, type: null, item: null });
        fetchData();
    };

    const handleDelete = async (type: AdminTab, item: any) => {
        switch (type) {
            case 'businesses': await deleteBusiness(item.id); break;
            case 'customers': await deleteCustomerAccount(item.id); break;
            case 'posts': await deletePost(item.id); break;
            case 'memberships': await deleteMembershipById(item.id); break;
        }
        setDeleteModal({ isOpen: false, type: null, item: null });
        fetchData();
    };
    
    const handleCreateBusiness = async (formData: Pick<Business, 'name' | 'email' | 'password'>) => {
        const result = await createBusinessByAdmin(formData);
        if (result.success && result.business) {
            setCreateBusinessModalOpen(false);
            setNewBusinessResult(result.business);
            fetchData();
            return { success: true };
        } else return { success: false, message: result.message || 'Failed.' };
    }


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex justify-center items-center p-6">
                <div className="w-full max-w-sm bg-white rounded-[3rem] shadow-2xl p-12 text-center space-y-10">
                    <div className="size-20 bg-indigo-50 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <span className="material-symbols-outlined text-[40px]">admin_panel_settings</span>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black text-slate-900 tracking-tighter">System Access</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Restricted Superuser Portal</p>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <InputField label="Admin Passkey" name="password" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />
                        {error && <p className="text-rose-500 text-xs font-bold uppercase tracking-widest">{error}</p>}
                        <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl active:scale-95 transition-all">Authorize</button>
                    </form>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center p-20"><Spinner /></div>;
        const props = {
            onEdit: (item: any, type: AdminTab) => setEditModal({ isOpen: true, type, item }),
            onDelete: (item: any, type: AdminTab) => setDeleteModal({ isOpen: true, type, item })
        };
        switch (activeTab) {
            case 'businesses': return <BusinessList businesses={businesses} {...props} />;
            case 'customers': return <CustomerList customers={customers} {...props} />;
            case 'posts': return <PostList posts={posts} {...props} />;
            case 'memberships': return <MembershipList memberships={memberships} {...props} />;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] font-sans pb-20">
            <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-slate-200 p-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-8">
                    <BackButton />
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none">Global Control</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Platform Oversite Dashboard</p>
                    </div>
                </div>
                <nav className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl">
                    <TabButton label="Businesses" count={businesses.length} isActive={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} />
                    <TabButton label="Users" count={customers.length} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                    <TabButton label="Posts" count={posts.length} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <TabButton label="Transactions" count={memberships.length} isActive={activeTab === 'memberships'} onClick={() => setActiveTab('memberships')} />
                </nav>
            </header>
            
            <main className="max-w-7xl mx-auto px-8 md:px-16 pt-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tighter">Active {activeTab}</h2>
                    {activeTab === 'businesses' && (
                        <button onClick={() => setCreateBusinessModalOpen(true)} className="bg-primary text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:bg-blue-700 transition-all active:scale-95">
                            Provision Partner
                        </button>
                    )}
                </div>
                {renderContent()}
            </main>
        </div>
    );
};

// --- LIST COMPONENTS ---

const BusinessList: React.FC<{ businesses: Business[], onEdit: any, onDelete: any }> = ({ businesses, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {businesses.map(biz => (
            <div key={biz.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all group">
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <img src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="L" className="size-16 rounded-[1.25rem] object-cover bg-slate-100 grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                        <div className="min-w-0">
                            <p className="font-black text-xl tracking-tight text-slate-900 truncate">{biz.public_name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{biz.email}</p>
                        </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                         <div className="text-center flex-grow">
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Partner QR</p>
                             <img src={biz.qr_data_url} alt="QR" className="size-20 mx-auto rounded-lg border border-white shadow-sm" />
                         </div>
                    </div>
                </div>
                <div className="flex gap-2 mt-8 pt-6 border-t border-slate-50">
                    <button onClick={() => onEdit(biz, 'businesses')} className="flex-grow py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">Modify</button>
                    <button onClick={() => onDelete(biz, 'businesses')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><TrashIcon/></button>
                </div>
            </div>
        ))}
    </div>
);

const CustomerList: React.FC<{ customers: Customer[], onEdit: any, onDelete: any }> = ({ customers, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {customers.map(cust => (
            <div key={cust.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all">
                <div className="flex items-center gap-6 mb-8">
                    <img src={cust.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="P" className="size-16 rounded-[1.25rem] object-cover bg-slate-100 shadow-sm" />
                    <div className="min-w-0">
                        <p className="font-black text-xl tracking-tight text-slate-900 truncate">{cust.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cust.phone_number || 'NO PHONE'}</p>
                    </div>
                </div>
                <div className="flex gap-2 mt-auto">
                    <button onClick={() => onEdit(cust, 'customers')} className="flex-grow py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-colors">Details</button>
                    <button onClick={() => onDelete(cust, 'customers')} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-colors"><TrashIcon/></button>
                </div>
            </div>
        ))}
    </div>
);

const PostList: React.FC<{ posts: Post[], onEdit: any, onDelete: any }> = ({ posts, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 gap-6">
        {posts.map(post => (
            <div key={post.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex justify-between items-center gap-8 hover:shadow-xl transition-all">
                <div className="flex items-center gap-8 flex-grow">
                    <div className="size-20 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                         {post.image_url ? <img src={post.image_url} alt="X" className="size-full object-cover" /> : <div className="size-full flex items-center justify-center text-slate-300 font-black">QR</div>}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-black text-xl tracking-tight text-slate-900 truncate mb-1">{post.title}</h3>
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">{post.businesses?.public_name || 'System'}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(post, 'posts')} className="p-4 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100"><PencilIcon/></button>
                    <button onClick={() => onDelete(post, 'posts')} className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100"><TrashIcon/></button>
                </div>
            </div>
        ))}
    </div>
);

const MembershipList: React.FC<{ memberships: Membership[], onEdit: any, onDelete: any }> = ({ memberships, onEdit, onDelete }) => (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50/50">
                <tr>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Partner</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Equity (PTS)</th>
                    <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                {memberships.map(mem => (
                    <tr key={mem.id} className="hover:bg-slate-50/20 transition-colors">
                        <td className="p-6 font-bold text-slate-900">{mem.customers?.name}</td>
                        <td className="p-6 font-bold text-slate-500">{mem.businesses?.public_name}</td>
                        <td className="p-6"><span className="font-black text-primary bg-primary/5 px-4 py-2 rounded-xl text-lg">{mem.points}</span></td>
                        <td className="p-6">
                            <div className="flex gap-2">
                                <button onClick={() => onEdit(mem, 'memberships')} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-primary transition-colors"><PencilIcon /></button>
                                <button onClick={() => onDelete(mem, 'memberships')} className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:text-rose-600 transition-colors"><TrashIcon /></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

// --- UI COMPONENTS ---

const TabButton: React.FC<{label: string, count: number, isActive: boolean, onClick: () => void}> = ({label, count, isActive, onClick}) => (
    <button onClick={onClick} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${isActive ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-900'}`}>
        {label}
        <span className={`text-[10px] px-2 py-0.5 rounded-lg ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>{count}</span>
    </button>
);

export default AdminPage;
