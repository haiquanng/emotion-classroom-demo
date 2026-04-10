import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSessionStore } from '@/store/sessionStore'
import { useTeacherWS } from '@/hooks/useSession'
import { StudentCard } from '@/components/StudentCard'
import { AlertBanner } from '@/components/AlertBanner'
import { Button } from '@/components/ui/button'
import { Users, Wifi, WifiOff } from 'lucide-react'

export function Session() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const { students, isConnected, reset } = useSessionStore()

  useTeacherWS(code ?? null)

  useEffect(() => {
    if (!code) navigate('/')
  }, [code, navigate])

  const studentList = Object.values(students)
  const connected = isConnected
  const avgEngagement =
    studentList.length > 0
      ? studentList.reduce((sum, s) => sum + s.engagement_score, 0) / studentList.length
      : 0

  function endSession() {
    fetch(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'}/sessions/${code}`, { method: 'DELETE' }).catch(() => {})
    reset()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <img className='w-10 h-10' src="/logo.png" alt="Tutora AI Logo" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Mã phòng:</span>
            <code className="bg-muted px-2 py-0.5 rounded font-mono font-semibold text-foreground">
              {code}
            </code>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            {connected ? (
              <><Wifi className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Đang kết nối</span></>
            ) : (
              <><WifiOff className="w-3.5 h-3.5 text-red-500" /><span className="text-red-600">Mất kết nối</span></>
            )}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{studentList.length} học viên</span>
            </div>
            <Button variant="destructive" size="sm" onClick={endSession} className='bg-primary hover:bg-primary/90'>
              Kết thúc buổi học
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-sm text-muted-foreground">Học viên</p>
            <p className="text-3xl font-bold mt-1">{studentList.length}</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-sm text-muted-foreground">Tỉ lệ trung bình</p>
            <p className={`text-3xl font-bold mt-1 ${avgEngagement >= 0.6 ? 'text-green-600' : avgEngagement >= 0.3 ? 'text-yellow-600' : 'text-red-600'}`}>
              {studentList.length > 0 ? `${Math.round(avgEngagement * 100)}%` : '—'}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-sm text-muted-foreground">Gặp vấn đề</p>
            <p className="text-3xl font-bold mt-1 text-red-500">
              {studentList.filter((s) => s.engagement_score < 0.3 && s.face_detected).length}
            </p>
          </div>
        </div>

        {/* Student grid */}
        {studentList.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">Chờ học viên tham gia...</p>
            <p className="text-sm mt-1">
              Chia sẻ mã phòng <span className="font-mono font-semibold text-foreground">{code}</span> cho học viên
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {studentList.map((student) => (
              <StudentCard key={student.student_id} student={student} />
            ))}
          </div>
        )}
      </main>

      <AlertBanner />
    </div>
  )
}
