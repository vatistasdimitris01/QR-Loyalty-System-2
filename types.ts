
export interface Customer {
  id: string;
  business_id: string;
  name: string;
  phone_number: string;
  password?: string; // Password is required for creation, but shouldn't be sent to client
  points: number;
  qr_token: string;
  qr_data_url: string;
  created_at: string;
  points_updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  password?: string;
  qr_token: string;
  qr_data_url: string;
  created_at: string;
  qr_logo_url?: string | null;
  qr_color?: string | null;
  qr_eye_shape?: string | null;
  qr_dot_style?: string | null;
}

export interface Discount {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  expiry_date?: string;
  active: boolean;
  created_at: string;
  percentage?: number;
  price?: number;
  price_cutoff?: number;
}

export interface ScanResult {
  success: boolean;
  message: string;
  customer?: Customer;
  pointsAwarded?: number;
  newPointsTotal?: number;
  rewardEarned?: boolean;
}