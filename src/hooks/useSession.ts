import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/store/sessionStore'

const WS_BASE = import.meta.env.VITE_WS_BASE ?? 'ws://localhost:8000/ws'
const RECONNECT_DELAY_MS = 3000

export function useTeacherWS(sessionCode: string | null) {
  const { upsertStudent, removeStudent, addAlert, setWs, setConnected } = useSessionStore()
  const navigate = useNavigate()
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const activeRef = useRef(false)  // true khi effect đang mounted

  useEffect(() => {
    if (!sessionCode) return
    activeRef.current = true

    function connect() {
      if (!activeRef.current) return

      const ws = new WebSocket(`${WS_BASE}/${sessionCode}/teacher`)
      wsRef.current = ws
      setWs(ws)

      ws.onopen = () => {
        if (reconnectTimer.current) {
          clearTimeout(reconnectTimer.current)
          reconnectTimer.current = null
        }
        setConnected(true)
      }

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data)

        if (msg.type === 'error' && msg.message === 'session_not_found') {
          activeRef.current = false
          ws.close()
          navigate('/')
          return
        }

        if (msg.type === 'frame_result') {
          upsertStudent({
            student_id: msg.student_id,
            student_name: msg.student_name,
            ...msg.payload,
            last_updated: Date.now(),
            history: [],
          })
        } else if (msg.type === 'student_joined') {
          upsertStudent({
            student_id: msg.student_id,
            student_name: msg.student_name,
            emotion: 'unknown',
            scores: { happy: 0, neutral: 0, sad: 0, angry: 0, fear: 0, surprise: 0, disgust: 0 },
            engagement_score: 0,
            face_detected: false,
            last_updated: Date.now(),
            history: [],
          })
        } else if (msg.type === 'student_left') {
          removeStudent(msg.student_id)
        } else if (msg.type === 'alert') {
          addAlert({
            level: msg.payload.level,
            student_id: msg.student_id,
            student_name: msg.student_name,
            message: msg.payload.message,
            reason: msg.payload.reason,
          })
        }
      }

      ws.onerror = () => { /* handled by onclose */ }

      ws.onclose = () => {
        setWs(null)
        setConnected(false)
        wsRef.current = null
        if (activeRef.current) {
          reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    }

    connect()

    return () => {
      activeRef.current = false
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
      wsRef.current?.close()
      wsRef.current = null
      setWs(null)
      setConnected(false)
    }
  }, [sessionCode])
}
