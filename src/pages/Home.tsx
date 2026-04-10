import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSessionStore } from '@/store/sessionStore'

const API = 'http://localhost:8000'

export function Home() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { setSession } = useSessionStore()
  const navigate = useNavigate()

  async function createSession() {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacher_name: name.trim() }),
      })
      if (!res.ok) throw new Error('Failed to create session')
      const data = await res.json()
      setSession(data.session_code, name.trim())
      navigate(`/session/${data.session_code}`)
    } catch {
      setError('Không thể kết nối server. Hãy chắc chắn backend đang chạy.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-violet-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center text-5xl mb-3">
            <img className='w-24 h-24' src="/logo.png" alt="Tutora AI Logo" />
          </div>
          <p className="text-muted-foreground mt-1">Demo Giám sát trạng thái học viên real-time</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-lg font-semibold">Tạo phòng học</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-0.5">
              <label className="text-sm font-medium mb-2">Tên giáo viên</label>
              <input
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createSession()}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button className="w-full" onClick={createSession} disabled={loading || !name.trim()}>
              {loading ? 'Đang tạo...' : 'Bắt đầu buổi học'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
