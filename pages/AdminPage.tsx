
import React, { useState, useEffect } from 'react';
import { Business, Customer, Post, Membership } from '../types';
import { getAllBusinesses, getAllCustomers, getAllPosts, getAllMemberships } from '../services/api';
import { Spinner } from '../components/common';

type AdminTab = 'businesses' | 'customers' | 'posts' | 'memberships';

const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('businesses');
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [memberships, setMemberships] = useState<Membership[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
        fetchData();
    }, []);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center p-10"><Spinner /></div>;
        }

        switch (activeTab) {
            case 'businesses':
                return <BusinessList businesses={businesses} />;
            case 'customers':
                return <CustomerList customers={customers} />;
            case 'posts':
                return <PostList posts={posts} />;
            case 'memberships':
                return <MembershipList memberships={memberships} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8 font-sans">
            <header className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <a href="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Home</a>
            </header>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    <TabButton label={`Businesses (${businesses.length})`} isActive={activeTab === 'businesses'} onClick={() => setActiveTab('businesses')} />
                    <TabButton label={`Customers (${customers.length})`} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                    <TabButton label={`Posts (${posts.length})`} isActive={activeTab === 'posts'} onClick={() => setActiveTab('posts')} />
                    <TabButton label={`Memberships (${memberships.length})`} isActive={activeTab === 'memberships'} onClick={() => setActiveTab('memberships')} />
                </nav>
            </div>
            
            <main className="mt-6">
                {renderContent()}
            </main>
        </div>
    );
};

// --- TAB LIST COMPONENTS ---

const BusinessList: React.FC<{ businesses: Business[] }> = ({ businesses }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businesses.map(biz => (
            <div key={biz.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                <div className="flex items-start gap-4">
                    <img src={biz.logo_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="logo" className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800">{biz.public_name}</p>
                        <p className="text-sm text-gray-500">{biz.name}</p>
                        <p className="text-sm text-gray-600 truncate">{biz.email}</p>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Created: {new Date(biz.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 break-all">ID: {biz.id}</p>
                </div>
                <div className="text-center bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold mb-1">Login QR</p>
                    <img src={biz.qr_data_url} alt="Business QR" className="w-24 h-24 mx-auto rounded" />
                </div>
            </div>
        ))}
    </div>
);

const CustomerList: React.FC<{ customers: Customer[] }> = ({ customers }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(cust => (
            <div key={cust.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                <div className="flex items-start gap-4">
                     <img src={cust.profile_picture_url || 'https://i.postimg.cc/8zRZt9pM/user.png'} alt="pfp" className="w-12 h-12 rounded-full object-cover bg-gray-200" />
                    <div className="flex-grow">
                        <p className="font-bold text-lg text-gray-800">{cust.name}</p>
                        <p className="text-sm text-gray-600">{cust.phone_number || 'No phone'}</p>
                    </div>
                </div>
                <div>
                     <p className="text-xs text-gray-500">Created: {new Date(cust.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 break-all">ID: {cust.id}</p>
                </div>
                 <div className="text-center bg-gray-50 p-2 rounded-md">
                    <p className="text-sm font-semibold mb-1">Loyalty QR</p>
                    <img src={cust.qr_data_url} alt="Customer QR" className="w-24 h-24 mx-auto rounded" />
                </div>
            </div>
        ))}
    </div>
);

const PostList: React.FC<{ posts: Post[] }> = ({ posts }) => (
    <div className="space-y-4">
        {posts.map(post => (
            <div key={post.id} className="bg-white p-4 rounded-lg shadow-md">
                <p className="font-bold text-lg">{post.title}</p>
                <p className="text-sm text-gray-600">By: <span className="font-semibold">{post.businesses?.public_name || 'Unknown'}</span></p>
                <p className="text-xs text-gray-400 mb-2">Posted: {new Date(post.created_at).toLocaleString()}</p>
                {post.content && <p className="text-gray-700 text-sm mt-2 p-2 bg-gray-50 rounded line-clamp-2">{post.content}</p>}
                 {post.image_url && <img src={post.image_url} alt="post" className="mt-2 rounded-md max-h-24" />}
            </div>
        ))}
    </div>
);

const MembershipList: React.FC<{ memberships: Membership[] }> = ({ memberships }) => (
     <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600">
                    <tr>
                        <th className="p-2">Customer</th>
                        <th className="p-2">Business</th>
                        <th className="p-2">Points</th>
                        <th className="p-2">Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {memberships.map(mem => (
                        <tr key={mem.id} className="border-b">
                            <td className="p-2 font-medium">{mem.customers.name}</td>
                            <td className="p-2 text-gray-700">{mem.businesses.public_name}</td>
                            <td className="p-2 font-bold text-blue-600">{mem.points}</td>
                            <td className="p-2 text-gray-500">{new Date(mem.updated_at).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


// --- UI COMPONENTS ---

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button onClick={onClick} className={`py-3 px-2 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
        {label}
    </button>
);

export default AdminPage;