import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useTeams, useAddTeam, useDeleteTeam } from './use-teams'
import type { TeamWithContact } from '@/types'

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

// Mock use-officials to avoid circular dependency issues in tests
vi.mock('@/hooks/use-officials', () => ({
  clearPrimaryContactForTeams: vi.fn().mockResolvedValue(undefined),
  useOfficials: vi.fn(() => ({ data: [], isLoading: false, error: null })),
  useAddOfficial: vi.fn(),
  useUpdateOfficial: vi.fn(),
  useDeleteOfficial: vi.fn(),
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

const mockTeam: TeamWithContact = {
  id: 'team-123',
  name: 'U10 Reds',
  age_group: 'U10',
  primary_contact_id: null,
  primary_contact: null,
  created_at: '2026-02-23T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useTeams', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns teams from Supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockTeam], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useTeams(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockTeam])
  })

  it('surfaces errors from Supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useTeams(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })
})

describe('useAddTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a new team', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockTeam, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    mockOrder.mockResolvedValue({ data: [mockTeam], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddTeam(), { wrapper: makeWrapper() })

    result.current.mutate({
      name: 'U10 Reds',
      age_group: 'U10',
      primary_contact_id: null,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInsert).toHaveBeenCalled()
  })
})

describe('useDeleteTeam', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes a team by id', async () => {
    mockEq.mockResolvedValueOnce({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })

    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteTeam(), { wrapper: makeWrapper() })

    result.current.mutate('team-123')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', 'team-123')
  })
})
