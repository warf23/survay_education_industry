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
   - Add the following redirect URIs:
     - For local development: `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
     - For production: `https://[YOUR_VERCEL_DOMAIN].vercel.app/auth/callback`
   - Add your Client ID and Client Secret to Supabase

3. Configure Supabase Auth Settings:
   - Go to Authentication → URL Configuration
   - Add your site URLs:
     - For local development: `http://localhost:3000`
     - For production: `https://[YOUR_VERCEL_DOMAIN].vercel.app`
   - Add redirect URLs:
     - For local development: `http://localhost:3000/auth/callback`
     - For production: `https://[YOUR_VERCEL_DOMAIN].vercel.app/auth/callback`

4. Create the required tables in your Supabase database:

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
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

CREATE POLICY "Users can update their own responses" 
ON survey_responses FOR UPDATE 
USING (auth.uid() = user_id);

-- Drop any existing delete policy and create a new one
DROP POLICY IF EXISTS "Users can delete their own responses" ON survey_responses;
CREATE POLICY "Users can delete their own responses" 
ON survey_responses FOR DELETE 
USING (auth.uid() = user_id);
```

4. Get your Supabase URL and anon key from your project settings and add them to your `.env.local` file.

## Database Structure

The application uses a Supabase PostgreSQL database with the following structure:

### Tables

1. **user_profiles**
   - `id`: UUID PRIMARY KEY - References auth.users(id)
   - `full_name`: TEXT NOT NULL - The participant's full name
   - `email`: TEXT NOT NULL - The participant's email address (with UNIQUE constraint)
   - `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW() - Timestamp when the record was created
   - `updated_at`: TIMESTAMPTZ - Timestamp when the record was last updated

2. **survey_responses**
   - `id`: UUID PRIMARY KEY DEFAULT uuid_generate_v4() - Unique identifier
   - `user_id`: UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE - Foreign key to user_profiles
   - `created_at`: TIMESTAMPTZ NOT NULL DEFAULT NOW() - Timestamp when the record was created
   - `updated_at`: TIMESTAMPTZ - Timestamp when the record was last updated
   - Question-specific fields (organized by section):
     
   **Section A: FIRM INFORMATION**
   - `A-01`: TEXT - Industry
   - `A-02`: TEXT - Region
   - `A-03`: TEXT - Public/Private
   - `A-04`: TEXT - Firm Size
   - `A-05`: TEXT - Age
   - `A-06`: TEXT - Strengths
   - `A-07`: TEXT - Methodology
   - `A-08`: TEXT - Opportunities
   - `A-09`: TEXT - Competitors
   - `A-10`: TEXT - Innovation
   
   **Section B: SKILLS IDENTIFICATION**
   - `B-01`: TEXT - Skills
   - `B-02`: TEXT - Relevance
   - `B-03`: TEXT - Specific Skills
   - `B-04`: TEXT - Skills Update
   - `B-05`: TEXT - Skills Assessment
   
   **Section C: COLLABORATION**
   - `C-01`: TEXT - Training Partnerships
   - `C-02`: TEXT - Influence of Partnerships
   - `C-03`: TEXT - Collaboration Difficulties
   - `C-04`: TEXT - Knowledge
   - `C-05`: TEXT - Cooperation
   
   **Section D: FUTURE PROSPECTS**
   - `D-01`: TEXT - Future Skills
   - `D-02`: TEXT - Method
   - `D-03`: TEXT - Role
   - `D-04`: TEXT - Effectiveness
   - `D-05`: TEXT - Recommendations
   - `D-06`: TEXT - Additional Comments

### Row Level Security (RLS)

Both tables have Row Level Security enabled to control access to data:

1. **user_profiles RLS Policies**
   - `user_profiles_select_policy`: Users can select their own profile or if authenticated
   - `user_profiles_insert_policy`: Users can insert their own profile or if authenticated
   - `user_profiles_update_policy`: Users can only update their own profile

2. **survey_responses RLS Policies**
   - `survey_responses_select_policy`: Users can select their own responses or if authenticated
   - `survey_responses_insert_policy`: Users can insert their own responses or if authenticated
   - `survey_responses_update_policy`: Users can only update their own responses
   - `survey_responses_delete_policy`: Users can only delete their own responses

### Database Functions and Triggers

1. **update_updated_at_column() Function**
   - Automatically updates the `updated_at` column with the current timestamp whenever a record is updated

2. **Triggers**
   - `update_user_profiles_updated_at`: Updates the `updated_at` column in user_profiles table
   - `update_survey_responses_updated_at`: Updates the `updated_at` column in survey_responses table

