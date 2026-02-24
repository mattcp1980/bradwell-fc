import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SiteContent, SiteContentMap } from '@/types'

const QUERY_KEY = ['site_content']

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

/**
 * Fetches all site_content rows and returns them as a key→value map.
 * Falls back to an empty object on error so pages render with empty strings
 * rather than crashing.
 */
export function useSiteContent() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SiteContentMap> => {
      const { data, error } = await supabase
        .from('site_content')
        .select('key, value')

      if (error) return {}
      const rows = (data ?? []) as Pick<SiteContent, 'key' | 'value'>[]
      return Object.fromEntries(rows.map((r) => [r.key, r.value]))
    },
  })
}

// ---------------------------------------------------------------------------
// Mutation
// ---------------------------------------------------------------------------

/**
 * Upserts a single site content entry.
 * Uses upsert (onConflict: 'key') so new keys are created and existing ones
 * are updated. Invalidates the shared query on success.
 */
export function useUpdateSiteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }): Promise<void> => {
      const { error } = await supabase
        .from('site_content')
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
