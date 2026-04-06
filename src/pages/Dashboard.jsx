import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WEEKLY_PLAN } from '../data/workoutPlan'
import { getSessions, getCardio, getBodyweight, getProfile, saveBodyweight } from '../utils/storage'
import { getDayIndex, getHourGreeting, todayStr, formatDate, daysAgo, weeksActive } from '../utils/dateUtils'
import { getCurrentStreak, getWeightLost } from '../utils/progressCalc'
import DayPlanCard from '../components/DayPlanCard'
import WorkoutCard from '../components/WorkoutCard'

const TIPS = [
  "Every rep is a vote for the person you're becoming.",
  "Progress, not perfection.",
  "The only bad workout is the one that didn't happen.",
  "You're stronger than yesterday.",
  "Rest days are part of the plan — take them seriously.",
  "Consistency beats intensity every time.",
  "You don't have to be extreme, just consistent.",
  "Small steps still move you forward.",
  "Your body can do it. It's your mind you need to convince.",
  "The best project you'll ever work on is you.",
  "Don't compare your chapter 1 to someone's chapter 20.",
  "Sweat is just fat crying.",
  "You're one workout away from a better mood.",
  "Strong is the new beautiful.",
  "Push yourself, because no one else is going to do it for you.",
  "Fitness is not about being better than someone else. It's about being better than you used to be.",
  "Wake up with determination. Go to bed with satisfaction.",
  "A one-hour workout is 4% of your day. No excuses.",
  "Sore today, strong tomorrow.",
  "The pain you feel today is the strength you feel tomorrow.",
  "It's not about having time. It's about making time.",
  "You already have everything you need to begin.",
  "Trust the process. Results will follow.",
  "Be patient with yourself. Transformation takes time.",
  "Every expert was once a beginner.",
  "Your only limit is you.",
  "Good things come to those who sweat.",
  "Believe in yourself and all that you are.",
  "Fall in love with taking care of yourself.",
  "Today is a great day to work out.",
]

export default function Dashboard() {
  const plan = WEEKLY_PLAN[getDayIndex()]
  const sessions = getSessions()
  const cardio = getCardio()
  const bodyweightEntries = getBodyweight()
  const profile = getProfile()

  const streak = getCurrentStreak(sessions, cardio)
  const totalSessions = sessions.length + cardio.length
  const weeks = profile ? weeksActive(profile.startDate) : 0
  const weightLost = getWeightLost(profile, bodyweightEntries)

  // Last 3 combined activities
  const recentActivities = [
    ...sessions.map(s => ({ ...s, _kind: 'strength' })),
    ...cardio.map(c => ({ ...c, _kind: 'cardio' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)

  // Check if today already logged
  const today = todayStr()
  const todayLogged = sessions.some(s => s.date === today) || cardio.some(c => c.date === today)

  // Bodyweight
  const lastBw = bodyweightEntries.length
    ? [...bodyweightEntries].sort((a, b) => b.date.localeCompare(a.date))[0]
    : null
  const sparklineData = [...bodyweightEntries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10)

  const [weightInput, setWeightInput] = useState('')
  const [bwEntries, setBwEntries] = useState(bodyweightEntries)

  function handleLogWeight() {
    const val = parseFloat(weightInput)
    if (!val || val <= 0) return
    saveBodyweight({ date: today, weightKg: val })
    setBwEntries(getBodyweight())
    setWeightInput('')
  }

  // Tip of the day
  const tipIndex = new Date().getDate() % 30
  const tip = TIPS[tipIndex]

  // Greeting
  const greeting = getHourGreeting()
  const dayName = plan.day

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100" data-testid="greeting">
          {greeting} <span className="text-rose-400">✦</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-300" data-testid="today-date">
          {formatDate(today)} — {dayName}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2" data-testid="stats-row">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center" data-testid="stat-item">
          <div className="text-xl font-bold text-rose-500">{streak}</div>
          <div className="text-xs text-gray-400 dark:text-gray-300">Streak</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center" data-testid="stat-item">
          <div className="text-xl font-bold text-rose-500">{totalSessions}</div>
          <div className="text-xs text-gray-400 dark:text-gray-300">Sessions</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center" data-testid="stat-item">
          <div className="text-xl font-bold text-rose-500">{weeks}</div>
          <div className="text-xs text-gray-400 dark:text-gray-300">Weeks</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center" data-testid="stat-item">
          <div className="text-xl font-bold text-rose-500">{weightLost != null ? `${weightLost}` : '—'}</div>
          <div className="text-xs text-gray-400 dark:text-gray-300">kg lost</div>
        </div>
      </div>

      {/* Today's plan */}
      <DayPlanCard plan={plan} />

      {/* Log button */}
      {todayLogged ? (
        <div className="text-center py-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-semibold" data-testid="already-logged">
          Already logged ✓
        </div>
      ) : (
        <Link
          to="/log"
          className="block text-center py-3 rounded-xl bg-rose-500 text-white font-semibold hover:bg-rose-600 transition-colors min-h-[44px]"
          data-testid="log-today-btn"
        >
          Log Today
        </Link>
      )}

      {/* Recent activity */}
      {recentActivities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivities.map((activity, i) => (
              <WorkoutCard key={activity.id || i} session={activity} type={activity._kind} />
            ))}
          </div>
        </div>
      )}

      {/* Body weight section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="bodyweight-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Body Weight</h2>
        {lastBw && (
          <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
            Last logged: {lastBw.weightKg} kg — {daysAgo(lastBw.date)} days ago
          </p>
        )}
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            placeholder="Weight (kg)"
            value={weightInput}
            onChange={e => setWeightInput(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 text-sm"
            data-testid="weight-input"
          />
          <button
            onClick={handleLogWeight}
            className="px-4 py-2 rounded-lg bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors min-h-[44px]"
            data-testid="log-weight-btn"
          >
            Log
          </button>
        </div>
        {/* Sparkline */}
        {sparklineData.length >= 2 && (
          <div className="h-12" data-testid="sparkline">
            <svg viewBox={`0 0 ${(sparklineData.length - 1) * 20} 40`} className="w-full h-full">
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                points={sparklineData.map((entry, i) => {
                  const min = Math.min(...sparklineData.map(e => e.weightKg))
                  const max = Math.max(...sparklineData.map(e => e.weightKg))
                  const range = max - min || 1
                  const y = 38 - ((entry.weightKg - min) / range) * 36
                  return `${i * 20},${y}`
                }).join(' ')}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Motivational tip */}
      <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 text-center" data-testid="motivational-tip">
        <p className="text-sm text-rose-600 dark:text-rose-300 italic">"{tip}"</p>
      </div>
    </div>
  )
}
