import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  slug: string;
  name: string;
  mission: string;
  created_at: string;
};

export type Position = {
  id: string;
  company_id: string;
  title: string;
  position_type: string;
  location: string;
  pay: string;
  description: string;
  expectations: string;
  created_at: string;
};

export type Application = {
  id: string;
  position_id: string;
  applicant_name: string;
  applicant_email: string;
  message: string;
  created_at: string;
};
