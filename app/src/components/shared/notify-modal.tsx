/**
 * NotifyModal
 *
 * Allows admins to send an email notification about a piece of content
 * (news article, event, document, or training schedule) to a configurable
 * set of recipients drawn from club_officials.
 *
 * For training schedules, the caller must supply pdfBase64 + pdfFilename
 * (generated client-side) which the edge function attaches to the email.
 */

import { useState, useMemo } from 'react'
import { Send, Loader2, Slack } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useOfficials } from '@/hooks/use-officials'
import { useTeams } from '@/hooks/use-teams'
import { useSendNotification } from '@/hooks/use-notifications'
import type { NotificationPayload, NotificationScope } from '@/types'

type ScopeType = NotificationScope['type']

type Props = {
  open: boolean
  onClose: () => void
  contentType: 'news' | 'event' | 'document' | 'schedule'
  contentId: string
  contentTitle: string
  contentSummary?: string
  contentUrl?: string
  /** Required when contentType === 'schedule' */
  pdfBase64?: string
  pdfFilename?: string
}

export function NotifyModal({
  open,
  onClose,
  contentType,
  contentId,
  contentTitle,
  contentSummary,
  contentUrl,
  pdfBase64,
  pdfFilename,
}: Props) {
  const { data: officials = [] } = useOfficials()
  const { data: teams = [] } = useTeams()
  const send = useSendNotification()

  const [subject, setSubject] = useState(contentTitle)
  const [postToSlack, setPostToSlack] = useState(false)
  const [scopeType, setScopeType] = useState<ScopeType>('everyone')
  const [teamName, setTeamName] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Distinct age groups from the teams list
  const ageGroups = useMemo(
    () => [...new Set(teams.map((t) => t.age_group).filter(Boolean))].sort(),
    [teams]
  )

  // Compute recipient preview count
  const recipientCount = useMemo(() => {
    if (scopeType === 'everyone') return officials.length
    if (scopeType === 'admins') return officials.filter((o) => o.role === 'admin').length
    if (scopeType === 'coaches') return officials.filter((o) => o.role === 'coach').length
    if (scopeType === 'team' && teamName) {
      return officials.filter((o) => o.teams.includes(teamName)).length
    }
    if (scopeType === 'age_group' && ageGroup) {
      const teamNames = teams.filter((t) => t.age_group === ageGroup).map((t) => t.name)
      return officials.filter((o) => o.teams.some((t) => teamNames.includes(t))).length
    }
    if (scopeType === 'team_primary_contacts') return officials.filter((o) => o.is_primary_contact).length
    if (scopeType === 'individuals') return selectedIds.length
    return 0
  }, [scopeType, teamName, ageGroup, selectedIds, officials, teams])

  function buildScope(): NotificationScope {
    if (scopeType === 'team') return { type: 'team', teamName }
    if (scopeType === 'age_group') return { type: 'age_group', ageGroup }
    if (scopeType === 'individuals') return { type: 'individuals', officialIds: selectedIds }
    return { type: scopeType } as NotificationScope
  }

  async function handleSend() {
    if (!subject.trim()) return
    if (recipientCount === 0) {
      toast.error('No recipients selected')
      return
    }

    const payload: NotificationPayload = {
      subject: subject.trim(),
      contentType,
      contentId,
      contentTitle,
      contentSummary,
      contentUrl,
      scope: buildScope(),
      pdfBase64,
      pdfFilename,
      postToSlack,
    }

    send.mutate(payload, {
      onSuccess: (data) => {
        const emailPart = `Sent to ${data.sent} ${data.sent === 1 ? 'person' : 'people'}`
        const slackPart = postToSlack
          ? data.slackSent ? ' · Posted to Slack' : ' · Slack post failed'
          : ''
        if (postToSlack && !data.slackSent) {
          toast.warning(`${emailPart}${slackPart}`)
        } else {
          toast.success(`${emailPart}${slackPart}`)
        }
        onClose()
      },
      onError: (err) => {
        toast.error(`Failed to send: ${err instanceof Error ? err.message : 'Unknown error'}`)
      },
    })
  }

  function toggleIndividual(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { onClose() } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading uppercase tracking-wide text-base">
            Send Notification
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Content summary */}
          <div className="rounded-md bg-muted/40 border border-border px-3 py-2.5 text-sm">
            <p className="font-medium text-foreground truncate">{contentTitle}</p>
            {contentSummary && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{contentSummary}</p>
            )}
            {contentType === 'schedule' && (
              <p className="text-xs text-primary mt-1">Full schedule will be provided as PDF</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
              Email subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Recipients */}
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
              Send to
            </label>
            <select
              value={scopeType}
              onChange={(e) => {
                setScopeType(e.target.value as ScopeType)
                setSelectedIds([])
              }}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="everyone">Everyone (all officials)</option>
              <option value="admins">All admins</option>
              <option value="coaches">All coaches</option>
              <option value="team_primary_contacts">Team primary contacts</option>
              <option value="team">Coaches — specific team</option>
              <option value="age_group">Coaches — specific age group</option>
              <option value="individuals">Specific individuals</option>
            </select>
          </div>

          {/* Team picker */}
          {scopeType === 'team' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Team
              </label>
              <select
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Age group picker */}
          {scopeType === 'age_group' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Age group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select an age group…</option>
                {ageGroups.map((ag) => (
                  <option key={ag} value={ag}>{ag}</option>
                ))}
              </select>
            </div>
          )}

          {/* Individuals picker */}
          {scopeType === 'individuals' && (
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">
                Select individuals
              </label>
              <div className="max-h-44 overflow-y-auto rounded-md border border-border divide-y divide-border">
                {officials.map((o) => (
                  <label
                    key={o.id}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(o.id)}
                      onChange={() => toggleIndividual(o.id)}
                      className="rounded border-border"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{o.full_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{o.role}</p>
                    </div>
                  </label>
                ))}
                {officials.length === 0 && (
                  <p className="px-3 py-4 text-xs text-muted-foreground text-center">
                    No officials found
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recipient preview */}
          <p className="text-xs text-muted-foreground">
            {recipientCount === 0
              ? 'No recipients selected'
              : `${recipientCount} ${recipientCount === 1 ? 'person' : 'people'} will receive this email`}
          </p>

          {/* Slack toggle */}
          <div className="rounded-md border border-border px-3 py-2.5 space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={postToSlack}
                onChange={(e) => setPostToSlack(e.target.checked)}
                className="rounded border-border"
              />
              <Slack size={14} className="text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Also post to Slack</span>
            </label>
            {postToSlack && (
              <div className="rounded bg-muted/50 px-2.5 py-2 text-xs text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">Slack preview</p>
                <p>{slackLabelFor(contentType)}</p>
                <p className="font-medium text-foreground truncate">{contentTitle}</p>
                {contentSummary && <p className="line-clamp-2">{contentSummary}</p>}
                {(contentUrl || contentType === 'schedule') && (
                  <p className="italic">
                    {contentType === 'schedule'
                      ? 'Button: Download Training Schedule (PDF)'
                      : `Button: View ${contentLabelFor(contentType)}`}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose} disabled={send.isPending}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSend}
              disabled={send.isPending || recipientCount === 0 || !subject.trim()}
              className="gap-1.5"
            >
              {send.isPending
                ? <><Loader2 size={13} className="animate-spin" /> Sending…</>
                : <><Send size={13} /> Send</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function slackLabelFor(type: 'news' | 'event' | 'document' | 'schedule'): string {
  return {
    news:     '📰  Club News',
    event:    '📅  Club Event',
    document: '📄  Club Document',
    schedule: '🏋️  Training Schedule',
  }[type]
}

function contentLabelFor(type: 'news' | 'event' | 'document' | 'schedule'): string {
  return {
    news:     'Club News',
    event:    'Club Event',
    document: 'Club Document',
    schedule: 'Training Schedule',
  }[type]
}
