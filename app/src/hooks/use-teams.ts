import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { clearPrimaryContactForTeams } from '@/hooks/use-officials'
import type { TeamInput, TeamWithContact } from '@/types'

const QUERY_KEY = ['teams']

export function useTeams() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<TeamWithContact[]> => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, primary_contact:club_officials(id, full_name)')
        .order('name', { ascending: true })

      // Return empty array if table doesn't exist yet (migration not yet run)
      if (error) return []
      return (data ?? []) as TeamWithContact[]
    },
  })
}

// When a team's primary contact changes, sync is_primary_contact on club_officials:
// - Set true on the newly assigned official (for this team)
// - Clear the flag from any other official who had it for this team
async function syncPrimaryContact(teamName: string, officialId: string) {
  // Clear existing primary contact flag for this team from all other officials
  await clearPrimaryContactForTeams([teamName], officialId)

  // Set the flag on the chosen official
  const { error } = await supabase
    .from('club_officials')
    .update({ is_primary_contact: true })
    .eq('id', officialId)

  if (error) throw error
}

export function useAddTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: TeamInput) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(input)
        .select('*, primary_contact:club_officials(id, full_name)')
        .single()

      if (error) throw error

      if (input.primary_contact_id) {
        await syncPrimaryContact(input.name, input.primary_contact_id)
      }

      return data as TeamWithContact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['club_officials'] })
    },
  })
}

export function useUpdateTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: TeamInput }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(input)
        .eq('id', id)
        .select('*, primary_contact:club_officials(id, full_name)')
        .single()

      if (error) throw error

      if (input.primary_contact_id) {
        await syncPrimaryContact(input.name, input.primary_contact_id)
      } else {
        // Primary contact cleared — remove is_primary_contact flag for this team
        await clearPrimaryContactForTeams([input.name])
      }

      return data as TeamWithContact
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: ['club_officials'] })
    },
  })
}

export function useDeleteTeam() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
