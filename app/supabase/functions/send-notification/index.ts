/**
 * send-notification Edge Function
 *
 * Receives a NotificationPayload from the admin UI, resolves recipient emails
 * from club_officials based on the scope, and sends branded HTML emails via
 * the Resend API. For training schedule notifications the PDF is attached.
 *
 * Required secrets:
 *   RESEND_API_KEY   — set via: supabase secrets set RESEND_API_KEY=re_...
 *
 * Optional secrets (fall back to defaults):
 *   FROM_EMAIL       — sender address, default: derived from contact_email in site_content
 *   SITE_URL         — public site URL, default: https://bradwellfc.online
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://bradwellfc.online'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ---------------------------------------------------------------------------
// Types (mirrored from frontend — edge functions can't import from src/)
// ---------------------------------------------------------------------------

type ScopeType = 'everyone' | 'admins' | 'coaches' | 'team' | 'age_group' | 'individuals'

interface NotificationScope {
  type: ScopeType
  teamName?: string
  ageGroup?: string
  officialIds?: string[]
}

interface NotificationPayload {
  subject: string
  contentType: 'news' | 'event' | 'document' | 'schedule'
  contentId: string
  contentTitle: string
  contentSummary?: string
  contentUrl?: string
  scope: NotificationScope
  pdfBase64?: string
  pdfFilename?: string
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return json({ error: 'RESEND_API_KEY not configured' }, 500)
  }

  // Authenticate caller via JWT
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return json({ error: 'Missing authorization' }, 401)
  }
  const token = authHeader.slice(7)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  // Verify the token and get the calling user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return json({ error: 'Unauthorized' }, 401)
  }

  // Check caller is an admin in club_officials
  const { data: official } = await supabase
    .from('club_officials')
    .select('role')
    .eq('email', user.email ?? '')
    .single()

  if (!official || official.role !== 'admin') {
    return json({ error: 'Forbidden — admins only' }, 403)
  }

  // Derive the from address from the contact_email stored in site_content
  const { data: siteContent } = await supabase
    .from('site_content')
    .select('value')
    .eq('key', 'contact_email')
    .maybeSingle()
  const contactEmail: string = siteContent?.value ?? 'noreply@bradwellfc.online'
  const fromDomain = contactEmail.includes('@') ? contactEmail.split('@')[1] : 'bradwellfc.online'
  const FROM_EMAIL = Deno.env.get('FROM_EMAIL') ?? `Bradwell FC <noreply@${fromDomain}>`

  const payload: NotificationPayload = await req.json()

  // ---------------------------------------------------------------------------
  // Resolve recipients
  // ---------------------------------------------------------------------------
  let recipientEmails: string[] = []

  const { scope } = payload

  if (scope.type === 'everyone') {
    const { data } = await supabase.from('club_officials').select('email')
    recipientEmails = (data ?? []).map((r: { email: string }) => r.email)

  } else if (scope.type === 'admins') {
    const { data } = await supabase.from('club_officials').select('email').eq('role', 'admin')
    recipientEmails = (data ?? []).map((r: { email: string }) => r.email)

  } else if (scope.type === 'coaches') {
    const { data } = await supabase.from('club_officials').select('email').eq('role', 'coach')
    recipientEmails = (data ?? []).map((r: { email: string }) => r.email)

  } else if (scope.type === 'team' && scope.teamName) {
    // officials whose teams array contains the team name
    const { data } = await supabase
      .from('club_officials')
      .select('email')
      .contains('teams', [scope.teamName])
    recipientEmails = (data ?? []).map((r: { email: string }) => r.email)

  } else if (scope.type === 'age_group' && scope.ageGroup) {
    // 1. find all team names with this age group
    const { data: teams } = await supabase
      .from('teams')
      .select('name')
      .eq('age_group', scope.ageGroup)
    const teamNames: string[] = (teams ?? []).map((t: { name: string }) => t.name)

    // 2. find officials whose teams array overlaps
    if (teamNames.length > 0) {
      const { data } = await supabase
        .from('club_officials')
        .select('email, teams')
      const all = (data ?? []) as { email: string; teams: string[] }[]
      recipientEmails = all
        .filter((o) => o.teams.some((t) => teamNames.includes(t)))
        .map((o) => o.email)
    }

  } else if (scope.type === 'individuals' && scope.officialIds?.length) {
    const { data } = await supabase
      .from('club_officials')
      .select('email')
      .in('id', scope.officialIds)
    recipientEmails = (data ?? []).map((r: { email: string }) => r.email)
  }

  // Deduplicate
  recipientEmails = [...new Set(recipientEmails)]

  if (recipientEmails.length === 0) {
    return json({ sent: 0, failed: [], message: 'No recipients matched' }, 200)
  }

  // ---------------------------------------------------------------------------
  // Build email
  // ---------------------------------------------------------------------------
  const html = buildHtml(payload)

  // ---------------------------------------------------------------------------
  // Send a single email with all recipients in BCC.
  // - Recipients cannot see each other's addresses.
  // - Attachments are fully supported (unlike the batch API).
  // - One API call regardless of recipient count.
  // ---------------------------------------------------------------------------
  const resendPayload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: [FROM_EMAIL],   // Resend requires a to address; send to self, everyone else is BCC
    bcc: recipientEmails,
    subject: payload.subject,
    html,
  }

  if (payload.contentType === 'schedule' && payload.pdfBase64 && payload.pdfFilename) {
    resendPayload.attachments = [
      { filename: payload.pdfFilename, content: payload.pdfBase64 },
    ]
  }

  let sent = 0
  const failed: string[] = []

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify(resendPayload),
  })

  if (res.ok) {
    sent = recipientEmails.length
  } else {
    const errText = await res.text()
    console.error('Send failed:', errText)
    failed.push(...recipientEmails)
  }

  // ---------------------------------------------------------------------------
  // Audit log
  // ---------------------------------------------------------------------------
  await supabase.from('notifications').insert({
    sent_by: user.id,
    subject: payload.subject,
    content_type: payload.contentType,
    content_id: payload.contentId,
    scope: payload.scope,
    sent_count: sent,
  })

  return json({ sent, failed }, 200)
})

// ---------------------------------------------------------------------------
// HTML email builder
// ---------------------------------------------------------------------------

function buildHtml(payload: NotificationPayload): string {
  const ctaBlock =
    payload.contentType !== 'schedule' && payload.contentUrl
      ? `<p style="margin:24px 0 0">
           <a href="${payload.contentUrl}"
              style="display:inline-block;background:#1a3a6b;color:#fff;padding:12px 24px;
                     border-radius:6px;text-decoration:none;font-weight:600;font-size:14px">
             View ${contentLabel(payload.contentType)}
           </a>
         </p>`
      : payload.contentType === 'schedule'
      ? `<p style="color:#666;font-size:14px;margin-top:16px">
           The full training schedule is attached as a PDF to this email.
         </p>`
      : ''

  const summaryBlock = payload.contentSummary
    ? `<p style="color:#444;font-size:15px;line-height:1.6;margin:12px 0 0">
         ${payload.contentSummary}
       </p>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">

        <!-- Header -->
        <tr>
          <td style="background:#1a3a6b;padding:24px 32px;text-align:center">
            <img src="https://byfdvqghhsaxfhhsbmzm.supabase.co/storage/v1/object/public/assets/club-badge-B2CwE4NS.jpg"
                 alt="Bradwell FC" width="64" height="64"
                 style="display:block;margin:0 auto 12px;border-radius:50%;border:2px solid rgba(255,255,255,0.2)" />
            <p style="margin:0;font-size:11px;color:#f0b429;letter-spacing:.2em;text-transform:uppercase;font-weight:700">
              Bradwell FC
            </p>
            <h1 style="margin:4px 0 0;font-size:22px;color:#fff;font-weight:800;letter-spacing:.05em;text-transform:uppercase">
              Club Update
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px">
            <p style="margin:0;font-size:11px;color:#f0b429;letter-spacing:.15em;text-transform:uppercase;font-weight:700">
              ${contentLabel(payload.contentType)}
            </p>
            <h2 style="margin:8px 0 0;font-size:20px;color:#1a1a1a;font-weight:700;line-height:1.3">
              ${payload.contentTitle}
            </h2>
            ${summaryBlock}
            ${ctaBlock}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f9;border-top:1px solid #eee;padding:20px 32px;text-align:center">
            <p style="margin:0;font-size:12px;color:#999">
              Bradwell FC &middot; This email was sent by a club admin.<br>
              <a href="${SITE_URL}" style="color:#1a3a6b;text-decoration:none">${SITE_URL}</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function contentLabel(type: string): string {
  const labels: Record<string, string> = {
    news: 'Club News',
    event: 'Club Event',
    document: 'Club Document',
    schedule: 'Training Schedule',
  }
  return labels[type] ?? type
}

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
