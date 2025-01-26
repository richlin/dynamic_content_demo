import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Recipient {
    id: string;
    first_name: string;
    email: string;
    segment: string;
}

export interface SegmentVariantRule {
    id: string;
    segment: string;
    variation_key: string;
    subject_line: string;
    html_body: string;
    headline: string;
    image_url: string;
    call_to_action: string;
}

export interface EmailSend {
    id: string;
    recipient_id: string;
    variant_rule_id: string;
    variation_used: string;
    timestamp_sent: string;
} 