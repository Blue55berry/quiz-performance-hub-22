
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://hdelimczvsqwqwihguee.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhkZWxpbWN6dnNxd3F3aWhndWVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0ODAzMDksImV4cCI6MjA2MzA1NjMwOX0.mZ7psxHRmsDthNXVn40xC2pr2i08hRDgeMZtzyJwF-s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
