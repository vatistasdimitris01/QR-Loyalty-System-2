import { Customer, ScanResult, Business, Membership, Discount, QrStyle, BusinessQrDesign, Post, BusinessAnalytics, DailyAnalyticsData } from '../types';
import sql from './dbClient';
import { generateQrCode } from './qrGenerator';

// ====== HELPERS ======

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// ====== CUSTOMER-FACING APIs ======

export const getCustomerByQrToken = async (qrToken: string): Promise<Customer | null> => {
    const rows = await sql`SELECT * FROM customers WHERE qr_token = ${qrToken} LIMIT 1`;
    return (rows[0] as Customer) || null;
};

export const uploadProfilePicture = async (customerId: string, file: File): Promise<string | null> => {
    try {
        const base64 = await fileToBase64(file);
        // In raw PSQL migration, we store the base64 directly in the URL column
        await sql`UPDATE customers SET profile_picture_url = ${base64} WHERE id = ${customerId}`;
        return base64;
    } catch (e) {
        console.error('Error uploading profile picture:', e);
        return null;
    }
};

export const uploadBusinessAsset = async (businessId: string, file: File, assetType: 'logo' | 'cover'): Promise<string | null> => {
    try {
        const base64 = await fileToBase64(file);
        const column = assetType === 'logo' ? 'logo_url' : 'cover_photo_url';
        
        // Dynamic column selection is tricky in SQL templates, so we use logic
        if (assetType === 'logo') {
            await sql`UPDATE businesses SET logo_url = ${base64} WHERE id = ${businessId}`;
        } else {
            await sql`UPDATE businesses SET cover_photo_url = ${base64} WHERE id = ${businessId}`;
        }
        return base64;
    } catch (e) {
        console.error(`Error uploading ${assetType}:`, e);
        return null;
    }
};

export const updateCustomer = async (id: string, updatedData: Partial<Customer>): Promise<Customer | null> => {
    if (updatedData.qr_style_preferences) {
        const rows = await sql`SELECT qr_token FROM customers WHERE id = ${id}`;
        if (rows.length > 0) {
            const newQrDataUrl = await generateQrCode(rows[0].qr_token, updatedData.qr_style_preferences);
            updatedData.qr_data_url = newQrDataUrl;
        }
    }

    // Build update query dynamically
    const fields = Object.entries(updatedData).filter(([k, v]) => v !== undefined);
    if (fields.length === 0) return null;

    // Use a multi-statement approach or simple individual calls if needed
    // For simplicity and since Neon HTTP driver is stateless, we just do one update
    for (const [key, value] of fields) {
        // Warning: This is simplified. In production use a more robust query builder.
        if (key === 'name') await sql`UPDATE customers SET name = ${value as any} WHERE id = ${id}`;
        if (key === 'phone_number') await sql`UPDATE customers SET phone_number = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_style_preferences') await sql`UPDATE customers SET qr_style_preferences = ${JSON.stringify(value)}::jsonb WHERE id = ${id}`;
        if (key === 'profile_picture_url') await sql`UPDATE customers SET profile_picture_url = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_data_url') await sql`UPDATE customers SET qr_data_url = ${value as any} WHERE id = ${id}`;
    }

    const rows = await sql`SELECT * FROM customers WHERE id = ${id}`;
    return (rows[0] as Customer) || null;
};

export const createCustomer = async (customerData: Pick<Customer, 'name' | 'phone_number'>): Promise<Customer | null> => {
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    const defaultStyle = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultStyle);

    const rows = await sql`
        INSERT INTO customers (name, phone_number, qr_token, qr_data_url, qr_style_preferences)
        VALUES (${customerData.name}, ${customerData.phone_number}, ${qr_token}, ${qr_data_url}, ${JSON.stringify(defaultStyle)}::jsonb)
        RETURNING *
    `;
    return (rows[0] as Customer) || null;
};

export const getMembershipsForCustomer = async (customerId: string): Promise<Membership[]> => {
    const rows = await sql`
        SELECT m.*, b.id as b_id, b.public_name as b_public_name, b.logo_url as b_logo_url
        FROM memberships m
        JOIN businesses b ON m.business_id = b.id
        WHERE m.customer_id = ${customerId}
        ORDER BY m.updated_at DESC
    `;
    
    return rows.map(r => ({
        ...r,
        businesses: {
            id: r.b_id,
            public_name: r.b_public_name,
            logo_url: r.b_logo_url
        }
    })) as Membership[];
};

