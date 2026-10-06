// Supabase Frontend Client Helper
// NEVER expose SUPABASE_SERVICE_ROLE_KEY here.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://gkrcegaegsafgkarmjqz.supabase.co';
export const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || `${SUPABASE_URL}/functions/v1`;
