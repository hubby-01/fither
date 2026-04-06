export const WEEKLY_PLAN = [
  // Index 0 — Sunday
  {
    day: 'Sunday',
    dayType: 'Rest',
    type: 'rest',
    exercises: [],
    cardio: null,
    restNote: 'Full rest today. Recovery is where results happen.',
  },
  // Index 1 — Monday
  {
    day: 'Monday',
    dayType: 'Full Body A',
    type: 'strength',
    exercises: [
      { name: 'Leg Press',               sets: 3, reps: 15, isCardio: false },
      { name: 'Lat Pulldown (machine)',   sets: 3, reps: 15, isCardio: false },
      { name: 'Chest Press (machine)',    sets: 3, reps: 15, isCardio: false },
      { name: 'Seated Cable Row',         sets: 3, reps: 15, isCardio: false },
      { name: 'Shoulder Press (machine)', sets: 3, reps: 12, isCardio: false },
      { name: 'Plank',                    sets: 3, reps: 30, isCardio: false, unit: 'sec' },
    ],
    cardio: { type: 'treadmill', durationMinutes: 15, speedKmh: 5.5, inclinePercent: 2, label: 'Cooldown' },
  },
  // Index 2 — Tuesday
  {
    day: 'Tuesday',
    dayType: 'Cardio + Core',
    type: 'cardio',
    exercises: [
      { name: 'Crunches',         sets: 3, reps: 20, isCardio: false },
      { name: 'Leg Raises',       sets: 3, reps: 15, isCardio: false },
      { name: 'Russian Twists',   sets: 3, reps: 20, isCardio: false, unit: 'each side' },
      { name: 'Mountain Climbers', sets: 3, reps: 30, isCardio: false, unit: 'sec' },
      { name: 'Bicycle Crunches', sets: 3, reps: 20, isCardio: false, unit: 'each side' },
    ],
    cardio: { type: 'treadmill', durationMinutes: 25, speedKmh: 6, inclinePercent: 3, label: 'Treadmill' },
  },
  // Index 3 — Wednesday
  {
    day: 'Wednesday',
    dayType: 'Upper Body',
    type: 'strength',
    exercises: [
      { name: 'Cable Lateral Raise',          sets: 3, reps: 15, isCardio: false },
      { name: 'Cable Bicep Curl',             sets: 3, reps: 15, isCardio: false },
      { name: 'Tricep Cable Pushdown (rope)', sets: 3, reps: 15, isCardio: false },
      { name: 'Chest Fly (machine)',          sets: 3, reps: 15, isCardio: false },
      { name: 'Face Pulls (cable)',           sets: 3, reps: 20, isCardio: false },
      { name: 'DB Shoulder Press',            sets: 3, reps: 12, isCardio: false },
    ],
    cardio: { type: 'treadmill', durationMinutes: 15, speedKmh: 5.5, inclinePercent: 2, label: 'Cooldown' },
  },
  // Index 4 — Thursday
  {
    day: 'Thursday',
    dayType: 'Active Recovery',
    type: 'active-recovery',
    exercises: [],
    cardio: null,
    recoveryOptions: [
      { type: 'zumba',     label: 'Zumba class (terrace studio)', durationMinutes: 45 },
      { type: 'yoga',      label: 'Yoga session (terrace studio)', durationMinutes: 40 },
      { type: 'treadmill', label: 'Light walk on treadmill', durationMinutes: 30, speedKmh: 4.5 },
    ],
  },
  // Index 5 — Friday
  {
    day: 'Friday',
    dayType: 'Lower Body',
    type: 'strength',
    exercises: [
      { name: 'Squat (bodyweight or goblet)', sets: 3, reps: 20, isCardio: false },
      { name: 'Leg Extension (machine)',      sets: 3, reps: 15, isCardio: false },
      { name: 'Leg Curl (machine)',           sets: 3, reps: 15, isCardio: false },
      { name: 'Hip Abductor (machine)',       sets: 3, reps: 20, isCardio: false },
      { name: 'Hip Adductor (machine)',       sets: 3, reps: 20, isCardio: false },
      { name: 'Glute Bridge',                sets: 3, reps: 20, isCardio: false },
      { name: 'Calf Raise',                  sets: 3, reps: 25, isCardio: false },
    ],
    cardio: { type: 'treadmill', durationMinutes: 15, speedKmh: 5.5, inclinePercent: 2, label: 'Cooldown' },
  },
  // Index 6 — Saturday
  {
    day: 'Saturday',
    dayType: 'Full Body B',
    type: 'strength',
    exercises: [
      { name: 'Step-ups (using bench)',        sets: 3, reps: 15, isCardio: false, unit: 'each leg' },
      { name: 'DB Romanian Deadlift',          sets: 3, reps: 15, isCardio: false },
      { name: 'Cable Kickbacks',               sets: 3, reps: 15, isCardio: false, unit: 'each leg' },
      { name: 'DB Lateral Raise',              sets: 3, reps: 15, isCardio: false },
      { name: 'Seated Row (machine)',          sets: 3, reps: 15, isCardio: false },
      { name: 'Tricep Dips (assisted machine)', sets: 3, reps: 12, isCardio: false },
    ],
    cardio: { type: 'treadmill', durationMinutes: 20, speedKmh: 6, inclinePercent: 2, label: 'Finisher' },
  },
]