export const searchBusinesses = async (searchTerm: string): Promise<Business[]> => {
    const rows = await sql`
        SELECT * FROM businesses 
        WHERE public_name ILIKE ${'%' + searchTerm + '%'}
    `;
    return rows as Business[];
};

export const getPopularBusinesses = async (): Promise<Business[]> => {
    const rows = await sql`
        SELECT b.*, COUNT(m.id) as membership_count
        FROM businesses b
        LEFT JOIN memberships m ON b.id = m.business_id
        GROUP BY b.id
        ORDER BY membership_count DESC
        LIMIT 10
    `;
    return rows as Business[];
};

export const getNearbyBusinesses = async (latitude: number, longitude: number): Promise<Business[]> => {
    // Haversine formula for proximity search
    const rows = await sql`
        SELECT *, (
            6371 * acos(
                cos(radians(${latitude})) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(${longitude})) +
                sin(radians(${latitude})) * sin(radians(latitude))
            )
        ) * 1000 AS dist_meters
        FROM businesses
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        ORDER BY dist_meters ASC
        LIMIT 20
    `;
    return rows as Business[];
};

export const joinBusiness = async(customerId: string, businessId: string): Promise<{membership: Membership, business: Business} | null> => {
    const existing = await sql`SELECT id FROM memberships WHERE customer_id = ${customerId} AND business_id = ${businessId} LIMIT 1`;
    if (existing.length > 0) return null;

    const bizRows = await sql`SELECT public_name FROM businesses WHERE id = ${businessId} LIMIT 1`;
    if (bizRows.length === 0) return null;

    const memRows = await sql`
        INSERT INTO memberships (customer_id, business_id, points)
        VALUES (${customerId}, ${businessId}, 0)
        RETURNING *
    `;

    return { membership: memRows[0] as Membership, business: bizRows[0] as Business };
};

export const leaveBusiness = async (customerId: string, businessId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM memberships WHERE customer_id = ${customerId} AND business_id = ${businessId}`;
    return { success: true };
};

export const deleteCustomerAccount = async (customerId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM customers WHERE id = ${customerId}`;
    return { success: true };
};


// ====== BUSINESS-FACING APIs ======

export const provisionCustomerForBusiness = async (businessId: string): Promise<Customer | null> => {
    const qr_token = `cust_${Math.random().toString(36).substr(2, 9)}`;
    const qr_data_url = await generateQrCode(qr_token, {}, businessId);

    const rows = await sql`
        INSERT INTO customers (name, phone_number, qr_token, qr_data_url)
        VALUES ('New Customer', '', ${qr_token}, ${qr_data_url})
        RETURNING *
    `;
    return (rows[0] as Customer) || null;
};

