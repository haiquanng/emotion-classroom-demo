import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import type { StudentState } from '@/store/sessionStore'

const EMOTION_EMOJI: Record<string, string> = {
  happy:    '😊',
  neutral:  '😐',
  sad:      '😔',
  angry:    '😠',
  fear:     '😨',
  surprise: '😲',
  disgust:  '🤢',
  contempt: '😤',
  drowsy:   '😴',
  unknown:  '❓',
}

const EMOTION_VI: Record<string, string> = {
  happy:    'Vui vẻ',
  neutral:  'Bình thường',
  sad:      'Buồn',
  angry:    'Tức giận',
  fear:     'Lo lắng',
  surprise: 'Ngạc nhiên',
  disgust:  'Khó chịu',
  contempt: 'Thờ ơ',
  drowsy:   'Buồn ngủ',
  unknown:  'Không rõ',
}

const EMOTION_COLOR: Record<string, string> = {
  happy:    'bg-green-100 text-green-800',
  neutral:  'bg-slate-100 text-slate-700',
  sad:      'bg-blue-100 text-blue-800',
  angry:    'bg-red-100 text-red-800',
  fear:     'bg-orange-100 text-orange-800',
  surprise: 'bg-yellow-100 text-yellow-800',
  disgust:  'bg-purple-100 text-purple-800',
  contempt: 'bg-rose-100 text-rose-800',
  drowsy:   'bg-indigo-100 text-indigo-800',
  unknown:  'bg-gray-100 text-gray-600',
}

function engagementColor(score: number) {
  if (score >= 0.6) return 'text-green-600'
  if (score >= 0.3) return 'text-yellow-600'
  return 'text-red-600'
}

interface Props {
  student: StudentState
}

export function StudentCard({ student }: Props) {
  const { student_name, emotion, engagement_score, face_detected, history } = student
  const initials = student_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const engPct = Math.round(engagement_score * 100)

  return (
    <Card className="w-full transition-all duration-300 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{student_name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {face_detected ? (
                <Badge className={`text-xs px-1.5 py-0 ${EMOTION_COLOR[emotion] ?? EMOTION_COLOR.unknown}`}>
                  {EMOTION_EMOJI[emotion] ?? '❓'} {EMOTION_VI[emotion] ?? emotion}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs px-1.5 py-0 text-muted-foreground">
                  📵 Away
                </Badge>
              )}
            </div>
          </div>
          <span className={`text-xl font-bold tabular-nums ${engagementColor(engagement_score)}`}>
            {face_detected ? `${engPct}%` : '—'}
          </span>
        </div>
      </CardHeader>

      <CardContent className="pb-3 space-y-2">
        <Progress value={face_detected ? engPct : 0} className="h-1.5" />

        {history.length > 1 && (
          <ResponsiveContainer width="100%" height={40}>
            <LineChart data={history}>
              <Tooltip
                formatter={(v) => [`${Math.round(Number(v) * 100)}%`, 'Engagement']}
                labelFormatter={() => ''}
                contentStyle={{ fontSize: 11 }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke={engagement_score >= 0.3 ? '#16a34a' : '#dc2626'}
                dot={false}
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
