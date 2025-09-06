
export type QrStyle = {
  qr_logo_url?: string | null;
  qr_color?: string | null;
  qr_eye_shape?: string | null;
  qr_dot_style?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  password?: string;
  qr_token: string;
  qr_data_url: string;
  created_at: string;
  qr_style_preferences?: QrStyle | null;
  profile_picture_url?: string | null;
}

export interface Business {
  id: string;
  name: string; // Internal/Login Name
  email: string;
  password?: string;
  qr_token: string;
  qr_data_url: string;
  created_at: string;
  
  // QR Customization
  qr_logo_url?: string | null;
  qr_color?: string | null;
  qr_eye_shape?: string | null;
  qr_dot_style?: string | null;

  // Public Profile
  public_name?: string | null;
  logo_url?: string | null;
  cover_photo_url?: string | null;
  bio?: string | null;
  website_url?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  public_phone_number?: string | null;

  // Loyalty Program
  points_per_scan?: number;
  reward_threshold?: number;
  reward_message?: string | null;

  // Location
  address_text?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // Properties from RPC calls
  membership_count?: number;
  dist_meters?: number;
}

export interface Membership {
  id: string;
  customer_id: string;
  business_id: string;
  points: number;
  created_at: string;
  updated_at: string;
  businesses: Business; // For joining data
  customers: Customer; // For business dashboard
}

export interface Discount {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  image_url?: string;
  active: boolean;
  created_at: string;
  // FIX: Add missing properties used in DiscountsPage.tsx
  percentage?: number;
  expiry_date?: string;
  price?: number;
  price_cutoff?: number;
}

export interface Post {
    id: string;
    business_id: string;
    title: string;
    content?: string;
    image_url?: string;
    created_at: string;
    post_type: 'standard' | 'discount';
    video_url?: string | null;
    price_text?: string | null;
    external_url?: string | null;
}

export interface Product {
    id: string;
    business_id: string;
    name: string;
    description?: string;
    price?: number;
    image_url?: string;
    product_url?: string;
    created_at: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  customer?: Customer;
  business?: Business;
  pointsAwarded?: number;
  newPointsTotal?: number;
  newMember?: boolean;
  rewardWon?: boolean;
  rewardMessage?: string;
}

export interface BusinessQrDesign extends QrStyle {
  id: string;
  business_id: string;
  created_at: string;
}

export interface BusinessAnalytics {
    total_customers: number;
    new_members_7d: number;
    points_awarded_7d: number;
    rewards_claimed_7d: number;
}