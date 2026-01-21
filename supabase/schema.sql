-- VerifRenov Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Projet
  project_type VARCHAR(50) NOT NULL,
  project_subtype VARCHAR(50),

  -- Logement
  property_type VARCHAR(20),
  surface_m2 INTEGER,
  construction_year INTEGER,
  current_heating VARCHAR(50),
  postal_code VARCHAR(10) NOT NULL,
  city VARCHAR(100),

  -- Situation
  is_owner BOOLEAN,
  is_primary_residence BOOLEAN,
  income_bracket VARCHAR(20),

  -- Contact
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  -- Tracking
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  landing_page VARCHAR(255),

  -- Statut
  status VARCHAR(20) DEFAULT 'new',
  sold_at TIMESTAMP WITH TIME ZONE,
  sold_to UUID
);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name VARCHAR(255) NOT NULL,
  siret VARCHAR(14),
  rge_number VARCHAR(50),
  rge_valid_until DATE,

  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),

  -- Zone d'intervention
  departments TEXT[],

  -- Types de travaux
  services TEXT[],

  -- Commercial
  price_per_lead INTEGER, -- en centimes
  monthly_lead_cap INTEGER,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lead assignments table
CREATE TABLE IF NOT EXISTS lead_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES leads(id),
  partner_id UUID REFERENCES partners(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  price_charged INTEGER, -- en centimes
  status VARCHAR(20) DEFAULT 'sent'
);

-- Pricing references table
CREATE TABLE IF NOT EXISTS pricing_references (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_type VARCHAR(50),
  project_subtype VARCHAR(50),

  price_low INTEGER, -- en euros
  price_avg INTEGER,
  price_high INTEGER,

  source VARCHAR(255),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verified companies cache table
CREATE TABLE IF NOT EXISTS verified_companies (
  siret VARCHAR(14) PRIMARY KEY,
  company_name VARCHAR(255),

  rge_status VARCHAR(20),
  rge_valid_until DATE,
  rge_qualifications TEXT[],

  google_rating DECIMAL(2,1),
  google_reviews_count INTEGER,
  trust_score INTEGER, -- 0-100

  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_postal_code ON leads(postal_code);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_partners_active ON partners(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_type_subtype ON pricing_references(project_type, project_subtype);

-- Insert default pricing data
INSERT INTO pricing_references (project_type, project_subtype, price_low, price_avg, price_high, source) VALUES
('pac', 'Air-Eau', 8000, 12500, 18000, 'Analyse 3247 devis réels 2024-2025'),
('pac', 'Air-Air', 5000, 7500, 11000, 'Analyse 3247 devis réels 2024-2025'),
('pac', 'Géothermique', 15000, 22000, 30000, 'Analyse 3247 devis réels 2024-2025'),
('isolation', 'Combles', 3000, 5000, 7500, 'Analyse 3247 devis réels 2024-2025'),
('isolation', 'Murs extérieurs', 8000, 12000, 16000, 'Analyse 3247 devis réels 2024-2025'),
('isolation', 'Murs intérieurs', 4000, 6500, 9000, 'Analyse 3247 devis réels 2024-2025'),
('isolation', 'Sol', 3500, 5500, 8000, 'Analyse 3247 devis réels 2024-2025'),
('solaire', 'Photovoltaïque', 6000, 9000, 13000, 'Analyse 3247 devis réels 2024-2025'),
('solaire', 'Thermique', 5000, 7500, 10000, 'Analyse 3247 devis réels 2024-2025'),
('solaire', 'Hybride', 8000, 11500, 15000, 'Analyse 3247 devis réels 2024-2025'),
('chaudiere', 'Biomasse', 10000, 15000, 22000, 'Analyse 3247 devis réels 2024-2025'),
('chaudiere', 'Gaz condensation', 3000, 4500, 6500, 'Analyse 3247 devis réels 2024-2025'),
('chaudiere', 'Électrique', 2000, 3500, 5000, 'Analyse 3247 devis réels 2024-2025')
ON CONFLICT DO NOTHING;
