import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClubEvent, ClubEventInput } from '@/types'

const QUERY_KEY = ['events']

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Public query — returns published events from today onwards, soonest first. */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'upcoming'],
    queryFn: async (): Promise<ClubEvent[]> => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('event_date', today)
        .order('event_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) return []
      return (data ?? []) as ClubEvent[]
    },
  })
}

/** Admin query — returns ALL events regardless of status, newest first. */
export function useAllEvents() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: async (): Promise<ClubEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: false })
        .order('start_time', { ascending: true })

      if (error) return []
      return (data ?? []) as ClubEvent[]
    },
  })
}

/** Coach query — published required-attendance events from today onwards. */
export function useRequiredEvents() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'required'],
    queryFn: async (): Promise<ClubEvent[]> => {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .eq('required_attendance', true)
        .gte('event_date', today)
        .order('event_date', { ascending: true })

      if (error) return []
      return (data ?? []) as ClubEvent[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAddEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ClubEventInput & { id?: string }): Promise<ClubEvent> => {
      const { data, error } = await supabase
        .from('events')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as ClubEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ClubEventInput> }): Promise<ClubEvent> => {
      const { data, error } = await supabase
        .from('events')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ClubEvent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
