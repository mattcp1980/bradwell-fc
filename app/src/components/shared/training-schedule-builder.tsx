/**
 * Training Schedule Builder
 *
 * Admin can:
 * - Create / rename / delete schedules
 * - Add time slots per day (with a venue/pitch label)
 * - Drag teams from the team list into slot cells (or remove them)
 * - Upload a pitch-layout image
 * - Publish / unpublish the schedule
 *
 * Drag-and-drop uses the native HTML5 drag API (no extra library).
 */

import { useState, useRef } from 'react'
import {
  Plus, Trash2, Image, ChevronDown, ChevronUp,
  CheckCircle, Clock, Pencil, X, Loader2, Copy, Download, Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTeams } from '@/hooks/use-teams'
import {
  useTrainingSchedules,
  useAddTrainingSchedule,
  useUpdateTrainingSchedule,
  useDeleteTrainingSchedule,
  useCloneTrainingSchedule,
  useTrainingSlots,
  useUpsertSlot,
  useDeleteSlot,
  uploadScheduleImage,
} from '@/hooks/use-training-schedule'
import { generateSchedulePdf, generateSchedulePdfBase64 } from '@/lib/generate-schedule-pdf'
import { NotifyModal } from '@/components/shared/notify-modal'
import type { TrainingSchedule, TrainingDay, TrainingSlotWithTeam } from '@/types'

const DAYS: TrainingDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: 'draft' | 'published' }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700">
        <CheckCircle size={10} /> Published
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
      <Clock size={10} /> Draft
    </span>
  )
}

// ---------------------------------------------------------------------------
// Add-slot form (inline, per day)
// ---------------------------------------------------------------------------

