import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://qvojeargwguulydefwuv.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_IPYZReEcFYX8Bf91G01Z_Q_Lf2Lyi7t';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const SUPABASE_SQL_SCHEMA = `-- EcoRoute AI — Supabase Database Schema
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/qvojeargwguulydefwuv/sql)

-- 1. Bins Table
CREATE TABLE IF NOT EXISTS public.bins (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  fill_percentage INTEGER NOT NULL DEFAULT 0,
  capacity_kg INTEGER NOT NULL DEFAULT 180,
  waste_type TEXT NOT NULL DEFAULT 'general',
  last_collection_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_special_priority BOOLEAN NOT NULL DEFAULT false,
  priority_score INTEGER NOT NULL DEFAULT 0,
  priority_level TEXT NOT NULL DEFAULT 'low',
  assigned_truck_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Trucks Table
CREATE TABLE IF NOT EXISTS public.trucks (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  driver_name TEXT NOT NULL,
  driver_phone TEXT,
  max_capacity_kg INTEGER NOT NULL DEFAULT 2500,
  current_load_kg INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'available',
  current_lat DOUBLE PRECISION NOT NULL DEFAULT 17.4474,
  current_lng DOUBLE PRECISION NOT NULL DEFAULT 78.3762,
  assigned_stops TEXT[] DEFAULT '{}',
  route_progress INTEGER DEFAULT 0,
  fuel_efficiency_km_l DOUBLE PRECISION DEFAULT 3.5,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Alerts Table
CREATE TABLE IF NOT EXISTS public.alerts (
  id TEXT PRIMARY KEY,
  bin_id TEXT,
  truck_id TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  resolved BOOLEAN NOT NULL DEFAULT false
);

-- 4. Collection Manifest Logs
CREATE TABLE IF NOT EXISTS public.collection_logs (
  id TEXT PRIMARY KEY,
  bin_id TEXT NOT NULL,
  bin_name TEXT NOT NULL,
  area TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  weight_kg INTEGER NOT NULL,
  truck_id TEXT NOT NULL,
  collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fill_at_collection INTEGER NOT NULL
);

-- Enable Row Level Security (RLS) & Allow Public Read/Write for Demonstration
ALTER TABLE public.bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on bins" ON public.bins FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access on trucks" ON public.trucks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access on alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read access on logs" ON public.collection_logs FOR ALL USING (true) WITH CHECK (true);
`;
