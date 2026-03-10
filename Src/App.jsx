import { useState, useEffect, useRef } from "react";

const PROGRAMS = {
  "Starting Strength": {
    days: ["Workout A", "Workout B"],
    workouts: {
      "Workout A": ["Squat", "Bench Press", "Deadlift"],
      "Workout B": ["Squat", "Overhead Press", "Barbell Row"],
    },
  },
  "5x5 StrongLifts": {
    days: ["Workout A", "Workout B"],
    workouts: {
      "Workout A": ["Squat", "Bench Press", "Barbell Row"],
      "Workout B": ["Squat", "Overhead Press", "Deadlift"],
    },
  },
  "Push Pull Legs": {
    days: ["Push", "Pull", "Legs"],
    workouts: {
      Push: ["Bench Press", "Overhead Press", "Tricep Pushdown"],
      Pull: ["Barbell Row", "Pull-Up", "Bicep Curl"],
      Legs: ["Squat", "Romanian Deadlift", "Leg Press"],
    },
  },
  "Upper Lower": {
    days: ["Upper A", "Lower A", "Upper B", "Lower B"],
    workouts: {
      "Upper A": ["Bench Press", "Barbell Row", "Overhead Press"],
      "Lower A": ["Squat", "Romanian Deadlift", "Leg Press"],
      "Upper B": ["Incline Bench Press", "Pull-Up", "Lateral Raise"],
      "Lower B": ["Deadlift", "Hack Squat", "Leg Curl"],
    },
  },
};

const PLATE_COLORS = {
  25: "#E53E3E",
  20: "#3182CE",
  15: "#38A169",
  10: "#D69E2E",
  5: "#805AD5",
  2.5: "#DD6B20",
  1.25: "#718096",
};

function calcPlates(targetKg, barKg = 20) {
  const sideWeight = (targetKg - barKg) / 2;
  const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
  let remaining = sideWeight;
  const result = [];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) {
      result.push({ weight: p, count });
      remaining -= count * p;
    }
  }
  return result;
}

function nextWeight(current, increment = 2.5) {
  return Math.round((current + increment) * 4) / 4;
}

function deload(current) {
  return Math.round(current * 0.9 * 4) / 4;
}

