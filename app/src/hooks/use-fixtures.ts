import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Fixture } from '@/types'

export function useFixtures() {
  return useQuery({
    queryKey: ['fixtures'],
    queryFn: async (): Promise<Fixture[]> => {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .order('date', { ascending: true })

      if (error) throw error
      return (data ?? []) as Fixture[]
    },
  })
}

export function useUpcomingFixtures(limit = 5) {
  return useQuery({
    queryKey: ['fixtures', 'upcoming', limit],
    queryFn: async (): Promise<Fixture[]> => {
      const { data, error } = await supabase
        .from('fixtures')
        .select('*')
        .gte('date', new Date().toISOString())
        .is('result', null)
        .order('date', { ascending: true })
        .limit(limit)

      if (error) throw error
      return (data ?? []) as Fixture[]
    },
  })
}
