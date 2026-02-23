import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
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
import type { ClubOfficial, ClubOfficialInput } from '@/types'

const officialSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  mobile: z.string().min(7, 'Enter a valid mobile number'),
  role: z.enum(['admin', 'coach']),
  teams: z.array(z.string()).min(1, 'Select at least one team'),
  is_primary_contact: z.boolean(),
})

type OfficialFormValues = z.infer<typeof officialSchema>

interface OfficialFormProps {
  defaultValues?: ClubOfficial
  onSubmit: (data: ClubOfficialInput) => void
  onCancel: () => void
  isPending: boolean
  teams: string[]
}

export function OfficialForm({ defaultValues, onSubmit, onCancel, isPending, teams }: OfficialFormProps) {
  const form = useForm<OfficialFormValues>({
    resolver: zodResolver(officialSchema),
    defaultValues: {
      full_name: defaultValues?.full_name ?? '',
      email: defaultValues?.email ?? '',
      mobile: defaultValues?.mobile ?? '',
      role: defaultValues?.role ?? 'coach',
      teams: defaultValues?.teams ?? [],
      is_primary_contact: defaultValues?.is_primary_contact ?? false,
    },
  })

  function handleSubmit(values: OfficialFormValues) {
    onSubmit(values)
  }

  const selectedTeams = form.watch('teams')

  function toggleTeam(team: string) {
    const current = form.getValues('teams')
    const updated = current.includes(team)
      ? current.filter((t) => t !== team)
      : [...current, team]
    form.setValue('teams', updated, { shouldValidate: true })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John Smith" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="e.g. john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile number</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="e.g. 07700 900000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teams"
          render={() => (
            <FormItem>
              <FormLabel>Teams</FormLabel>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {teams.length === 0 && (
                  <p className="col-span-2 text-xs text-muted-foreground">
                    No teams set up yet. Add teams in the Teams section first.
                  </p>
                )}
                {teams.map((team) => (
                  <label
                    key={team}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Checkbox
                      checked={selectedTeams.includes(team)}
                      onCheckedChange={() => toggleTeam(team)}
                    />
                    {team}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_primary_contact"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3 rounded-md border border-border p-3">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="primary-contact"
                  />
                </FormControl>
                <div>
                  <Label htmlFor="primary-contact" className="cursor-pointer font-medium">
                    Primary contact
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Only one primary contact is allowed per team. Setting this will remove the flag from any other official on the same team.
                  </p>
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : defaultValues ? 'Save changes' : 'Add official'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