export const awardPoints = async (customerQrToken: string, businessId: string): Promise<ScanResult> => {
  try {
    const customer = await getCustomerByQrToken(customerQrToken);
    if (!customer) return { success: false, message: 'Customer QR not found.' };

    const bizRows = await sql`SELECT * FROM businesses WHERE id = ${businessId} LIMIT 1`;
    if (bizRows.length === 0) return { success: false, message: 'Business not found.' };
    const business = bizRows[0] as Business;

    const pointsPerScan = business.points_per_scan || 1;
    const rewardThreshold = business.reward_threshold || 5;
    const rewardMessage = business.reward_message || 'You won a reward!';

    const memRows = await sql`SELECT * FROM memberships WHERE customer_id = ${customer.id} AND business_id = ${businessId} LIMIT 1`;
    const membership = memRows[0] as Membership;

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

    if (membership) {
        await sql`UPDATE memberships SET points = ${finalPoints}, updated_at = NOW() WHERE id = ${membership.id}`;
    } else {
        await sql`INSERT INTO memberships (customer_id, business_id, points) VALUES (${customer.id}, ${businessId}, ${finalPoints})`;
    }

    await sql`
        INSERT INTO scan_logs (business_id, customer_id, points_awarded, reward_claimed)
        VALUES (${businessId}, ${customer.id}, ${pointsAwarded}, ${rewardWon})
    `;

    let message = `+${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''} for ${customer.name}!`;
    if (newMember) message = `${customer.name} just joined and earned ${pointsAwarded} point${pointsAwarded > 1 ? 's' : ''}!`;

    return { success: true, message, customer, business, newPointsTotal: finalPoints, newMember, rewardWon, rewardMessage };

  } catch (error) {
    console.error('Error in awardPoints:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
};

export const searchMembershipsForBusiness = async (businessId: string, searchTerm: string): Promise<Membership[]> => {
    let rows;
    if (!searchTerm) {
        rows = await sql`
            SELECT m.*, c.name as c_name, c.phone_number as c_phone_number, c.profile_picture_url as c_pfp, c.qr_data_url as c_qr_data_url, c.qr_token as c_qr_token
            FROM memberships m
            JOIN customers c ON m.customer_id = c.id
            WHERE m.business_id = ${businessId}
            ORDER BY m.updated_at DESC
        `;
    } else {
        const likeTerm = `%${searchTerm}%`;
        rows = await sql`
            SELECT m.*, c.name as c_name, c.phone_number as c_phone_number, c.profile_picture_url as c_pfp, c.qr_data_url as c_qr_data_url, c.qr_token as c_qr_token
            FROM memberships m
            JOIN customers c ON m.customer_id = c.id
            WHERE m.business_id = ${businessId}
            AND (c.name ILIKE ${likeTerm} OR c.phone_number ILIKE ${likeTerm} OR c.qr_token = ${searchTerm})
            ORDER BY m.updated_at DESC
        `;
    }

    return rows.map(r => ({
        ...r,
        customers: {
            name: r.c_name,
            phone_number: r.c_phone_number,
            profile_picture_url: r.c_pfp,
            qr_data_url: r.c_qr_data_url,
            qr_token: r.c_qr_token
        }
    })) as Membership[];
};

export const removeMembership = async (customerId: string, businessId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM memberships WHERE customer_id = ${customerId} AND business_id = ${businessId}`;
    return { success: true };
};

export const loginBusiness = async (email: string, password: string): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const rows = await sql`SELECT * FROM businesses WHERE email = ${email} LIMIT 1`;
    if (rows.length === 0) return { success: false, message: 'Business not found.' };
    const data = rows[0] as Business;
    if (data.password === password) {
        const { password: _, ...businessData } = data;
        return { success: true, business: businessData as Business };
    }
    return { success: false, message: 'Invalid credentials.' };
};

export const loginBusinessWithQrToken = async (qrToken: string): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const rows = await sql`SELECT * FROM businesses WHERE qr_token = ${qrToken} LIMIT 1`;
    if (rows.length === 0) return { success: false, message: 'Business not found.' };
    const { password: _, ...businessData } = rows[0] as Business;
    return { success: true, business: businessData as Business };
}

export const signupBusiness = async (businessData: Omit<Business, 'id' | 'created_at' | 'qr_token' | 'qr_data_url'>): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const existing = await sql`SELECT id FROM businesses WHERE email = ${businessData.email} LIMIT 1`;
    if (existing.length > 0) return { success: false, message: 'A business with this email already exists.' };

    const qr_token = `biz_${Math.random().toString(36).substr(2, 9)}`;
    const defaultSettings = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultSettings);

    const rows = await sql`
        INSERT INTO businesses (name, public_name, email, password, qr_token, qr_data_url, reward_message, qr_color, qr_dot_style, qr_eye_shape)
        VALUES (${businessData.name}, ${businessData.name}, ${businessData.email}, ${businessData.password}, ${qr_token}, ${qr_data_url}, 'Congratulations! You won a reward!', '#000000', 'square', 'square')
        RETURNING *
    `;
    
    if (rows.length === 0) return { success: false, message: 'Failed to create business.' };
    const { password: _password, ...newBusiness } = rows[0] as Business;
    return { success: true, business: newBusiness as Business };
};

export const updateBusiness = async (id: string, updatedData: Partial<Business>): Promise<Business | null> => {
    const bizRows = await sql`SELECT * FROM businesses WHERE id = ${id} LIMIT 1`;
    if (bizRows.length === 0) return null;
    const currentBusiness = bizRows[0] as Business;

    const qrSettingsChanged = 
        ('qr_color' in updatedData && updatedData.qr_color !== currentBusiness.qr_color) ||
        ('qr_dot_style' in updatedData && updatedData.qr_dot_style !== currentBusiness.qr_dot_style) ||
        ('qr_eye_shape' in updatedData && updatedData.qr_eye_shape !== currentBusiness.qr_eye_shape) ||
        ('qr_logo_url' in updatedData && updatedData.qr_logo_url !== currentBusiness.qr_logo_url);

    if (qrSettingsChanged) {
        const newQrSettings = {
            qr_logo_url: updatedData.qr_logo_url ?? currentBusiness.qr_logo_url,
            qr_color: updatedData.qr_color ?? currentBusiness.qr_color,
            qr_eye_shape: updatedData.qr_eye_shape ?? currentBusiness.qr_eye_shape,
            qr_dot_style: updatedData.qr_dot_style ?? currentBusiness.qr_dot_style,
        };
        updatedData.qr_data_url = await generateQrCode(currentBusiness.qr_token, newQrSettings);
    }

    if ('address_text' in updatedData && updatedData.address_text !== currentBusiness.address_text) {
        try {
            if (updatedData.address_text) {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(updatedData.address_text)}&format=json&limit=1`);
                const geoData = await response.json();
                if (geoData && geoData.length > 0) {
                    updatedData.latitude = parseFloat(geoData[0].lat);
                    updatedData.longitude = parseFloat(geoData[0].lon);
                }
            }
        } catch (error) { console.error("Geocoding failed:", error); }
    }
    
    // Build update query dynamically
    for (const [key, value] of Object.entries(updatedData)) {
        if (value === undefined) continue;
        // Simplified dynamic update
        if (key === 'public_name') await sql`UPDATE businesses SET public_name = ${value as any} WHERE id = ${id}`;
        if (key === 'logo_url') await sql`UPDATE businesses SET logo_url = ${value as any} WHERE id = ${id}`;
        if (key === 'cover_photo_url') await sql`UPDATE businesses SET cover_photo_url = ${value as any} WHERE id = ${id}`;
        if (key === 'bio') await sql`UPDATE businesses SET bio = ${value as any} WHERE id = ${id}`;
        if (key === 'website_url') await sql`UPDATE businesses SET website_url = ${value as any} WHERE id = ${id}`;
        if (key === 'facebook_url') await sql`UPDATE businesses SET facebook_url = ${value as any} WHERE id = ${id}`;
        if (key === 'instagram_url') await sql`UPDATE businesses SET instagram_url = ${value as any} WHERE id = ${id}`;
        if (key === 'public_phone_number') await sql`UPDATE businesses SET public_phone_number = ${value as any} WHERE id = ${id}`;
        if (key === 'default_profile_tab') await sql`UPDATE businesses SET default_profile_tab = ${value as any} WHERE id = ${id}`;
        if (key === 'points_per_scan') await sql`UPDATE businesses SET points_per_scan = ${value as any} WHERE id = ${id}`;
        if (key === 'reward_threshold') await sql`UPDATE businesses SET reward_threshold = ${value as any} WHERE id = ${id}`;
        if (key === 'reward_message') await sql`UPDATE businesses SET reward_message = ${value as any} WHERE id = ${id}`;
        if (key === 'address_text') await sql`UPDATE businesses SET address_text = ${value as any} WHERE id = ${id}`;
        if (key === 'latitude') await sql`UPDATE businesses SET latitude = ${value as any} WHERE id = ${id}`;
        if (key === 'longitude') await sql`UPDATE businesses SET longitude = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_color') await sql`UPDATE businesses SET qr_color = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_dot_style') await sql`UPDATE businesses SET qr_dot_style = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_eye_shape') await sql`UPDATE businesses SET qr_eye_shape = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_logo_url') await sql`UPDATE businesses SET qr_logo_url = ${value as any} WHERE id = ${id}`;
        if (key === 'qr_data_url') await sql`UPDATE businesses SET qr_data_url = ${value as any} WHERE id = ${id}`;
    }

    const finalRows = await sql`SELECT * FROM businesses WHERE id = ${id}`;
    const { password: _, ...businessData } = finalRows[0] as Business;
    return businessData as Business;
};

// ====== BUSINESS CONTENT APIs ======

export const getDailyAnalytics = async (businessId: string): Promise<DailyAnalyticsData[] | null> => {
    // Calling the function created in migration scripts
    const rows = await sql`SELECT * FROM get_daily_analytics_7d(${businessId})`;
    return rows as any[];
};

export const getBusinessAnalytics = async (businessId: string): Promise<BusinessAnalytics | null> => {
    const rows = await sql`
        SELECT
            (SELECT COUNT(*)::int FROM memberships WHERE business_id = ${businessId}) as total_customers,
            (SELECT COUNT(*)::int FROM memberships WHERE business_id = ${businessId} AND created_at >= NOW() - INTERVAL '7 days') as new_members_7d,
            (SELECT COALESCE(SUM(points_awarded), 0)::int FROM scan_logs WHERE business_id = ${businessId} AND created_at >= NOW() - INTERVAL '7 days') as points_awarded_7d,
            (SELECT COUNT(*)::int FROM scan_logs WHERE business_id = ${businessId} AND reward_claimed = true AND created_at >= NOW() - INTERVAL '7 days') as rewards_claimed_7d
    `;
    return (rows[0] as BusinessAnalytics) || null;
};

export const getPostsForBusiness = async (businessId: string): Promise<Post[]> => {
    const rows = await sql`SELECT * FROM posts WHERE business_id = ${businessId} ORDER BY created_at DESC`;
    return rows as Post[];
};

export const createPost = async (postData: Omit<Post, 'id' | 'created_at'>): Promise<Post | null> => {
    const rows = await sql`
        INSERT INTO posts (business_id, title, content, image_url, post_type, video_url, price_text, external_url)
        VALUES (${postData.business_id}, ${postData.title}, ${postData.content}, ${postData.image_url}, ${postData.post_type}, ${postData.video_url}, ${postData.price_text}, ${postData.external_url})
        RETURNING *
    `;
    return (rows[0] as Post) || null;
};

export const updatePost = async (postId: string, postData: Partial<Post>): Promise<Post | null> => {
    for (const [key, value] of Object.entries(postData)) {
        if (value === undefined) continue;
        if (key === 'title') await sql`UPDATE posts SET title = ${value as any} WHERE id = ${postId}`;
        if (key === 'content') await sql`UPDATE posts SET content = ${value as any} WHERE id = ${postId}`;
        if (key === 'image_url') await sql`UPDATE posts SET image_url = ${value as any} WHERE id = ${postId}`;
        if (key === 'post_type') await sql`UPDATE posts SET post_type = ${value as any} WHERE id = ${postId}`;
        if (key === 'video_url') await sql`UPDATE posts SET video_url = ${value as any} WHERE id = ${postId}`;
        if (key === 'price_text') await sql`UPDATE posts SET price_text = ${value as any} WHERE id = ${postId}`;
        if (key === 'external_url') await sql`UPDATE posts SET external_url = ${value as any} WHERE id = ${postId}`;
    }
    const rows = await sql`SELECT * FROM posts WHERE id = ${postId}`;
    return (rows[0] as Post) || null;
}

export const deletePost = async (postId: string) => {
    await sql`DELETE FROM posts WHERE id = ${postId}`;
    return true;
};

export const getDiscountsForBusiness = async (businessId: string): Promise<Discount[]> => {
    const rows = await sql`SELECT * FROM discounts WHERE business_id = ${businessId} AND active = true ORDER BY created_at DESC`;
    return rows as Discount[];
};

export const createDiscount = async (discountData: Omit<Discount, 'id' | 'created_at' | 'active'>): Promise<Discount | null> => {
    const rows = await sql`
        INSERT INTO discounts (business_id, name, description, image_url, active)
        VALUES (${discountData.business_id}, ${discountData.name}, ${discountData.description}, ${discountData.image_url}, true)
        RETURNING *
    `;
    return (rows[0] as Discount) || null;
};

export const deleteDiscount = async (discountId: string) => {
    await sql`DELETE FROM discounts WHERE id = ${discountId}`;
    return true;
};


// ====== BUSINESS QR DESIGN APIs ======

export const getBusinessQrDesigns = async (businessId: string): Promise<BusinessQrDesign[]> => {
    const rows = await sql`SELECT * FROM business_qr_designs WHERE business_id = ${businessId} ORDER BY created_at DESC`;
    return rows as BusinessQrDesign[];
};

export const createBusinessQrDesign = async (designData: Omit<BusinessQrDesign, 'id' | 'created_at'>): Promise<BusinessQrDesign | null> => {
    const rows = await sql`
        INSERT INTO business_qr_designs (business_id, qr_logo_url, qr_color, qr_eye_shape, qr_dot_style)
        VALUES (${designData.business_id}, ${designData.qr_logo_url}, ${designData.qr_color}, ${designData.qr_eye_shape}, ${designData.qr_dot_style})
        RETURNING *
    `;
    return (rows[0] as BusinessQrDesign) || null;
};

export const deleteBusinessQrDesign = async (designId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM business_qr_designs WHERE id = ${designId}`;
    return { success: true };
};

