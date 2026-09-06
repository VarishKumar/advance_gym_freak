import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const WORKOUT_DATABASE = {
  home: {
    title: "Home Workout (Bodyweight & Resistance)",
    splits: [
      { day: 'Day 1', name: 'Upper Body & Core', exercises: ['Standard & Incline Push-ups (3x15)', 'Doorframe / Towel Rows (3x12)', 'Pike Push-ups for Shoulders (3x10)', 'Plank to Push-up (3x12)'] },
      { day: 'Day 2', name: 'Lower Body & Mobility', exercises: ['Bodyweight Deep Squats / Jump Squats (4x15)', 'Walking Lunges (3x12/leg)', 'Glute Bridges (Spine Safe, 3x15)', 'Calf Raises on Edge (3x20)'] },
      { day: 'Day 3', name: 'Full Body HIIT & Cardio Burn', exercises: ['Burpees / Modified Sprawls (3x10)', 'Mountain Climbers (3x30 sec)', 'Bicycle Crunches (3x20)', 'High Knees (3x45 sec)'] },
      { day: 'Day 4', name: 'Active Rest & Full Body Stretch', exercises: ['Cobra Stretch & Child Pose (5 mins)', 'Hamstring & Quad Dynamic Stretch', 'Cat-Cow Core Stretches'] }
    ]
  },
  gym_ppl: {
    title: "Gym: Push Pull Legs (PPL)",
    splits: [
      { day: 'Day 1', name: 'Push (Chest, Delts, Triceps)', exercises: ['Incline Barbell/Dumbbell Press (4x10)', 'Flat Dumbbell Press (3x10)', 'Overhead Dumbbell Shoulder Press (3x12)', 'Cable Tricep Pushdowns & Skull Crushers (3x15)'] },
      { day: 'Day 2', name: 'Pull (Back, Rear Delts, Biceps)', exercises: ['Lat Pulldowns (Wide Grip, 4x10)', 'Chest-Supported T-Bar / Cable Rows (3x12)', 'Face Pulls for Rear Delts (3x15)', 'Barbell / Incline Bicep Curls (3x12)'] },
      { day: 'Day 3', name: 'Legs & Calves', exercises: ['Barbell Squats / Leg Press (4x10)', 'Romanian Deadlifts / Lying Hamstring Curls (3x12)', 'Bulgarian Split Squats (3x10)', 'Standing Machine Calf Raises (4x15)'] },
      { day: 'Day 4', name: 'Core & Active Recovery / Light Cardio', exercises: ['Hanging Knee/Leg Raises (3x15)', 'Cable Woodchoppers (3x12)', '25 Mins Incline Treadmill Walk'] }
    ]
  },
  gym_two_muscle: {
    title: "Gym: Two Muscles / Day (Classic Split)",
    splits: [
      { day: 'Day 1', name: 'Chest & Triceps', exercises: ['Flat Bench Press (4x10)', 'Incline Dumbbell Fly/Press (3x12)', 'Dips (Weighted/Bodyweight, 3x10)', 'Overhead Rope Tricep Extension (3x15)'] },
      { day: 'Day 2', name: 'Back & Biceps', exercises: ['Deadlift / Lat Pulldown (4x8)', 'Bent-Over Barbell Rows (3x10)', 'Preacher Curls (3x12)', 'Hammer Curls for Forearms (3x12)'] },
      { day: 'Day 3', name: 'Shoulders & Traps', exercises: ['Seated Dumbbell Shoulder Press (4x10)', 'Dumbbell Lateral Raises (4x15)', 'Barbell / Dumbbell Shrugs (4x12)', 'Reverse Pec Deck Fly (3x15)'] },
      { day: 'Day 4', name: 'Legs & Abs', exercises: ['Barbell Squats (4x10)', 'Leg Extension & Leg Curl Superset (3x12)', 'Walking Dumbbell Lunges (3x12)', 'Hanging Leg Raises & Plank (3 sets)'] }
    ]
  },
  gym_one_muscle: {
    title: "Gym: One Muscle / Day (Bro Split)",
    splits: [
      { day: 'Day 1', name: 'Chest Day', exercises: ['Flat Barbell Bench Press (4x8-10)', 'Incline Dumbbell Press (4x10)', 'Cable Chest Flys (3x15)', 'Push-ups Burnout (2 sets to failure)'] },
      { day: 'Day 2', name: 'Back Day', exercises: ['Conventional Deadlifts / Rack Pulls (4x6)', 'Wide-Grip Lat Pulldowns (4x10)', 'Seated Cable Rows (3x12)', 'Single-Arm Dumbbell Rows (3x10)'] },
      { day: 'Day 3', name: 'Shoulder Day', exercises: ['Standing Overhead Barbell Press (4x8)', 'Side Lateral Raises (4x15)', 'Front Plate Raises (3x12)', 'Rear Delt Flys & Shrugs (4x12)'] },
      { day: 'Day 4', name: 'Arms (Biceps & Triceps)', exercises: ['Barbell Bicep Curls (4x10)', 'Close-Grip Bench Press (4x10)', 'Incline Hammer Curls (3x12)', 'Skull Crushers & Tricep Pushdowns (3x15)'] },
      { day: 'Day 5', name: 'Leg Day', exercises: ['Barbell Squats (4x10)', 'Leg Press (4x12)', 'Hamstring Curls (4x12)', 'Standing Calf Raises (4x20)'] }
    ]
  }
};

const HEALTH_CONDITIONS = [
  { id: 'knee_pain', label: 'Knee Joint Pain', caution: 'Avoid heavy barbell squats; auto-adapted to knee-friendly extensions & box squats.', tag: 'Orthopedic' },
  { id: 'lower_back', label: 'Lower Back Issue / Sciatica', caution: 'Avoid conventional deadlifts; auto-adapted to chest-supported rows.', tag: 'Orthopedic' },
  { id: 'hypertension', label: 'High Blood Pressure', caution: 'Avoid prolonged Valsalva breathing; maintain steady cadence and light cardio.', tag: 'Cardiovascular' },
  { id: 'diabetes', label: 'Type 2 Diabetes / Insulin Resistance', caution: 'Prioritize resistance training after meals to improve glucose clearance.', tag: 'Metabolic' },
  { id: 'pcod', label: 'PCOS / Hormonal Imbalance', caution: 'Focus on progressive resistance training with steady rest periods; limit high cortisol.', tag: 'Metabolic' }
];

const EXPERTS = [
  {
    id: 'dr_sharma',
    name: 'Dr. Aditi Sharma, MD',
    role: 'Clinical Nutritionist & Metabolic Specialist',
    focus: 'PCOD, Thyroid & Diabetes Glycemic Control',
    rating: '4.9 ★',
    fee: '₹799',
    badge: 'Disha Verified'
  },
  {
    id: 'dr_varun',
    name: 'Varun Kashyap, MPT',
    role: 'Sports Physiotherapist & Rehab Expert',
    focus: 'Knee Rehab, Sciatica & Spine Posture Alignment',
    rating: '4.95 ★',
    fee: '₹899',
    badge: 'Orthopedic Lead'
  },
  {
    id: 'coach_ranveer',
    name: 'Ranveer Chauhan, CSCS',
    role: 'Elite Hypertrophy & Strength Coach',
    focus: 'Plateau Breaking, Body Recomposition & Biomechanics',
    rating: '4.85 ★',
    fee: '₹649',
    badge: 'Biomechanics Pro'
  }
];

const TIME_SLOTS = ['10:00 AM', '11:30 AM', '03:00 PM', '05:30 PM', '07:00 PM'];

