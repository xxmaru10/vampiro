import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://srajipjjlhevdniujwod.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNyYWppcGpqbGhldmRuaXVqd29kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNTQ1NDEsImV4cCI6MjA5MjYzMDU0MX0.0ctiXFH_dlEUvbPoIAx9Zlst13IOmdL0WP13CUjtgHs';

export const supabase = createClient(supabaseUrl, supabaseKey);