// ====== ADMIN APIs ======

export const getAllBusinesses = async (): Promise<Business[]> => {
  const rows = await sql`SELECT * FROM businesses ORDER BY created_at DESC`;
  return rows as Business[];
};

export const createBusinessByAdmin = async (businessData: Pick<Business, 'name' | 'email' | 'password'>): Promise<{ success: boolean; business?: Business; message?: string }> => {
    const existing = await sql`SELECT id FROM businesses WHERE email = ${businessData.email} LIMIT 1`;
    if (existing.length > 0) return { success: false, message: 'A business with this email already exists.' };

    const qr_token = `biz_${Math.random().toString(36).substr(2, 9)}`;
    const defaultSettings = { qr_color: '#000000', qr_dot_style: 'square', qr_eye_shape: 'square' };
    const qr_data_url = await generateQrCode(qr_token, defaultSettings);

    const rows = await sql`
        INSERT INTO businesses (name, public_name, email, password, qr_token, qr_data_url, reward_message, qr_color, qr_dot_style, qr_eye_shape)
        VALUES (${businessData.name}, ${businessData.name}, ${businessData.email}, ${businessData.password}, ${qr_token}, ${qr_data_url}, 'Congratulations! You won a reward!', '#000000', 'square', 'square')
        RETURNING *
    `;
    
    if (rows.length === 0) return { success: false, message: 'Failed to create business.' };
    const { password: _, ...newBusiness } = rows[0] as Business;
    return { success: true, business: newBusiness as Business };
};

