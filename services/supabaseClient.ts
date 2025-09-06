
import { Customer, Discount, Business } from '../types';

const MOCK_CUSTOMERS_KEY = 'mock_customers';
const MOCK_DISCOUNTS_KEY = 'mock_discounts';
const MOCK_BUSINESSES_KEY = 'mock_businesses';


// --- Initialize Mock Data ---
const getInitialCustomers = (): Customer[] => {
  return [
    { id: '1', name: 'Alice Smith', phone_number: '1234567890', password: 'password123', points: 2, qrToken: 'cust_token123', qrDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cust_token123', created_at: new Date().toISOString(), points_updated_at: new Date().toISOString() },
    { id: '2', name: 'Bob Johnson', phone_number: '0987654321', password: 'password123', points: 4, qrToken: 'cust_token456', qrDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cust_token456', created_at: new Date().toISOString(), points_updated_at: new Date().toISOString() },
    { id: '3', name: 'Charlie Brown', phone_number: '5555555555', password: 'password123', points: 1, qrToken: 'cust_token789', qrDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=cust_token789', created_at: new Date().toISOString(), points_updated_at: new Date().toISOString() },
  ];
};

const getInitialDiscounts = (): Discount[] => {
    return [
        { id: 'd1', name: '20% Off Coffee', description: 'Get 20% off any coffee drink.', image_url: 'https://picsum.photos/400/200?image=1060', expiry_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), active: true, created_at: new Date().toISOString(), percentage: 20, price: undefined, price_cutoff: 5 },
        { id: 'd2', name: 'Free Pastry', description: 'Enjoy a free pastry with any purchase over $10.', image_url: 'https://picsum.photos/400/200?image=30', expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), active: true, created_at: new Date().toISOString(), percentage: undefined, price: 0, price_cutoff: 10 },
        { id: 'd3', name: 'Lunch Special', description: 'Sandwich and drink for $8.', active: true, created_at: new Date().toISOString(), price: 8 },
    ];
}

const getInitialBusinesses = (): Business[] => {
    return [
        { id: 'b1', name: 'Xartagora', email: 'business@example.com', password: 'password123', qrToken: 'biz_mainbiz', qrDataUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=biz_mainbiz', created_at: new Date().toISOString() }
    ];
};

if (!localStorage.getItem(MOCK_CUSTOMERS_KEY)) {
  localStorage.setItem(MOCK_CUSTOMERS_KEY, JSON.stringify(getInitialCustomers()));
}

if (!localStorage.getItem(MOCK_DISCOUNTS_KEY)) {
    localStorage.setItem(MOCK_DISCOUNTS_KEY, JSON.stringify(getInitialDiscounts()));
}

if (!localStorage.getItem(MOCK_BUSINESSES_KEY)) {
    localStorage.setItem(MOCK_BUSINESSES_KEY, JSON.stringify(getInitialBusinesses()));
}

const getTableKey = (tableName: string) => {
    if (tableName === 'customers') return MOCK_CUSTOMERS_KEY;
    if (tableName === 'discounts') return MOCK_DISCOUNTS_KEY;
    if (tableName === 'businesses') return MOCK_BUSINESSES_KEY;
    throw new Error(`Unknown table: ${tableName}`);
}

// --- Mock Supabase Client ---
const createMockSupabaseClient = () => {
    const from = (tableName: string) => {
        const tableKey = getTableKey(tableName);
        let data: any[] = JSON.parse(localStorage.getItem(tableKey) || '[]');
        let filters: ((item: any) => boolean)[] = [];
        let single = false;
        let orderKey: string | null = null;
        let orderAsc = true;
        
        const self = {
            select: (columns = '*') => {
                // In mock, select always returns all columns
                return self;
            },
            eq: (column: string, value: any) => {
                filters.push((item) => item[column] === value);
                return self;
            },
            order: (column: string, { ascending }: { ascending: boolean }) => {
                orderKey = column;
                orderAsc = ascending;
                return self;
            },
            single: () => {
                single = true;
                return self;
            },
            update: async (updateData: any) => {
                let updatedItems: any[] = [];
                const allItems: any[] = JSON.parse(localStorage.getItem(tableKey) || '[]');
                const newAllItems = allItems.map(item => {
                    if (filters.every(f => f(item))) {
                        const updatedItem = { ...item, ...updateData };
                        updatedItems.push(updatedItem);
                        return updatedItem;
                    }
                    return item;
                });
                localStorage.setItem(tableKey, JSON.stringify(newAllItems));
                
                if (single && updatedItems.length > 1) {
                    return { data: null, error: new Error('More than one row found') };
                }
                const resultData = single ? updatedItems[0] || null : updatedItems;
                return { data: resultData, error: null };
            },
            delete: async () => {
                const allItems: any[] = JSON.parse(localStorage.getItem(tableKey) || '[]');
                const remainingItems = allItems.filter(item => !filters.every(f => f(item)));
                localStorage.setItem(tableKey, JSON.stringify(remainingItems));
                return { data: null, error: null };
            },
            insert: async (insertData: any | any[]) => {
                 const allItems: any[] = JSON.parse(localStorage.getItem(tableKey) || '[]');
                 const itemsToInsert = Array.isArray(insertData) ? insertData : [insertData];
                 const newItems = itemsToInsert.map(item => ({
                     ...item, 
                     id: crypto.randomUUID(), 
                     created_at: new Date().toISOString() 
                 }));
                 const updatedItems = [...allItems, ...newItems];
                 localStorage.setItem(tableKey, JSON.stringify(updatedItems));
                 // Return a single object if only one was inserted, following Supabase behavior
                 return { data: newItems.length === 1 ? [newItems[0]] : newItems, error: null };
            },
            then: async (resolve: (result: { data: any, error: any }) => void) => {
                let localData: any[] = JSON.parse(localStorage.getItem(tableKey) || '[]');
                let filteredData = localData.filter(item => filters.every(f => f(item)));

                if (orderKey) {
                    filteredData.sort((a, b) => {
                        if (a[orderKey!] < b[orderKey!]) return orderAsc ? -1 : 1;
                        if (a[orderKey!] > b[orderKey!]) return orderAsc ? 1 : -1;
                        return 0;
                    });
                }

                if (single) {
                    if (filteredData.length > 1) {
                        resolve({ data: null, error: new Error('More than one row found') });
                    } else {
                        resolve({ data: filteredData.length ? filteredData[0] : null, error: null });
                    }
                } else {
                    resolve({ data: filteredData, error: null });
                }
            }
        };
        return self;
    };

    return { from };
};

const supabase = createMockSupabaseClient();
export default supabase;
