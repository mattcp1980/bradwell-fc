import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useDocuments, useParentDocuments, useDocumentCategories, useAddDocument, useDeleteDocument, uploadDocument } from './use-documents'
import type { Document } from '@/types'

// ---------------------------------------------------------------------------
// Mock Supabase client
// ---------------------------------------------------------------------------

const { mockStorageUpload, mockStorageGetPublicUrl, mockStorageRemove, mockStorageFrom } = vi.hoisted(() => {
  const mockStorageUpload = vi.fn()
  const mockStorageGetPublicUrl = vi.fn()
  const mockStorageRemove = vi.fn()
  const mockStorageFrom = vi.fn(() => ({
    upload: mockStorageUpload,
    getPublicUrl: mockStorageGetPublicUrl,
    remove: mockStorageRemove,
  }))
  return { mockStorageUpload, mockStorageGetPublicUrl, mockStorageRemove, mockStorageFrom }
})

const mockSelect = vi.fn()
const mockInsert = vi.fn()
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

const mockDoc: Document = {
  id: 'doc-abc-123',
  name: 'FA Respect Code of Conduct',
  file_url: 'https://storage.example.com/documents/doc-abc-123/fa-respect.pdf',
  file_path: 'doc-abc-123/fa-respect.pdf',
  category: 'Policy',
  audience: 'general',
  uploaded_by: 'user-xyz-456',
  created_at: '2026-02-26T10:00:00Z',
}

const mockParentsDoc: Document = {
  ...mockDoc,
  id: 'doc-def-456',
  audience: 'parents',
  name: 'Emergency Contact Form',
}

const mockAdminDoc: Document = {
  ...mockDoc,
  id: 'doc-ghi-789',
  audience: 'admin',
  name: 'Admin Internal Notes',
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useDocuments', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns all documents', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockDoc, mockAdminDoc], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDocuments(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDocuments(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useParentDocuments', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns parents and general documents', async () => {
    mockOrder.mockResolvedValueOnce({ data: [mockDoc, mockParentsDoc], error: null })
    mockOr.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ or: mockOr })

    const { result } = renderHook(() => useParentDocuments(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })

  it('returns empty array on error', async () => {
    mockOrder.mockResolvedValueOnce({ data: null, error: new Error('DB error') })
    mockOr.mockReturnValue({ order: mockOrder })
    mockSelect.mockReturnValue({ or: mockOr })

    const { result } = renderHook(() => useParentDocuments(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useDocumentCategories', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns deduplicated category list', async () => {
    mockSelect.mockResolvedValueOnce({
      data: [{ category: 'Policy' }, { category: 'Form' }, { category: 'Policy' }],
      error: null,
    })

    const { result } = renderHook(() => useDocumentCategories(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(['Policy', 'Form'])
  })

  it('returns empty array on error', async () => {
    mockSelect.mockResolvedValueOnce({ data: null, error: new Error('DB error') })

    const { result } = renderHook(() => useDocumentCategories(), { wrapper: makeWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual([])
  })
})

describe('useAddDocument', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('inserts a new document', async () => {
    mockSingle.mockResolvedValueOnce({ data: mockDoc, error: null })
    mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) })

    mockOrder.mockResolvedValue({ data: [mockDoc], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useAddDocument(), { wrapper: makeWrapper() })

    result.current.mutate({
      name: 'FA Respect Code of Conduct',
      file_url: 'https://storage.example.com/documents/doc-abc-123/fa-respect.pdf',
      file_path: 'doc-abc-123/fa-respect.pdf',
      category: 'Policy',
      audience: 'general',
      uploaded_by: 'user-xyz-456',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockInsert).toHaveBeenCalled()
  })
})

describe('useDeleteDocument', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('deletes a document by id and removes from storage', async () => {
    mockEq.mockResolvedValueOnce({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })
    mockStorageRemove.mockResolvedValueOnce({ error: null })

    mockOrder.mockResolvedValue({ data: [], error: null })
    mockSelect.mockReturnValue({ order: mockOrder })

    const { result } = renderHook(() => useDeleteDocument(), { wrapper: makeWrapper() })

    result.current.mutate(mockDoc)

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(mockEq).toHaveBeenCalledWith('id', mockDoc.id)
    expect(mockStorageRemove).toHaveBeenCalledWith([mockDoc.file_path])
  })
})

describe('uploadDocument', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('uploads a file and returns the public URL and path', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: null })
    mockStorageGetPublicUrl.mockReturnValueOnce({
      data: { publicUrl: 'https://storage.example.com/documents/doc-abc-123/fa-respect.pdf' },
    })

    const file = new File(['content'], 'fa-respect.pdf', { type: 'application/pdf' })
    const result = await uploadDocument(file, 'doc-abc-123')

    expect(result.file_url).toBe('https://storage.example.com/documents/doc-abc-123/fa-respect.pdf')
    expect(result.file_path).toBe('doc-abc-123/fa-respect.pdf')
    expect(mockStorageFrom).toHaveBeenCalledWith('documents')
    expect(mockStorageUpload).toHaveBeenCalled()
  })

  it('throws if upload fails', async () => {
    mockStorageUpload.mockResolvedValueOnce({ error: new Error('Upload failed') })

    const file = new File(['content'], 'fa-respect.pdf', { type: 'application/pdf' })

    await expect(uploadDocument(file, 'doc-abc-123')).rejects.toThrow('Upload failed')
  })
})