const INDIAN_FOOD_PRESETS = [
  { name: 'Soya Chunks (Nutrela)', serving: '50g (Dry boiled)', cal: 172, pro: 26.0, carb: 16.5, fat: 0.5, category: 'veg' },
  { name: 'Paneer (Raw/Sautéed)', serving: '100g', cal: 265, pro: 18.3, carb: 3.5, fat: 20.8, category: 'veg' },
  { name: 'Tofu (Soya Paneer)', serving: '100g', cal: 83, pro: 10.0, carb: 1.9, fat: 5.3, category: 'veg' },
  { name: 'Dal (Moong/Arhar/Masoor)', serving: '1 big katori (150g)', cal: 150, pro: 9.0, carb: 21.0, fat: 3.5, category: 'veg' },
  { name: 'Rajma / Chana Curry', serving: '1 katori (150g)', cal: 180, pro: 9.5, carb: 26.0, fat: 4.0, category: 'veg' },
  { name: 'Roti / Chapati (Wheat)', serving: '1 piece (35g)', cal: 104, pro: 3.1, carb: 20.0, fat: 0.5, category: 'veg' },
  { name: 'Cooked White Rice', serving: '1 katori (150g)', cal: 195, pro: 4.1, carb: 42.0, fat: 0.4, category: 'veg' },
  { name: 'Curd / Dahi (Low Fat)', serving: '1 katori (150g)', cal: 90, pro: 5.5, carb: 6.8, fat: 3.0, category: 'veg' },
  { name: 'Sattu Drink (Roasted Chana)', serving: '40g powder (1 glass)', cal: 164, pro: 10.2, carb: 26.0, fat: 2.1, category: 'veg' },
  { name: 'Oats with Milk & Nuts', serving: '1 bowl (50g oats + milk)', cal: 310, pro: 13.5, carb: 45.0, fat: 6.5, category: 'veg' },
  { name: 'Sprouted Moong Salad', serving: '1 bowl (100g)', cal: 135, pro: 9.2, carb: 22.0, fat: 0.8, category: 'veg' },
  { name: 'Peanut Butter (Natural)', serving: '2 tbsp (32g)', cal: 190, pro: 8.0, carb: 6.0, fat: 16.0, category: 'veg' },
  { name: 'Whey Protein (1 Scoop)', serving: '33g scoop with water', cal: 130, pro: 24.0, carb: 3.0, fat: 1.5, category: 'veg' },
  { name: 'Boiled Whole Eggs', serving: '2 whole eggs', cal: 155, pro: 13.0, carb: 1.1, fat: 10.6, category: 'egg' },
  { name: 'Egg Whites (Boiled)', serving: '3 egg whites', cal: 52, pro: 11.0, carb: 0.7, fat: 0.2, category: 'egg' },
  { name: 'Egg Omelette (2 Eggs + Veggies)', serving: '1 serving', cal: 180, pro: 14.0, carb: 3.0, fat: 12.0, category: 'egg' },
  { name: 'Chicken Breast (Grilled/Cooked)', serving: '100g', cal: 165, pro: 31.0, carb: 0.0, fat: 3.6, category: 'non_veg' },
  { name: 'Chicken Curry (Home Style)', serving: '150g (3-4 pcs)', cal: 240, pro: 25.0, carb: 6.0, fat: 12.0, category: 'non_veg' },
  { name: 'Fish Fillet (Rohu/Basa)', serving: '100g', cal: 125, pro: 22.0, carb: 0.0, fat: 4.0, category: 'non_veg' }
];

const playGymBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.log('Audio prompt skipped:', e);
  }
};

