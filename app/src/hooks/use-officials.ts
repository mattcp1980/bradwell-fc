import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClubOfficial, ClubOfficialInput } from '@/types'

const QUERY_KEY = ['club_officials']

export function useOfficials() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<ClubOfficial[]> => {
      const { data, error } = await supabase
        .from('club_officials')
        .select('*')
        .order('full_name', { ascending: true })

      if (error) throw error
      return (data ?? []) as ClubOfficial[]
    },
  })
}

// When an official is marked as primary contact, clear the flag on any other
// official that shares one of the same teams. Exported for reuse in use-teams.ts.
export async function clearPrimaryContactForTeams(teams: string[], excludeId?: string) {
  if (teams.length === 0) return

  let query = supabase
    .from('club_officials')
    .update({ is_primary_contact: false })
    .overlaps('teams', teams)
    .eq('is_primary_contact', true)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { error } = await query
  if (error) throw error
}

export function useAddOfficial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ClubOfficialInput) => {
      if (input.is_primary_contact) {
        await clearPrimaryContactForTeams(input.teams)
      }

      const { data, error } = await supabase
        .from('club_officials')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as ClubOfficial
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateOfficial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: ClubOfficialInput }) => {
      if (input.is_primary_contact) {
        await clearPrimaryContactForTeams(input.teams, id)
      }

      const { data, error } = await supabase
        .from('club_officials')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as ClubOfficial
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteOfficial() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('club_officials')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
