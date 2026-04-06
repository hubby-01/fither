import { WEEKLY_PLAN } from '../data/workoutPlan'
import { WEIGHT_GUIDE } from '../data/weightGuide'

const DAY_TYPE_COLORS = {
  'Full Body A': 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Full Body B': 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  'Cardio + Core': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  'Upper Body': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Lower Body': 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  'Active Recovery': 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  'Rest': 'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
}

export default function Guide() {
  const weightGuideEntries = Object.entries(WEIGHT_GUIDE)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Guide</h1>

      {/* 1. Weekly Split */}
      <section data-testid="weekly-split-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Weekly Split</h2>
        <div className="overflow-x-auto" data-testid="table-scroll-wrapper">
          <table className="w-full text-sm" data-testid="weekly-split-table">
            <thead>
              <tr className="bg-rose-500 text-white">
                <th className="px-3 py-2 text-left rounded-tl-lg">Day</th>
                <th className="px-3 py-2 text-left">Type</th>
                <th className="px-3 py-2 text-left rounded-tr-lg">Exercises</th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_PLAN.map((plan, i) => (
                <tr
                  key={plan.day}
                  className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} border-b border-gray-100 dark:border-gray-700`}
                  data-testid="weekly-split-row"
                >
                  <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200">{plan.day}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${DAY_TYPE_COLORS[plan.dayType] || 'bg-gray-100 text-gray-600'}`}>
                      {plan.dayType}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-100">
                    {plan.type === 'rest' && plan.restNote}
                    {plan.type === 'active-recovery' && plan.recoveryOptions?.map(o => o.label).join(' / ')}
                    {plan.exercises?.length > 0 && plan.exercises.map(ex => ex.name).join(', ')}
                    {plan.cardio && ` + ${plan.cardio.label || 'Cardio'}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 2. Weight Guide */}
      <section data-testid="weight-guide-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Weight Guide</h2>
        <div className="overflow-x-auto" data-testid="table-scroll-wrapper">
          <table className="w-full text-sm" data-testid="weight-guide-table">
            <thead>
              <tr className="bg-rose-500 text-white">
                <th className="px-3 py-2 text-left rounded-tl-lg">Exercise</th>
                <th className="px-3 py-2 text-left">Start (kg)</th>
                <th className="px-3 py-2 text-left">Target (kg)</th>
                <th className="px-3 py-2 text-left rounded-tr-lg">Type</th>
              </tr>
            </thead>
            <tbody>
              {weightGuideEntries.map(([name, guide], i) => (
                <tr
                  key={name}
                  className={`${i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'} border-b border-gray-100 dark:border-gray-700`}
                  data-testid="weight-guide-row"
                >
                  <td className="px-3 py-2 font-medium text-gray-700 dark:text-gray-200">{name}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-100">{guide.startMin}–{guide.startMax}</td>
                  <td className="px-3 py-2 text-gray-600 dark:text-gray-100">{guide.targetMin}–{guide.targetMax}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      guide.type === 'compound'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300'
                        : 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300'
                    }`}>
                      {guide.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Progressive Overload Rules */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="overload-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Progressive Overload Rules</h2>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-100">
          <li className="flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">●</span>
            Complete all sets at target reps before adding weight
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">●</span>
            Add 2 kg for compound exercises, 1 kg for isolation
          </li>
          <li className="flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">●</span>
            If you can't complete all reps, keep the weight the same
          </li>
        </ul>
      </section>

      {/* 4. Exercise Tips */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="exercise-tips-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Exercise Tips</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-100">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Leg Press</p>
            <p>Place feet shoulder-width on the platform. Push through your heels, not toes. Don't lock knees at the top. Control the descent — 2 seconds down, 1 second up.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Hip Abductor</p>
            <p>Sit upright with back against the pad. Push knees outward in a controlled motion. Squeeze at the widest point for 1 second. Great for outer thigh and glute activation.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Lat Pulldown</p>
            <p>Grip slightly wider than shoulders. Pull the bar to your upper chest, not behind the neck. Squeeze shoulder blades together at the bottom. Control the return slowly.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Cable Exercises</p>
            <p>Keep your core tight and body stable throughout. Use smooth, controlled movements — no swinging. Adjust the pulley height for each exercise. Start light to learn the movement pattern.</p>
          </div>
        </div>
      </section>

      {/* 5. Cardio Guide */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="cardio-guide-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Cardio Guide</h2>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-100">
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Treadmill Incline Benefits</p>
            <p>Walking at an incline burns significantly more calories than flat walking at the same speed. A 2–3% incline mimics outdoor walking and engages your glutes and hamstrings more. Start at 2% and gradually increase as it gets easier. Even 15 minutes of incline walking is an effective fat-burning cooldown after strength training.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700 dark:text-gray-200">Why Zumba Works for Fat Loss</p>
            <p>Zumba combines cardio with full-body movement in a fun, high-energy format. A 45-minute session can burn 300–500 calories depending on intensity. The dance-based movements improve coordination and keep workouts enjoyable — which means you're more likely to stay consistent. Consistency is the number one factor in fat loss.</p>
          </div>
        </div>
      </section>

      {/* 6. Why This Plan Works */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-4" data-testid="why-section">
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-3">Why This Plan Works</h2>
        <p className="text-sm text-gray-600 dark:text-gray-100 leading-relaxed">
          This plan combines strength training with cardio in a balanced 5-day split designed for fat loss and body toning. Higher rep ranges (12–20) with moderate weights build lean muscle and boost metabolism without adding bulk. Full body days ensure all major muscle groups are trained twice per week, while dedicated upper and lower days allow targeted work. Active recovery days with Zumba or yoga keep you moving without overtraining. The progressive overload approach ensures continuous improvement — as you get stronger, the weights increase gradually, keeping your body adapting and burning calories efficiently.
        </p>
      </section>
    </div>
  )
}
