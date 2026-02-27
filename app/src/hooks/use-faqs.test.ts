import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useFaqs, useAllFaqs, useAddFaq, useUpdateFaq, useDeleteFaq } from './use-faqs'
import type { Faq } from '@/types'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
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

const mockCoachFaq: Faq = {
  id: 'faq-001',
  question: 'What kit do players need?',
  answer: 'Players need a full Bradwell FC kit including boots and shin pads.',
  audience: 'coaches',
  display_order: 0,
  created_at: '2026-02-27T10:00:00Z',
}

const mockParentFaq: Faq = {
  id: 'faq-002',
  question: 'How do I register my child?',
  answer: 'Visit the Hivelink portal to complete registration.',
  audience: 'parents',
  display_order: 0,
  created_at: '2026-02-27T10:00:00Z',
}

// ---------------------------------------------------------------------------
// useFaqs
// ---------------------------------------------------------------------------

describe('useFaqs', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns FAQs for the given audience ordered by display_order', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockCoachFaq], error: null })
    mockEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })

    const { result } = renderHook(() => useFaqs('coaches'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockCoachFaq])
    expect(mockEq).toHaveBeenCalledWith('audience', 'coaches')
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockEq.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ eq: mockEq })

    const { result } = renderHook(() => useFaqs('coaches'), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// useAllFaqs
// ---------------------------------------------------------------------------

describe('useAllFaqs', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns all FAQs across both audiences', async () => {
    const mockOrder2 = vi.fn().mockResolvedValueOnce({ data: [mockCoachFaq, mockParentFaq], error: null })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAllFaqs(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array on error', async () => {
    const mockOrder2 = vi.fn().mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAllFaqs(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// useAddFaq
// ---------------------------------------------------------------------------

describe('useAddFaq', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('inserts a new FAQ and returns it', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockCoachFaq, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    // stub refetch after invalidation
    const mockOrder2 = vi.fn().mockResolvedValue({ data: [mockCoachFaq], error: null })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddFaq(), { wrapper: makeWrapper() })

    result.current.mutate({
      question: 'What kit do players need?',
      answer: 'Full Bradwell FC kit.',
      audience: 'coaches',
      display_order: 0,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInsert).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// useUpdateFaq
// ---------------------------------------------------------------------------

describe('useUpdateFaq', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('updates a FAQ by id', async () => {
    mockSingle.mockResolvedValueOnce({ data: { ...mockCoachFaq, question: 'Updated question?' }, error: null })
    const mockEqUpdate = vi.fn().mockReturnValue({ select: () => ({ single: mockSingle }) })
    mockUpdate.mockReturnValue({ eq: mockEqUpdate })

    const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useUpdateFaq(), { wrapper: makeWrapper() })

    result.current.mutate({ id: mockCoachFaq.id, input: { question: 'Updated question?' } })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEqUpdate).toHaveBeenCalledWith('id', mockCoachFaq.id)
  })
})

// ---------------------------------------------------------------------------
// useDeleteFaq
// ---------------------------------------------------------------------------

describe('useDeleteFaq', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('deletes a FAQ by id', async () => {
    mockEq.mockResolvedValueOnce({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })

    const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteFaq(), { wrapper: makeWrapper() })

    result.current.mutate(mockCoachFaq.id)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', mockCoachFaq.id)
  })

  it('throws on DB error', async () => {
    mockEq.mockResolvedValueOnce({ error: new Error('Delete failed') })
    mockDelete.mockReturnValue({ eq: mockEq })

    const mockOrder2 = vi.fn().mockResolvedValue({ data: [], error: null })
    mockOrder.mockReturnValue({ order: mockOrder2 })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteFaq(), { wrapper: makeWrapper() })

    result.current.mutate(mockCoachFaq.id)

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})
