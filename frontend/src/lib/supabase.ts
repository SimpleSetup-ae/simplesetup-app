import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Business Activity interface matching the database schema
export interface BusinessActivity {
  id: string;
  freezone: string;
  activity_code: string;
  activity_name: string;
  activity_description: string;
  activity_type: 'Professional' | 'Commercial';
  property_requirements?: string;
  notes?: string;
  classification?: string;
  regulation_type: 'Regulated' | 'Non-Regulated';
  approving_entity_1?: string;
  approving_entity_2?: string;
  created_at: string;
  updated_at: string;
}

// API functions for business activities
export async function getBusinessActivities({
  search = '',
  freezone = '',
  activityType = '',
  page = 1,
  perPage = 50
}: {
  search?: string;
  freezone?: string;
  activityType?: string;
  page?: number;
  perPage?: number;
} = {}) {
  let query = supabase
    .from('business_activities')
    .select('*');

  // Apply filters
  if (freezone) {
    query = query.eq('freezone', freezone);
  }

  if (activityType) {
    query = query.eq('activity_type', activityType);
  }

  if (search) {
    query = query.or(`activity_name.ilike.%${search}%,activity_description.ilike.%${search}%,activity_code.ilike.%${search}%`);
  }

  // Apply pagination
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  
  query = query.range(from, to);

  // Order by activity name
  query = query.order('activity_name');

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching business activities:', error);
    throw error;
  }

  return {
    data: data || [],
    meta: {
      current_page: page,
      total_pages: Math.ceil((count || 0) / perPage),
      total_count: count || 0,
      per_page: perPage
    }
  };
}

export async function searchBusinessActivities(searchTerm: string) {
  const { data, error } = await supabase
    .from('business_activities')
    .select('*')
    .or(`activity_name.ilike.%${searchTerm}%,activity_description.ilike.%${searchTerm}%,activity_code.ilike.%${searchTerm}%`)
    .order('activity_name')
    .limit(20);

  if (error) {
    console.error('Error searching business activities:', error);
    throw error;
  }

  return data || [];
}
