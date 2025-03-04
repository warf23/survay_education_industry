export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      survey_responses_flat: {
        Row: {
          user_id: string
          full_name: string | null
          email: string | null
          Industry: string | null
          Region: string | null
          Public_Private: string | null
          Firm_Size: string | null
          Firm_Age: string | null
          Strengths: string | null
          Recruitment_Process: string | null
          Market_Opportunities: string | null
          Competitors: string | null
          Innovation_Measurement: string | null
          Key_Skills: string | null
          Skills_Importance: string | null
          Missing_Skills: string | null
          Skills_Update_Method: string | null
          Skills_Assessment_Tools: string | null
          Training_Partnerships: string | null
          Partnership_Influence: string | null
          Collaboration_Difficulties: string | null
          Knowledge_Transfer_Channels: string | null
          Cooperation_Improvements: string | null
          Future_Essential_Skills: string | null
          Teaching_Methods_Evolution: string | null
          Technology_Role: string | null
          Skills_Effectiveness_Measurement: string | null
          Education_Industry_Recommendations: string | null
          Additional_Comments: string | null
          submission_date: string
          last_updated: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          email?: string | null
          Industry?: string | null
          Region?: string | null
          Public_Private?: string | null
          Firm_Size?: string | null
          Firm_Age?: string | null
          Strengths?: string | null
          Recruitment_Process?: string | null
          Market_Opportunities?: string | null
          Competitors?: string | null
          Innovation_Measurement?: string | null
          Key_Skills?: string | null
          Skills_Importance?: string | null
          Missing_Skills?: string | null
          Skills_Update_Method?: string | null
          Skills_Assessment_Tools?: string | null
          Training_Partnerships?: string | null
          Partnership_Influence?: string | null
          Collaboration_Difficulties?: string | null
          Knowledge_Transfer_Channels?: string | null
          Cooperation_Improvements?: string | null
          Future_Essential_Skills?: string | null
          Teaching_Methods_Evolution?: string | null
          Technology_Role?: string | null
          Skills_Effectiveness_Measurement?: string | null
          Education_Industry_Recommendations?: string | null
          Additional_Comments?: string | null
          submission_date: string
          last_updated: string
        }
        Update: {
          user_id?: string
          full_name?: string | null
          email?: string | null
          Industry?: string | null
          Region?: string | null
          Public_Private?: string | null
          Firm_Size?: string | null
          Firm_Age?: string | null
          Strengths?: string | null
          Recruitment_Process?: string | null
          Market_Opportunities?: string | null
          Competitors?: string | null
          Innovation_Measurement?: string | null
          Key_Skills?: string | null
          Skills_Importance?: string | null
          Missing_Skills?: string | null
          Skills_Update_Method?: string | null
          Skills_Assessment_Tools?: string | null
          Training_Partnerships?: string | null
          Partnership_Influence?: string | null
          Collaboration_Difficulties?: string | null
          Knowledge_Transfer_Channels?: string | null
          Cooperation_Improvements?: string | null
          Future_Essential_Skills?: string | null
          Teaching_Methods_Evolution?: string | null
          Technology_Role?: string | null
          Skills_Effectiveness_Measurement?: string | null
          Education_Industry_Recommendations?: string | null
          Additional_Comments?: string | null
          submission_date?: string
          last_updated?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 