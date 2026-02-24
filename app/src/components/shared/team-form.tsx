import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useOfficials } from '@/hooks/use-officials'
import type { TeamInput, TeamWithContact } from '@/types'

const AGE_GROUPS = [
  'U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12',
  'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'Open Age',
] as const

const teamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters'),
  age_group: z.string().min(1, 'Select an age group'),
  primary_contact_id: z.string().nullable(),
})

type TeamFormValues = z.infer<typeof teamSchema>

interface TeamFormProps {
  defaultValues?: TeamWithContact
  onSubmit: (data: TeamInput) => void
  onCancel: () => void
  isPending: boolean
}

export function TeamForm({ defaultValues, onSubmit, onCancel, isPending }: TeamFormProps) {
  const { data: officials = [] } = useOfficials()

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      age_group: defaultValues?.age_group ?? '',
      primary_contact_id: defaultValues?.primary_contact_id ?? null,
    },
  })

  function handleSubmit(values: TeamFormValues) {
    onSubmit({
      name: values.name,
      age_group: values.age_group,
      primary_contact_id: values.primary_contact_id || null,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. U10 Reds" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="age_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age group</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {AGE_GROUPS.map((ag) => (
                    <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primary_contact_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Primary contact</FormLabel>
              <Select
                onValueChange={(val) => field.onChange(val === 'none' ? null : val)}
                defaultValue={field.value ?? 'none'}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an official" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {officials.map((official) => (
                    <SelectItem key={official.id} value={official.id}>
                      {official.full_name} ({official.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Setting a primary contact will flag that official on their profile.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : defaultValues ? 'Save changes' : 'Add team'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