### Indexes

The following indexes are created for better query performance:

1. **user_profiles Indexes**
   - `idx_user_profiles_email`: Index on the email column

2. **survey_responses Indexes**
   - `idx_survey_responses_user_id`: Index on the user_id column
   - `idx_survey_responses_question_id`: Index on the question_id column (in the original schema)

### Constraints

1. **user_profiles Constraints**
   - Primary key on `id`
   - Unique constraint on `email`

2. **survey_responses Constraints**
   - Primary key on `id`
   - Foreign key on `user_id` referencing user_profiles(id) with CASCADE on delete
   - Unique constraint on `user_id` (one survey response set per user)

### UUID Extension

The database uses the UUID extension to generate UUIDs:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Deployment

This is a Next.js application that can be deployed to platforms like Vercel, Netlify, or any other hosting service that supports Next.js.

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Create a new project on [Vercel](https://vercel.com)

3. Import your Git repository

4. Configure environment variables:
   - Go to Settings → Environment Variables
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

5. Deploy your application

6. After deployment, update your Supabase configuration:
   - Go to your Supabase project → Authentication → URL Configuration
   - Add your Vercel domain to the Site URL list
   - Add `https://[YOUR_VERCEL_DOMAIN].vercel.app/auth/callback` to the Redirect URLs list

7. Update your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials
   - Edit your OAuth 2.0 Client ID
   - Add `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback` to the Authorized redirect URIs

### Troubleshooting Deployment Issues

- **OAuth Redirect Issues**: If you see the access token in the URL after login, make sure you've properly configured the redirect URLs in both Supabase and Google OAuth settings.
  
- **Environment Variables**: Verify that your environment variables are correctly set in Vercel.

- **CORS Errors**: If you encounter CORS errors, ensure your Supabase project has the correct site URL configured.

## License

This project is licensed under the MIT License.









# database 

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(email)
);

-- Create survey_responses table
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, question_id)
);

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles table
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for survey_responses table
CREATE TRIGGER update_survey_responses_updated_at
BEFORE UPDATE ON survey_responses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_survey_responses_user_id ON survey_responses(user_id);
CREATE INDEX idx_survey_responses_question_id ON survey_responses(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles table
CREATE POLICY user_profiles_select_policy ON user_profiles
  FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY user_profiles_insert_policy ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NOT NULL);

CREATE POLICY user_profiles_update_policy ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for survey_responses table
CREATE POLICY survey_responses_select_policy ON survey_responses
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY survey_responses_insert_policy ON survey_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IS NOT NULL);

CREATE POLICY survey_responses_update_policy ON survey_responses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY survey_responses_delete_policy ON survey_responses
  FOR DELETE USING (auth.uid() = user_id);













# database 
create table public.survey_responses (
  id uuid not null default extensions.uuid_generate_v4(),
  user_id uuid not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  -- Section A: FIRM INFORMATION
  "A-01" text null, -- Industry
  "A-02" text null, -- Region
  "A-03" text null, -- PubPriv
  "A-04" text null, -- FirmSize
  "A-05" text null, -- Age
  "A-06" text null, -- Strengths
  "A-07" text null, -- Methodology
  "A-08" text null, -- Opportunities
  "A-09" text null, -- Competitors
  "A-10" text null, -- Innovation
  -- Section B: SKILLS IDENTIFICATION
  "B-01" text null, -- Skills
  "B-02" text null, -- Relevance
  "B-03" text null, -- Specific skills
  "B-04" text null, -- Skills update
  "B-05" text null, -- Skills assessment
  -- Section C: COLLABORATION
  "C-01" text null, -- Training partnerships
  "C-02" text null, -- Influence of partnerships
  "C-03" text null, -- Collaboration difficulties
  "C-04" text null, -- Knowledge
  "C-05" text null, -- Cooperation
  -- Section D: FUTURE PROSPECTS
  "D-01" text null, -- Future skills
  "D-02" text null, -- Method
  "D-03" text null, -- Role
  "D-04" text null, -- Effectiveness
  "D-05" text null, -- Recommendations
  "D-06" text null, -- Additional Comments
  constraint survey_responses_pkey primary key (id),
  constraint survey_responses_user_id_key unique (user_id),
  constraint survey_responses_user_id_fkey foreign key (user_id) references user_profiles(id) on delete cascade
) tablespace pg_default;

-- Keep the updated_at trigger
create trigger update_survey_responses_updated_at before
update on survey_responses for each row
execute function update_updated_at_column();
