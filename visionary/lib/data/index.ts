import 'server-only';
import type { DataLayer } from './repos';
import { mockData } from './mock';
import { supabaseData } from './supabase';
import { supabaseEnv, usingSupabase } from '../supabase/env';

// Single switch for the data source: DATA_SOURCE=supabase (real database) or mock (in-memory demo data).
function select(): DataLayer {
  if (!usingSupabase()) return mockData;
  if (!supabaseEnv().ready) {
    // Fail loudly rather than silently serving demo data on a site that is meant to be live.
    throw new Error('DATA_SOURCE=supabase but the Supabase env vars are missing (see .env.example).');
  }
  return supabaseData;
}

export const db = select();
export const { reviews, enquiries, stats } = db;
export const isDemoData = db.source === 'mock';
