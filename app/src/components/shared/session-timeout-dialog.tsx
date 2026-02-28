import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const WARNING_SECONDS = 2 * 60  // must match WARNING_MS in use-session-timeout.ts

type Props = {
  open: boolean
  onStayLoggedIn: () => void
  onSignOut: () => void
}

export function SessionTimeoutDialog({ open, onStayLoggedIn, onSignOut }: Props) {
  const [countdown, setCountdown] = useState(WARNING_SECONDS)

  // Reset and start countdown whenever the dialog opens
  useEffect(() => {
    if (!open) return
    setCountdown(WARNING_SECONDS)

    const interval = setInterval(() => {
      setCountdown((s) => {
        if (s <= 1) {
          clearInterval(interval)
          return 0
        }
        return s - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open])

  // Sign out when countdown hits 0
  useEffect(() => {
    if (open && countdown === 0) {
      onSignOut()
    }
  }, [open, countdown, onSignOut])

  const minutes = Math.floor(countdown / 60)
  const seconds = countdown % 60
  const countdownLabel = minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, '0')}`
    : `${seconds}s`

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onStayLoggedIn() }}>
      <DialogContent className="sm:max-w-sm" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Still there?</DialogTitle>
          <DialogDescription>
            You'll be signed out in <strong>{countdownLabel}</strong> due to inactivity.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onSignOut} className="gap-1.5">
            <LogOut size={14} />
            Sign out now
          </Button>
          <Button onClick={onStayLoggedIn}>
            Stay logged in
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