function PRWallView({ exerciseLogs, onAddCustomExercise }) {
  const [customName, setCustomName] = useState('');
  const [customTarget, setCustomTarget] = useState('Chest');
  const [customSplit, setCustomSplit] = useState('gym_ppl');
  const [customDay, setCustomDay] = useState('Day 1');

  const keyLifts = [
    { title: 'Bench Press', keywords: ['bench press', 'flat barbell', 'flat dumbbell', 'chest press'], icon: '🏋️‍♂️' },
    { title: 'Barbell Squat', keywords: ['barbell squat', 'squat', 'leg press'], icon: '🦵' },
    { title: 'Deadlift', keywords: ['deadlift', 'rack pull'], icon: '⚡' },
    { title: 'Overhead Shoulder Press', keywords: ['shoulder press', 'overhead barbell', 'overhead dumbbell'], icon: '💥' },
    { title: 'Bicep Curl', keywords: ['bicep curl', 'barbell curl', 'preacher curl', 'hammer curl'], icon: '💪' },
    { title: 'Lat Pulldown / Row', keywords: ['lat pulldown', 'cable row', 'barbell row'], icon: '🦅' }
  ];

  const calculateLiftPR = (keywords) => {
    let maxWeight = 0;
    let maxReps = 0;
    let exerciseFound = '';
    let recordDate = '';

    Object.entries(exerciseLogs).forEach(([name, sets]) => {
      const lower = name.toLowerCase();
      if (keywords.some(k => lower.includes(k))) {
        sets.forEach(s => {
          const w = parseFloat(s.weight) || 0;
          if (w > maxWeight) {
            maxWeight = w;
            maxReps = s.reps || 1;
            exerciseFound = name;
            recordDate = s.date;
          }
        });
      }
    });

    const est1RM = maxWeight > 0 ? Math.round(maxWeight * (1 + maxReps / 30)) : 0;
    return { maxWeight, maxReps, exerciseFound, recordDate, est1RM };
  };

  const handleCreateCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) return;
    onAddCustomExercise({
      name: customName.trim(),
      target_muscle: customTarget,
      split_type: customSplit,
      day_label: customDay
    });
    setCustomName('');
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-gradient-to-r from-[#121824]/90 via-[#0A0E17]/80 to-[#121824]/90 backdrop-blur-xl shadow-[0_0_50px_rgba(0,229,255,0.06)]">
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
              Hall of Overload
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white">🏆 PR Trophy Wall</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Automated 1-Rep Max benchmarks calculated directly from your logged workout records.
            </p>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {keyLifts.map((lift, idx) => {
          const pr = calculateLiftPR(lift.keywords);
          const hasPR = pr.maxWeight > 0;

          return (
            <div
              key={idx}
              className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                hasPR
                  ? 'bg-[#121824]/70 border-[#00E5FF]/30 hover:border-[#00E5FF] hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] backdrop-blur-md'
                  : 'bg-[#0A0E17]/50 border-white/5 opacity-60'
              }`}
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">{lift.icon}</span>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                    hasPR ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40' : 'bg-white/5 text-gray-500 border-white/10'
                  }`}>
                    {hasPR ? 'RECORD HOLDER' : 'LOCKED'}
                  </span>
                </div>
                <h3 className="text-base font-black text-white mt-4 tracking-wide">{lift.title}</h3>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">
                  {hasPR ? pr.exerciseFound : 'Log this lift to unlock trophy'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-end">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-bold">Max Weight</span>
                  <span className="text-2xl font-black font-mono text-white tracking-tight">
                    {hasPR ? `${pr.maxWeight} kg` : '--'}
                  </span>
                  {hasPR && <span className="text-xs text-gray-400 ml-1 font-mono">× {pr.maxReps}</span>}
                </div>
                {hasPR && (
                  <div className="text-right">
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-bold">Est. 1RM</span>
                    <span className="text-xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                      {pr.est1RM} kg
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <div>
          <h3 className="font-black text-base flex items-center gap-2 text-white">
            🛠️ Custom Exercise Builder
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Create any gym machine, cable variant, or bodyweight progression to embed in your workout routine.
          </p>
        </div>

        <form onSubmit={handleCreateCustom} className="grid sm:grid-cols-5 gap-3 pt-2">
          <div className="sm:col-span-2">
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Exercise Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Incline Smith Press, Cable Bayesian Curl"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Target Muscle</label>
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            >
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Shoulders">Shoulders</option>
              <option value="Arms">Arms</option>
              <option value="Legs">Legs</option>
              <option value="Core">Core</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Assign to Split</label>
            <select
              value={customSplit}
              onChange={(e) => setCustomSplit(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            >
              <option value="gym_ppl">Push Pull Legs</option>
              <option value="gym_two_muscle">Two Muscle / Day</option>
              <option value="gym_one_muscle">Bro Split (1 Muscle)</option>
              <option value="home">Home Workout</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition active:scale-95"
            >
              + Add Exercise
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FoodLoggerView({ currentUser, targetCalories, targetProtein, profileDietPref, onUpdateDietPref }) {
  const [logs, setLogs] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dietFilter, setDietFilter] = useState(profileDietPref || 'veg');

  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState('');
  const [customPro, setCustomPro] = useState('');
  const [customCarb, setCustomCarb] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [mealType, setMealType] = useState('Lunch');

  const loadFoodLogs = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from('food_logs')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('logged_date', selectedDate)
        .order('created_at', { ascending: true });

      if (data && !error) setLogs(data);
    } catch (err) {
      console.error('Error fetching food logs:', err);
    }
  };

  useEffect(() => {
    loadFoodLogs();
  }, [currentUser, selectedDate]);

  const handleAddPreset = async (item) => {
    if (!currentUser?.id) return;
    try {
      const payload = {
        user_id: currentUser.id,
        food_name: item.name,
        serving_size: item.serving,
        quantity: 1,
        calories: item.cal,
        protein: item.pro,
        carbs: item.carb,
        fats: item.fat,
        meal_type: mealType,
        logged_date: selectedDate
      };

      const { error } = await supabase.from('food_logs').insert([payload]);
      if (error) throw error;
      loadFoodLogs();
    } catch (err) {
      alert(`Error logging food: ${err.message}`);
    }
  };

  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!customName || !customCal || !currentUser?.id) return;

    try {
      const payload = {
        user_id: currentUser.id,
        food_name: customName,
        serving_size: 'Custom portion',
        quantity: 1,
        calories: parseFloat(customCal),
        protein: parseFloat(customPro) || 0,
        carbs: parseFloat(customCarb) || 0,
        fats: parseFloat(customFat) || 0,
        meal_type: mealType,
        logged_date: selectedDate
      };

      const { error } = await supabase.from('food_logs').insert([payload]);
      if (error) throw error;

      setCustomName('');
      setCustomCal('');
      setCustomPro('');
      setCustomCarb('');
      setCustomFat('');
      loadFoodLogs();
    } catch (err) {
      alert(`Error logging custom food: ${err.message}`);
    }
  };

  const handleDeleteLog = async (id) => {
    try {
      const { error } = await supabase.from('food_logs').delete().eq('id', id);
      if (error) throw error;
      loadFoodLogs();
    } catch (err) {
      alert(`Error deleting food item: ${err.message}`);
    }
  };

  const visiblePresets = INDIAN_FOOD_PRESETS.filter(item => {
    if (dietFilter === 'veg') return item.category === 'veg';
    if (dietFilter === 'egg') return item.category === 'veg' || item.category === 'egg';
    return true;
  });

  const totalCaloriesLogged = Math.round(logs.reduce((sum, item) => sum + (Number(item.calories) || 0), 0));
  const totalProteinLogged = Math.round(logs.reduce((sum, item) => sum + (Number(item.protein) || 0), 0));
  const totalCarbsLogged = Math.round(logs.reduce((sum, item) => sum + (Number(item.carbs) || 0), 0));
  const totalFatsLogged = Math.round(logs.reduce((sum, item) => sum + (Number(item.fats) || 0), 0));

  const calProgress = Math.min(100, Math.round((totalCaloriesLogged / targetCalories) * 100));
  const proProgress = Math.min(100, Math.round((totalProteinLogged / targetProtein) * 100));

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-gradient-to-r from-[#121824]/90 via-[#0A0E17]/80 to-[#121824]/90 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
              Macro Engine
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white">Indian Diet & Macro Logger</h2>
            <p className="text-xs text-gray-400 mt-1 max-w-lg">
              Precision nutrition balance with regional Indian staple presets and clean macro tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#0A0E17]/80 border border-white/10 text-xs px-3.5 py-2.5 rounded-xl text-white outline-none focus:border-[#00E5FF] transition font-mono shadow-inner"
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 border border-white/10 bg-[#121824]/60 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <span className="text-xs font-bold text-gray-200 block">Dietary Lifestyle:</span>
          <span className="text-[11px] text-gray-400">Filter presets based on your personal intake values</span>
        </div>
        <div className="inline-flex bg-[#0A0E17]/90 p-1 rounded-xl border border-white/5 shadow-inner">
          <button
            onClick={() => { setDietFilter('veg'); onUpdateDietPref('veg'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
              dietFilter === 'veg' ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            🌱 Pure Veg
          </button>
          <button
            onClick={() => { setDietFilter('egg'); onUpdateDietPref('egg'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
              dietFilter === 'egg' ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.3)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            🥚 Eggetarian
          </button>
          <button
            onClick={() => { setDietFilter('non_veg'); onUpdateDietPref('non_veg'); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 ${
              dietFilter === 'non_veg' ? 'bg-[#00E5FF] text-black shadow-[0_0_12px_rgba(0,229,255,0.3)]' : 'text-gray-400 hover:text-white'
            }`}
          >
            🍗 Non-Veg
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300">Daily Calories Burn / Target</span>
            <span className="font-black font-mono text-[#00E5FF]">{totalCaloriesLogged} / {targetCalories} kcal ({calProgress}%)</span>
          </div>
          <div className="w-full bg-[#0A0E17] h-4 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                calProgress >= 100 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] shadow-[0_0_15px_rgba(0,229,255,0.5)]'
              }`}
              style={{ width: `${calProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 block font-medium">
            {targetCalories - totalCaloriesLogged > 0 ? `${targetCalories - totalCaloriesLogged} kcal remaining` : 'Target achieved! 🔥'}
          </span>
        </div>

        <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300">Daily Protein Target</span>
            <span className="font-black font-mono text-emerald-400">{totalProteinLogged} / {targetProtein} g ({proProgress}%)</span>
          </div>
          <div className="w-full bg-[#0A0E17] h-4 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ width: `${proProgress}%` }}
            />
          </div>
          <span className="text-[11px] text-gray-400 block font-mono">
            Carbs: {totalCarbsLogged}g • Fats: {totalFatsLogged}g logged today
          </span>
        </div>
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-black text-base flex items-center gap-2 text-white">
              ⚡ Quick Add {dietFilter === 'veg' ? 'Vegetarian' : dietFilter === 'egg' ? 'Veg & Egg' : 'All'} Presets
            </h3>
            <p className="text-xs text-gray-400">Tap any item to instantly add it to your daily tally</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 font-bold">Meal Slot:</span>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              className="bg-[#0A0E17]/80 border border-white/10 text-xs px-3.5 py-1.5 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snack">Evening Snack</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {visiblePresets.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleAddPreset(item)}
              className="group relative bg-[#0A0E17]/70 border border-white/5 hover:border-[#00E5FF]/40 p-4 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col justify-between hover:shadow-[0_0_20px_rgba(0,229,255,0.15)] active:scale-95"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-black text-white group-hover:text-[#00E5FF] transition tracking-tight">{item.name}</h4>
                  <span className="text-xs">
                    {item.category === 'veg' ? '🌱' : item.category === 'egg' ? '🥚' : '🍗'}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 block mt-1">{item.serving}</span>
              </div>
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center text-[11px] font-mono">
                <span className="text-gray-400 font-bold">{item.cal} kcal</span>
                <span className="text-emerald-400 font-black">+{item.pro}g Pro</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="font-black text-base text-white">✏️ Add Custom Food Entry</h3>
        <form onSubmit={handleAddCustom} className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="col-span-2">
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Food / Recipe Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Sattu Paratha, Besan Chilla"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Calories</label>
            <input
              type="number"
              required
              placeholder="kcal"
              value={customCal}
              onChange={(e) => setCustomCal(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00E5FF] transition font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Protein (g)</label>
            <input
              type="number"
              placeholder="g"
              value={customPro}
              onChange={(e) => setCustomPro(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00E5FF] transition font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Carbs (g)</label>
            <input
              type="number"
              placeholder="g"
              value={customCarb}
              onChange={(e) => setCustomCarb(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00E5FF] transition font-mono"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-black py-3 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
            >
              + Log Food
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="font-black text-base text-white">📑 Logged Meals for {selectedDate}</h3>
          <span className="text-xs text-gray-400 font-mono">{logs.length} items logged</span>
        </div>

        {logs.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No food entries logged for this date. Tap on any preset above to start logging!
          </p>
        ) : (
          <div className="divide-y divide-white/5">
            {logs.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{item.food_name}</span>
                    <span className="text-[9px] bg-white/5 text-[#00E5FF] px-2 py-0.5 rounded-md border border-white/10 font-bold uppercase">
                      {item.meal_type}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 block mt-0.5 font-mono">
                    {item.serving_size} • {item.carbs}g C • {item.fats}g F
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right font-mono">
                    <span className="text-xs font-bold text-white block">{item.calories} kcal</span>
                    <span className="text-[11px] font-black text-emerald-400">+{item.protein}g Pro</span>
                  </div>
                  <button
                    onClick={() => handleDeleteLog(item.id)}
                    className="text-gray-500 hover:text-rose-400 text-xs px-2 py-1 rounded transition"
                    title="Remove entry"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BeforeAfterSlider({ beforeUrl, afterUrl, beforeLabel, afterLabel }) {
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-3xl overflow-hidden select-none border-2 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-black">
      <img 
        src={afterUrl} 
        alt="After Transformation" 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      <span className="absolute bottom-4 right-4 z-10 bg-black/80 text-[#00E5FF] text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-[#00E5FF]/40 backdrop-blur-md">
        {afterLabel || 'Recent Check-in'}
      </span>

      <div 
        className="absolute inset-0 overflow-hidden" 
        style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
      >
        <img 
          src={beforeUrl} 
          alt="Before Transformation" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <span className="absolute bottom-4 left-4 z-10 bg-black/80 text-rose-400 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border border-rose-500/40 backdrop-blur-md">
          {beforeLabel || 'Baseline Photo'}
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        value={sliderPos}
        onChange={(e) => setSliderPos(Number(e.target.value))}
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
      />
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-[#00E5FF] pointer-events-none shadow-[0_0_15px_#00E5FF]" 
        style={{ left: `${sliderPos}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -left-3.5 w-7 h-7 rounded-full bg-[#0A0E17] border-2 border-[#00E5FF] flex items-center justify-center text-[10px] text-[#00E5FF] font-black shadow-[0_0_12px_#00E5FF]">
          ↔
        </div>
      </div>
    </div>
  );
}

function TransformationVaultView({ currentUser, profile }) {
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedBeforeId, setSelectedBeforeId] = useState(null);
  const [selectedAfterId, setSelectedAfterId] = useState(null);

  const [weight, setWeight] = useState(profile?.weight || '');
  const [bodyFat, setBodyFat] = useState('');
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('checkin');

  const loadPhotos = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setPhotos(data);
        if (data.length >= 2) {
          setSelectedBeforeId(data[data.length - 1].id);
          setSelectedAfterId(data[0].id);
        } else if (data.length === 1) {
          setSelectedBeforeId(data[0].id);
          setSelectedAfterId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching transformation photos:', err);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [currentUser]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('transformations')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('transformations')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('progress_photos')
        .insert([
          {
            user_id: currentUser.id,
            photo_url: publicUrl,
            weight: parseFloat(weight) || null,
            body_fat: parseFloat(bodyFat) || null,
            caption: caption || 'Physique check-in',
            tag: tag
          }
        ]);

      if (dbError) throw dbError;

      alert('Check-in photo logged to vault! 📸');
      setCaption('');
      loadPhotos();
    } catch (err) {
      alert(`Upload Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('Remove this check-in from your vault?')) return;
    try {
      const { error } = await supabase.from('progress_photos').delete().eq('id', photoId);
      if (error) throw error;
      loadPhotos();
    } catch (err) {
      alert(`Delete Error: ${err.message}`);
    }
  };

  const beforePhoto = photos.find(p => p.id === selectedBeforeId) || photos[photos.length - 1];
  const afterPhoto = photos.find(p => p.id === selectedAfterId) || photos[0];

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-gradient-to-r from-[#121824]/90 via-[#0A0E17]/80 to-[#121824]/90 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
            Visual Vault
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">Physique & Transformation Vault</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-lg">
            Side-by-side progression analysis with the interactive visual split comparison tool.
          </p>
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 px-5 py-3 rounded-2xl text-center shadow-inner">
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Check-ins</span>
          <span className="text-2xl font-black font-mono text-[#00E5FF]">{photos.length}</span>
        </div>
      </div>

      {photos.length >= 2 && beforePhoto && afterPhoto && (
        <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                ⚡ Interactive Comparison
              </h3>
              <p className="text-xs text-gray-400">Drag the center handle to inspect muscular recomposition</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedBeforeId || ''}
                onChange={(e) => setSelectedBeforeId(e.target.value)}
                className="bg-[#0A0E17] border border-rose-500/40 text-rose-300 text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono"
              >
                {photos.map((p) => (
                  <option key={`b-${p.id}`} value={p.id}>
                    Before: {new Date(p.created_at).toLocaleDateString()} ({p.weight || '??'}kg)
                  </option>
                ))}
              </select>
              <span className="text-xs text-gray-500">vs</span>
              <select
                value={selectedAfterId || ''}
                onChange={(e) => setSelectedAfterId(e.target.value)}
                className="bg-[#0A0E17] border border-[#00E5FF]/40 text-[#00E5FF] text-xs px-2.5 py-1.5 rounded-lg outline-none font-mono"
              >
                {photos.map((p) => (
                  <option key={`a-${p.id}`} value={p.id}>
                    After: {new Date(p.created_at).toLocaleDateString()} ({p.weight || '??'}kg)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <BeforeAfterSlider
            beforeUrl={beforePhoto.photo_url}
            afterUrl={afterPhoto.photo_url}
            beforeLabel={`Baseline • ${new Date(beforePhoto.created_at).toLocaleDateString()} (${beforePhoto.weight || '--'}kg)`}
            afterLabel={`Recent • ${new Date(afterPhoto.created_at).toLocaleDateString()} (${afterPhoto.weight || '--'}kg)`}
          />
        </div>
      )}

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="font-black text-base text-white">📸 Add Check-in Photo</h3>
        <div className="grid md:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Weight (kg)</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 72"
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Body Fat % (Optional)</label>
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="e.g. 14.5"
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Milestone Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            >
              <option value="checkin">Weekly Check-in</option>
              <option value="before">Baseline (Before)</option>
              <option value="after">Current (After)</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Caption / Context</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Post leg day, empty stomach"
              className="w-full bg-[#0A0E17]/80 border border-white/10 text-xs p-3 rounded-xl text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
        </div>

        <div className="pt-2">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/15 hover:border-[#00E5FF] p-6 rounded-2xl cursor-pointer bg-[#0A0E17]/50 transition group">
            <span className="text-3xl group-hover:scale-110 transition">📷</span>
            <span className="text-xs font-bold text-gray-200 mt-2">
              {uploading ? 'Encrypting & Syncing...' : 'Upload Physique Snapshot'}
            </span>
            <span className="text-[10px] text-gray-500 mt-0.5">JPEG, PNG, WebP up to 10MB</span>
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="font-black text-base text-white">📑 Timeline Gallery</h3>
        {photos.length === 0 ? (
          <p className="text-xs text-gray-500 py-6 text-center">
            No check-in photos recorded yet. Upload your first milestone photo above!
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {photos.map((p) => (
              <div key={p.id} className="bg-[#0A0E17] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group shadow-lg">
                <div className="relative aspect-[3/4] bg-black">
                  <img src={p.photo_url} alt={p.caption} className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 text-[9px] uppercase font-black bg-black/80 px-2 py-0.5 rounded border border-white/10 text-gray-200 backdrop-blur-sm">
                    {p.tag}
                  </span>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-rose-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs transition active:scale-95"
                    title="Delete photo"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-3 space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-bold text-white">{p.weight ? `${p.weight} kg` : '--'}</span>
                    {p.body_fat && <span className="text-[#00E5FF] font-black">{p.body_fat}% BF</span>}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate">{p.caption || 'No notes'}</p>
                  <span className="text-[9px] text-gray-600 block font-mono">{new Date(p.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlateCalculatorModal({ onClose }) {
  const [calcWeight, setCalcWeight] = useState(60);
  const [calcReps, setCalcReps] = useState(8);
  const [barWeight] = useState(20);

  const oneRepMax = Math.round(calcWeight * (1 + calcReps / 30));

  const calculatePlates = (target) => {
    let weightPerSide = (target - barWeight) / 2;
    if (weightPerSide <= 0) return [];
    
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesNeeded = [];

    for (let plate of availablePlates) {
      while (weightPerSide >= plate) {
        platesNeeded.push(plate);
        weightPerSide -= plate;
      }
    }
    return platesNeeded;
  };

  const platesPerSide = calculatePlates(calcWeight);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121824]/95 border border-[#00E5FF]/40 p-6 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.2)] space-y-5 text-white">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-base font-black text-[#00E5FF] flex items-center gap-2">
            🧮 1RM & Barbell Plate Breakdown
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Lifted Weight (kg)</label>
            <input 
              type="number" 
              value={calcWeight} 
              onChange={e => setCalcWeight(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Reps Done</label>
            <input 
              type="number" 
              value={calcReps} 
              onChange={e => setCalcReps(Math.max(1, Number(e.target.value)))}
              className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
            />
          </div>
        </div>

        <div className="bg-[#0A0E17] border border-white/5 p-4 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Estimated 1RM</span>
            <span className="text-2xl font-black font-mono text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">{oneRepMax} kg</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] uppercase font-bold text-gray-400 block tracking-wider">Barbell Bar</span>
            <span className="text-xs font-bold text-white font-mono">{barWeight} kg (Olympic)</span>
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-gray-300 block">
            Plates to rack <span className="text-[#00E5FF]">PER SIDE</span>:
          </span>
          {platesPerSide.length === 0 ? (
            <p className="text-xs text-gray-500 italic bg-[#0A0E17] p-3 rounded-xl border border-white/5">
              Weight is equal to or less than the empty barbell.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {platesPerSide.map((p, idx) => (
                <span 
                  key={idx}
                  className="bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-black font-mono text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm"
                >
                  ⚪ {p} kg
                </span>
              ))}
            </div>
          )}
        </div>

        <button 
          type="button" 
          onClick={onClose}
          className="w-full bg-white/10 hover:bg-white/15 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
}

function FloatingRestTimer({ initialSeconds, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [totalTime, setTotalTime] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setTotalTime(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      playGymBeep();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const addTime = (secs) => {
    setTimeLeft(prev => prev + secs);
    setTotalTime(prev => prev + secs);
  };

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;

  return (
    <div className="fixed bottom-24 right-6 z-50 bg-[#121824]/95 backdrop-blur-xl border-2 border-[#00E5FF] p-4 rounded-3xl shadow-[0_0_35px_rgba(0,229,255,0.4)] flex items-center gap-4 text-white">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-white/10"
            strokeWidth="3"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="text-[#00E5FF] transition-all duration-1000 ease-linear"
            strokeDasharray={`${progressPercent}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-sm font-black font-mono tracking-tighter">
          {timeLeft > 0 ? `${timeLeft}s` : '🔥'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase text-[#00E5FF] tracking-wider">
            {timeLeft > 0 ? 'Resting...' : 'Set Ready!'}
          </span>
          <button onClick={onCancel} className="text-xs text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="flex gap-1.5 pt-0.5">
          <button onClick={() => addTime(30)} className="text-[10px] bg-[#0A0E17] hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 font-bold">
            +30s
          </button>
          <button onClick={() => addTime(60)} className="text-[10px] bg-[#0A0E17] hover:bg-white/10 px-2 py-1 rounded-md border border-white/10 font-bold">
            +60s
          </button>
          <button onClick={() => setTimeLeft(0)} className="text-[10px] bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-2 py-1 rounded-md border border-rose-500/40 font-bold">
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function ConsistencyMatrix({ waterGlasses, completedWorkoutsCount }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-black flex items-center gap-1.5 text-white">⚡ 7-Day Consistency Matrix</h3>
          <p className="text-[11px] text-gray-400">Tracking daily workout volume and fluid hydration adherence</p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          {waterGlasses >= 8 ? '🔥 Streak Active' : '📈 Daily Progress'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-2">
        {days.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isPast = idx < todayIndex;
          const isLogged = isToday && completedWorkoutsCount > 0;

          return (
            <div
              key={day}
              className={`p-3 rounded-2xl border text-center transition-all ${
                isToday 
                  ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_20px_rgba(0,229,255,0.25)]'
                  : isPast
                  ? 'border-white/5 bg-[#0A0E17]/60 text-gray-400'
                  : 'border-white/5 bg-[#0A0E17]/30 text-gray-600'
              }`}
            >
              <span className="text-[9px] font-black block uppercase tracking-wider">{day}</span>
              <span className="text-base mt-1 block">
                {isToday ? (isLogged ? '💪' : '⚡') : isPast ? '✓' : '•'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ConsultationView({ currentUser, profile, selectedConditions, biomarkers }) {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  const loadBookings = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (data && !error) setMyBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedExpert || !bookingDate) {
      alert("Please select both a date and an expert!");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        user_id: currentUser?.id,
        patient_name: profile?.name || 'Athlete',
        doctor_name: selectedExpert.name,
        expert_name: selectedExpert.name,
        specialty: selectedExpert.role,
        appointment_date: bookingDate,
        slot_time: selectedTime,
        notes: `Clinical: Diet - ${profile?.diet_pref || 'Veg'}, BMI ${((profile?.weight || 70) / ((profile?.height || 170) / 100) ** 2).toFixed(1)}, Sugar: ${biomarkers?.fastingSugar || 'Not logged'}`,
        status: 'Paid & Confirmed'
      };

      const { error } = await supabase.from('consultations').insert([payload]);
      if (error) throw error;

      alert(`Session Booked with ${selectedExpert.name}! 🎉`);
      setSelectedExpert(null);
      setBookingDate('');
      loadBookings();
    } catch (err) {
      alert(`Booking Error: ${err.message}`);
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-gradient-to-r from-[#121824]/90 via-[#0A0E17]/80 to-[#121824]/90 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
            Tele-Health Suite
          </span>
          <h2 className="text-3xl font-black tracking-tight text-white">Clinical Expert Consultations</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-lg">
            Certified metabolic and biomechanical specialists aligned under the Disha Clinical Protocol.
          </p>
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 px-5 py-3 rounded-2xl text-center shadow-inner">
          <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">Active Slots</span>
          <span className="text-2xl font-black font-mono text-[#00E5FF]">{myBookings.length}</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {EXPERTS.map((exp) => {
          const isChosen = selectedExpert?.id === exp.id;
          return (
            <div
              key={exp.id}
              className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isChosen
                  ? 'bg-[#00E5FF]/15 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.25)] backdrop-blur-md'
                  : 'bg-[#121824]/60 border-white/10 hover:border-white/20 backdrop-blur-md'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black uppercase tracking-wider bg-white/5 text-[#00E5FF] px-2.5 py-1 rounded-full border border-white/10">
                    {exp.badge}
                  </span>
                  <span className="text-xs font-black text-amber-400">{exp.rating}</span>
                </div>
                <h3 className="font-black text-lg text-white">{exp.name}</h3>
                <p className="text-xs text-[#00E5FF] mt-0.5 font-bold">{exp.role}</p>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed">{exp.focus}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-gray-500 block font-bold">Session Fee</span>
                  <span className="text-xl font-black font-mono text-white">{exp.fee}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExpert(isChosen ? null : exp)}
                  className={`text-xs px-4 py-2.5 rounded-xl font-black uppercase tracking-wider transition active:scale-95 ${
                    isChosen ? 'bg-rose-500 text-white' : 'bg-[#00E5FF] text-black hover:bg-[#00B4D8]'
                  }`}
                >
                  {isChosen ? 'Deselect' : 'Select Slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedExpert && (
        <form onSubmit={handleBooking} className="rounded-3xl border border-[#00E5FF]/50 bg-[#121824]/90 backdrop-blur-xl p-6 md:p-8 space-y-4 shadow-[0_0_50px_rgba(0,229,255,0.15)]">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              📅 Confirm Slot with <span className="text-[#00E5FF]">{selectedExpert.name}</span>
            </h3>
            <button type="button" onClick={() => setSelectedExpert(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Select Consultation Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">Select Available Time</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={bookingLoading}
            className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition active:scale-95 shadow-[0_0_25px_rgba(0,229,255,0.35)]"
          >
            💳 {bookingLoading ? 'Securing Telemetry Slot...' : `Pay & Lock Slot (${selectedExpert.fee})`}
          </button>
        </form>
      )}

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
        <h3 className="font-black text-base text-white">📑 Appointment History</h3>
        {myBookings.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No consultations booked yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl flex justify-between items-center shadow-inner">
                <div>
                  <h4 className="font-black text-sm text-white">{b.doctor_name || b.expert_name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{b.specialty}</p>
                  <span className="text-[11px] text-[#00E5FF] block mt-2 font-mono font-bold">
                    📅 {b.appointment_date} at {b.slot_time}
                  </span>
                </div>
                <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/30">
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthModal({ onAuthSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.session) onAuthSuccess(data.session.user);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data?.session) onAuthSuccess(data.session.user);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E17] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00E5FF]/10 via-[#0A0E17] to-black">
      <div className="w-full max-w-md bg-[#121824]/90 border border-white/10 p-8 rounded-3xl shadow-[0_0_60px_rgba(0,229,255,0.15)] backdrop-blur-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] text-3xl border border-[#00E5FF]/30 shadow-[0_0_20px_rgba(0,229,255,0.2)] mb-2">🔥</div>
          <h2 className="text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#00E5FF]">GYM F.R.E.A.K</h2>
          <p className="text-xs text-gray-400">
            {isSignUp ? 'Initialize your clinical biometric profile' : 'Sign in to access synchronized workouts & telemetry'}
          </p>
        </div>

        {errorMsg && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3.5 rounded-2xl text-xs">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="athlete@domain.com"
              className="w-full bg-[#0A0E17] border border-white/10 rounded-2xl p-3.5 text-sm text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0A0E17] border border-white/10 rounded-2xl p-3.5 text-sm text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-black py-3.5 rounded-2xl transition uppercase tracking-wider text-xs shadow-[0_0_25px_rgba(0,229,255,0.3)] active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isSignUp ? 'Create Profile' : 'Access Terminal'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/5 text-xs text-gray-400">
          {isSignUp ? 'Already registered?' : 'New athlete?'}{' '}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); }}
            className="text-[#00E5FF] font-bold hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ExerciseRow({ exerciseName, onLogSet, onStartRest, history = [] }) {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const lastSet = history[history.length - 1];

  const submitSet = () => {
    if (!weight || !reps) return;
    onLogSet(exerciseName, weight, reps);
    setWeight('');
    setReps('');
    onStartRest(60);
  };

  const isAdapted = exerciseName.includes('⚠️');

  return (
    <div className={`p-4 rounded-2xl border transition-all ${isAdapted ? 'border-amber-400/40 bg-amber-400/5' : 'border-white/5 bg-[#0A0E17]/60'} space-y-2.5 shadow-sm`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
        <span className={`text-xs font-black ${isAdapted ? 'text-amber-300' : 'text-gray-200'}`}>
          {exerciseName}
        </span>
        {lastSet && (
          <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 self-start sm:self-auto shadow-[0_0_10px_rgba(52,211,153,0.15)]">
            PR: {lastSet.weight}kg × {lastSet.reps}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input 
          type="number" 
          placeholder="Weight (kg)" 
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-28 bg-[#121824] border border-white/10 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-[#00E5FF] font-mono"
        />
        <input 
          type="number" 
          placeholder="Reps" 
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-20 bg-[#121824] border border-white/10 text-xs px-3 py-2 rounded-xl text-white outline-none focus:border-[#00E5FF] font-mono"
        />
        <button 
          type="button" 
          onClick={submitSet}
          className="bg-[#00E5FF] hover:bg-[#00B4D8] text-black text-[11px] font-black px-3.5 py-2 rounded-xl uppercase tracking-wider transition active:scale-95 shadow-[0_0_12px_rgba(0,229,255,0.2)]"
        >
          + Log
        </button>
        <button 
          type="button" 
          onClick={() => onStartRest(90)}
          className="text-gray-300 hover:text-white text-[11px] bg-white/5 border border-white/10 px-3 py-2 rounded-xl font-bold transition active:scale-95"
        >
          ⏱️ Rest
        </button>
      </div>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {history.slice(-4).map((item, idx) => (
            <span key={idx} className="text-[9px] font-mono bg-[#121824] text-gray-400 px-2 py-0.5 rounded-md border border-white/5">
              {item.weight}kg × {item.reps} ({item.date})
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function ClinicalDietPanel({ profile, selectedConditions, targetCalories, targetProtein }) {
  const fatCalories = targetCalories * 0.25;
  const targetFats = Math.round(fatCalories / 9);
  const remainingCalories = targetCalories - (targetProtein * 4) - fatCalories;
  const targetCarbs = Math.max(50, Math.round(remainingCalories / 4));
  const isPureVeg = profile?.diet_pref === 'veg';

  return (
    <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">🥗 Clinical Nutrition Blueprint</h3>
          <p className="text-xs text-gray-400">
            Targeting for: <span className="text-[#00E5FF] font-bold">{isPureVeg ? '🌱 Pure Vegetarian Diet' : profile?.diet_pref === 'egg' ? '🥚 Eggetarian Diet' : '🍗 Non-Vegetarian Diet'}</span>
          </p>
        </div>
        <span className="text-[10px] font-black uppercase tracking-wider bg-[#00E5FF]/10 text-[#00E5FF] px-3 py-1 rounded-full border border-[#00E5FF]/30">
          {profile.goal.replace('_', ' ').toUpperCase()} TARGET
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl text-center shadow-inner">
          <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Protein</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">{targetProtein}g</span>
          <span className="text-[10px] text-gray-500 font-mono">{targetProtein * 4} kcal</span>
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl text-center shadow-inner">
          <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-wider block">Carbs</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">{targetCarbs}g</span>
          <span className="text-[10px] text-gray-500 font-mono">{targetCarbs * 4} kcal</span>
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl text-center shadow-inner">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Fats</span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">{targetFats}g</span>
          <span className="text-[10px] text-gray-500 font-mono">{targetFats * 9} kcal</span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0A0E17]/60 border border-white/5 p-4 rounded-2xl">
            <span className="font-black text-emerald-400 block mb-1">Recommended Staples</span>
            <p className="text-gray-400 leading-relaxed">
              {isPureVeg
                ? 'Soya chunks (52% protein), paneer, tofu, yellow & green moong dal, rajma, sattu, roasted chana, chia seeds, oats, and Greek yogurt.'
                : 'Paneer, boiled whole eggs/egg whites, chicken breast, fish, moong lentils, curd, oats, and seeds.'}
            </p>
          </div>
          <div className="bg-[#0A0E17]/60 border border-white/5 p-4 rounded-2xl">
            <span className="font-black text-rose-400 block mb-1">Items to Minimize</span>
            <p className="text-gray-400 leading-relaxed">
              Ultra-processed refined flour (maida), excess refined seed oils, added sugar syrups, and packaged deep-fried snacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BiomarkerPanel({ biomarkers, setBiomarkers }) {
  const handleChange = (key, value) => {
    const updated = { ...biomarkers, [key]: value };
    setBiomarkers(updated);
    localStorage.setItem('gym_freak_biomarkers', JSON.stringify(updated));
  };

  const vitD = parseFloat(biomarkers?.vitD);
  const vitB12 = parseFloat(biomarkers?.b12);
  const sugar = parseFloat(biomarkers?.fastingSugar);

  return (
    <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
      <div>
        <h3 className="text-lg font-black text-white flex items-center gap-2">🧪 Biomarker & Lab Diagnostics</h3>
        <p className="text-xs text-gray-400">Routine diagnostics under the Disha Clinical Preventive health model.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl">
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Vitamin D3 (ng/mL)</label>
          <input 
            type="number"
            placeholder="Optimal: 30 - 100"
            value={biomarkers?.vitD || ''}
            onChange={(e) => handleChange('vitD', e.target.value)}
            className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
          />
          {vitD && vitD < 30 && <p className="text-[10px] text-amber-400 mt-2">⚠️ Deficient: Slow joint recovery, fatigue.</p>}
          {vitD && vitD >= 30 && <p className="text-[10px] text-emerald-400 mt-2">✓ Optimal bone density.</p>}
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl">
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Vitamin B12 (pg/mL)</label>
          <input 
            type="number"
            placeholder="Optimal: 200 - 900"
            value={biomarkers?.b12 || ''}
            onChange={(e) => handleChange('b12', e.target.value)}
            className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
          />
          {vitB12 && vitB12 < 200 && <p className="text-[10px] text-amber-400 mt-2">⚠️ Low B12: Lethargy, poor nerve speed.</p>}
          {vitB12 && vitB12 >= 200 && <p className="text-[10px] text-emerald-400 mt-2">✓ Healthy energy metabolism.</p>}
        </div>
        <div className="bg-[#0A0E17]/80 border border-white/10 p-4 rounded-2xl">
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Fasting Sugar (mg/dL)</label>
          <input 
            type="number"
            placeholder="Normal: 70 - 99"
            value={biomarkers?.fastingSugar || ''}
            onChange={(e) => handleChange('fastingSugar', e.target.value)}
            className="w-full bg-[#121824] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono"
          />
          {sugar && sugar > 100 && <p className="text-[10px] text-rose-400 mt-2">⚠️ Pre-diabetic: Prioritize high-fiber meals.</p>}
          {sugar && sugar <= 99 && <p className="text-[10px] text-emerald-400 mt-2">✓ Normal fasting range.</p>}
        </div>
      </div>
    </div>
  );
}

function HealthRiskSection({ profile, selectedConditions, setSelectedConditions, biomarkers, setBiomarkers }) {
  const toggleCondition = (id) => {
    const updated = selectedConditions.includes(id) ? selectedConditions.filter(item => item !== id) : [...selectedConditions, id];
    setSelectedConditions(updated);
    localStorage.setItem('gym_freak_conditions', JSON.stringify(updated));
  };

  let baseScore = 100;
  const bmi = parseFloat(profile.weight) / ((parseFloat(profile.height) / 100) ** 2);
  if (bmi > 25) baseScore -= 10;
  if (bmi > 30) baseScore -= 15;
  if (profile.activity === '1.2') baseScore -= 10;
  baseScore -= selectedConditions.length * 8;
  const score = Math.max(40, Math.min(100, Math.round(baseScore)));
  const scoreColor = score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="w-full space-y-6">
      <div className="rounded-3xl p-6 md:p-8 border border-white/10 bg-[#121824]/60 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
            Vitality Index
          </span>
          <h3 className="text-3xl font-black tracking-tight text-white">Lifestyle Readiness Score</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md">Calculated dynamically using BMI ({bmi.toFixed(1)}), metabolic burn, and logged physical symptoms.</p>
        </div>
        <div className="text-center bg-[#0A0E17]/90 border border-white/10 px-8 py-5 rounded-3xl min-w-[200px] shadow-inner">
          <span className={`text-4xl font-black font-mono ${scoreColor}`}>{score} / 100</span>
          <span className="block text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wider">
            {score >= 80 ? 'Optimal Condition' : score >= 65 ? 'Moderate Caution' : 'Clinical Attention'}
          </span>
        </div>
      </div>

      <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl space-y-4">
        <h3 className="text-base font-black text-white">Active Concerns / Joint Injuries</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {HEALTH_CONDITIONS.map((cond) => {
            const active = selectedConditions.includes(cond.id);
            return (
              <div 
                key={cond.id} 
                onClick={() => toggleCondition(cond.id)} 
                className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  active ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white shadow-[0_0_20px_rgba(0,229,255,0.15)]' : 'bg-[#0A0E17]/60 border-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-sm">{cond.label}</span>
                  <span className="text-[9px] uppercase font-bold bg-white/5 px-2.5 py-0.5 rounded-md text-gray-400 border border-white/5">{cond.tag}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cond.caution}</p>
                <div className="mt-3 text-right">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${active ? 'text-[#00E5FF]' : 'text-gray-600'}`}>
                    {active ? '✓ Active Caution' : '+ Tap to Select'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <BiomarkerPanel biomarkers={biomarkers} setBiomarkers={setBiomarkers} />
    </div>
  );
}

function ProfileModal({ profile, onSave, onClose }) {
  const [data, setData] = useState(profile || {
    name: '', age: '22', gender: 'male', height: '175', weight: '70', activity: '1.375', goal: 'fat_loss', diet_pref: 'veg'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121824]/95 border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl text-white space-y-4">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h2 className="text-xl font-black text-[#00E5FF] tracking-wider">ATHLETE BIOMETRICS</h2>
          {profile && <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>}
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Full Name</label>
          <input type="text" required value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Age</label>
            <input type="number" value={data.age} onChange={e => setData({...data, age: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Gender</label>
            <select value={data.gender} onChange={e => setData({...data, gender: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]">
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Height (cm)</label>
            <input type="number" value={data.height} onChange={e => setData({...data, height: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono" />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 block mb-1">Weight (kg)</label>
            <input type="number" value={data.weight} onChange={e => setData({...data, weight: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Diet Preference</label>
          <select value={data.diet_pref || 'veg'} onChange={e => setData({...data, diet_pref: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]">
            <option value="veg">🌱 Pure Vegetarian</option>
            <option value="egg">🥚 Eggetarian</option>
            <option value="non_veg">🍗 Non-Vegetarian</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Activity Level</label>
          <select value={data.activity} onChange={e => setData({...data, activity: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]">
            <option value="1.2">Sedentary (Little or no workout)</option>
            <option value="1.375">Lightly Active (1-3 days/week)</option>
            <option value="1.55">Moderately Active (3-5 days/week)</option>
            <option value="1.725">Very Active (6-7 days/week)</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-bold text-gray-400 block mb-1">Fitness Target</label>
          <select value={data.goal} onChange={e => setData({...data, goal: e.target.value})} className="w-full bg-[#0A0E17] border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF]">
            <option value="fat_loss">Fat Loss (-400 kcal deficit)</option>
            <option value="maintenance">Maintenance</option>
            <option value="muscle_gain">Muscle Gain (+350 kcal surplus)</option>
          </select>
        </div>
        <button onClick={() => data.name && onSave(data)} className="w-full bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black font-black py-3.5 rounded-xl uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(0,229,255,0.3)] transition active:scale-95">
          Save Biometrics
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_profile') || localStorage.getItem('iron_start_profile');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [waterGlasses, setWaterGlasses] = useState(() => {
    const saved = localStorage.getItem('gym_freak_water');
    return saved ? parseInt(saved, 10) : 5;
  });
  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_workouts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [workoutType, setWorkoutType] = useState('gym');
  const [gymSplitType, setGymSplitType] = useState('gym_ppl');

  const [selectedConditions, setSelectedConditions] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_conditions');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [biomarkers, setBiomarkers] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_biomarkers');
      return saved ? JSON.parse(saved) : { vitD: '', b12: '', fastingSugar: '' };
    } catch { return { vitD: '', b12: '', fastingSugar: '' }; }
  });

  const [exerciseLogs, setExerciseLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_exercise_logs');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [customExercises, setCustomExercises] = useState(() => {
    try {
      const saved = localStorage.getItem('gym_freak_custom_exercises');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [activeRestSeconds, setActiveRestSeconds] = useState(null);
  const [syncStatus, setSyncStatus] = useState('synced');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const loadFromCloud = async () => {
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (data) {
          if (data.profile && Object.keys(data.profile).length > 0) setProfile(data.profile);
          if (data.conditions) setSelectedConditions(data.conditions);
          if (data.biomarkers) setBiomarkers(data.biomarkers);
          if (data.completed_workouts) setCompletedWorkouts(data.completed_workouts);
          if (data.water_glasses !== undefined) setWaterGlasses(data.water_glasses);
        }

        const { data: customData } = await supabase
          .from('custom_exercises')
          .select('*')
          .eq('user_id', currentUser.id);

        if (customData) setCustomExercises(customData);
      } catch (err) {
        console.error('Cloud load error:', err);
      }
    };
    loadFromCloud();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser || !profile) return;

    localStorage.setItem('gym_freak_profile', JSON.stringify(profile));
    localStorage.setItem('gym_freak_water', waterGlasses.toString());
    localStorage.setItem('gym_freak_workouts', JSON.stringify(completedWorkouts));
    localStorage.setItem('gym_freak_exercise_logs', JSON.stringify(exerciseLogs));
    localStorage.setItem('gym_freak_custom_exercises', JSON.stringify(customExercises));

    const syncToCloud = async () => {
      setSyncStatus('syncing');
      try {
        const payload = {
          user_id: currentUser.id,
          profile,
          conditions: selectedConditions,
          biomarkers,
          completed_workouts: completedWorkouts,
          water_glasses: waterGlasses,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'user_id' });
        if (error) throw error;
        setSyncStatus('synced');
      } catch (err) {
        console.error('Cloud Sync failed:', err);
        setSyncStatus('error');
      }
    };

    const timeout = setTimeout(syncToCloud, 800);
    return () => clearTimeout(timeout);
  }, [profile, selectedConditions, biomarkers, completedWorkouts, waterGlasses, exerciseLogs, customExercises, currentUser]);

  const handleLogSet = (exerciseName, weightVal, repsVal) => {
    const currentList = exerciseLogs[exerciseName] || [];
    const updated = {
      ...exerciseLogs,
      [exerciseName]: [
        ...currentList,
        { weight: weightVal, reps: repsVal, date: new Date().toLocaleDateString() }
      ]
    };
    setExerciseLogs(updated);
  };

  const handleAddCustomExercise = async (newEx) => {
    if (!currentUser?.id) return;
    try {
      const payload = { ...newEx, user_id: currentUser.id };
      const { data, error } = await supabase.from('custom_exercises').insert([payload]).select();
      if (error) throw error;
      if (data) {
        setCustomExercises(prev => [...prev, data[0]]);
        alert(`Added "${newEx.name}" to routine! 💪`);
      }
    } catch (err) {
      alert(`Error saving custom exercise: ${err.message}`);
    }
  };

  const handleUpdateDietPref = (newPref) => {
    setProfile(prev => ({ ...prev, diet_pref: newPref }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E17] text-[#00E5FF] font-black tracking-widest uppercase text-sm">
        Initializing GYM F.R.E.A.K Terminal...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onAuthSuccess={setCurrentUser} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E17]">
        <ProfileModal onSave={(p) => setProfile(p)} />
      </div>
    );
  }

  const weight = parseFloat(profile.weight) || 70;
  const height = parseFloat(profile.height) || 170;
  const age = parseFloat(profile.age) || 22;
  const activityMultiplier = parseFloat(profile.activity) || 1.375;
  let bmr = (10 * weight) + (6.25 * height) - (5 * age);
  bmr = profile.gender === 'male' ? bmr + 5 : bmr - 161;
  const tdee = Math.round(bmr * activityMultiplier);
  let targetCalories = tdee;
  if (profile.goal === 'fat_loss') targetCalories -= 400;
  if (profile.goal === 'muscle_gain') targetCalories += 350;
  const bmi = (weight / ((height / 100) ** 2)).toFixed(1);
  const targetProtein = Math.round(weight * 1.8);

  const toggleWorkout = (dayIndex) => {
    setCompletedWorkouts(prev => ({ ...prev, [dayIndex]: !prev[dayIndex] }));
  };

  const selectedKey = workoutType === 'home' ? 'home' : gymSplitType;
  const basePlan = WORKOUT_DATABASE[selectedKey];

  const currentPlan = {
    ...basePlan,
    splits: basePlan.splits.map((split) => {
      const extra = customExercises
        .filter(ce => ce.split_type === selectedKey && ce.day_label === split.day)
        .map(ce => `${ce.name} [${ce.target_muscle}] (Custom)`);
      return {
        ...split,
        exercises: [...split.exercises, ...extra]
      };
    })
  };

  const adaptExercise = (ex) => {
    let text = ex;
    if (selectedConditions.includes('knee_pain')) {
      if (text.toLowerCase().includes('barbell squat') || text.toLowerCase().includes('jump squat')) return text + ' ⚠️ [Rehab: Replace with Box Squats / Leg Extension]';
    }
    if (selectedConditions.includes('lower_back')) {
      if (text.toLowerCase().includes('deadlift') || text.toLowerCase().includes('bent-over')) return text + ' ⚠️ [Spine Safe: Replace with Chest-Supported Rows]';
    }
    if (selectedConditions.includes('hypertension')) {
      if (text.toLowerCase().includes('heavy') || text.toLowerCase().includes('failure')) return text + ' ⚠️ [Cadence: Keep steady breath, avoid maximum strain]';
    }
    return text;
  };

  const completedCount = Object.values(completedWorkouts).filter(Boolean).length;

  return (
    <div className="min-h-screen text-white pb-28 md:pb-16 font-sans antialiased bg-[#0A0E17] selection:bg-[#00E5FF] selection:text-black">
      {/* TOP HEADER */}
      <header className="border-b border-white/10 bg-[#121824]/80 backdrop-blur-xl sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl filter drop-shadow-[0_0_8px_#00E5FF]">🔥</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-[#00E5FF]">
                  GYM F.R.E.A.K
                </span>
                <span className="text-[10px] flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-full border bg-black/40 border-white/10">
                  {syncStatus === 'synced' && <span className="text-emerald-400">● Synced</span>}
                  {syncStatus === 'syncing' && <span className="text-amber-400 animate-pulse">🔄 Syncing</span>}
                  {syncStatus === 'error' && <span className="text-rose-400">⚠️ Local</span>}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowCalculator(true)}
              className="text-xs bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] px-3.5 py-2 rounded-xl border border-[#00E5FF]/30 transition flex items-center gap-1.5 font-black uppercase tracking-wider active:scale-95 shadow-[0_0_12px_rgba(0,229,255,0.15)]"
            >
              🧮 1RM & Plates
            </button>
            <button onClick={() => setIsEditing(true)} className="text-xs bg-white/5 hover:bg-white/10 text-gray-200 px-3 py-2 rounded-xl border border-white/10 transition active:scale-95">
              ✏️
            </button>
            <button onClick={handleSignOut} className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-2 rounded-xl border border-rose-500/30 transition active:scale-95">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* DESKTOP TABS */}
      <div className="max-w-6xl mx-auto px-6 mt-6 hidden md:block">
        <div className="inline-flex bg-[#121824]/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-xl flex-wrap gap-1">
          {[
            { id: 'dashboard', label: '📊 Tracker' },
            { id: 'pr', label: '🏆 PR Wall' },
            { id: 'food', label: '🍱 Diet Logger' },
            { id: 'vault', label: '⚡ Visual Vault' },
            { id: 'consult', label: '🩺 Consult' },
            { id: 'health', label: '🛡️ Health Risk', badge: selectedConditions.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                currentTab === tab.id
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 mt-6">
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 border border-white/10 bg-gradient-to-r from-[#121824]/90 via-[#0A0E17]/80 to-[#121824]/90 backdrop-blur-xl shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#00E5FF] px-2.5 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 inline-block mb-2">
                  Athlete Terminal
                </span>
                <h1 className="text-3xl font-black tracking-tight text-white">Welcome back, {profile.name} 👋</h1>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Target: <span className="text-[#00E5FF] font-bold uppercase">{profile.goal.replace('_', ' ')}</span> • Diet: <span className="text-emerald-400 font-bold uppercase">{profile.diet_pref || 'Veg'}</span> • {profile.height}cm • {profile.weight}kg
                </p>
              </div>
              <div className="bg-[#0A0E17]/80 border border-white/10 px-5 py-3 rounded-2xl text-center shadow-inner">
                <span className="text-[10px] uppercase text-gray-400 block font-bold tracking-wider">BMI Ratio</span>
                <span className="text-2xl font-black font-mono text-white">{bmi}</span>
                <span className="text-[10px] text-[#00E5FF] block font-semibold">({bmi < 18.5 ? 'Underweight' : bmi < 24.9 ? 'Healthy' : 'Overweight'})</span>
              </div>
            </div>

            <ConsistencyMatrix waterGlasses={waterGlasses} completedWorkoutsCount={completedCount} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Daily Target</span>
                <span className="text-3xl font-black font-mono text-[#00E5FF] tracking-tight">{targetCalories}</span>
                <span className="text-[11px] text-gray-500 font-mono block">kcal / day</span>
              </div>
              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Daily Burn</span>
                <span className="text-3xl font-black font-mono text-white tracking-tight">{tdee}</span>
                <span className="text-[11px] text-gray-500 font-mono block">kcal TDEE</span>
              </div>
              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Protein Goal</span>
                <span className="text-3xl font-black font-mono text-emerald-400 tracking-tight">{targetProtein}g</span>
                <span className="text-[11px] text-gray-500 block font-mono">Muscle repair</span>
              </div>
              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Resting BMR</span>
                <span className="text-3xl font-black font-mono text-amber-400 tracking-tight">{Math.round(bmr)}</span>
                <span className="text-[11px] text-gray-500 block font-mono">Basal energy</span>
              </div>
            </div>

            <ClinicalDietPanel profile={profile} selectedConditions={selectedConditions} targetCalories={targetCalories} targetProtein={targetProtein} />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base flex items-center gap-2 text-white">💧 Fluid Hydration</h3>
                    <p className="text-xs text-gray-400">Aim for at least 8 to 10 glasses daily</p>
                  </div>
                  <span className="text-sm font-black font-mono text-[#00E5FF]">{waterGlasses} / 10 Glasses</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))} className="w-11 h-11 rounded-2xl bg-[#0A0E17] border border-white/10 text-lg font-bold hover:bg-white/10 transition active:scale-95">-</button>
                  <div className="flex-1 bg-[#0A0E17] h-4 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                    <div className="bg-gradient-to-r from-[#00E5FF] to-[#00B4D8] h-full rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(0,229,255,0.5)]" style={{ width: `${Math.min(100, (waterGlasses / 10) * 100)}%` }} />
                  </div>
                  <button onClick={() => setWaterGlasses(prev => prev + 1)} className="w-11 h-11 rounded-2xl bg-[#0A0E17] border border-white/10 text-lg font-bold hover:bg-white/10 transition active:scale-95">+</button>
                </div>
              </div>

              <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base flex items-center gap-2 text-white">🏋️ Active Guidance</h3>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Log progressive overload weights for automatic estimated 1RM sync to your PR Trophy Wall.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex justify-between text-xs text-gray-400 font-mono">
                  <span>Split: <span className="text-[#00E5FF] font-black uppercase">{workoutType}</span></span>
                  <span className="text-emerald-400 font-bold">Cloud Synced</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl p-6 border border-white/10 bg-[#121824]/60 backdrop-blur-xl shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">💪 Workout Schedule & Logs</h2>
                  <p className="text-xs text-gray-400">Track sets, weights, and repetitions with integrated rest timer</p>
                </div>
                <div className="flex bg-[#0A0E17]/80 p-1 rounded-2xl border border-white/10 shadow-inner">
                  <button onClick={() => setWorkoutType('gym')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${workoutType === 'gym' ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'text-gray-400 hover:text-white'}`}>🏋️ Gym</button>
                  <button onClick={() => setWorkoutType('home')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition ${workoutType === 'home' ? 'bg-[#00E5FF] text-black shadow-[0_0_15px_rgba(0,229,255,0.3)]' : 'text-gray-400 hover:text-white'}`}>🏠 Home</button>
                </div>
              </div>

              {workoutType === 'gym' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-bold mr-1">Split:</span>
                  <button onClick={() => setGymSplitType('gym_ppl')} className={`text-xs px-3.5 py-1.5 rounded-xl border font-black uppercase tracking-wider transition ${gymSplitType === 'gym_ppl' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-white/5 hover:text-white'}`}>PPL</button>
                  <button onClick={() => setGymSplitType('gym_two_muscle')} className={`text-xs px-3.5 py-1.5 rounded-xl border font-black uppercase tracking-wider transition ${gymSplitType === 'gym_two_muscle' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-white/5 hover:text-white'}`}>Two Muscle</button>
                  <button onClick={() => setGymSplitType('gym_one_muscle')} className={`text-xs px-3.5 py-1.5 rounded-xl border font-black uppercase tracking-wider transition ${gymSplitType === 'gym_one_muscle' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-white/5 hover:text-white'}`}>Bro Split</button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {currentPlan.splits.map((split, idx) => (
                  <div key={idx} className={`p-5 rounded-3xl border transition-all ${completedWorkouts[`${selectedKey}_${idx}`] ? 'bg-[#00E5FF]/10 border-[#00E5FF]/50' : 'bg-[#0A0E17]/40 border-white/5'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-[#00E5FF]">{split.day}</span>
                        <h4 className="font-black text-sm text-white mt-0.5">{split.name}</h4>
                      </div>
                      <button onClick={() => toggleWorkout(`${selectedKey}_${idx}`)} className={`text-xs px-3.5 py-1.5 rounded-xl font-black uppercase tracking-wider transition active:scale-95 ${completedWorkouts[`${selectedKey}_${idx}`] ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}>
                        {completedWorkouts[`${selectedKey}_${idx}`] ? '✓ Done' : 'Complete'}
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {split.exercises.map((ex, i) => {
                        const adapted = adaptExercise(ex);
                        return (
                          <ExerciseRow 
                            key={i}
                            exerciseName={adapted}
                            onLogSet={handleLogSet}
                            onStartRest={(secs) => setActiveRestSeconds(secs)}
                            history={exerciseLogs[adapted] || []}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentTab === 'pr' && (
          <PRWallView 
            exerciseLogs={exerciseLogs}
            onAddCustomExercise={handleAddCustomExercise}
          />
        )}

        {currentTab === 'food' && (
          <FoodLoggerView
            currentUser={currentUser}
            targetCalories={targetCalories}
            targetProtein={targetProtein}
            profileDietPref={profile.diet_pref || 'veg'}
            onUpdateDietPref={handleUpdateDietPref}
          />
        )}

        {currentTab === 'vault' && (
          <TransformationVaultView
            currentUser={currentUser}
            profile={profile}
          />
        )}

        {currentTab === 'consult' && (
          <ConsultationView 
            currentUser={currentUser}
            profile={profile}
            selectedConditions={selectedConditions}
            biomarkers={biomarkers}
          />
        )}
        
        {currentTab === 'health' && (
          <HealthRiskSection 
            profile={profile} 
            selectedConditions={selectedConditions} 
            setSelectedConditions={setSelectedConditions} 
            biomarkers={biomarkers} 
            setBiomarkers={setBiomarkers} 
          />
        )}
      </main>

      {/* MOBILE STICKY BOTTOM NAVIGATION DOCK */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#121824]/90 backdrop-blur-2xl border-t border-white/10 px-3 py-2">
        <div className="flex justify-around items-center">
          {[
            { id: 'dashboard', icon: '📊', label: 'Tracker' },
            { id: 'pr', icon: '🏆', label: 'PRs' },
            { id: 'food', icon: '🍱', label: 'Diet' },
            { id: 'vault', icon: '⚡', label: 'Vault' },
            { id: 'consult', icon: '🩺', label: 'Consult' },
            { id: 'health', icon: '🛡️', label: 'Health' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center py-1 px-2.5 rounded-xl transition active:scale-95 ${
                currentTab === tab.id
                  ? 'text-[#00E5FF] font-black'
                  : 'text-gray-400 font-medium'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-[9px] mt-0.5 tracking-tight uppercase">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {activeRestSeconds !== null && (
        <FloatingRestTimer 
          initialSeconds={activeRestSeconds}
          onCancel={() => setActiveRestSeconds(null)}
        />
      )}

      {showCalculator && (
        <PlateCalculatorModal onClose={() => setShowCalculator(false)} />
      )}

      {isEditing && (
        <ProfileModal 
          profile={profile} 
          onClose={() => setIsEditing(false)} 
          onSave={(p) => { setProfile(p); setIsEditing(false); }} 
        />
      )}
    </div>
  );
}