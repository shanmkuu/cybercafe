import { supabase } from './supabase';

/**
 * Auth helpers using Supabase Auth (v2)
 * - signUp: create user with email/password
 * - signIn: sign in with email/password
 * - signOut: sign out current session
 * - getUser: returns current user if available
 * - onAuthStateChange: subscribe to auth changes
 */

export async function signUp({ email, password, options = {} }) {
  try {
    const result = await supabase.auth.signUp({ email, password }, options);
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('signUp error', error);
    return { data: null, error };
  }
}

export async function signIn({ email, password }) {
  try {
    const result = await supabase.auth.signInWithPassword({ email, password });
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('signIn error', error);
    return { data: null, error };
  }
}

export async function signOut() {
  try {
    const result = await supabase.auth.signOut();
    if (result.error) throw result.error;
    return { data: result.data, error: null };
  } catch (error) {
    console.error('signOut error', error);
    return { data: null, error };
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { user: data?.user ?? null, error: null };
  } catch (error) {
    console.error('getCurrentUser error', error);
    return { user: null, error };
  }
}

export function onAuthStateChange(callback) {
  // returns the subscription object which has .unsubscribe()
  const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
    try {
      callback(event, session);
    } catch (err) {
      console.error('onAuthStateChange callback error', err);
    }
  });

  return subscription;
}