const ACCENT = "#F6AD3A";
const BG = "#0A0A0F";
const SURFACE = "#12121A";
const SURFACE2 = "#1A1A26";
const BORDER = "#2A2A3E";
const TEXT = "#E8E8F0";
const MUTED = "#6B6B8A";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  
  * { box-sizing: border-box; margin: 0; padding: 0; }
  
  body {
    background: ${BG};
    color: ${TEXT};
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${BG}; }
  ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px; }

  .app-shell {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .header {
    padding: 20px 20px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${BORDER};
    background: ${BG};
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    color: ${ACCENT};
    line-height: 1;
  }

  .logo span { color: ${TEXT}; }

  .streak-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    background: ${SURFACE2};
    border: 1px solid ${BORDER};
    border-radius: 20px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    color: ${ACCENT};
  }

  .nav {
    display: flex;
    background: ${SURFACE};
    border-top: 1px solid ${BORDER};
    position: sticky;
    bottom: 0;
    z-index: 100;
  }

  .nav-btn {
    flex: 1;
    padding: 12px 0;
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    color: ${MUTED};
    transition: color 0.15s;
    letter-spacing: 0.5px;
    text-transform: uppercase;
  }

  .nav-btn.active { color: ${ACCENT}; }
  .nav-btn svg { width: 20px; height: 20px; }

  .content { flex: 1; overflow-y: auto; padding-bottom: 80px; }

  .section { padding: 20px; }

  .section-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 1.5px;
    color: ${TEXT};
    margin-bottom: 16px;
  }

  .card {
    background: ${SURFACE};
    border: 1px solid ${BORDER};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
  }

  .card-accent { border-left: 3px solid ${ACCENT}; }

  .btn-primary {
    background: ${ACCENT};
    color: #0A0A0F;
    border: none;
    border-radius: 10px;
    padding: 14px 24px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 18px;
    letter-spacing: 1.5px;
    cursor: pointer;
    width: 100%;
    transition: opacity 0.15s, transform 0.1s;
  }

  .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
  .btn-primary:active { transform: translateY(0); }

  .btn-secondary {
    background: ${SURFACE2};
    color: ${TEXT};
    border: 1px solid ${BORDER};
    border-radius: 10px;
    padding: 11px 20px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .btn-secondary:hover { border-color: ${ACCENT}; }

  .btn-icon {
    background: ${SURFACE2};
    border: 1px solid ${BORDER};
    border-radius: 8px;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    color: ${TEXT};
    font-size: 18px;
    transition: background 0.15s;
  }

  .btn-icon:hover { background: ${BORDER}; }

  .input {
    background: ${SURFACE2};
    border: 1px solid ${BORDER};
    border-radius: 8px;
    padding: 10px 14px;
    color: ${TEXT};
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    width: 100%;
    outline: none;
    transition: border-color 0.15s;
  }

  .input:focus { border-color: ${ACCENT}; }

  .label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: ${MUTED};
    margin-bottom: 6px;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    background: ${SURFACE2};
    border: 1px solid ${BORDER};
    border-radius: 6px;
    padding: 3px 10px;
    font-size: 12px;
    font-weight: 500;
    color: ${MUTED};
  }

  .tag-accent {
    background: rgba(246,173,58,0.12);
    border-color: rgba(246,173,58,0.3);
    color: ${ACCENT};
  }

  .tag-green {
    background: rgba(56,161,105,0.12);
    border-color: rgba(56,161,105,0.3);
    color: #68D391;
  }

  .tag-red {
    background: rgba(229,62,62,0.12);
    border-color: rgba(229,62,62,0.3);
    color: #FC8181;
  }

  .progress-bar-wrap {
    background: ${SURFACE2};
    border-radius: 4px;
    height: 6px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: ${ACCENT};
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .exercise-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 0;
    border-bottom: 1px solid ${BORDER};
  }

  .exercise-row:last-child { border-bottom: none; }

  .ex-name {
    font-weight: 600;
    font-size: 15px;
    margin-bottom: 3px;
  }

  .ex-sub { font-size: 12px; color: ${MUTED}; }

  .weight-display {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 1px;
    color: ${ACCENT};
    line-height: 1;
  }

  .weight-unit {
    font-size: 14px;
    color: ${MUTED};
    font-family: 'DM Sans', sans-serif;
  }

  .stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }

  .stat-card {
    background: ${SURFACE2};
    border: 1px solid ${BORDER};
    border-radius: 10px;
    padding: 14px;
  }

  .stat-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 1px;
    color: ${ACCENT};
    line-height: 1;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 11px;
    color: ${MUTED};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 600;
  }

  .pr-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid ${BORDER};
  }

  .pr-item:last-child { border-bottom: none; }

  .coach-banner {
    background: linear-gradient(135deg, rgba(246,173,58,0.15) 0%, rgba(246,173,58,0.05) 100%);
    border: 1px solid rgba(246,173,58,0.3);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .coach-icon { font-size: 24px; flex-shrink: 0; }

  .coach-msg {
    font-size: 14px;
    color: ${TEXT};
    line-height: 1.5;
  }

  .coach-msg strong { color: ${ACCENT}; }

  .plate-visual {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .plate {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 13px;
    color: white;
    padding: 4px 8px;
    min-width: 36px;
  }

  .program-card {
    background: ${SURFACE};
    border: 1px solid ${BORDER};
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: border-color 0.15s;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .program-card:hover { border-color: ${ACCENT}; }
  .program-card.selected { border-color: ${ACCENT}; background: rgba(246,173,58,0.05); }

  .gym-mode-overlay {
    position: fixed;
    inset: 0;
    background: ${BG};
    z-index: 200;
    display: flex;
    flex-direction: column;
    max-width: 430px;
    margin: 0 auto;
  }

  .gym-header {
    padding: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid ${BORDER};
  }

  .gym-exercise-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 40px;
    letter-spacing: 2px;
    color: ${TEXT};
    text-align: center;
    padding: 0 20px;
    margin-top: 10px;
  }

  .gym-weight {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 88px;
    letter-spacing: -2px;
    color: ${ACCENT};
    text-align: center;
    line-height: 1;
  }

  .gym-unit {
    font-size: 24px;
    color: ${MUTED};
    text-align: center;
    margin-top: -8px;
    margin-bottom: 8px;
  }

  .sets-track {
    display: flex;
    gap: 10px;
    justify-content: center;
    padding: 12px 20px;
    flex-wrap: wrap;
  }

  .set-dot {
    width: 44px; height: 44px;
    border-radius: 10px;
    border: 2px solid ${BORDER};
    display: flex; align-items: center; justify-content: center;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 20px;
    color: ${MUTED};
    cursor: pointer;
    transition: all 0.15s;
  }

  .set-dot.done { background: ${ACCENT}; border-color: ${ACCENT}; color: #0A0A0F; }
  .set-dot.current { border-color: ${ACCENT}; color: ${ACCENT}; }

  .rest-timer {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 56px;
    color: ${ACCENT};
    text-align: center;
    letter-spacing: 2px;
  }

  .rest-label {
    text-align: center;
    color: ${MUTED};
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-top: -8px;
    margin-bottom: 12px;
  }

  .share-card {
    background: linear-gradient(135deg, #1A1A26, #12121A);
    border: 2px solid ${ACCENT};
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    margin: 16px 0;
  }

  .share-pr-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 14px;
    letter-spacing: 3px;
    color: ${MUTED};
    margin-bottom: 4px;
  }

  .share-pr-weight {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 64px;
    color: ${ACCENT};
    letter-spacing: -1px;
    line-height: 1;
  }

  .share-pr-exercise {
    font-size: 18px;
    font-weight: 600;
    color: ${TEXT};
    margin: 4px 0;
  }

  select.input { appearance: none; cursor: pointer; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .fade-in { animation: fadeIn 0.3s ease forwards; }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }
  .pulse { animation: pulse 1.5s ease infinite; }

  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    70% { transform: scale(1.1); }
    100% { transform: scale(1); opacity: 1; }
  }
  .pop-in { animation: popIn 0.3s ease forwards; }
`;

function MiniLineChart({ data, color = ACCENT }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 13 }}>
      Not enough data yet
    </div>
  );
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 360, h = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 16) - 8;
    return `${x},${y}`;
  });
  const pathD = `M ${pts.join(" L ")}`;
  const areaD = `M ${pts[0]} L ${pts.join(" L ")} L ${w},${h} L 0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 100 }}>
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#grad)" />
      <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * w;
        const y = h - ((v - min) / range) * (h - 16) - 8;
        return <circle key={i} cx={x} cy={y} r="4" fill={color} />;
      })}
    </svg>
  );
}

