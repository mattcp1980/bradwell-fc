import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Faq, FaqInput } from '@/types'

const QUERY_KEY = ['faqs']

// faqs table is not yet in the generated types — cast until types are regenerated after migration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const faqsTable = () => (supabase as any).from('faqs')

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Portal query — returns FAQs for a specific audience, sorted by display_order. */
export function useFaqs(audience: 'coaches' | 'parents') {
  return useQuery({
    queryKey: [...QUERY_KEY, audience],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await faqsTable()
        .select('*')
        .eq('audience', audience)
        .order('display_order', { ascending: true })

      if (error) return []
      return (data ?? []) as Faq[]
    },
  })
}

/** Admin query — returns ALL FAQs regardless of audience. */
export function useAllFaqs() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'all'],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await faqsTable()
        .select('*')
        .order('audience', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) return []
      return (data ?? []) as Faq[]
    },
  })
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAddFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: FaqInput): Promise<Faq> => {
      const { data, error } = await faqsTable()
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as Faq
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useUpdateFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<FaqInput> }): Promise<Faq> => {
      const { data, error } = await faqsTable()
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Faq
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteFaq() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await faqsTable()
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
