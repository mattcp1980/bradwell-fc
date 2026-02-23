import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Document, DocumentInput } from '@/types'

const QUERY_KEY = ['documents']

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Admin query — returns all documents regardless of audience, newest first. */
export function useDocuments() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) return []
      return (data ?? []) as Document[]
    },
  })
}

/** Parent portal query — returns only parents + general documents, newest first. */
export function useParentDocuments() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'parent'],
    queryFn: async (): Promise<Document[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .or('audience.eq.parents,audience.eq.general')
        .order('created_at', { ascending: false })

      if (error) return []
      return (data ?? []) as Document[]
    },
  })
}

/** Returns deduplicated list of category strings for autocomplete datalist. */
export function useDocumentCategories() {
  return useQuery({
    queryKey: [...QUERY_KEY, 'categories'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('documents')
        .select('category')

      if (error) return []
      const categories = (data ?? []).map((r) => r.category).filter(Boolean)
      return [...new Set(categories)]
    },
  })
}

// ---------------------------------------------------------------------------
// Storage helper
// ---------------------------------------------------------------------------

/**
 * Uploads a file to the documents bucket and returns the public URL + storage path.
 * Path: {documentId}/{filename}
 */
export async function uploadDocument(
  file: File,
  documentId: string
): Promise<{ file_url: string; file_path: string }> {
  const file_path = `${documentId}/${file.name}`

  const { error } = await supabase.storage
    .from('documents')
    .upload(file_path, file, { upsert: false })

  if (error) throw error

  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(file_path)

  return { file_url: data.publicUrl, file_path }
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAddDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: DocumentInput & { id?: string }): Promise<Document> => {
      const { data, error } = await supabase
        .from('documents')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data as Document
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (doc: Document): Promise<void> => {
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id)

      if (dbError) throw dbError

      // Best-effort storage cleanup — don't block on failure
      await supabase.storage.from('documents').remove([doc.file_path])
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
