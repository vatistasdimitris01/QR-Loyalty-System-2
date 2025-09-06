import { Customer, ScanResult, Business } from '../types';
import supabase from './supabaseClient';
import { REWARD_THRESHOLD } from '../constants';

export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*');
  if (error) {
    console.error('Error fetching all customers:', error);
    return [];
  }
  return data || [];
};

export const getCustomerByQrToken = async (qrToken: string): Promise<Customer | null> => {
  const { data, error } = await supabase.from('customers').select('*').eq('qr_token', qrToken).single();
  if (error) {
    console.error(`Error fetching customer by token ${qrToken}:`, error);
    return null;
  }
  return data;
};

export const awardPoints = async (qrToken: string): Promise<ScanResult> => {
  try {
    const { data: customerRecord, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('qr_token', qrToken)
      .single();

    if (customerError || !customerRecord) {
      return { success: false, message: 'Customer not found.' };
    }

    let newPoints = customerRecord.points + 1;
    let rewardEarned = false;

    if (newPoints > REWARD_THRESHOLD) {
      newPoints = 1;
      rewardEarned = true;
    }

    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({ points: newPoints, points_updated_at: new Date().toISOString() })
      .eq('id', customerRecord.id)
      .select()
      .single();

    if (updateError || !updatedCustomer) {
      return { success: false, message: 'Failed to update customer points.' };
    }

    return {
      success: true,
      message: rewardEarned ? `${updatedCustomer.name} earned a reward!` : `+1 point for ${updatedCustomer.name}!`,
      customer: updatedCustomer,
      pointsAwarded: 1,
      newPointsTotal: updatedCustomer.points,
      rewardEarned,
    };
  } catch (error) {
    console.error('Error awarding points:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const updateCustomer = async (id: string, updatedData: Partial<Customer>): Promise<Customer | null> => {
    const { data, error } = await supabase
        .from('customers')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating customer ${id}:`, error);
        return null;
    }
    return data;
};

export const updateCustomerPhoneNumber = async (id: string, phoneNumber: string): Promise<Customer | null> => {
    return updateCustomer(id, { phone_number: phoneNumber });
};

export const deleteCustomer = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
        console.error(`Error deleting customer ${id}:`, error);
        return false;
    }
    return true;
};

export const createCustomer = async (name: string): Promise<Customer | null> => {
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr_token}`;

    const newCustomerData = {
        name,
        phone_number: null,
        points: 0,
        qr_token,
        qr_data_url,
        points_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('customers')
        .insert(newCustomerData)
        .select();

    if (error) {
        console.error('Error creating customer:', error);
        return null;
    }
    return data?.[0] || null;
};

export const loginBusiness = async (email: string, password: string): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('email', email)
        .single();
    
    if (error || !data) {
        return { success: false, message: 'Business not found.' };
    }

    if (data.password === password) {
        const { password: _, ...businessData } = data;
        return { success: true, business: businessData as Business };
    }

    return { success: false, message: 'Invalid credentials.' };
};

export const loginBusinessWithQrToken = async (qrToken: string): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('qr_token', qrToken)
        .single();

    if (error || !data) {
        return { success: false, message: 'Business not found.' };
    }
    
    const { password: _, ...businessData } = data;
    return { success: true, business: businessData as Business };
}

export const signupBusiness = async (businessData: Omit<Business, 'id' | 'created_at' | 'qr_token' | 'qr_data_url'>): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const { data: existingBusinesses, error: checkError } = await supabase
        .from('businesses')
        .select('id')
        .eq('email', businessData.email);

    if (checkError) {
        console.error('Error during existence check:', checkError);
        return { success: false, message: 'An error occurred checking for existing business.' };
    }

    if (existingBusinesses && existingBusinesses.length > 0) {
        return { success: false, message: 'A business with this email already exists.' };
    }

    const qr_token = `biz_${Math.random().toString(36).substr(2, 9)}`;
    const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr_token}`;

    const { data, error } = await supabase
        .from('businesses')
        .insert({
            name: businessData.name,
            email: businessData.email,
            password: businessData.password,
            qr_token,
            qr_data_url
        })
        .select();
    
    if (error || !data || data.length === 0) {
        console.error('Error creating business:', error);
        return { success: false, message: 'Failed to create business.' };
    }
    
    const { password: _password, ...newBusiness } = data[0];
    return { success: true, business: newBusiness as Business };
};

export const signupCustomer = async (phoneNumber: string, password: string): Promise<{ success: boolean; customer?: Customer; message?: string }> => {
    const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('id')
        .eq('phone_number', phoneNumber);

    if (checkError) {
        console.error('Error during existence check:', checkError);
        return { success: false, message: 'An error occurred checking for existing customer.' };
    }
    
    if (existingCustomers && existingCustomers.length > 0) {
        return { success: false, message: 'This phone number is already registered.' };
    }
    
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    const qr_data_url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qr_token}`;

    const newCustomerData = {
        name: `User ${phoneNumber.slice(-4)}`,
        phone_number: phoneNumber,
        password: password,
        points: 0,
        qr_token,
        qr_data_url,
        points_updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('customers')
        .insert(newCustomerData)
        .select();

    if (error || !data || data.length === 0) {
        console.error('Error creating customer:', error);
        return { success: false, message: 'Failed to create customer account.' };
    }
    
    return { success: true, customer: data[0] as Customer };
};