export const getAllCustomers = async (): Promise<Customer[]> => {
  const rows = await sql`SELECT * FROM customers ORDER BY created_at DESC`;
  return rows as Customer[];
};

export const getAllPosts = async (): Promise<Post[]> => {
  const rows = await sql`
    SELECT p.*, b.public_name as b_public_name
    FROM posts p
    LEFT JOIN businesses b ON p.business_id = b.id
    ORDER BY p.created_at DESC
  `;
  return rows.map(r => ({
      ...r,
      businesses: { public_name: r.b_public_name }
  })) as Post[];
};

export const getAllMemberships = async (): Promise<Membership[]> => {
  const rows = await sql`
    SELECT m.*, b.public_name as b_public_name, c.name as c_name, c.phone_number as c_phone_number
    FROM memberships m
    JOIN businesses b ON m.business_id = b.id
    JOIN customers c ON m.customer_id = c.id
    ORDER BY m.updated_at DESC
  `;
  return rows.map(r => ({
      ...r,
      businesses: { public_name: r.b_public_name },
      customers: { name: r.c_name, phone_number: r.c_phone_number }
  })) as Membership[];
};

export const deleteBusiness = async (businessId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM businesses WHERE id = ${businessId}`;
    return { success: true };
};

export const deleteMembershipById = async (membershipId: string): Promise<{ success: boolean }> => {
    await sql`DELETE FROM memberships WHERE id = ${membershipId}`;
    return { success: true };
}

export const updateMembership = async (membershipId: string, updates: Partial<Membership>): Promise<Membership | null> => {
    if (updates.points !== undefined) {
        await sql`UPDATE memberships SET points = ${updates.points} WHERE id = ${membershipId}`;
    }
    const rows = await sql`SELECT * FROM memberships WHERE id = ${membershipId}`;
    return (rows[0] as Membership) || null;
}