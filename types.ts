
export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  password?: string; // Password is required for creation, but shouldn't be sent to client
  points: number;
  qrToken: string;
  qrDataUrl: string;
  created_at: string;
  points_updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  email: string;
  password?: string;
  qrToken: string;
  qrDataUrl: string;
  created_at: string;
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
