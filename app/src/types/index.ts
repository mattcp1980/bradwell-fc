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

export interface NewsPost {
  id: string
  title: string
  body: string
  published_at: string
  author_id: string
}

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
