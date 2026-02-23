import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useOfficials, useAddOfficial, useDeleteOfficial } from './use-officials'
import type { ClubOfficial } from '@/types'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const mockSelect = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq = vi.fn()
const mockOverlaps = vi.fn()
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
// Test helpers
// ---------------------------------------------------------------------------

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

const mockOfficial: ClubOfficial = {
  id: 'abc-123',
  full_name: 'Jane Smith',
  email: 'jane@bradwellfc.co.uk',
  mobile: '07700900001',
  role: 'admin',
  teams: ['U10 Reds'],
  is_primary_contact: false,
  created_at: '2026-02-23T10:00:00Z',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useOfficials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns officials from Supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockOfficial], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useOfficials(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([mockOfficial])
  })

  it('surfaces errors from Supabase', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useOfficials(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useAddOfficial', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('inserts a new official', async () => {
    // No existing primary contacts to clear
    mockOverlaps.mockReturnValue({ eq: () => ({ data: [], error: null }) })
    mockUpdate.mockReturnValue({ overlaps: mockOverlaps })

    mockSingle.mockResolvedValueOnce({ data: mockOfficial, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    // Mock the list refetch after mutation
    mockOrder.mockResolvedValue({ data: [mockOfficial], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddOfficial(), { wrapper: makeWrapper() })

    result.current.mutate({
      full_name: 'Jane Smith',
      email: 'jane@bradwellfc.co.uk',
      mobile: '07700900001',
      role: 'admin',
      teams: ['U10 Reds'],
      is_primary_contact: false,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInsert).toHaveBeenCalled()
  })
})

describe('useDeleteOfficial', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deletes an official by id', async () => {
    mockEq.mockResolvedValueOnce({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })

    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteOfficial(), { wrapper: makeWrapper() })

    result.current.mutate('abc-123')

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', 'abc-123')
  })
})

describe('primary contact deduplication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears existing primary contacts when adding a new one for the same team', async () => {
    const clearEq = vi.fn().mockResolvedValue({ error: null })
    mockOverlaps.mockReturnValue({ eq: () => ({ neq: vi.fn().mockReturnValue({ data: null, error: null }), ...{ eq: clearEq } }) })
    mockUpdate.mockReturnValue({ overlaps: mockOverlaps })

    mockSingle.mockResolvedValueOnce({ data: { ...mockOfficial, is_primary_contact: true }, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddOfficial(), { wrapper: makeWrapper() })

    result.current.mutate({
      full_name: 'Jane Smith',
      email: 'jane@bradwellfc.co.uk',
      mobile: '07700900001',
      role: 'admin',
      teams: ['U10 Reds'],
      is_primary_contact: true,
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // update was called to clear existing primary contacts
    expect(mockUpdate).toHaveBeenCalledWith({ is_primary_contact: false })
  })
})
