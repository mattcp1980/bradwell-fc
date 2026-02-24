import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ClubEvent, ClubEventInput } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string(),
  event_date: z.string().min(1, 'Date is required'),
  start_time: z.string(),
  end_time: z.string(),
  location: z.string(),
  required_attendance: z.boolean(),
  status: z.enum(['draft', 'published']),
})

type FormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: ClubEvent
  createdBy: string
  onSubmit: (input: ClubEventInput) => void
  onCancel: () => void
  isPending: boolean
}

export function EventForm({ defaultValues, createdBy, onSubmit, onCancel, isPending }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues
      ? {
          title: defaultValues.title,
          description: defaultValues.description,
          event_date: defaultValues.event_date,
          start_time: defaultValues.start_time ?? '',
          end_time: defaultValues.end_time ?? '',
          location: defaultValues.location,
          required_attendance: defaultValues.required_attendance,
          status: defaultValues.status,
        }
      : {
          title: '',
          description: '',
          event_date: '',
          start_time: '',
          end_time: '',
          location: '',
          required_attendance: false,
          status: 'draft',
        },
  })

  function onValid(values: FormValues) {
    onSubmit({
      title: values.title,
      description: values.description,
      event_date: values.event_date,
      start_time: values.start_time || null,
      end_time: values.end_time || null,
      location: values.location,
      required_attendance: values.required_attendance,
      status: values.status,
      created_by: createdBy,
    })
  }

  const inputClass = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
  const errorClass = 'text-xs text-destructive mt-1'
  const labelClass = 'block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1'

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
      {/* Title */}
      <div>
        <label className={labelClass}>Title *</label>
        <input {...register('title')} className={inputClass} placeholder="e.g. Club AGM" />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>Description</label>
        <textarea
          {...register('description')}
          className={`${inputClass} resize-none`}
          rows={3}
          placeholder="Additional details about the event..."
        />
      </div>

      {/* Date */}
      <div>
        <label className={labelClass}>Date *</label>
        <input {...register('event_date')} type="date" className={inputClass} />
        {errors.event_date && <p className={errorClass}>{errors.event_date.message}</p>}
      </div>

      {/* Time */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Start time</label>
          <input {...register('start_time')} type="time" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>End time</label>
          <input {...register('end_time')} type="time" className={inputClass} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className={labelClass}>Location</label>
        <input {...register('location')} className={inputClass} placeholder="e.g. Bradwell Park Clubhouse" />
      </div>

      {/* Required attendance */}
      <label className="flex items-center gap-3 cursor-pointer select-none">
        <input
          {...register('required_attendance')}
          type="checkbox"
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <span className="text-sm text-foreground">
          Required attendance
          <span className="block text-xs text-muted-foreground font-normal">
            Will be highlighted in the coach portal and coaches will be notified by email.
          </span>
        </span>
      </label>

      {/* Status */}
      <div>
        <label className={labelClass}>Status</label>
        <select {...register('status')} className={inputClass}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {defaultValues ? 'Save changes' : 'Create event'}
        </Button>
      </div>
    </form>
  )
}
