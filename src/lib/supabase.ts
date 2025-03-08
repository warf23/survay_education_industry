import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your project
// You'll need to replace these with your actual Supabase URL and anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

// Log the Supabase URL (without the key for security)
console.log('Connecting to Supabase URL:', supabaseUrl);
if (supabaseUrl === 'https://your-supabase-url.supabase.co') {
  console.warn('Warning: Using placeholder Supabase URL. Please update your .env.local file with actual credentials.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database tables
export type UserProfile = {
  id?: string;
  full_name: string;
  email: string;
  created_at?: string;
};

export type SurveyResponse = {
  id?: string;
  user_id: string;
  question_id: string;
  answer: string;
  created_at?: string;
};

// Function to sign in with Google
export async function signInWithGoogle() {
  try {
    console.log('Starting Google sign-in process...');
    
    // Get the current origin (works in both development and production)
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    
    if (error) {
      console.error('Error signing in with Google:', error);
      return null;
    }
    
    console.log('Google sign-in initiated successfully, redirecting...');
    return data;
  } catch (error) {
    console.error('Exception during Google sign in:', error);
    return null;
  }
}

// Function to get the current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    if (!user) return null;
    
    const currentTimestamp = new Date().toISOString();
    
    // First check if the user profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking for existing user profile:', fetchError);
    }
    
    // If the profile doesn't exist, create it
    if (!existingProfile) {
      console.log('User profile does not exist, creating it now...');
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: user.user_metadata.full_name || user.user_metadata.name || 'Anonymous',
          email: user.email || '',
          created_at: currentTimestamp,
          updated_at: currentTimestamp
        });
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        // Try to provide more detailed error information
        if (insertError.code === '23505') {
          console.error('Duplicate key violation. The user ID already exists.');
        } else if (insertError.code === '42P01') {
          console.error('Table "user_profiles" does not exist. Please create the table in Supabase.');
        }
      } else {
        console.log('User profile created successfully');
      }
    } else {
      console.log('User profile already exists, updating last login timestamp');
      
      // Update the updated_at timestamp
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ updated_at: currentTimestamp })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('Error updating user profile timestamp:', updateError);
        // Continue anyway, as this is not critical
      } else {
        console.log('User profile timestamp updated successfully');
      }
    }
    
    // Return user data from the auth session which is guaranteed to exist
    return {
      id: user.id,
      fullName: user.user_metadata.full_name || user.user_metadata.name || 'Anonymous',
      email: user.email || ''
    };
  } catch (error) {
    console.error('Exception getting current user:', error);
    return null;
  }
}

// Function to sign out
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Exception during sign out:', error);
    return false;
  }
}

// Function to save user profile
export async function saveUserProfile(fullName: string, email: string): Promise<string | null> {
  try {
    console.log('Attempting to save user profile:', { fullName, email });
    
    const currentTimestamp = new Date().toISOString();
    
    // First check if the email already exists
    const { data: existingUser, error: searchError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();
    
    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 means no rows returned
      console.error('Error checking for existing email:', searchError);
      return null;
    }
    
    // If email already exists, update the timestamp and return the existing user ID
    if (existingUser) {
      console.log('Email already exists, updating timestamp and returning existing user ID:', existingUser.id);
      
      // Update the updated_at timestamp
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ updated_at: currentTimestamp })
        .eq('id', existingUser.id);
      
      if (updateError) {
        console.error('Error updating user profile timestamp:', updateError);
        // Continue anyway, as this is not critical
      }
      
      return existingUser.id;
    }
    
    // Get the current authenticated user if available
    const { data: { user } } = await supabase.auth.getUser();
    
    // If email doesn't exist, insert new user
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ 
        // Use the authenticated user's ID if available, otherwise let Supabase generate one
        ...(user && { id: user.id }),
        full_name: fullName, 
        email: email,
        created_at: currentTimestamp,
        updated_at: currentTimestamp
      }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving user profile:', error);
      // Log more detailed error information
      if (error.code === '23505') {
        console.error('Duplicate key violation. The user ID or email already exists.');
      } else if (error.code === '42P01') {
        console.error('Table "user_profiles" does not exist. Please create the table in Supabase.');
      } else if (error.code === 'PGRST301') {
        console.error('Supabase credentials may be incorrect or the service is unavailable.');
      }
      return null;
    }
    
    console.log('User profile saved successfully with ID:', data?.id);
    return data?.id || null;
  } catch (error) {
    console.error('Exception saving user profile:', error);
    return null;
  }
}

// Function to save survey responses
export async function saveSurveyResponses(userId: string, responses: { questionId: string, answer: string }[]): Promise<boolean> {
  try {
    console.log('Attempting to save survey responses for user:', userId);
    
    // First, verify that the current authenticated user matches the userId
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Authentication error:', authError);
      return false;
    }
    
    if (!user) {
      console.error('No authenticated user found');
      return false;
    }
    
    if (user.id !== userId) {
      console.error('User ID mismatch. Authenticated user:', user.id, 'Requested user:', userId);
      return false;
    }
    
    const currentTimestamp = new Date().toISOString();
    
    // Check if the user exists in the user_profiles table
    const { data: existingUser, error: userCheckError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userCheckError) {
      console.error('Error checking if user exists:', userCheckError);
      return false;
    }

    if (!existingUser) {
      console.error('User does not exist in the database');
      return false;
    }
    
    // Get existing responses for this user
    const { data: existingResponses, error: fetchError } = await supabase
      .from('survey_responses')
    .select('question_id, answer')
    .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching existing responses:', fetchError);
      return false;
    }

    // Create a map of existing responses with their created_at timestamps
    const existingResponseMap = new Map(
      existingResponses?.map(response => [response.question_id, response.created_at]) || []
    );

    // Prepare arrays for upsert operation
    const upsertData = responses.map(response => ({
      user_id: userId,
      question_id: response.questionId,
      answer: response.answer,
      // Keep the original created_at if it exists, otherwise use current timestamp
      created_at: existingResponseMap.get(response.questionId) || currentTimestamp,
      updated_at: currentTimestamp
    }));

    console.log('Upserting data for user:', userId);
    
    // Use upsert operation (insert if not exists, update if exists)
    const { error: upsertError } = await supabase
      .from('survey_responses')
      .upsert(upsertData, {
        onConflict: 'user_id,question_id',
        ignoreDuplicates: false
      });

    if (upsertError) {
      console.error('Error upserting survey responses:', upsertError);
      return false;
    }

    // Update user_profiles updated_at timestamp
    const { error: updateProfileError } = await supabase
      .from('user_profiles')
      .update({ updated_at: currentTimestamp })
      .eq('id', userId);

    if (updateProfileError) {
      console.error('Error updating user profile timestamp:', updateProfileError);
      // Continue anyway as this is not critical
    }

    console.log('Survey responses saved successfully for user:', userId);
    return true;
  } catch (error) {
    console.error('Exception saving survey responses:', error);
    return false;
  }
}

// Function to check if a user has already submitted responses
export async function hasUserSubmittedResponses(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;
    
    const { data, error } = await supabase
      .from('survey_responses')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking if user has submitted responses:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking if user has submitted responses:', error);
    return false;
  }
}