const STORAGE_KEY = "ironprogress_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const DEFAULT_LOG = {
  "Squat": [
    { date: "2025-02-10", weight: 70, reps: 5, sets: 5, failed: false },
    { date: "2025-02-14", weight: 75, reps: 5, sets: 5, failed: false },
    { date: "2025-02-19", weight: 80, reps: 5, sets: 5, failed: false },
    { date: "2025-02-21", weight: 82.5, reps: 5, sets: 5, failed: false },
  ],
  "Bench Press": [
    { date: "2025-02-10", weight: 60, reps: 5, sets: 5, failed: false },
    { date: "2025-02-14", weight: 65, reps: 5, sets: 5, failed: false },
    { date: "2025-02-17", weight: 65, reps: 5, sets: 5, failed: true },
    { date: "2025-02-21", weight: 67.5, reps: 5, sets: 5, failed: false },
  ],
  "Deadlift": [
    { date: "2025-02-10", weight: 100, reps: 5, sets: 1, failed: false },
    { date: "2025-02-14", weight: 105, reps: 5, sets: 1, failed: false },
    { date: "2025-02-21", weight: 110, reps: 5, sets: 1, failed: false },
  ],
};

export default function IronProgress() {
  const saved = loadState();

  const [tab, setTab] = useState("home");
  const [gymMode, setGymMode] = useState(null);
  const [workoutLog, setWorkoutLog] = useState(saved?.workoutLog || DEFAULT_LOG);
  const [selectedProgram, setSelectedProgram] = useState(saved?.selectedProgram || "Starting Strength");
  const [currentDayIdx, setCurrentDayIdx] = useState(saved?.currentDayIdx || 0);
  const [showSharePR, setShowSharePR] = useState(null);
  const [streak] = useState(saved?.streak || 5);
  const restRef = useRef(null);

  // Persist state
  useEffect(() => {
    saveState({ workoutLog, selectedProgram, currentDayIdx, streak });
  }, [workoutLog, selectedProgram, currentDayIdx]);

  // Rest timer
  useEffect(() => {
    if (gymMode?.resting && gymMode.restSecs > 0) {
      restRef.current = setInterval(() => {
        setGymMode(g => {
          if (!g) return g;
          if (g.restSecs <= 1) {
            clearInterval(restRef.current);
            return { ...g, resting: false, restSecs: 0 };
          }
          return { ...g, restSecs: g.restSecs - 1 };
        });
      }, 1000);
    }
    return () => clearInterval(restRef.current);
  }, [gymMode?.resting]);

  const program = PROGRAMS[selectedProgram];
  const currentDay = program.days[currentDayIdx % program.days.length];
  const todaysExercises = program.workouts[currentDay];

  function getLastSet(exercise) {
    const log = workoutLog[exercise];
    return log && log.length > 0 ? log[log.length - 1] : null;
  }

  function getNextWeight(exercise) {
    const last = getLastSet(exercise);
    if (!last) return 20;
    const log = workoutLog[exercise];
    const recent = log.slice(-2);
    const twoFails = recent.length === 2 && recent.every(r => r.failed);
    if (twoFails) return deload(last.weight);
    if (last.failed) return last.weight;
    return nextWeight(last.weight);
  }

  function getFailCount(exercise) {
    const log = workoutLog[exercise];
    if (!log || log.length < 2) return 0;
    return log.slice(-2).filter(r => r.failed).length;
  }

  function getPR(exercise) {
    const log = workoutLog[exercise];
    if (!log || !log.length) return null;
    return Math.max(...log.map(l => l.weight));
  }

  function coachMessage(exercise) {
    const last = getLastSet(exercise);
    if (!last) return { icon: "💪", msg: <span>First time doing <strong>{exercise}</strong> — start light and focus on form.</span> };
    const fails = getFailCount(exercise);
    const next = getNextWeight(exercise);
    if (fails >= 2) return { icon: "⚠️", msg: <span>Deload recommended. Next: <strong>{next}kg</strong>. Recovery is progress.</span> };
    if (last.failed) return { icon: "🔄", msg: <span>Retry at <strong>{last.weight}kg</strong>. You had it — stay focused.</span> };
    const pr = getPR(exercise);
    if (next > pr) return { icon: "🏆", msg: <span>Next session <strong>{next}kg</strong> — new PR incoming!</span> };
    return { icon: "📈", msg: <span>Increase to <strong>{next}kg</strong>. Consistent progression.</span> };
  }

  function logWorkout(exercise, weight, reps, sets, failed) {
    const entry = { date: new Date().toISOString().split("T")[0], weight, reps, sets, failed };
    setWorkoutLog(log => {
      const prev = log[exercise] || [];
      const pr = getPR(exercise);
      if (!failed && weight > (pr || 0)) {
        setTimeout(() => setShowSharePR({ exercise, weight, reps }), 400);
      }
      return { ...log, [exercise]: [...prev, entry] };
    });
  }

  function startGymMode() {
    setGymMode({ exerciseIdx: 0, setsDone: [], resting: false, restSecs: 0 });
  }

  function gymCompleteSet(setIdx) {
    setGymMode(g => {
      const exercise = todaysExercises[g.exerciseIdx];
      const totalSets = getLastSet(exercise)?.sets || 5;
      const newDone = [...g.setsDone, setIdx];
      const allDone = newDone.length >= totalSets;
      return { ...g, setsDone: newDone, resting: !allDone, restSecs: !allDone ? 90 : 0 };
    });
  }

  function gymNextExercise(failed = false) {
    const exercise = todaysExercises[gymMode.exerciseIdx];
    const last = getLastSet(exercise);
    const weight = last ? last.weight : 20;
    logWorkout(exercise, weight, last?.reps || 5, last?.sets || 5, failed);
    if (gymMode.exerciseIdx + 1 >= todaysExercises.length) {
      setGymMode(null);
      setCurrentDayIdx(i => i + 1);
    } else {
      setGymMode(g => ({ ...g, exerciseIdx: g.exerciseIdx + 1, setsDone: [], resting: false, restSecs: 0 }));
    }
  }

  const allExercises = Object.keys(workoutLog);
  const totalWorkouts = Object.values(workoutLog).reduce((a, b) => a + b.length, 0);
  const totalVolume = Object.values(workoutLog).reduce((acc, logs) =>
    acc + logs.reduce((s, l) => s + l.weight * l.reps * l.sets, 0), 0);

  function HomeTab() {
    return (
      <div className="section fade-in">
        <div className="coach-banner">
          <div className="coach-icon">🤖</div>
          <div className="coach-msg">
            Today: <strong>{currentDay}</strong> — {selectedProgram}. Ready to lift?
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalWorkouts}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{(totalVolume / 1000).toFixed(1)}t</div>
            <div className="stat-label">Total Volume</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{allExercises.length}</div>
            <div className="stat-label">Exercises</div>
          </div>
        </div>

        <div className="section-title">Today's Workout</div>

        {todaysExercises.map((ex) => {
          const nw = getNextWeight(ex);
          const last = getLastSet(ex);
          const { icon, msg } = coachMessage(ex);
          const plates = calcPlates(nw);
          return (
            <div key={ex} className="card card-accent">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div className="ex-name">{ex}</div>
                  {last && <div className="ex-sub">Last: {last.weight}kg × {last.reps} × {last.sets}sets</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="weight-display">{nw}</div>
                  <div className="weight-unit">kg</div>
                </div>
              </div>
              <div className="coach-banner" style={{ margin: "8px 0", padding: "10px 12px" }}>
                <div style={{ fontSize: 16 }}>{icon}</div>
                <div className="coach-msg" style={{ fontSize: 13 }}>{msg}</div>
              </div>
              {plates.length > 0 && (
                <div>
                  <div className="label" style={{ marginBottom: 4 }}>Plates per side</div>
                  <div className="plate-visual">
                    {plates.map((p, i) =>
                      Array(p.count).fill(0).map((_, j) => (
                        <div key={`${i}-${j}`} className="plate" style={{ background: PLATE_COLORS[p.weight] || "#555" }}>
                          {p.weight}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <button className="btn-primary" onClick={startGymMode} style={{ marginTop: 8 }}>
          🏋️ START GYM MODE
        </button>
      </div>
    );
  }

  function ProgressTab() {
    const [selEx, setSelEx] = useState(allExercises[0] || "Squat");
    const exLog = workoutLog[selEx] || [];
    const chartData = exLog.map(l => l.weight);
    const pr = getPR(selEx);

    return (
      <div className="section fade-in">
        <div className="section-title">Progress</div>
        <div style={{ marginBottom: 16 }}>
          <div className="label">Exercise</div>
          <select className="input" value={selEx} onChange={e => setSelEx(e.target.value)}>
            {allExercises.map(ex => <option key={ex} value={ex}>{ex}</option>)}
          </select>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div className="label">Personal Record</div>
              <div className="weight-display">{pr || "—"} <span className="weight-unit">kg</span></div>
            </div>
            {pr && (
              <button className="btn-secondary" onClick={() => setShowSharePR({ exercise: selEx, weight: pr, reps: 5 })}>
                Share PR 📣
              </button>
            )}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="label" style={{ marginBottom: 8 }}>Strength Over Time</div>
          <MiniLineChart data={chartData} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <div style={{ fontSize: 11, color: MUTED }}>{exLog[0]?.date}</div>
            <div style={{ fontSize: 11, color: MUTED }}>{exLog[exLog.length - 1]?.date}</div>
          </div>
        </div>
        <div className="section-title">All PRs</div>
        <div className="card">
          {allExercises.map(ex => {
            const pr = getPR(ex);
            const log = workoutLog[ex] || [];
            const trend = log.length >= 2
              ? log[log.length - 1].weight > log[log.length - 2].weight ? "↑" : "→"
              : "—";
            return (
              <div key={ex} className="pr-item" onClick={() => setSelEx(ex)} style={{ cursor: "pointer" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{ex}</div>
                  <div style={{ fontSize: 12, color: MUTED }}>{log.length} sessions</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, color: ACCENT }}>{pr || "—"}kg</div>
                  <div style={{ fontSize: 13, color: trend === "↑" ? "#68D391" : MUTED }}>{trend} trending</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function ProgramsTab() {
    return (
      <div className="section fade-in">
        <div className="section-title">Programs</div>
        <div className="coach-banner">
          <div className="coach-icon">📋</div>
          <div className="coach-msg">
            Select a program and follow it consistently. <strong>Consistency beats perfection</strong> every time.
          </div>
        </div>
        {Object.entries(PROGRAMS).map(([name, prog]) => (
          <div
            key={name}
            className={`program-card ${selectedProgram === name ? "selected" : ""}`}
            onClick={() => { setSelectedProgram(name); setCurrentDayIdx(0); }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: 13, color: MUTED }}>{prog.days.length}-day split</div>
              <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {prog.days.map(d => <span key={d} className="tag">{d}</span>)}
              </div>
            </div>
            {selectedProgram === name && <span className="tag-accent">ACTIVE</span>}
          </div>
        ))}
      </div>
    );
  }

  function LogTab() {
    const [ex, setEx] = useState("");
    const [weight, setWeight] = useState("");
    const [reps, setReps] = useState("5");
    const [sets, setSets] = useState("5");
    const [failed, setFailed] = useState(false);
    const [added, setAdded] = useState(false);

    function handleAdd() {
      if (!ex || !weight) return;
      logWorkout(ex, parseFloat(weight), parseInt(reps), parseInt(sets), failed);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      setWeight("");
      setFailed(false);
    }

    const recentEntries = [];
    Object.entries(workoutLog).forEach(([exercise, logs]) => {
      logs.slice(-3).forEach(l => recentEntries.push({ exercise, ...l }));
    });
    recentEntries.sort((a, b) => b.date.localeCompare(a.date));

    return (
      <div className="section fade-in">
        <div className="section-title">Log Workout</div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <div className="label">Exercise</div>
            <input className="input" value={ex} onChange={e => setEx(e.target.value)} placeholder="e.g. Bench Press" list="ex-list" />
            <datalist id="ex-list">
              {["Squat", "Bench Press", "Deadlift", "Overhead Press", "Barbell Row", "Pull-Up", "Bicep Curl", "Leg Press", "Romanian Deadlift"].map(e =>
                <option key={e} value={e} />
              )}
            </datalist>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            <div>
              <div className="label">Weight (kg)</div>
              <input className="input" type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="80" />
            </div>
            <div>
              <div className="label">Reps</div>
              <input className="input" type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder="5" />
            </div>
            <div>
              <div className="label">Sets</div>
              <input className="input" type="number" value={sets} onChange={e => setSets(e.target.value)} placeholder="5" />
            </div>
          </div>
          <div style={{ marginBottom: 12 }}>
            <button
              onClick={() => setFailed(!failed)}
              style={{
                background: failed ? "rgba(229,62,62,0.15)" : SURFACE2,
                border: `1px solid ${failed ? "#E53E3E" : BORDER}`,
                color: failed ? "#FC8181" : MUTED,
                borderRadius: 8, padding: "8px 14px", cursor: "pointer",
                fontSize: 13, fontFamily: "'DM Sans'"
              }}
            >
              {failed ? "✗ Marked as Failed" : "Mark as Failed"}
            </button>
          </div>
          <button className="btn-primary" onClick={handleAdd}>
            {added ? "✓ LOGGED!" : "LOG WORKOUT"}
          </button>
        </div>
        <div className="section-title">Recent Logs</div>
        <div className="card">
          {recentEntries.slice(0, 10).map((entry, i) => (
            <div key={i} className="exercise-row">
              <div>
                <div className="ex-name">{entry.exercise}</div>
                <div className="ex-sub">{entry.date}</div>
              </div>
              <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, color: entry.failed ? "#FC8181" : ACCENT }}>
                    {entry.weight}kg
                  </div>
                  <div style={{ fontSize: 12, color: MUTED }}>{entry.sets}×{entry.reps}</div>
                </div>
                {entry.failed && <span className="tag-red">Failed</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function GymModeOverlay() {
    if (!gymMode) return null;
    const exercise = todaysExercises[gymMode.exerciseIdx];
    const last = getLastSet(exercise);
    const targetWeight = getNextWeight(exercise);
    const totalSets = last?.sets || 5;
    const reps = last?.reps || 5;
    const plates = calcPlates(targetWeight);
    const formatTime = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

    return (
      <div className="gym-mode-overlay fade-in">
        <div className="gym-header">
          <div>
            <div className="label">Exercise {gymMode.exerciseIdx + 1} of {todaysExercises.length}</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{currentDay}</div>
          </div>
          <button className="btn-secondary" onClick={() => setGymMode(null)}>✕ Exit</button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }}>
          <div className="gym-exercise-name">{exercise}</div>
          <div className="gym-weight">{targetWeight}</div>
          <div className="gym-unit">kg × {reps} reps</div>

          {gymMode.resting ? (
            <div style={{ padding: "8px 20px 0" }}>
              <div className="rest-timer pulse">{formatTime(gymMode.restSecs)}</div>
              <div className="rest-label">Rest Timer</div>
              <button className="btn-secondary" style={{ width: "100%" }}
                onClick={() => setGymMode(g => ({ ...g, resting: false, restSecs: 0 }))}>
                Skip Rest
              </button>
            </div>
          ) : (
            <div>
              <div className="label" style={{ textAlign: "center", marginBottom: 8 }}>Tap to complete set</div>
              <div className="sets-track">
                {Array(totalSets).fill(0).map((_, i) => (
                  <div
                    key={i}
                    className={`set-dot ${gymMode.setsDone.includes(i) ? "done" : gymMode.setsDone.length === i ? "current" : ""}`}
                    onClick={() => !gymMode.setsDone.includes(i) && gymMode.setsDone.length === i && gymCompleteSet(i)}
                  >
                    {gymMode.setsDone.includes(i) ? "✓" : i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}

          {gymMode.setsDone.length >= totalSets && !gymMode.resting && (
            <div style={{ padding: "12px 20px 0" }} className="fade-in">
              <div className="coach-banner">
                <div className="coach-icon">💪</div>
                <div className="coach-msg">All sets done! How did it go?</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button className="btn-secondary" onClick={() => gymNextExercise(true)}
                  style={{ borderColor: "#E53E3E", color: "#FC8181" }}>
                  ✗ Failed
                </button>
                <button className="btn-primary" onClick={() => gymNextExercise(false)}>
                  ✓ Completed
                </button>
              </div>
            </div>
          )}

          {plates.length > 0 && (
            <div style={{ padding: "16px 20px 0" }}>
              <div className="card">
                <div className="label">Plates per side</div>
                <div className="plate-visual" style={{ marginTop: 8 }}>
                  {plates.map((p, i) =>
                    Array(p.count).fill(0).map((_, j) => (
                      <div key={`${i}-${j}`} className="plate" style={{ background: PLATE_COLORS[p.weight] || "#555" }}>
                        {p.weight}
                      </div>
                    ))
                  )}
                </div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>+ 20kg bar = {targetWeight}kg total</div>
              </div>
            </div>
          )}

          <div style={{ padding: "0 20px" }}>
            <div className="progress-bar-wrap" style={{ marginTop: 16 }}>
              <div className="progress-bar-fill" style={{ width: `${(gymMode.exerciseIdx / todaysExercises.length) * 100}%` }} />
            </div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 4, textAlign: "center" }}>
              {gymMode.exerciseIdx} / {todaysExercises.length} exercises done
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SharePRModal() {
    if (!showSharePR) return null;
    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20
      }} onClick={() => setShowSharePR(null)}>
        <div className="pop-in" onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 380 }}>
          <div className="share-card">
            <div className="share-pr-text">🏆 NEW PERSONAL RECORD</div>
            <div className="share-pr-weight">{showSharePR.weight}<span style={{ fontSize: 32 }}>kg</span></div>
            <div className="share-pr-exercise">{showSharePR.exercise}</div>
            <div style={{ color: MUTED, fontSize: 14, marginTop: 4 }}>{showSharePR.reps} reps</div>
            <div style={{ marginTop: 12, color: MUTED, fontSize: 12, letterSpacing: 2, textTransform: "uppercase" }}>
              Iron Progress
            </div>
          </div>
          <button className="btn-primary" onClick={() => setShowSharePR(null)}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="app-shell">
        <div className="header">
          <div className="logo">Iron<span>Progress</span></div>
          <div className="streak-badge">🔥 {streak} day streak</div>
        </div>
        <div className="content">
          {tab === "home" && <HomeTab />}
          {tab === "progress" && <ProgressTab />}
          {tab === "programs" && <ProgramsTab />}
          {tab === "log" && <LogTab />}
        </div>
        <nav className="nav">
          {[
            { id: "home", label: "Today", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
            { id: "progress", label: "Progress", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
            { id: "programs", label: "Programs", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> },
            { id: "log", label: "Log", icon: <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg> },
          ].map(({ id, label, icon }) => (
            <button key={id} className={`nav-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>
              {icon}{label}
            </button>
          ))}
        </nav>
        <GymModeOverlay />
        <SharePRModal />
      </div>
    </>
  );
}