function AddSlotRow({
  scheduleId,
  day,
  onDone,
}: {
  scheduleId: string
  day: TrainingDay
  onDone: () => void
}) {
  const upsert = useUpsertSlot()
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('19:00')
  const [venue, setVenue] = useState('')

  function handleAdd() {
    upsert.mutate(
      { schedule_id: scheduleId, day, start_time: startTime, end_time: endTime, venue, team_id: null },
      { onSuccess: onDone }
    )
  }

  return (
    <tr className="bg-primary/5">
      <td className="px-3 py-2 text-xs text-muted-foreground">{day}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs w-24"
          />
          <span className="text-xs text-muted-foreground">–</span>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs w-24"
          />
        </div>
      </td>
      <td
        className="px-3 py-2"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="e.g. Bradwell Park, Pitch 1 *"
          className={`rounded border bg-background px-2 py-1 text-xs w-full ${venue.trim() ? 'border-border' : 'border-destructive/60'}`}
        />
      </td>
      <td className="px-3 py-2 text-muted-foreground text-xs italic">Drag a team in</td>
      <td className="px-3 py-2">
        <div className="flex gap-1">
          <Button size="sm" className="h-7 text-xs gap-1" onClick={handleAdd} disabled={upsert.isPending || !venue.trim()}>
            {upsert.isPending ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />}
            Add
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={onDone}>Cancel</Button>
        </div>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Single slot row (with drag-drop target for team)
// ---------------------------------------------------------------------------

function SlotRow({ slot }: { slot: TrainingSlotWithTeam }) {
  const upsert = useUpsertSlot()
  const deleteSlot = useDeleteSlot()
  const [dragOver, setDragOver] = useState(false)
  const [editingVenue, setEditingVenue] = useState(false)
  const [venueDraft, setVenueDraft] = useState(slot.venue)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const teamId = e.dataTransfer.getData('text/plain')
    upsert.mutate({
      id: slot.id,
      schedule_id: slot.schedule_id,
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      venue: slot.venue,
      team_id: teamId || null,
    })
  }

  function handleRemoveTeam() {
    upsert.mutate({
      id: slot.id,
      schedule_id: slot.schedule_id,
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      venue: slot.venue,
      team_id: null,
    })
  }

  function handleDelete() {
    deleteSlot.mutate({ id: slot.id, schedule_id: slot.schedule_id })
  }

  function saveVenue() {
    const trimmed = venueDraft.trim()
    if (trimmed !== slot.venue) {
      upsert.mutate({
        id: slot.id,
        schedule_id: slot.schedule_id,
        day: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
        venue: trimmed,
        team_id: slot.team_id,
      })
    }
    setEditingVenue(false)
  }

  return (
    <tr className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-3 py-2 text-xs text-muted-foreground" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}>{slot.day}</td>
      <td className="px-3 py-2 text-xs font-mono text-foreground" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}>
        {slot.start_time} – {slot.end_time}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground" onDragOver={(e) => e.preventDefault()} onDrop={(e) => e.preventDefault()}>
        {editingVenue ? (
          <input
            autoFocus
            type="text"
            value={venueDraft}
            onChange={(e) => setVenueDraft(e.target.value)}
            onBlur={saveVenue}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveVenue()
              if (e.key === 'Escape') { setVenueDraft(slot.venue); setEditingVenue(false) }
            }}
            className="rounded border border-primary px-2 py-0.5 text-xs w-full focus:outline-none"
          />
        ) : (
          <button
            onClick={() => { setVenueDraft(slot.venue); setEditingVenue(true) }}
            className="text-left hover:text-foreground transition-colors group flex items-center gap-1"
            title="Click to edit venue"
          >
            {slot.venue || <span className="italic text-muted-foreground/40">—</span>}
            <Pencil size={10} className="opacity-0 group-hover:opacity-50 transition-opacity shrink-0" />
          </button>
        )}
      </td>
      <td
        className={`px-3 py-2 transition-colors ${dragOver ? 'bg-primary/10' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {slot.team ? (
          <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-medium rounded px-2 py-0.5">
            {slot.team.name}
            <button
              onClick={handleRemoveTeam}
              className="text-primary/60 hover:text-primary ml-0.5"
              title="Remove team"
            >
              <X size={10} />
            </button>
          </span>
        ) : (
          <span className={`text-xs italic ${dragOver ? 'text-primary' : 'text-muted-foreground/50'}`}>
            {dragOver ? 'Drop team here' : 'Drag a team here'}
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={handleDelete}
          disabled={deleteSlot.isPending}
        >
          <Trash2 size={12} />
        </Button>
      </td>
    </tr>
  )
}

// ---------------------------------------------------------------------------
// Schedule editor (expanded panel for a single schedule)
// ---------------------------------------------------------------------------

function ScheduleEditor({ schedule }: { schedule: TrainingSchedule }) {
  const { data: slots = [], isLoading: slotsLoading } = useTrainingSlots(schedule.id)
  const { data: allTeams = [] } = useTeams()
  const updateSchedule = useUpdateTrainingSchedule()
  const [addingDay, setAddingDay] = useState<TrainingDay | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Group slots by day for rendering
  const slotsByDay = DAYS.reduce<Record<string, TrainingSlotWithTeam[]>>((acc, day) => {
    acc[day] = slots.filter((s) => s.day === day)
    return acc
  }, {})

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const { pitch_image_url, pitch_image_path } = await uploadScheduleImage(file, schedule.id)
      updateSchedule.mutate({ id: schedule.id, pitch_image_url, pitch_image_path })
    } finally {
      setUploadingImage(false)
    }
  }

  function handleRemoveImage() {
    updateSchedule.mutate({ id: schedule.id, pitch_image_url: null, pitch_image_path: null })
  }

  function togglePublish() {
    updateSchedule.mutate({
      id: schedule.id,
      status: schedule.status === 'published' ? 'draft' : 'published',
    })
  }

  return (
    <div className="border-t border-border">
      {/* Toolbar */}
      <div className="px-6 py-3 flex flex-wrap items-center gap-3 bg-muted/20 border-b border-border">
        <Button
          size="sm"
          variant={schedule.status === 'published' ? 'outline' : 'default'}
          className="h-8 text-xs gap-1.5"
          onClick={togglePublish}
          disabled={updateSchedule.isPending}
        >
          {schedule.status === 'published' ? 'Unpublish' : 'Publish'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1.5"
          onClick={() => generateSchedulePdf(schedule.name, slots)}
          disabled={slots.length === 0}
        >
          <Download size={12} /> Download PDF
        </Button>
        <div className="flex items-center gap-2 ml-auto">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            onClick={() => fileRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
            {schedule.pitch_image_url ? 'Replace image' : 'Attach pitch image'}
          </Button>
          {schedule.pitch_image_url && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs text-destructive hover:text-destructive gap-1"
              onClick={handleRemoveImage}
            >
              <X size={12} /> Remove image
            </Button>
          )}
        </div>
      </div>

      {/* Pitch image preview */}
      {schedule.pitch_image_url && (
        <div className="px-6 py-4 border-b border-border">
          <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">Pitch Layout</p>
          <img
            src={schedule.pitch_image_url}
            alt="Pitch layout"
            className="max-h-64 rounded-lg border border-border object-contain"
          />
        </div>
      )}

      {/* Team palette — drag from here */}
      <div className="px-6 py-4 border-b border-border">
        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-2">Teams — drag into slots</p>
        <div className="flex flex-wrap gap-2">
          {allTeams.map((team) => (
            <div
              key={team.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', team.id)}
              className="bg-card border border-border text-xs font-medium text-foreground rounded px-2.5 py-1 cursor-grab active:cursor-grabbing select-none hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              {team.name}
            </div>
          ))}
          {allTeams.length === 0 && (
            <p className="text-xs text-muted-foreground italic">No teams yet — add teams in the Teams section first.</p>
          )}
        </div>
      </div>

      {/* Schedule grid */}
      {slotsLoading ? (
        <p className="px-6 py-6 text-sm text-muted-foreground text-center">Loading slots…</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-3 py-2 text-left text-xs font-heading uppercase tracking-wider text-muted-foreground w-28">Day</th>
                <th className="px-3 py-2 text-left text-xs font-heading uppercase tracking-wider text-muted-foreground w-40">Time</th>
                <th className="px-3 py-2 text-left text-xs font-heading uppercase tracking-wider text-muted-foreground">Venue / Pitch</th>
                <th className="px-3 py-2 text-left text-xs font-heading uppercase tracking-wider text-muted-foreground">Team</th>
                <th className="px-3 py-2 w-10" />
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const daySlots = slotsByDay[day]
                if (daySlots.length === 0 && addingDay !== day) {
                  return (
                    <tr key={day} className="border-b border-border/40">
                      <td className="px-3 py-2 text-xs text-muted-foreground">{day}</td>
                      <td colSpan={3} className="px-3 py-2 text-xs text-muted-foreground/40 italic">No sessions</td>
                      <td className="px-3 py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-primary"
                          onClick={() => setAddingDay(day)}
                          title="Add session"
                        >
                          <Plus size={12} />
                        </Button>
                      </td>
                    </tr>
                  )
                }

                return [
                  ...daySlots.map((slot) => (
                    <SlotRow key={slot.id} slot={slot} />
                  )),
                  // "Add session" row appended after last slot for this day
                  addingDay === day ? (
                    <AddSlotRow
                      key={`add-${day}`}
                      scheduleId={schedule.id}
                      day={day}
                      onDone={() => setAddingDay(null)}
                    />
                  ) : (
                    <tr key={`add-btn-${day}`} className="border-b border-border/20">
                      <td colSpan={5} className="px-3 py-1">
                        <button
                          onClick={() => setAddingDay(day)}
                          className="text-xs text-muted-foreground/50 hover:text-primary flex items-center gap-1 transition-colors"
                        >
                          <Plus size={10} /> Add {day} session
                        </button>
                      </td>
                    </tr>
                  ),
                ]
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Schedule notifier — fetches slots then opens NotifyModal with PDF attached
// ---------------------------------------------------------------------------

function ScheduleNotifier({
  schedule,
  onClose,
}: {
  schedule: TrainingSchedule
  onClose: () => void
}) {
  const { data: slots = [] } = useTrainingSlots(schedule.id)
  const pdfBase64 = generateSchedulePdfBase64(schedule.name, slots)
  const pdfFilename = `${schedule.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.pdf`

  return (
    <NotifyModal
      open
      onClose={onClose}
      contentType="schedule"
      contentId={schedule.id}
      contentTitle={`Training Schedule: ${schedule.name}`}
      pdfBase64={pdfBase64}
      pdfFilename={pdfFilename}
    />
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function TrainingScheduleBuilder() {
  const { data: schedules = [], isLoading } = useTrainingSchedules()
  const addSchedule = useAddTrainingSchedule()
  const updateSchedule = useUpdateTrainingSchedule()
  const deleteSchedule = useDeleteTrainingSchedule()
  const cloneSchedule = useCloneTrainingSchedule()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const [notifySchedule, setNotifySchedule] = useState<TrainingSchedule | null>(null)

  function handleCreate() {
    const name = newName.trim() || 'Training Schedule'
    addSchedule.mutate(name, {
      onSuccess: (schedule) => {
        setExpandedId(schedule.id)
        setNewName('')
        setAddingNew(false)
      },
    })
  }

  function handleRename(id: string) {
    if (renameDraft.trim()) {
      updateSchedule.mutate({ id, name: renameDraft.trim() })
    }
    setRenamingId(null)
  }

  function handleDelete(schedule: TrainingSchedule) {
    if (!confirm(`Delete "${schedule.name}"? This cannot be undone.`)) return
    deleteSchedule.mutate(schedule, {
      onSuccess: () => {
        if (expandedId === schedule.id) setExpandedId(null)
      },
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Build the training timetable. Publish to make it visible on the site.
        </p>
        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => setAddingNew(true)}>
          <Plus size={12} /> New Schedule
        </Button>
      </div>

      {addingNew && (
        <div className="bg-card border border-primary/40 rounded-lg px-5 py-4 flex items-center gap-3">
          <input
            autoFocus
            type="text"
            placeholder="Schedule name e.g. Summer Training 2026"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            className="flex-1 rounded border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button size="sm" className="h-8 text-xs" onClick={handleCreate} disabled={addSchedule.isPending}>
            {addSchedule.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Create'}
          </Button>
          <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setAddingNew(false)}>Cancel</Button>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground text-center py-8">Loading…</p>
      )}

      {!isLoading && schedules.length === 0 && !addingNew && (
        <div className="bg-card border border-border rounded-lg px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">No schedules yet. Click "New Schedule" to get started.</p>
        </div>
      )}

      {notifySchedule && (
        <ScheduleNotifier schedule={notifySchedule} onClose={() => setNotifySchedule(null)} />
      )}

      {schedules.map((schedule) => {
        const isExpanded = expandedId === schedule.id
        const isRenaming = renamingId === schedule.id

        return (
          <div key={schedule.id} className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Header row */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button
                onClick={() => setExpandedId(isExpanded ? null : schedule.id)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
              >
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0" />}
                {isRenaming ? (
                  <input
                    autoFocus
                    type="text"
                    value={renameDraft}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setRenameDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(schedule.id)
                      if (e.key === 'Escape') setRenamingId(null)
                    }}
                    onBlur={() => handleRename(schedule.id)}
                    className="rounded border border-primary px-2 py-0.5 text-sm font-semibold focus:outline-none"
                  />
                ) : (
                  <span className="font-semibold text-sm text-foreground truncate">{schedule.name}</span>
                )}
                <StatusBadge status={schedule.status} />
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => cloneSchedule.mutate(schedule, { onSuccess: (s) => setExpandedId(s.id) })}
                  disabled={cloneSchedule.isPending}
                  title="Duplicate"
                >
                  {cloneSchedule.isPending ? <Loader2 size={13} className="animate-spin" /> : <Copy size={13} />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setNotifySchedule(schedule)}
                  title="Send notification"
                >
                  <Bell size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => { setRenamingId(schedule.id); setRenameDraft(schedule.name) }}
                  title="Rename"
                >
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(schedule)}
                  title="Delete"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>

            {isExpanded && <ScheduleEditor schedule={schedule} />}
          </div>
        )
      })}
    </div>
  )
}
