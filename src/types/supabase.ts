export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type DailyRecordRow = {
  id: string;
  user_id: string;
  date: string;
  weight: number | null;
  diet_notes: string | null;
  created_at: string;
};

export type ProfileRow = {
  id: string;
  is_premium: boolean;
  is_admin: boolean;
  updated_at: string;
  subscription_end_date: string | null;
  target_weight: number | null;
  target_date: string | null;
  starting_weight: number | null;
  starting_date: string | null;
};

export interface Database {
  public: {
    Tables: {
      daily_records: {
        Row: DailyRecordRow;
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          weight?: number | null;
          diet_notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_records"]["Insert"]>;
      };
      profiles: {
        Row: ProfileRow;
        Insert: {
          id: string;
          is_premium?: boolean;
          is_admin?: boolean;
          updated_at?: string;
          subscription_end_date?: string | null;
          target_weight?: number | null;
          target_date?: string | null;
          starting_weight?: number | null;
          starting_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

