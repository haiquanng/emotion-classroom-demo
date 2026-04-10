import { useEffect, useRef } from 'react'
import { X, AlertTriangle, Info } from 'lucide-react'
import { useSessionStore, type Alert } from '@/store/sessionStore'

const DISMISS_MS = 5000

function playAlertSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 520
    osc.type = 'sine'
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
    osc.start()
    osc.stop(ctx.currentTime + 0.5)
  } catch {
    /* silent fallback */
  }
}

function AlertItem({ alert }: { alert: Alert }) {
  const dismissAlert = useSessionStore((s) => s.dismissAlert)
  const isHigh = alert.level === 'HIGH'

  useEffect(() => {
    const t = setTimeout(() => dismissAlert(alert.id), DISMISS_MS)
    return () => clearTimeout(t)
  }, [alert.id, dismissAlert])

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg shadow-lg border text-sm animate-in slide-in-from-right-5 ${
        isHigh
          ? 'bg-red-50 border-red-200 text-red-900'
          : 'bg-yellow-50 border-yellow-200 text-yellow-900'
      }`}
    >
      {isHigh ? (
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
      ) : (
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
      )}
      <div className="flex-1 min-w-0">
        {alert.student_name && (
          <p className="font-medium">{alert.student_name}</p>
        )}
        <p className="text-xs opacity-80">{alert.message}</p>
      </div>
      <button onClick={() => dismissAlert(alert.id)} className="shrink-0 opacity-60 hover:opacity-100">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function AlertBanner() {
  const alerts = useSessionStore((s) => s.alerts)
  const prevCountRef = useRef(0)

  // Play sound khi có alert HIGH mới (engagement < 30%, drowsy, away)
  useEffect(() => {
    if (alerts.length > prevCountRef.current) {
      const newest = alerts[0]
      if (newest?.level === 'HIGH') {
        playAlertSound()
      }
    }
    prevCountRef.current = alerts.length
  }, [alerts])

  if (alerts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {alerts.slice(0, 5).map((alert) => (
        <AlertItem key={alert.id} alert={alert} />
      ))}
    </div>
  )
}
