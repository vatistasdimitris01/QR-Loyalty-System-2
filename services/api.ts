
import { Customer, ScanResult, Business, Membership, Discount, QrStyle, BusinessQrDesign, Post, BusinessAnalytics, DailyAnalyticsData } from '../types';
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

export const uploadProfilePicture = async (customerId: string, file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${customerId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        console.error('Error uploading profile picture:', uploadError);
        return null;
    }

    const { data } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

    if (!data.publicUrl) {
        console.error('Error getting public URL for profile picture');
        return null;
    }
    
    return data.publicUrl;
};


export const updateCustomer = async (id: string, updatedData: Partial<Pick<Customer, 'name' | 'phone_number' | 'qr_style_preferences' | 'profile_picture_url'>>): Promise<Customer | null> => {
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

export const getPopularBusinesses = async (): Promise<Business[]> => {
    const { data, error } = await supabase.rpc('get_popular_businesses');
    if (error) {
        console.error('Error fetching popular businesses:', error);
        return [];
    }
    return data || [];
};

export const getNearbyBusinesses = async (latitude: number, longitude: number): Promise<Business[]> => {
    const { data, error } = await supabase.rpc('get_nearby_businesses', {
        user_lat: latitude,
        user_lon: longitude
    });
    if (error) {
        console.error('Error fetching nearby businesses:', error);
        return [];
    }
    return data || [];
};

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

export const deleteCustomerAccount = async (customerId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

    if (error) {
        console.error('Error deleting customer account:', error);
        return { success: false };
    }
    return { success: true };
};


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
    const customer = await getCustomerByQrToken(customerQrToken);
    if (!customer) return { success: false, message: 'Customer QR not found.' };

    const { data: business, error: businessError } = await supabase.from('businesses').select('*').eq('id', businessId).single();
    if (businessError || !business) return { success: false, message: 'Business not found.' };

    const pointsPerScan = business.points_per_scan || 1;
    const rewardThreshold = business.reward_threshold || 5;
    const rewardMessage = business.reward_message || 'You won a reward!';

    const { data: membership, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('business_id', businessId)
      .maybeSingle();
    if (membershipError) throw membershipError;

    let newPointsTotal: number;
    let newMember = false;

    if (membership) {
        newPointsTotal = membership.points + pointsPerScan;
    } else {
        newPointsTotal = pointsPerScan;
        newMember = true;
    }

    const rewardWon = newPointsTotal >= rewardThreshold;
    const finalPoints = rewardWon ? 0 : newPointsTotal;
    const pointsAwarded = newMember ? newPointsTotal : pointsPerScan;

    const { error: upsertError } = await supabase
        .from('memberships')
        .upsert({ 
            id: membership?.id,
            customer_id: customer.id, 
            business_id: businessId, 
            points: finalPoints,
            updated_at: new Date().toISOString()
        });
    if (upsertError) throw upsertError;

    // Log scan for analytics
    const { error: logError } = await supabase.from('scan_logs').insert({
        business_id: businessId,
        customer_id: customer.id,
        points_awarded: pointsAwarded,
        reward_claimed: rewardWon
    });
    if (logError) console.error("Error logging scan:", logError);

    let message = `+${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''} for ${customer.name}!`;
    if (newMember) message = `${customer.name} just joined and earned ${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''}!`;

    return { success: true, message, customer, business, newPointsTotal: finalPoints, newMember, rewardWon, rewardMessage };

  } catch (error) {
    console.error('Error in awardPoints:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const searchMembershipsForBusiness = async (businessId: string, searchTerm: string): Promise<Membership[]> => {
    const { data, error } = await supabase
        .rpc('search_memberships_for_business', {
            business_id_param: businessId,
            search_term_param: searchTerm
        })
        .select('*, customers(*)');

    if (error) {
        console.error('Error searching memberships for business:', error);
        return [];
    }
    return (data as any[]) || [];
}

export const removeMembership = async (customerId: string, businessId: string): Promise<{ success: boolean }> => {
    const { error } = await supabase
        .from('memberships')
        .delete()
        .match({ customer_id: customerId, business_id: businessId });

    if (error) {
        console.error('Error removing membership:', error);
        return { success: false };
    }
    return { success: true };
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
    const defaultSettings = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultSettings);

    const { data, error } = await supabase
        .from('businesses')
        .insert({
            name: businessData.name,
            public_name: businessData.name,
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
    if ('qr_color' in updatedData || 'qr_dot_style' in updatedData || 'qr_eye_shape' in updatedData || 'qr_logo_url' in updatedData) {
        const { data: currentBusiness } = await supabase.from('businesses').select('qr_token, qr_logo_url, qr_color, qr_eye_shape, qr_dot_style').eq('id', id).single();
        if(currentBusiness) {
            const newQrSettings = { ...currentBusiness, ...updatedData };
            updatedData.qr_data_url = await generateQrCode(currentBusiness.qr_token, newQrSettings);
        }
    }

    if ('address_text' in updatedData) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(updatedData.address_text || '')}&format=json&limit=1`);
            const geoData = await response.json();
            if (geoData && geoData.length > 0) {
                updatedData.latitude = parseFloat(geoData[0].lat);
                updatedData.longitude = parseFloat(geoData[0].lon);
            } else {
                 updatedData.latitude = null;
                 updatedData.longitude = null;
            }
        } catch (error) {
            console.error("Geocoding failed:", error);
            updatedData.latitude = null;
            updatedData.longitude = null;
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

// ====== BUSINESS CONTENT APIs ======

export const getDailyAnalytics = async (businessId: string): Promise<DailyAnalyticsData[] | null> => {
    const { data, error } = await supabase.rpc('get_daily_analytics_7d', { p_business_id: businessId });
    if (error) {
        console.error('Error fetching daily analytics:', error);
        return null;
    }
    return data;
};

export const getBusinessAnalytics = async (businessId: string): Promise<BusinessAnalytics | null> => {
    const { data, error } = await supabase.rpc('get_business_analytics', { p_business_id: businessId }).single();
    if (error) {
        console.error('Error fetching analytics:', error);
        return null;
    }
    return data;
};

export const getPostsForBusiness = async (businessId: string): Promise<Post[]> => {
    const { data, error } = await supabase.from('posts').select('*').eq('business_id', businessId).order('created_at', { ascending: false });
    if (error) console.error('Error fetching posts:', error);
    return data || [];
};
export const createPost = async (postData: Omit<Post, 'id' | 'created_at'>): Promise<Post | null> => {
    const { data, error } = await supabase.from('posts').insert(postData).select().single();
    if (error) console.error('Error creating post:', error);
    return data;
};
export const updatePost = async (postId: string, postData: Partial<Omit<Post, 'id' | 'created_at' | 'business_id'>>): Promise<Post | null> => {
    const { data, error } = await supabase.from('posts').update(postData).eq('id', postId).select().single();
    if (error) console.error('Error updating post:', error);
    return data;
}
export const deletePost = async (postId: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) console.error('Error deleting post:', error);
    return !error;
};

export const getDiscountsForBusiness = async (businessId: string): Promise<Discount[]> => {
    const { data, error } = await supabase.from('discounts').select('*').eq('business_id', businessId).eq('active', true).order('created_at', { ascending: false });
    if (error) console.error('Error fetching discounts:', error);
    return data || [];
};
export const createDiscount = async (discountData: Omit<Discount, 'id' | 'created_at' | 'active'>): Promise<Discount | null> => {
    const { data, error } = await supabase.from('discounts').insert({ ...discountData, active: true }).select().single();
    if (error) console.error('Error creating discount:', error);
    return data;
};
export const deleteDiscount = async (discountId: string) => {
    const { error } = await supabase.from('discounts').delete().eq('id', discountId);
    if (error) console.error('Error deleting discount:', error);
    return !error;
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

// ====== ADMIN APIs ======

export const getAllBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase.from('businesses').select('*').order('created_at', { ascending: false });
  if (error) {
      console.error('Error fetching all businesses:', error);
      return [];
  }
  return data || [];
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
  if (error) {
      console.error('Error fetching all customers:', error);
      return [];
  }
  return data || [];
};

export const getAllPosts = async (): Promise<Post[]> => {
  const { data, error } = await supabase.from('posts').select('*, businesses(public_name)').order('created_at', { ascending: false });
  if (error) {
      console.error('Error fetching all posts:', error);
      return [];
  }
  return (data as Post[]) || [];
};

export const getAllMemberships = async (): Promise<Membership[]> => {
  const { data, error } = await supabase.from('memberships').select('*, businesses(public_name), customers(name, phone_number)').order('updated_at', { ascending: false });
  if (error) {
      console.error('Error fetching all memberships:', error);
      return [];
  }
  return (data as Membership[]) || [];
};