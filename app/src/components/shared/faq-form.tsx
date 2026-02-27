import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { Faq, FaqInput } from '@/types'

const schema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
  audience: z.enum(['coaches', 'parents']),
  display_order: z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

type Props = {
  defaultValues?: Faq
  /** When true, show the Audience and Display Order fields (admin use). */
  showAudienceAndOrder?: boolean
  onSubmit: (input: FaqInput) => void
  onCancel: () => void
  isPending: boolean
}

export function FaqForm({
  defaultValues,
  showAudienceAndOrder = true,
  onSubmit,
  onCancel,
  isPending,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as import('react-hook-form').Resolver<FormValues>,
    defaultValues: defaultValues
      ? {
          question: defaultValues.question,
          answer: defaultValues.answer,
          audience: defaultValues.audience,
          display_order: defaultValues.display_order,
        }
      : {
          question: '',
          answer: '',
          audience: 'coaches',
          display_order: 0,
        },
  })

  function onValid(values: FormValues) {
    onSubmit({
      question: values.question,
      answer: values.answer,
      audience: values.audience,
      display_order: values.display_order,
    })
  }

  const inputClass = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30'
  const errorClass = 'text-xs text-destructive mt-1'
  const labelClass = 'block text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1'

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-4">
      {/* Question */}
      <div>
        <label className={labelClass}>Question *</label>
        <Textarea
          {...register('question')}
          rows={2}
          placeholder="e.g. What kit do players need?"
        />
        {errors.question && <p className={errorClass}>{errors.question.message}</p>}
      </div>

      {/* Answer */}
      <div>
        <label className={labelClass}>Answer *</label>
        <Textarea
          {...register('answer')}
          rows={4}
          placeholder="Type the answer here..."
        />
        {errors.answer && <p className={errorClass}>{errors.answer.message}</p>}
      </div>

      {showAudienceAndOrder && (
        <>
          {/* Audience */}
          <div>
            <label className={labelClass}>Audience</label>
            <select {...register('audience')} className={inputClass}>
              <option value="coaches">Coaches</option>
              <option value="parents">Parents</option>
            </select>
            {errors.audience && <p className={errorClass}>{errors.audience.message}</p>}
          </div>

          {/* Display order */}
          <div>
            <label className={labelClass}>Display order</label>
            <input
              {...register('display_order')}
              type="number"
              min={0}
              className={inputClass}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Lower numbers appear first.
            </p>
            {errors.display_order && <p className={errorClass}>{errors.display_order.message}</p>}
          </div>
        </>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending} className="gap-1.5">
          {isPending && <Loader2 size={14} className="animate-spin" />}
          {defaultValues ? 'Save changes' : 'Add FAQ'}
        </Button>
      </div>
    </form>
  )
}
