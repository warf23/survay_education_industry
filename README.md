# Education & Industry Survey

A modern, responsive questionnaire application for collecting data on the alignment between education and industry needs.

## Features

- Multi-section questionnaire with progress tracking
- Responsive design for desktop, tablet, and mobile devices
- Bilingual support (English/French)
- User information collection with validation
- Supabase integration for data storage
- Animated transitions and modern UI

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Start the development server:

```bash
npm run dev
```

## Setting Up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)

2. Enable Google Authentication:
   - Go to Authentication → Providers → Google
   - Enable the Google provider
   - Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com/)
   - Add the redirect URI: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
   - Add your Client ID and Client Secret to Supabase

3. Create the required tables in your Supabase database:

### User Profiles Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint to email field
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_unique UNIQUE (email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own profiles" 
ON user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profiles" 
ON user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profiles" 
ON user_profiles FOR UPDATE
USING (auth.uid() = id);
```

### Survey Responses Table

```sql
CREATE TABLE survey_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own responses" 
ON survey_responses FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own responses" 
ON survey_responses FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

4. Get your Supabase URL and anon key from your project settings and add them to your `.env.local` file.

## Database Structure

The application uses two main tables:

1. **user_profiles**: Stores information about survey participants
   - `id`: Unique identifier (UUID)
   - `full_name`: The participant's full name
   - `email`: The participant's email address
   - `created_at`: Timestamp when the record was created

2. **survey_responses**: Stores the survey responses
   - `id`: Unique identifier (UUID)
   - `user_id`: Foreign key referencing the user_profiles table
   - `question_id`: The ID of the question (e.g., "A-01", "B-03")
   - `answer`: The participant's answer to the question
   - `created_at`: Timestamp when the record was created

## Deployment

This is a Next.js application that can be deployed to platforms like Vercel, Netlify, or any other hosting service that supports Next.js.

## License

This project is licensed under the MIT License.
