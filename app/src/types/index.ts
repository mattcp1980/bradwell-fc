export type { UserRole } from './supabase'

export interface Fixture {
  id: string
  date: string
  opponent: string
  home: boolean
  venue: string | null
  result: FixtureResult | null
  competition: string | null
}

export interface FixtureResult {
  goals_for: number
  goals_against: number
}

export interface Player {
  id: string
  full_name: string
  squad_number: number | null
  position: string | null
}

export type NewsPostStatus = 'draft' | 'published' | 'scheduled'

export interface NewsPost {
  id: string
  title: string
  excerpt: string
  body: string
  cover_image_url: string | null
  images: string[]
  status: NewsPostStatus
  scheduled_at: string | null
  author_id: string
  created_at: string
  updated_at: string
}

export type NewsPostInput = Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>

export interface ClubOfficial {
  id: string
  full_name: string
  email: string
  mobile: string
  role: 'admin' | 'coach'
  teams: string[]
  is_primary_contact: boolean
  created_at: string
}

export type ClubOfficialInput = Omit<ClubOfficial, 'id' | 'created_at'>

export interface Team {
  id: string
  name: string
  age_group: string
  primary_contact_id: string | null
  created_at: string
}

export type TeamInput = Omit<Team, 'id' | 'created_at'>

// Team row joined with primary contact details (from useTeams select)
export interface TeamWithContact extends Team {
  primary_contact: { id: string; full_name: string } | null
}

export type DocumentAudience = 'admin' | 'coaches' | 'parents' | 'general'

export interface Document {
  id: string
  name: string
  file_url: string
  file_path: string
  category: string
  audience: DocumentAudience
  uploaded_by: string
  created_at: string
}

export type DocumentInput = Omit<Document, 'id' | 'created_at'>
