import { Customer, ScanResult, Business, Membership, Discount, QrStyle, BusinessQrDesign } from '../types';
import supabase from './supabaseClient';
import { generateQrCode } from './qrGenerator';

// ====== CUSTOMER-FACING APIs ======

export const getCustomerByQrToken = async (qrToken: string): Promise<Customer | null> => {
  const { data, error } = await supabase.from('customers').select('*').eq('qr_token', qrToken).single();
  if (error) {
    console.error(`Error fetching customer by token ${qrToken}:`, error);
    return null;
  }
  return data;
};

export const updateCustomer = async (id: string, updatedData: Partial<Pick<Customer, 'name' | 'phone_number' | 'qr_style_preferences'>>): Promise<Customer | null> => {
    // If QR style is being updated, regenerate the QR code data URL
    if ('qr_style_preferences' in updatedData && updatedData.qr_style_preferences) {
        const { data: currentCustomer } = await supabase.from('customers').select('qr_token').eq('id', id).single();
        if (currentCustomer) {
            const newQrDataUrl = await generateQrCode(currentCustomer.qr_token, updatedData.qr_style_preferences);
            (updatedData as any).qr_data_url = newQrDataUrl;
        }
    }

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

export const createCustomer = async (customerData: Pick<Customer, 'name' | 'phone_number'>): Promise<Customer | null> => {
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    const defaultStyle = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultStyle);

    const newCustomerData = {
        ...customerData,
        qr_token,
        qr_data_url,
        qr_style_preferences: defaultStyle
    };

    const { data, error } = await supabase
        .from('customers')
        .insert(newCustomerData)
        .select()
        .single();

    if (error) {
        console.error('Error creating customer:', error);
        return null;
    }
    return data;
};

export const getMembershipsForCustomer = async (customerId: string): Promise<Membership[]> => {
    const { data, error } = await supabase
        .from('memberships')
        .select('*, businesses(*)')
        .eq('customer_id', customerId)
        .order('updated_at', { ascending: false });
    
    if (error) {
        console.error('Error fetching memberships:', error);
        return [];
    }
    return (data as Membership[]) || [];
}

export const searchBusinesses = async (searchTerm: string): Promise<Business[]> => {
    const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .ilike('public_name', `%${searchTerm}%`);
    
    if (error) {
        console.error('Error searching businesses:', error);
        return [];
    }
    return data || [];
}

export const joinBusiness = async(customerId: string, businessId: string): Promise<{membership: Membership, business: Business} | null> => {
    // Check if membership already exists
    const { data: existing, error: checkError } = await supabase
        .from('memberships')
        .select('id')
        .eq('customer_id', customerId)
        .eq('business_id', businessId)
        .maybeSingle();
    
    if (checkError || existing) {
        if(existing) console.log("Membership already exists.");
        if(checkError) console.error("Error checking for membership:", checkError);
        return null; // Don't create a duplicate
    }
    
    // Fetch business details to return for a nice message
    const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('public_name')
        .eq('id', businessId)
        .single();

    if (businessError || !business) {
        console.error('Could not find business to join');
        return null;
    }

    const { data, error } = await supabase
        .from('memberships')
        .insert({ customer_id: customerId, business_id: businessId, points: 0 })
        .select()
        .single();

    if (error) {
        console.error('Error joining business:', error);
        return null;
    }
    return { membership: data, business };
}

export const getDiscountsForBusiness = async (businessId: string): Promise<Discount[]> => {
    const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .eq('business_id', businessId)
        .eq('active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching discounts for business ${businessId}:`, error);
        return [];
    }
    return data || [];
}

export const leaveBusiness = async (customerId: string, businessId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('customer_id', customerId)
        .eq('business_id', businessId);

    if (error) {
        console.error('Error leaving business:', error);
        return { success: false };
    }
    return { success: true };
}


// ====== BUSINESS-FACING APIs ======

export const provisionCustomerForBusiness = async (businessId: string): Promise<Customer | null> => {
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate a QR with an embedded 'join' parameter for this business
    const qr_data_url = await generateQrCode(qr_token, {}, businessId);

    const newCustomerData = {
        name: 'New Customer', // Placeholder name
        phone_number: '', // Empty phone, to be filled by customer
        qr_token,
        qr_data_url,
    };

    const { data, error } = await supabase
        .from('customers')
        .insert(newCustomerData)
        .select()
        .single();

    if (error) {
        console.error('Error provisioning customer:', error);
        return null;
    }
    return data;
};

