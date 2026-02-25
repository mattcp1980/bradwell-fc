import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { NotificationPayload } from '@/types'

export function useSendNotification() {
  return useMutation({
    mutationFn: async (payload: NotificationPayload): Promise<{ sent: number; failed: string[] }> => {
      const { data: { session } } = await supabase.auth.getSession()

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-notification`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token ?? ''}`,
          },
          body: JSON.stringify(payload),
        }
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Request failed with status ${res.status}`)
      }

      return res.json()
    },
  })
}
