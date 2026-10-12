import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env?.VITE_SUPABASE_URL ||
  'https://qvojeargwguulydefwuv.supabase.co';

const supabaseAnonKey =
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_IPYZReEcFYX8Bf91G01Z_Q_Lf2Lyi7t';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Initiates Supabase OAuth Sign-In with Google.
 * Redirects to Google consent screen and returns to current app origin.
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      console.error('Supabase Google OAuth error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Failed to sign in with Google:', err);
    throw err;
  }
};

/**
 * Signs the user out from Supabase session.
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Supabase SignOut error:', error);
    throw error;
  }
};

/**
 * Retrieves the current authenticated user session.
 */
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};