export const awardPoints = async (customerQrToken: string, businessId: string): Promise<ScanResult> => {
  try {
    // 1. Find the customer
    const customer = await getCustomerByQrToken(customerQrToken);
    if (!customer) {
      return { success: false, message: 'Customer QR not found.' };
    }

    // 2. Find the business and its loyalty settings
    const { data: business, error: businessError } = await supabase.from('businesses').select('*').eq('id', businessId).single();
    if (businessError || !business) {
        return { success: false, message: 'Business not found.' };
    }
    const pointsPerScan = business.points_per_scan || 1;
    const rewardThreshold = business.reward_threshold || 5;
    const rewardMessage = business.reward_message || 'You won a reward!';


    // 3. Find existing membership
    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('business_id', businessId)
      .maybeSingle();

    if (membershipError) throw membershipError;

    let newPointsTotal: number;
    let newMember = false;

    // 4. If membership exists, update points. If not, create it.
    if (membership) {
        newPointsTotal = membership.points + pointsPerScan;
    } else {
        newPointsTotal = pointsPerScan;
        newMember = true;
    }

    // 5. Check for reward
    const rewardWon = newPointsTotal >= rewardThreshold;
    const finalPoints = rewardWon ? 0 : newPointsTotal; // Reset points on win
    const pointsAwarded = newMember ? newPointsTotal : pointsPerScan;

    // 6. Upsert membership
     const { error: upsertError } = await supabase
        .from('memberships')
        .upsert({ 
            id: membership?.id, // Supabase uses id for upsert matching
            customer_id: customer.id, 
            business_id: businessId, 
            points: finalPoints,
            updated_at: new Date().toISOString()
        });
    if (upsertError) throw upsertError;
    
    let message = `+${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''} for ${customer.name}!`;
    if (newMember) message = `${customer.name} just joined and earned ${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''}!`;

    return { 
        success: true, 
        message: message,
        customer,
        business,
        newPointsTotal: finalPoints,
        newMember,
        rewardWon,
        rewardMessage
    };

  } catch (error) {
    console.error('Error in awardPoints:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const getMembershipsForBusiness = async (businessId: string): Promise<Membership[]> => {
    const { data, error } = await supabase
        .from('memberships')
        .select('*, customers(*)')
        .eq('business_id', businessId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching memberships for business:', error);
        return [];
    }
    return (data as Membership[]) || [];
}

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
    const defaultSettings = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultSettings);

    const { data, error } = await supabase
        .from('businesses')
        .insert({
            name: businessData.name,
            public_name: businessData.name, // Default public name to internal name
            email: businessData.email,
            password: businessData.password,
            qr_token,
            qr_data_url,
            reward_message: 'Congratulations! You won a reward!',
            ...defaultSettings
        })
        .select();
    
    if (error || !data || data.length === 0) {
        console.error('Error creating business:', error);
        return { success: false, message: 'Failed to create business.' };
    }
    
    const { password: _password, ...newBusiness } = data[0];
    return { success: true, business: newBusiness as Business };
};


export const updateBusiness = async (id: string, updatedData: Partial<Business>): Promise<Business | null> => {
    // If QR settings are changed, regenerate the business's own QR code
    if ('qr_color' in updatedData || 'qr_dot_style' in updatedData || 'qr_eye_shape' in updatedData || 'qr_logo_url' in updatedData) {
        const { data: currentBusiness } = await supabase.from('businesses').select('qr_token, qr_logo_url, qr_color, qr_eye_shape, qr_dot_style').eq('id', id).single();
        if(currentBusiness) {
            const newQrSettings = { ...currentBusiness, ...updatedData };
            updatedData.qr_data_url = await generateQrCode(currentBusiness.qr_token, newQrSettings);
        }
    }
    
    const { data, error } = await supabase
        .from('businesses')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error(`Error updating business ${id}:`, error);
        return null;
    }
    const { password: _, ...businessData } = data;
    return businessData as Business;
};

// ====== BUSINESS QR DESIGN APIs ======

export const getBusinessQrDesigns = async (businessId: string): Promise<BusinessQrDesign[]> => {
    const { data, error } = await supabase
        .from('business_qr_designs')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching QR designs for business ${businessId}:`, error);
        return [];
    }
    return data || [];
};

export const createBusinessQrDesign = async (designData: Omit<BusinessQrDesign, 'id' | 'created_at'>): Promise<BusinessQrDesign | null> => {
    const { data, error } = await supabase
        .from('business_qr_designs')
        .insert(designData)
        .select()
        .single();
    if (error) {
        console.error('Error creating QR design:', error);
        return null;
    }
    return data;
};

export const deleteBusinessQrDesign = async (designId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('business_qr_designs')
        .delete()
        .eq('id', designId);
    if (error) {
        console.error('Error deleting QR design:', error);
        return { success: false };
    }
    return { success: true };
};
