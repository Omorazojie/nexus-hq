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

export type TeamMember = {
  id: string;
  company_id: string;
  name: string;
  role: string;
  last_seen_at: string;
  created_at: string;
};

export type OfficePost = {
  id: string;
  company_id: string;
  member_id: string;
  author_name: string;
  message: string;
  created_at: string;
};

export type Payment = {
  id: string;
  company_id: string;
  type: "incoming" | "payout";
  amount: number;
  currency: string;
  description: string;
  status: string;
  stripe_session_id: string | null;
  payee_name: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  company_id: string;
  name: string;
  description: string;
  price: number | null;
  image_url: string | null;
  listing_type: "buy" | "inquire";
  created_at: string;
};

export type Inquiry = {
  id: string;
  product_id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};
