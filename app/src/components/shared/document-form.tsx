import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useDocumentCategories, uploadDocument } from '@/hooks/use-documents'
import type { DocumentInput } from '@/types'

const documentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string(),
  audience: z.enum(['admin', 'parents', 'general']),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentFormProps {
  uploadedBy: string
  onSubmit: (input: DocumentInput, id: string) => void
  onCancel: () => void
  isPending: boolean
}

export function DocumentForm({ uploadedBy, onSubmit, onCancel, isPending }: DocumentFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const { data: categories = [] } = useDocumentCategories()

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      name: '',
      category: '',
      audience: 'parents',
    },
  })

  async function handleSubmit(values: DocumentFormValues) {
    if (!file) {
      setFileError('Please select a file to upload')
      return
    }

    setFileError(null)
    setUploading(true)

    try {
      const documentId = crypto.randomUUID()
      const { file_url, file_path } = await uploadDocument(file, documentId)

      onSubmit(
        {
          name: values.name || file.name,
          category: values.category,
          audience: values.audience,
          file_url,
          file_path,
          uploaded_by: uploadedBy,
        },
        documentId
      )
    } finally {
      setUploading(false)
    }
  }

  const busy = isPending || uploading

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. FA Respect Code of Conduct" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <>
                  <Input
                    list="category-suggestions"
                    placeholder="e.g. Policy, Form, Safeguarding…"
                    {...field}
                  />
                  <datalist id="category-suggestions">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="audience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Audience</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="admin">Admin Only</option>
                  <option value="parents">Parents</option>
                  <option value="general">General</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-1">
          <Label>File</Label>
          <Input
            type="file"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null
              setFile(f)
              if (f && !form.getValues('name')) {
                form.setValue('name', f.name.replace(/\.[^.]+$/, ''))
              }
            }}
          />
          {fileError && <p className="text-xs text-destructive">{fileError}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Uploading…' : 'Upload document'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
