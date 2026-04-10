import { create } from 'zustand'

export type AlertLevel = 'HIGH' | 'MED'

export interface EmotionScores {
  happy: number
  neutral: number
  sad: number
  angry: number
  fear: number
  surprise: number
  disgust: number
}

export interface StudentState {
  student_id: string
  student_name: string
  emotion: string
  scores: EmotionScores
  engagement_score: number
  face_detected: boolean
  last_updated: number
  history: { time: number; engagement: number }[]
}

export interface Alert {
  id: string
  level: AlertLevel
  student_id: string | null
  student_name: string | null
  message: string
  reason: string
  timestamp: number
}

interface SessionStore {
  sessionCode: string | null
  teacherName: string
  students: Record<string, StudentState>
  alerts: Alert[]
  ws: WebSocket | null
  isConnected: boolean

  setSession: (code: string, name: string) => void
  setWs: (ws: WebSocket | null) => void
  setConnected: (v: boolean) => void
  upsertStudent: (data: StudentState) => void
  removeStudent: (id: string) => void
  addAlert: (alert: Omit<Alert, 'id' | 'timestamp'>) => void
  dismissAlert: (id: string) => void
  reset: () => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionCode: null,
  teacherName: '',
  students: {},
  alerts: [],
  ws: null,
  isConnected: false,

  setSession: (code, name) => set({ sessionCode: code, teacherName: name }),
  setWs: (ws) => set({ ws }),
  setConnected: (v) => set({ isConnected: v }),

  upsertStudent: (data) =>
    set((state) => {
      const prev = state.students[data.student_id]
      const prevHistory = prev?.history ?? []
      const history = [
        ...prevHistory.slice(-20),
        { time: Date.now(), engagement: data.engagement_score },
      ]
      return {
        students: {
          ...state.students,
          [data.student_id]: { ...data, last_updated: Date.now(), history },
        },
      }
    }),

  removeStudent: (id) =>
    set((state) => {
      const next = { ...state.students }
      delete next[id]
      return { students: next }
    }),

  addAlert: (alert) =>
    set((state) => {
      const now = Date.now()
      const isDuplicate = state.alerts.some(
        (a) =>
          a.reason === alert.reason &&
          a.student_id === alert.student_id &&
          now - a.timestamp < 60_000
      )
      if (isDuplicate) return state
      return {
        alerts: [
          { ...alert, id: crypto.randomUUID(), timestamp: now },
          ...state.alerts.slice(0, 19),
        ],
      }
    }),

  dismissAlert: (id) =>
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) })),

  reset: () => set({ sessionCode: null, students: {}, alerts: [], ws: null, isConnected: false }),
}))
