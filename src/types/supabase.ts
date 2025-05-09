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
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      packages: {
        Row: {
          id: string
          created_at: string
          name: string
          description: string | null
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string | null
          active?: boolean
        }
        Relationships: []
      }
      subtests: {
        Row: {
          id: string
          created_at: string
          name: string
          package_id: string
          duration: number
          order: number
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          package_id: string
          duration: number
          order: number
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          package_id?: string
          duration?: number
          order?: number
        }
        Relationships: [
          {
            foreignKeyName: "subtests_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      questions: {
        Row: {
          id: string
          created_at: string
          subtest_id: string
          text: string
          type: 'MC' | 'SA'
          options: Json | null
          correct_answer: string
        }
        Insert: {
          id?: string
          created_at?: string
          subtest_id: string
          text: string
          type: 'MC' | 'SA'
          options?: Json | null
          correct_answer: string
        }
        Update: {
          id?: string
          created_at?: string
          subtest_id?: string
          text?: string
          type?: 'MC' | 'SA'
          options?: Json | null
          correct_answer?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_subtest_id_fkey"
            columns: ["subtest_id"]
            isOneToOne: false
            referencedRelation: "subtests"
            referencedColumns: ["id"]
          }
        ]
      }
      tryout_sessions: {
        Row: {
          id: string
          created_at: string
          package_id: string
          start_date: string
          end_date: string
          is_active: boolean
          name: string
        }
        Insert: {
          id?: string
          created_at?: string
          package_id: string
          start_date: string
          end_date: string
          is_active?: boolean
          name: string
        }
        Update: {
          id?: string
          created_at?: string
          package_id?: string
          start_date?: string
          end_date?: string
          is_active?: boolean
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tryout_sessions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          }
        ]
      }
      user_tryouts: {
        Row: {
          id: string
          created_at: string
          user_id: string
          package_id: string
          session_id: string
          status: 'not_started' | 'in_progress' | 'completed' | 'scored'
          final_score: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          package_id: string
          session_id: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'scored'
          final_score?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          package_id?: string
          session_id?: string
          status?: 'not_started' | 'in_progress' | 'completed' | 'scored'
          final_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tryouts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tryouts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_tryouts_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "tryout_sessions"
            referencedColumns: ["id"]
          }
        ]
      }
      user_answers: {
        Row: {
          id: string
          created_at: string
          user_tryout_id: string
          question_id: string
          answer_text: string
          is_flagged: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_tryout_id: string
          question_id: string
          answer_text: string
          is_flagged?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_tryout_id?: string
          question_id?: string
          answer_text?: string
          is_flagged?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_answers_user_tryout_id_fkey"
            columns: ["user_tryout_id"]
            isOneToOne: false
            referencedRelation: "user_tryouts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          }
        ]
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