export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          onboarding_completed: boolean
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          onboarding_completed?: boolean
        }
      }
      life_assessments: {
        Row: {
          id: string
          user_id: string
          health_score: number
          career_score: number
          relationships_score: number
          finances_score: number
          personal_growth_score: number
          leisure_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          health_score: number
          career_score: number
          relationships_score: number
          finances_score: number
          personal_growth_score: number
          leisure_score: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          health_score?: number
          career_score?: number
          relationships_score?: number
          finances_score?: number
          personal_growth_score?: number
          leisure_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      daily_tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          category: LifeCategory
          estimated_minutes: number
          completed: boolean
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          category: LifeCategory
          estimated_minutes: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          category?: LifeCategory
          estimated_minutes?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          updated_at?: string
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
      life_category: 'health' | 'career' | 'relationships' | 'finances' | 'personal_growth' | 'leisure'
    }
  }
}

export type LifeCategory = 'health' | 'career' | 'relationships' | 'finances' | 'personal_growth' | 'leisure'

export interface LifeAssessment {
  id: string
  user_id: string
  health_score: number
  career_score: number
  relationships_score: number
  finances_score: number
  personal_growth_score: number
  leisure_score: number
  created_at: string
  updated_at: string
}

export interface DailyTask {
  id: string
  user_id: string
  title: string
  description: string
  category: LifeCategory
  estimated_minutes: number
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  created_at: string
  updated_at: string
  email: string
  full_name: string | null
  avatar_url: string | null
  onboarding_completed: boolean
}

export const LIFE_CATEGORIES: Record<LifeCategory, { label: string; description: string; icon: string }> = {
  health: {
    label: 'Health & Wellness',
    description: 'Physical and mental well-being',
    icon: '🏃‍♂️'
  },
  career: {
    label: 'Career & Work',
    description: 'Professional growth and satisfaction',
    icon: '💼'
  },
  relationships: {
    label: 'Relationships',
    description: 'Family, friends, and social connections',
    icon: '❤️'
  },
  finances: {
    label: 'Finances',
    description: 'Money management and financial security',
    icon: '💰'
  },
  personal_growth: {
    label: 'Personal Growth',
    description: 'Learning, skills, and self-development',
    icon: '🌱'
  },
  leisure: {
    label: 'Leisure & Fun',
    description: 'Hobbies, recreation, and enjoyment',
    icon: '🎯'
  }
} 