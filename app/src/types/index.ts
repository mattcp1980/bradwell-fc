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

export type TrainingDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

export interface TrainingSchedule {
  id: string
  name: string
  status: 'draft' | 'published'
  pitch_image_url: string | null
  pitch_image_path: string | null
  created_at: string
  updated_at: string
}

export interface TrainingSlot {
  id: string
  schedule_id: string
  day: TrainingDay
  start_time: string
  end_time: string
  venue: string
  team_id: string | null
  created_at: string
}

/** A slot with the joined team name, for display */
export interface TrainingSlotWithTeam extends TrainingSlot {
  team: { id: string; name: string } | null
}

export interface SiteContent {
  key: string
  value: string
  updated_at: string
}

/** Map of all site content keys to their values, for easy lookup. */
export type SiteContentMap = Record<string, string>

export type EventStatus = 'draft' | 'published'

export interface ClubEvent {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string | null
  end_time: string | null
  location: string
  required_attendance: boolean
  status: EventStatus
  created_by: string
  created_at: string
  updated_at: string
}

export type ClubEventInput = Omit<ClubEvent, 'id' | 'created_at' | 'updated_at'>
