import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if URL and key are valid (not empty or placeholder)
const isValidConfig = supabaseUrl &&
                      supabaseAnonKey &&
                      !supabaseUrl.includes('placeholder') &&
                      !supabaseAnonKey.includes('placeholder');

export const supabase = isValidConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Types pour la base de données
export type Lead = {
  id: string;
  created_at: string;
  project_type: string;
  project_subtype: string | null;
  property_type: string | null;
  surface_m2: number | null;
  construction_year: number | null;
  current_heating: string | null;
  postal_code: string;
  city: string | null;
  is_owner: boolean | null;
  is_primary_residence: boolean | null;
  income_bracket: string | null;
  first_name: string;
  email: string;
  phone: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  landing_page: string | null;
  status: string;
  sold_at: string | null;
  sold_to: string | null;
};

export type Partner = {
  id: string;
  company_name: string;
  siret: string | null;
  rge_number: string | null;
  rge_valid_until: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  departments: string[] | null;
  services: string[] | null;
  price_per_lead: number | null;
  monthly_lead_cap: number | null;
  is_active: boolean;
  created_at: string;
};

export type PricingReference = {
  id: string;
  project_type: string;
  project_subtype: string | null;
  price_low: number;
  price_avg: number;
  price_high: number;
  source: string | null;
  updated_at: string;
};
