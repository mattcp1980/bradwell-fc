import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TrainingSchedule, TrainingSlot, TrainingSlotWithTeam } from '@/types'

const SCHEDULE_KEY = ['training_schedules']
const SLOTS_KEY = ['training_slots']

// ---------------------------------------------------------------------------
// Schedule queries
// ---------------------------------------------------------------------------

/** All schedules (admin use), newest first. */
export function useTrainingSchedules() {
  return useQuery({
    queryKey: SCHEDULE_KEY,
    queryFn: async (): Promise<TrainingSchedule[]> => {
      const { data, error } = await supabase
        .from('training_schedules')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) return []
      return (data ?? []) as TrainingSchedule[]
    },
  })
}

/** The single currently published schedule (for public pages). */
export function usePublishedSchedule() {
  return useQuery({
    queryKey: [...SCHEDULE_KEY, 'published'],
    queryFn: async (): Promise<TrainingSchedule | null> => {
      const { data, error } = await supabase
        .from('training_schedules')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) return null
      return (data as TrainingSchedule | null)
    },
  })
}

// ---------------------------------------------------------------------------
// Slots query
// ---------------------------------------------------------------------------

/** Slots for a given schedule, with team name joined. */
export function useTrainingSlots(scheduleId: string | null) {
  return useQuery({
    queryKey: [...SLOTS_KEY, scheduleId],
    enabled: !!scheduleId,
    queryFn: async (): Promise<TrainingSlotWithTeam[]> => {
      if (!scheduleId) return []
      const { data, error } = await supabase
        .from('training_slots')
        .select('*, team:teams(id, name)')
        .eq('schedule_id', scheduleId)
        .order('day')
        .order('start_time')
      if (error) return []
      return (data ?? []) as unknown as TrainingSlotWithTeam[]
    },
  })
}

// ---------------------------------------------------------------------------
// Storage helper
// ---------------------------------------------------------------------------

export async function uploadScheduleImage(
  file: File,
  scheduleId: string
): Promise<{ pitch_image_url: string; pitch_image_path: string }> {
  const pitch_image_path = `${scheduleId}/${file.name}`

  const { error } = await supabase.storage
    .from('schedule-images')
    .upload(pitch_image_path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage
    .from('schedule-images')
    .getPublicUrl(pitch_image_path)

  return { pitch_image_url: data.publicUrl, pitch_image_path }
}

// ---------------------------------------------------------------------------
// Schedule mutations
// ---------------------------------------------------------------------------

export function useAddTrainingSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name: string): Promise<TrainingSchedule> => {
      const { data, error } = await supabase
        .from('training_schedules')
        .insert({ name, status: 'draft' })
        .select()
        .single()
      if (error) throw error
      return data as TrainingSchedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
  })
}

export function useUpdateTrainingSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<TrainingSchedule> & { id: string }): Promise<void> => {
      const { error } = await supabase
        .from('training_schedules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
    },
  })
}

export function useCloneTrainingSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (source: TrainingSchedule): Promise<TrainingSchedule> => {
      // 1. Create new draft schedule
      const { data: newSchedule, error: scheduleError } = await supabase
        .from('training_schedules')
        .insert({ name: `Copy of ${source.name}`, status: 'draft' })
        .select()
        .single()
      if (scheduleError) throw scheduleError

      // 2. Fetch source slots
      const { data: sourceSlots, error: slotsError } = await supabase
        .from('training_slots')
        .select('day, start_time, end_time, venue, team_id')
        .eq('schedule_id', source.id)
      if (slotsError) throw slotsError

      // 3. Bulk-insert cloned slots
      if (sourceSlots && sourceSlots.length > 0) {
        const { error: insertError } = await supabase
          .from('training_slots')
          .insert(sourceSlots.map((s) => ({ ...s, schedule_id: (newSchedule as TrainingSchedule).id })))
        if (insertError) throw insertError
      }

      return newSchedule as TrainingSchedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY })
    },
  })
}

export function useDeleteTrainingSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (schedule: TrainingSchedule): Promise<void> => {
      const { error } = await supabase
        .from('training_schedules')
        .delete()
        .eq('id', schedule.id)
      if (error) throw error

      // Best-effort image cleanup
      if (schedule.pitch_image_path) {
        await supabase.storage
          .from('schedule-images')
          .remove([schedule.pitch_image_path])
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY })
      queryClient.invalidateQueries({ queryKey: SLOTS_KEY })
    },
  })
}

// ---------------------------------------------------------------------------
// Slot mutations
// ---------------------------------------------------------------------------

export function useUpsertSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (
      slot: Omit<TrainingSlot, 'id' | 'created_at'> & { id?: string }
    ): Promise<void> => {
      const { error } = await supabase
        .from('training_slots')
        .upsert(slot, { onConflict: 'id' })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...SLOTS_KEY, vars.schedule_id] })
    },
  })
}

export function useDeleteSlot() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, schedule_id: _schedule_id }: { id: string; schedule_id: string }): Promise<void> => {
      const { error } = await supabase
        .from('training_slots')
        .delete()
        .eq('id', id)
      if (error) throw error
      return
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: [...SLOTS_KEY, vars.schedule_id] })
    },
  })
}
