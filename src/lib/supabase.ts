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

// Function to save user profile
export async function saveUserProfile(fullName: string, email: string): Promise<string | null> {
  try {
    console.log('Attempting to save user profile:', { fullName, email });
    
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
    
    // If email already exists, return the existing user ID
    if (existingUser) {
      console.log('Email already exists, returning existing user ID:', existingUser.id);
      return existingUser.id;
    }
    
    // If email doesn't exist, insert new user
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([{ full_name: fullName, email: email }])
      .select('id')
      .single();
    
    if (error) {
      console.error('Error saving user profile:', error);
      // Log more detailed error information
      if (error.code === '42P01') {
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
    const formattedResponses = responses.map(response => ({
      user_id: userId,
      question_id: response.questionId,
      answer: response.answer
    }));
    
    const { error } = await supabase
      .from('survey_responses')
      .insert(formattedResponses);
    
    if (error) {
      console.error('Error saving survey responses:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception saving survey responses:', error);
    return false;
  }
} 