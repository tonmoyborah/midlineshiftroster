import { createClient } from '@supabase/supabase-js';

const supabaseUrl = `https://pupzezyqzqenfyzvrjye.supabase.co`;
const supabaseAnonKey =  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1cHplenlxenFlbmZ5enZyanllIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwMDI5OCwiZXhwIjoyMDc0OTc2Mjk4fQ.Iwo4WEztUa9poljxY3tHnhOTQnizJ-Ai2OjGb1k9tYU`;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);