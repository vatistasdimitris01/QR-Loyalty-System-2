
import React, { useState, useEffect } from 'react';
import { Business, Customer, Post, Membership } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { 
    getAllBusinesses, getAllCustomers, getAllPosts, getAllMemberships,
    updateBusiness, deleteBusiness, updateCustomer, deleteCustomerAccount,
    updatePost, deletePost, updateMembership, deleteMembershipById,
    createBusinessByAdmin
} from '../services/api';
import { Spinner, InputField, TextAreaField, PencilIcon, TrashIcon } from '../components/common';

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
        if (isAuthenticated) {
            fetchData();
        }
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
            setNewBusinessResult(result.business); // Show success modal with QR
            fetchData(); // Refresh the list
            return { success: true };
        } else {
            return { success: false, message: result.message || 'Failed to create business.' };
        }
    }


    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-900 flex justify-center items-center p-4">
                <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-8">
                    <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin Access</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <InputField label="Password" name="password" type="password" value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">Login</button>
                    </form>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center p-10"><Spinner /></div>;
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
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 font-sans">
            {editModal.isOpen && <EditModal modalState={editModal} onSave={handleSave} onClose={() => setEditModal({ isOpen: false, type: null, item: null })} />}
            {deleteModal.isOpen && <DeleteModal modalState={deleteModal} onDelete={handleDelete} onClose={() => setDeleteModal({ isOpen: false, type: null, item: null })} />}
            {createBusinessModalOpen && <CreateBusinessModal onCreate={handleCreateBusiness} onClose={() => setCreateBusinessModalOpen(false)} />}
            {newBusinessResult && <NewBusinessResultModal business={newBusinessResult} onClose={() => setNewBusinessResult(null)} />}
            
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <a href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Home</a>
            </header>
            <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-6 overflow-x-auto">
                <TabButton label={`Businesses (${businesses.length})`} isActive={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} />
                <TabButton label={`Customers (${customers.length})`} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                <TabButton label={`Posts (${posts.length})`} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                <TabButton label={`Memberships (${memberships.length})`} isActive={activeTab === 'memberships'} onClick={() => setActiveTab('memberships')} />
            </nav></div>
            
            {activeTab === 'businesses' && (
                <div className="mt-6 text-right">
                    <button onClick={() => setCreateBusinessModalOpen(true)} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">
                        + {t('businessSignup')}
                    </button>
                </div>
            )}
            
            <main className="mt-6">{renderContent()}</main>
        </div>
    );
};

// --- CRUD MODALS ---
const Modal: React.FC<{title: string, children: React.ReactNode, onClose: () => void}> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
);

