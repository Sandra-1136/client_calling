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
      clients: {
        Row: {
          id: string
          name: string
          phone_number: string
          whatsapp_number: string | null
          email: string
          position: string
          department: string
          status: 'pending' | 'calling' | 'answered' | 'missed'
          call_attempts: number
          last_call_time: string | null
          priority: 'high' | 'follow-up' | 'not-interested' | null
          work_status: 'new' | 'in_progress' | 'completed' | 'repeat_client'
          is_urgent: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          phone_number: string
          whatsapp_number?: string | null
          email?: string
          position?: string
          department?: string
          status?: 'pending' | 'calling' | 'answered' | 'missed'
          call_attempts?: number
          last_call_time?: string | null
          priority?: 'high' | 'follow-up' | 'not-interested' | null
          work_status?: 'new' | 'in_progress' | 'completed' | 'repeat_client'
          is_urgent?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone_number?: string
          whatsapp_number?: string | null
          email?: string
          position?: string
          department?: string
          status?: 'pending' | 'calling' | 'answered' | 'missed'
          call_attempts?: number
          last_call_time?: string | null
          priority?: 'high' | 'follow-up' | 'not-interested' | null
          work_status?: 'new' | 'in_progress' | 'completed' | 'repeat_client'
          is_urgent?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      client_feedback: {
        Row: {
          id: string
          client_id: string
          user_id: string
          rating: number
          feedback_text: string | null
          feedback_date: string
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          rating: number
          feedback_text?: string | null
          feedback_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          rating?: number
          feedback_text?: string | null
          feedback_date?: string
          created_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          client_id: string
          user_id: string
          appointment_date: string
          appointment_type: string
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          appointment_date: string
          appointment_type?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          appointment_date?: string
          appointment_type?: string
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      work_history: {
        Row: {
          id: string
          client_id: string
          user_id: string
          work_type: string
          work_description: string | null
          start_date: string | null
          completion_date: string | null
          status: 'completed' | 'in_progress' | 'cancelled'
          amount: number | null
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          work_type: string
          work_description?: string | null
          start_date?: string | null
          completion_date?: string | null
          status?: 'completed' | 'in_progress' | 'cancelled'
          amount?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          work_type?: string
          work_description?: string | null
          start_date?: string | null
          completion_date?: string | null
          status?: 'completed' | 'in_progress' | 'cancelled'
          amount?: number | null
          created_at?: string
        }
      }
      client_notes: {
        Row: {
          id: string
          client_id: string
          user_id: string
          note_text: string
          is_urgent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          user_id: string
          note_text: string
          is_urgent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          user_id?: string
          note_text?: string
          is_urgent?: boolean
          created_at?: string
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}