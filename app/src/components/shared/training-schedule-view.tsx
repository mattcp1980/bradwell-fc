/**
 * Training Schedule View — read-only display of the published schedule.
 *
 * Props:
 *   filterTeamId  — if set, highlights that team's slots and dims others
 *   teamDropdown  — if true, shows a "Filter by team" dropdown above the grid
 *   myTeamIds     — if set, only rows whose team_id is in this set are shown
 *                   (used in the coach portal to show only the coach's teams)
 */

import { useState } from 'react'
import { Download } from 'lucide-react'
import { usePublishedSchedule, useTrainingSlots } from '@/hooks/use-training-schedule'
import { generateSchedulePdf } from '@/lib/generate-schedule-pdf'
import type { TrainingDay, TrainingSlotWithTeam } from '@/types'

const DAYS: TrainingDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

type Props = {
  filterTeamId?: string | null
  teamDropdown?: boolean
  myTeamIds?: string[]
  hideUnassigned?: boolean
}

export function TrainingScheduleView({ filterTeamId: externalFilter, teamDropdown = false, myTeamIds, hideUnassigned = false }: Props) {
  const { data: schedule, isLoading: scheduleLoading } = usePublishedSchedule()
  const { data: allSlots = [], isLoading: slotsLoading } = useTrainingSlots(schedule?.id ?? null)

  const [selectedTeamId, setSelectedTeamId] = useState<string>('')

  const isLoading = scheduleLoading || slotsLoading

  // Determine the active filter
  const activeFilter = externalFilter !== undefined ? externalFilter : (selectedTeamId || null)

  // If myTeamIds is provided, narrow down to only those slots
  // Always exclude unassigned slots when hideUnassigned is set
  const visibleSlots = allSlots
    .filter((s) => !hideUnassigned || s.team_id !== null)
    .filter((s) => !myTeamIds || (s.team_id && myTeamIds.includes(s.team_id)))

  // Collect unique teams from visible slots for the dropdown
  const teamsInSchedule = Array.from(
    new Map(
      visibleSlots
        .filter((s) => s.team)
        .map((s) => [s.team!.id, s.team!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name))

  if (isLoading) {
    return (
      <div className="space-y-2 py-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-10 bg-muted rounded animate-pulse" />
        ))}
      </div>
    )
  }

  if (!schedule) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No training schedule published yet.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Schedule name + actions */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground">
          {schedule.name}
        </p>
        <div className="flex items-center gap-3">
          {schedule.pitch_image_url && (
            <a
              href={schedule.pitch_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline-offset-2 hover:underline"
            >
              View pitch layout →
            </a>
          )}
          <button
            type="button"
            onClick={() => generateSchedulePdf(schedule.name, visibleSlots)}
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
          >
            <Download size={13} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Team filter dropdown */}
      {teamDropdown && teamsInSchedule.length > 0 && (
        <div className="flex items-center gap-2">
          <label htmlFor="team-filter" className="text-xs text-muted-foreground shrink-0">
            Filter by team:
          </label>
          <select
            id="team-filter"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="rounded border border-border bg-background px-2 py-1 text-xs flex-1 max-w-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All teams</option>
            {teamsInSchedule.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Schedule grid */}
      {DAYS.map((day) => {
        const daySlots = visibleSlots.filter((s) => s.day === day)
        if (daySlots.length === 0) return null

        return (
          <div key={day}>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground mb-1.5">{day}</p>
            <div className="flex flex-col gap-1">
              {daySlots.map((slot) => (
                <SlotCard key={slot.id} slot={slot} highlight={activeFilter ? slot.team_id === activeFilter : false} dimmed={activeFilter ? slot.team_id !== activeFilter : false} />
              ))}
            </div>
          </div>
        )
      })}

      {visibleSlots.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">No sessions scheduled yet.</p>
      )}
    </div>
  )
}

function SlotCard({ slot, highlight, dimmed }: { slot: TrainingSlotWithTeam; highlight: boolean; dimmed: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 border transition-colors ${
        highlight
          ? 'bg-primary/10 border-primary/40'
          : dimmed
          ? 'bg-muted/20 border-border opacity-50'
          : 'bg-card border-border'
      }`}
    >
      <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">
        {slot.start_time}–{slot.end_time}
      </span>
      <span className={`text-sm font-semibold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {slot.team?.name ?? <span className="italic text-muted-foreground font-normal">Unassigned</span>}
      </span>
      {slot.venue && (
        <span className="text-xs text-muted-foreground ml-auto shrink-0">{slot.venue}</span>
      )}
    </div>
  )
}