const CreateBusinessModal: React.FC<{onCreate: (data: any) => Promise<{success: boolean, message?: string}>, onClose: () => void}> = ({ onCreate, onClose }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleCreate = async () => {
        setError('');
        if (!formData.name || !formData.email || !formData.password) {
            setError('All fields are required.');
            return;
        }
        setIsSaving(true);
        const result = await onCreate(formData);
        if (!result.success) {
            setError(result.message || 'An error occurred.');
        }
        setIsSaving(false);
    };

    return (
        <Modal title={t('businessSignup')} onClose={onClose}>
            <div className="space-y-4">
                <InputField label="Business Name (internal)" name="name" value={formData.name} onChange={handleChange} />
                <InputField label="Login Email" name="email" value={formData.email} onChange={handleChange} type="email" />
                <InputField label="Password" name="password" value={formData.password} onChange={handleChange} type="password" />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={handleCreate} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300">
                        {isSaving ? 'Creating...' : t('createAccount')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const NewBusinessResultModal: React.FC<{business: Business, onClose: () => void}> = ({ business, onClose }) => {
    return (
        <Modal title="Business Created Successfully" onClose={onClose}>
            <div className="text-center">
                <p className="mb-2">The business '<strong>{business.public_name}</strong>' has been created.</p>
                <p className="text-gray-600 mb-4">Provide the owner with this QR code to log in.</p>
                <img src={business.qr_data_url} alt="New Business Login QR" className="w-48 h-48 mx-auto rounded-lg border"/>
                <div className="mt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold">Done</button>
                </div>
            </div>
        </Modal>
    )
};

const EditModal: React.FC<{modalState: ModalState, onSave: (type: AdminTab, item: any) => void, onClose: () => void}> = ({ modalState, onSave, onClose }) => {
    const { item, type } = modalState;
    const [formData, setFormData] = useState(item);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => { setFormData(item); }, [item]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSave = async () => {
        setIsSaving(true);
        await onSave(type!, formData);
        setIsSaving(false);
    };

    const renderForm = () => {
        switch (type) {
            case 'businesses': return (<div className="space-y-4">
                <InputField label="Public Name" name="public_name" value={formData.public_name || ''} onChange={handleChange} />
                <InputField label="Internal Name" name="name" value={formData.name || ''} onChange={handleChange} />
                <InputField label="Email" name="email" value={formData.email || ''} onChange={handleChange} />
            </div>);
            case 'customers': return (<div className="space-y-4">
                <InputField label="Name" name="name" value={formData.name || ''} onChange={handleChange} />
                <InputField label="Phone Number" name="phone_number" value={formData.phone_number || ''} onChange={handleChange} />
            </div>);
            case 'posts': return (<div className="space-y-4">
                <InputField label="Title" name="title" value={formData.title || ''} onChange={handleChange} />
                <TextAreaField label="Content" name="content" value={formData.content || ''} onChange={handleChange} />
            </div>);
            case 'memberships': return (<div className="space-y-4">
                <p>Editing points for <strong>{item.customers.name}</strong> at <strong>{item.businesses.public_name}</strong></p>
                <InputField label="Points" name="points" type="number" value={formData.points} onChange={(e) => setFormData({...formData, points: parseInt(e.target.value, 10) || 0})} />
            </div>);
            default: return null;
        }
    };
    
    return (
        <Modal title={`Edit ${type}`} onClose={onClose}>
            <div className="space-y-6">
                {renderForm()}
                <div className="flex justify-end gap-3 pt-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold disabled:bg-blue-300">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const DeleteModal: React.FC<{modalState: ModalState, onDelete: (type: AdminTab, item: any) => void, onClose: () => void}> = ({ modalState, onDelete, onClose }) => {
    const { item, type } = modalState;
    const [isDeleting, setIsDeleting] = useState(false);
    const handleDelete = async () => {
        setIsDeleting(true);
        await onDelete(type!, item);
        setIsDeleting(false);
    }
    const itemName = item?.name || item?.title || `membership for ${item?.customers?.name}`;
    return (
        <Modal title={`Delete ${type}`} onClose={onClose}>
            <p>Are you sure you want to delete <strong>{itemName}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3 pt-6">
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-semibold">Cancel</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold disabled:bg-red-300">
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
            </div>
        </Modal>
    )
};


// --- LIST COMPONENTS ---
interface ListProps { onEdit: (item: any, type: AdminTab) => void; onDelete: (item: any, type: AdminTab) => void; }

const BusinessList: React.FC<{ businesses: Business[] } & ListProps> = ({ businesses, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{businesses.map(biz => (
        <div key={biz.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-start gap-4"><img src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="logo" className="w-12 h-12 rounded-full object-cover bg-gray-200" /><div className="flex-grow"><p className="font-bold text-lg text-gray-800">{biz.public_name}</p><p className="text-sm text-gray-500">{biz.name}</p><p className="text-sm text-gray-600 truncate">{biz.email}</p></div></div>
                <div><p className="text-xs text-gray-500">ID: {biz.id}</p></div>
                <div className="text-center bg-gray-50 p-2 rounded-md"><p className="text-sm font-semibold mb-1">Login QR</p><img src={biz.qr_data_url} alt="Business QR" className="w-24 h-24 mx-auto rounded" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-3 border-t pt-3"><ActionButton onClick={() => onEdit(biz, 'businesses')} type="edit" /><ActionButton onClick={() => onDelete(biz, 'businesses')} type="delete" /></div>
        </div>
    ))}</div>
);

const CustomerList: React.FC<{ customers: Customer[] } & ListProps> = ({ customers, onEdit, onDelete }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{customers.map(cust => (
        <div key={cust.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col justify-between">
            <div className="space-y-3">
                <div className="flex items-start gap-4"><img src={cust.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="pfp" className="w-12 h-12 rounded-full object-cover bg-gray-200" /><div className="flex-grow"><p className="font-bold text-lg text-gray-800">{cust.name}</p><p className="text-sm text-gray-600">{cust.phone_number || 'No phone'}</p></div></div>
                <div><p className="text-xs text-gray-500">ID: {cust.id}</p></div>
                <div className="text-center bg-gray-50 p-2 rounded-md"><p className="text-sm font-semibold mb-1">Loyalty QR</p><img src={cust.qr_data_url} alt="Customer QR" className="w-24 h-24 mx-auto rounded" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-3 border-t pt-3"><ActionButton onClick={() => onEdit(cust, 'customers')} type="edit" /><ActionButton onClick={() => onDelete(cust, 'customers')} type="delete" /></div>
        </div>
    ))}</div>
);

const PostList: React.FC<{ posts: Post[] } & ListProps> = ({ posts, onEdit, onDelete }) => (
    <div className="space-y-4">{posts.map(post => (
        <div key={post.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start gap-4">
            <div className="flex-grow">
                <p className="font-bold text-lg">{post.title}</p>
                <p className="text-sm text-gray-600">By: <span className="font-semibold">{post.businesses?.public_name || 'Unknown'}</span></p>
                <p className="text-xs text-gray-400 mb-2">Posted: {new Date(post.created_at).toLocaleString()}</p>
                {post.content && <p className="text-gray-700 text-sm mt-2 p-2 bg-gray-50 rounded line-clamp-2">{post.content}</p>}
                {post.image_url && <img src={post.image_url} alt="post" className="mt-2 rounded-md max-h-24" />}
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0"><ActionButton onClick={() => onEdit(post, 'posts')} type="edit" /><ActionButton onClick={() => onDelete(post, 'posts')} type="delete" /></div>
        </div>
    ))}</div>
);

const MembershipList: React.FC<{ memberships: Membership[] } & ListProps> = ({ memberships, onEdit, onDelete }) => (
     <div className="bg-white rounded-lg shadow-md"><div className="overflow-x-auto"><table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-600"><tr><th className="p-2">Customer</th><th className="p-2">Business</th><th className="p-2">Points</th><th className="p-2">Last Updated</th><th className="p-2">Actions</th></tr></thead>
        <tbody>{memberships.map(mem => (
            <tr key={mem.id} className="border-b">
                <td className="p-2 font-medium">{mem.customers?.name}</td>
                <td className="p-2 text-gray-700">{mem.businesses?.public_name}</td>
                <td className="p-2 font-bold text-blue-600">{mem.points}</td>
                <td className="p-2 text-gray-500">{new Date(mem.updated_at).toLocaleString()}</td>
                <td className="p-2"><div className="flex gap-2"><ActionButton onClick={() => onEdit(mem, 'memberships')} type="edit" /><ActionButton onClick={() => onDelete(mem, 'memberships')} type="delete" /></div></td>
            </tr>
        ))}</tbody>
    </table></div></div>
);


// --- UI COMPONENTS ---
const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-2 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{label}</button>
);
const ActionButton: React.FC<{onClick: () => void, type: 'edit' | 'delete'}> = ({onClick, type}) => (
    <button onClick={onClick} className={`p-2 rounded-md transition-colors ${type === 'edit' ? 'text-blue-600 hover:bg-blue-100' : 'text-red-600 hover:bg-red-100'}`}>
        {type === 'edit' ? <PencilIcon /> : <TrashIcon />}
    </button>
);

export default AdminPage;