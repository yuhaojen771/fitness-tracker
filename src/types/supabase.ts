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

export type ExpenseCategoryRow = {
  id: string;
  user_id: string;
  name: string;
  icon: string | null;
  color: string | null;
  is_default: boolean;
  parent_category_id: string | null; // 父類別 ID（null 表示主類別）
  created_at: string;
  updated_at: string;
};

export type ExpenseRecordRow = {
  id: string;
  user_id: string;
  type: "expense" | "income";
  amount: number;
  category_id: string | null;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
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
      expense_categories: {
        Row: ExpenseCategoryRow;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          parent_category_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expense_categories"]["Insert"]>;
      };
      expense_records: {
        Row: ExpenseRecordRow;
        Insert: {
          id?: string;
          user_id: string;
          type: "expense" | "income";
          amount: number;
          category_id?: string | null;
          date: string;
          note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["expense_records"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

