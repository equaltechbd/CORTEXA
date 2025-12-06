
import { createClient } from '@supabase/supabase-js';

// New Credentials provided by user
const supabaseUrl = 'https://cnkmlskncqzbbuzseoep.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua21sc2tuY3F6YmJ1enNlb2VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwNDIxNTcsImV4cCI6MjA4MDYxODE1N30.y2sdnuGfmsacIqm49067koBAIs-6m9Tqey0uCYrJ-Zs';

export const supabase = createClient(supabaseUrl, supabaseKey);
