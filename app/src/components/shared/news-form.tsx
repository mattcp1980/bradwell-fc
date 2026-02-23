import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { NewsFormFields } from './news-form-fields'
import { NewsEditor } from './news-editor'
import { uploadNewsImage } from '@/hooks/use-news'
import type { NewsPost, NewsPostInput } from '@/types'

// crypto.randomUUID requires HTTPS — use this fallback instead
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const newsSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  excerpt: z.string().min(10, 'Excerpt must be at least 10 characters').max(300, 'Keep excerpt under 300 characters'),
  body: z.string().min(1, 'Article body cannot be empty'),
  status: z.enum(['draft', 'published', 'scheduled']),
  scheduled_at: z.string().nullable(),
  cover_image_url: z.string().nullable(),
  images: z.array(z.string()),
  author_id: z.string(),
}).refine(
  (data) => data.status !== 'scheduled' || (data.scheduled_at !== null && data.scheduled_at !== ''),
  { message: 'Publish date is required when status is "Scheduled"', path: ['scheduled_at'] }
)

export type NewsFormValues = z.infer<typeof newsSchema>

interface NewsFormProps {
  defaultValues?: NewsPost
  authorId: string
  onSubmit: (data: NewsPostInput, clientId: string) => void
  onCancel: () => void
  isPending: boolean
}

export function NewsForm({ defaultValues, authorId, onSubmit, onCancel, isPending }: NewsFormProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      excerpt: defaultValues?.excerpt ?? '',
      body: defaultValues?.body ?? '',
      status: defaultValues?.status ?? 'draft',
      scheduled_at: defaultValues?.scheduled_at ?? null,
      cover_image_url: defaultValues?.cover_image_url ?? null,
      images: defaultValues?.images ?? [],
      author_id: authorId,
    },
  })

  async function handleSubmit(values: NewsFormValues) {
    const clientId = defaultValues?.id ?? generateId()
    setUploading(true)

    try {
      let coverUrl = values.cover_image_url
      if (coverFile) {
        coverUrl = await uploadNewsImage(coverFile, clientId)
      }

      let extraUrls = values.images
      if (additionalFiles.length > 0) {
        const uploaded = await Promise.all(
          additionalFiles.map((f) => uploadNewsImage(f, clientId))
        )
        extraUrls = [...extraUrls, ...uploaded]
      }

      onSubmit(
        {
          title: values.title,
          excerpt: values.excerpt,
          body: values.body,
          status: values.status,
          scheduled_at: values.scheduled_at,
          cover_image_url: coverUrl,
          images: extraUrls,
          author_id: authorId,
        },
        clientId
      )
    } finally {
      setUploading(false)
    }
  }

  const busy = isPending || uploading

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <NewsFormFields />

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Article body</FormLabel>
                <FormControl>
                  <NewsEditor value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-1">
            <Label>Cover image</Label>
            {defaultValues?.cover_image_url && !coverFile && (
              <img src={defaultValues.cover_image_url} alt="Current cover" className="h-24 rounded object-cover" />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1">
            <Label>Additional images</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setAdditionalFiles(Array.from(e.target.files ?? []))}
            />
            {additionalFiles.length > 0 && (
              <p className="text-xs text-muted-foreground">{additionalFiles.length} file(s) selected</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : defaultValues ? 'Save changes' : 'Add article'}
            </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  )
}
