'use client';

import { supabase } from './supabase';

// Function to sign in with email and password
export async function signIn(email: string, password: string): Promise<boolean> {
  try {
    console.log(`Attempting to sign in with email: ${email}`);
    
    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Error signing in:', error);
      return false;
    }
    
    console.log('Sign in successful, checking if user is admin');
    
    // Check if the user is an admin by querying the user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // Sign out if we can't verify admin status
      await supabase.auth.signOut();
      return false;
    }
    
    if (!profileData || !profileData.is_admin) {
      console.error('User is not an admin');
      // Sign out non-admin users
      await supabase.auth.signOut();
      return false;
    }
    
    console.log('Admin verification successful');
    return true;
  } catch (error) {
    console.error('Exception during sign in:', error);
    return false;
  }
}

// Function to check if the user is authenticated as an admin
export async function checkAuth(): Promise<boolean> {
  try {
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Error checking session:', error);
      return false;
    }
    
    if (!session) {
      console.log('No active session found');
      return false;
    }
    
    // Check if the user is an admin by querying the user_profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return false;
    }
    
    if (!profileData || !profileData.is_admin) {
      console.log('User is not an admin:', session.user?.email);
      return false;
    }
    
    console.log('User is verified as admin');
    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

// Function to sign out
export async function signOut(): Promise<boolean> {
  try {
    console.log('Signing out user');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    
    console.log('User signed out successfully');
    return true;
  } catch (error) {
    console.error('Error signing out:', error);
    return false;
  }
}

export async function fetchSurveyResponses(): Promise<SurveyResponse[]> {
  try {
    // First check if user is admin
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profileData?.is_admin) {
      console.error('Unauthorized access attempt to survey data');
      return [];
    }

    // Fetch data from the view
    const { data, error } = await supabase
      .from('survey_responses_flat1')
      .select('*');
    
    if (error) {
      console.error('Error fetching survey responses:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Exception fetching survey responses:', error);
    return [];
  }
}

// Function to get current admin user information
export async function getCurrentAdminUser() {
  try {
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      console.error('Error getting user session:', error);
      return null;
    }
    
    // Get user profile data
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return null;
    }
    
    if (!profileData || !profileData.is_admin) {
      console.log('User is not an admin');
      return null;
    }
    
    // Return user information
    return {
      id: session.user.id,
      email: session.user.email,
      name: profileData.full_name || session.user.email?.split('@')[0] || 'Admin User',
      avatar: profileData.avatar_url || null
    };
  } catch (error) {
    console.error('Error getting current admin user:', error);
    return null;
  }
} 