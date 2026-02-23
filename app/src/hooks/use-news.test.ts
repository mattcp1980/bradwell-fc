import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { usePublishedNews, useAllNews, useAddNews, useUpdateNews, useDeleteNews, uploadNewsImage } from './use-news'
import type { NewsPost } from '@/types'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

// Use vi.hoisted so these are available inside the vi.mock factory (which is hoisted)
const { mockStorageUpload, mockStorageGetPublicUrl, mockStorageFrom } = vi.hoisted(() => {
  const mockStorageUpload = vi.fn()
  const mockStorageGetPublicUrl = vi.fn()
  const mockStorageFrom = vi.fn(() => ({
    upload: mockStorageUpload,
    getPublicUrl: mockStorageGetPublicUrl,
  }))
  return { mockStorageUpload, mockStorageGetPublicUrl, mockStorageFrom }
})

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOr = vi.fn()
const mockOrder = vi.fn()
const mockSingle = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    })),
    storage: {
      from: mockStorageFrom,
    },
  },
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockPost: NewsPost = {
  id: 'post-abc-123',
  title: 'Test Article',
  excerpt: 'A short summary of the test article.',
  body: '<p>Full article body here.</p>',
  cover_image_url: null,
  images: [],
  status: 'published',
  scheduled_at: null,
  author_id: 'user-xyz-456',
  created_at: '2026-02-25T10:00:00Z',
  updated_at: '2026-02-25T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('usePublishedNews', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns published articles from Supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockPost], error: null })
    mockOr.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ or: mockOr })

    const { result } = renderHook(() => usePublishedNews(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockPost])
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockOr.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ or: mockOr })

    const { result } = renderHook(() => usePublishedNews(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useAllNews', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns all articles including drafts', async () => {
    const draftPost = { ...mockPost, status: 'draft' as const }
    mockOrder.mockResolvedValueOnce({ data: [mockPost, draftPost], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAllNews(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAllNews(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useAddNews', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('inserts a new article', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockPost, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    mockOrder.mockResolvedValue({ data: [mockPost], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddNews(), { wrapper: makeWrapper() })

    result.current.mutate({
      title: 'Test Article',
      excerpt: 'A short summary.',
      body: '<p>Body</p>',
      status: 'published',
      scheduled_at: null,
      cover_image_url: null,
      images: [],
      author_id: 'user-xyz-456',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInsert).toHaveBeenCalled()
  })
})

describe('useUpdateNews', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('updates an existing article by id', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockPost, error: null })
    mockEq.mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEq })

    mockOrder.mockResolvedValue({ data: [mockPost], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useUpdateNews(), { wrapper: makeWrapper() })

    result.current.mutate({ id: 'post-abc-123', input: { title: 'Updated Title' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', 'post-abc-123')
  })
})

describe('useDeleteNews', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('deletes an article by id', async () => {
    mockEq.mockResolvedValueOnce({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })

    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteNews(), { wrapper: makeWrapper() })

    result.current.mutate('post-abc-123')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', 'post-abc-123')
  })
})

describe('uploadNewsImage', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('uploads a file and returns the public URL', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: null })
    mockStorageGetPublicUrl.mockReturnValueOnce({
      data: { publicUrl: 'https://storage.example.com/news-images/article-id/123456.jpg' },
    })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })
    const url = await uploadNewsImage(file, 'article-id')

    expect(url).toBe('https://storage.example.com/news-images/article-id/123456.jpg')
    expect(mockStorageFrom).toHaveBeenCalledWith('news-images')
    expect(mockStorageUpload).toHaveBeenCalled()
  })

  it('throws if upload fails', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: new Error('Upload failed') })

    const file = new File(['content'], 'photo.jpg', { type: 'image/jpeg' })

    await expect(uploadNewsImage(file, 'article-id')).rejects.toThrow('Upload failed')
  })
})
