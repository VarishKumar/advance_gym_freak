import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const C = {
  bg: '#0A0E17',
  card: '#121824',
  accent: '#00E5FF',
  text: '#FFFFFF',
  border: '#1E293B'
};

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
    <div className="fixed bottom-6 right-6 z-50 bg-[#121824]/95 backdrop-blur-md border-2 border-[#00E5FF] p-4 rounded-2xl shadow-[0_0_25px_rgba(0,229,255,0.35)] flex items-center gap-4 text-white">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-800"
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
        <span className="absolute text-sm font-black tracking-tighter">
          {timeLeft > 0 ? `${timeLeft}s` : '🔥'}
        </span>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase text-[#00E5FF] tracking-wider">
            {timeLeft > 0 ? 'Resting...' : 'Ready for Next Set!'}
          </span>
          <button onClick={onCancel} className="text-xs text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="flex gap-1.5 pt-0.5">
          <button onClick={() => addTime(30)} className="text-[10px] bg-[#0A0E17] hover:bg-gray-800 px-2 py-1 rounded border border-gray-700 font-bold">
            +30s
          </button>
          <button onClick={() => addTime(60)} className="text-[10px] bg-[#0A0E17] hover:bg-gray-800 px-2 py-1 rounded border border-gray-700 font-bold">
            +60s
          </button>
          <button onClick={() => setTimeLeft(0)} className="text-[10px] bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 px-2 py-1 rounded border border-rose-500/40 font-bold">
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
    <div className="bg-[#121824] border border-[#1E293B] p-5 rounded-2xl space-y-3">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-1.5">⚡ 7-Day Habit & Consistency Matrix</h3>
          <p className="text-[11px] text-gray-400">Streak tracker based on hydration adherence and session activity.</p>
        </div>
        <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
          {waterGlasses >= 8 ? '🔥 100% Hydrated' : '📈 Daily In-Progress'}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-2 pt-1">
        {days.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isPast = idx < todayIndex;
          const isLogged = isToday && completedWorkoutsCount > 0;

          return (
            <div
              key={day}
              className={`p-2.5 rounded-xl border text-center transition ${
                isToday 
                  ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                  : isPast
                  ? 'border-gray-800 bg-[#0A0E17] text-gray-400'
                  : 'border-gray-800/40 bg-[#0A0E17]/50 text-gray-600'
              }`}
            >
              <span className="text-[10px] font-bold block uppercase">{day}</span>
              <span className="text-sm mt-1 block">
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
  const [statusMsg, setStatusMsg] = useState('');

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
    if (!selectedExpert || !bookingDate) return;

    setBookingLoading(true);
    setStatusMsg('');

    try {
      const notes = `Clinical Profile: BMI ${((profile?.weight || 70) / ((profile?.height || 170) / 100) ** 2).toFixed(1)}, Conditions: ${selectedConditions?.join(', ') || 'None'}, Sugar: ${biomarkers?.fastingSugar || 'Not logged'}`;

      const { error } = await supabase.from('consultations').insert([
        {
          user_id: currentUser.id,
          expert_name: selectedExpert.name,
          specialty: selectedExpert.role,
          appointment_date: bookingDate,
          slot_time: selectedTime,
          notes: notes,
          status: 'Confirmed'
        }
      ]);

      if (error) throw error;

      setStatusMsg('Booking confirmed! Your clinical telemetry has been forwarded.');
      setSelectedExpert(null);
      setBookingDate('');
      loadBookings();
    } catch (err) {
      console.error('Booking failed:', err);
      setStatusMsg('Error creating booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Clinical Tele-Health</span>
          <h2 className="text-2xl font-black mt-1">Book 1-on-1 Specialist Consultation</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-lg">
            Consult doctors & rehabilitation specialists certified under the Disha Health Clinical Model.
          </p>
        </div>
        <div className="bg-[#0A0E17] border border-gray-800 px-4 py-3 rounded-xl text-center">
          <span className="text-xs text-gray-500 block uppercase font-bold">Active Bookings</span>
          <span className="text-2xl font-black text-[#00E5FF]">{myBookings.length}</span>
        </div>
      </div>

      {statusMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-xl text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {EXPERTS.map((exp) => {
          const isChosen = selectedExpert?.id === exp.id;
          return (
            <div
              key={exp.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isChosen ? 'bg-[#00E5FF]/10 border-[#00E5FF]' : 'bg-[#121824] border-[#1E293B] hover:border-gray-700'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-800 text-[#00E5FF] px-2 py-0.5 rounded border border-gray-700">
                    {exp.badge}
                  </span>
                  <span className="text-xs font-bold text-amber-400">{exp.rating}</span>
                </div>
                <h3 className="font-bold text-base text-white">{exp.name}</h3>
                <p className="text-xs text-[#00E5FF] mt-0.5 font-semibold">{exp.role}</p>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{exp.focus}</p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase text-gray-500 block">Session Fee</span>
                  <span className="text-lg font-black text-white">{exp.fee}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExpert(isChosen ? null : exp)}
                  className={`text-xs px-4 py-2 rounded-xl font-bold transition ${
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
        <form onSubmit={handleBooking} className="bg-[#121824] border border-[#00E5FF]/50 p-6 rounded-2xl space-y-4 shadow-2xl">
          <div className="flex justify-between items-center border-b border-gray-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              📅 Confirm Session with <span className="text-[#00E5FF]">{selectedExpert.name}</span>
            </h3>
            <button type="button" onClick={() => setSelectedExpert(null)} className="text-gray-400 hover:text-white">✕</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Select Consultation Date</label>
              <input
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full bg-[#0A0E17] border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Select Available Time Slot</label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full bg-[#0A0E17] border border-gray-700 rounded-xl p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]"
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
            className="w-full bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-black py-3 rounded-xl text-sm transition shadow-lg shadow-[#00E5FF]/20"
          >
            {bookingLoading ? 'Securing Session Slot...' : `Confirm & Book Appointment (${selectedExpert.fee})`}
          </button>
        </form>
      )}

      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">📑 Your Consultation History</h3>
        {myBookings.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No consultations booked yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-[#0A0E17] border border-gray-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-sm text-white">{b.expert_name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{b.specialty}</p>
                  <span className="text-[11px] text-[#00E5FF] block mt-2 font-semibold">
                    📅 {b.appointment_date} at {b.slot_time}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/30">
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
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data?.user?.identities?.length === 0) {
          setErrorMsg('An account with this email already exists.');
        } else {
          setInfoMsg('Account created! Logging you in...');
          if (data?.session) onAuthSuccess(data.session.user);
        }
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E17]">
      <div className="w-full max-w-md bg-[#121824] border border-[#1E293B] p-8 rounded-2xl shadow-2xl space-y-6 text-white">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#00E5FF]/10 text-[#00E5FF] text-2xl mb-1">🔥</div>
          <h2 className="text-2xl font-black tracking-wider text-[#00E5FF]">GYM F.R.E.A.K</h2>
          <p className="text-xs text-gray-400">
            {isSignUp ? 'Create your clinical fitness profile' : 'Sign in to sync your routines and health biomarkers'}
          </p>
        </div>

        {errorMsg && <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">{errorMsg}</div>}
        {infoMsg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-xs">{infoMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#0A0E17] border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0A0E17] border border-gray-700 rounded-xl p-3 text-sm text-white outline-none focus:border-[#00E5FF] transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-black py-3 rounded-xl transition text-sm shadow-lg shadow-[#00E5FF]/20 disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800 text-xs text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            type="button"
            onClick={() => { setIsSignUp(!isSignUp); setErrorMsg(''); setInfoMsg(''); }}
            className="text-[#00E5FF] font-bold hover:underline ml-1"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
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
    <div className={`bg-[#0A0E17] border rounded-xl p-3 space-y-2 transition ${isAdapted ? 'border-amber-400/40 bg-amber-400/5' : 'border-gray-800'}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
        <span className={`text-xs font-semibold ${isAdapted ? 'text-amber-300' : 'text-gray-200'}`}>
          {exerciseName}
        </span>
        {lastSet && (
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 self-start sm:self-auto">
            Best PR: {lastSet.weight}kg × {lastSet.reps} reps
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <input 
          type="number" 
          placeholder="Weight (kg)" 
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-24 bg-[#121824] border border-gray-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none focus:border-[#00E5FF]"
        />
        <input 
          type="number" 
          placeholder="Reps" 
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="w-20 bg-[#121824] border border-gray-700 text-xs px-2.5 py-1.5 rounded-lg text-white outline-none focus:border-[#00E5FF]"
        />
        <button 
          type="button" 
          onClick={submitSet}
          className="bg-[#00E5FF] hover:bg-[#00B4D8] text-black text-[11px] font-black px-3 py-1.5 rounded-lg transition"
        >
          + Log Set
        </button>
        <button 
          type="button" 
          onClick={() => onStartRest(90)}
          className="text-gray-400 hover:text-white text-[11px] bg-[#121824] border border-gray-700 px-2.5 py-1.5 rounded-lg transition"
          title="Start 90s Rest Timer"
        >
          ⏱️ Rest
        </button>
      </div>

      {history.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {history.slice(-4).map((item, idx) => (
            <span key={idx} className="text-[10px] bg-gray-800/80 text-gray-300 px-2 py-0.5 rounded border border-gray-700">
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

  return (
    <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">🥗 Clinical Nutrition & Macro Protocol</h3>
          <p className="text-xs text-gray-400">Precision macro breakdown and condition-specific dietary guidelines.</p>
        </div>
        <span className="text-xs bg-[#00E5FF]/10 text-[#00E5FF] px-3 py-1 rounded-lg border border-[#00E5FF]/30 font-bold self-start sm:self-auto">
          {profile.goal.replace('_', ' ').toUpperCase()} TARGET
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#0A0E17] border border-gray-800 p-3.5 rounded-xl text-center">
          <span className="text-[11px] text-emerald-400 font-bold uppercase block">Protein</span>
          <span className="text-xl font-black text-white">{targetProtein}g</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">{targetProtein * 4} kcal</span>
        </div>
        <div className="bg-[#0A0E17] border border-gray-800 p-3.5 rounded-xl text-center">
          <span className="text-[11px] text-[#00E5FF] font-bold uppercase block">Carbohydrates</span>
          <span className="text-xl font-black text-white">{targetCarbs}g</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">{targetCarbs * 4} kcal</span>
        </div>
        <div className="bg-[#0A0E17] border border-gray-800 p-3.5 rounded-xl text-center">
          <span className="text-[11px] text-amber-400 font-bold uppercase block">Healthy Fats</span>
          <span className="text-xl font-black text-white">{targetFats}g</span>
          <span className="text-[10px] text-gray-500 block mt-0.5">{targetFats * 9} kcal</span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        <h4 className="text-xs uppercase font-bold text-gray-400 tracking-wider">Clinical Nutrition Guidelines</h4>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#0A0E17] border border-gray-800 p-3 rounded-xl">
            <span className="font-bold text-emerald-400 block mb-1">Recommended Staples</span>
            <p className="text-gray-400 leading-relaxed">
              Paneer, tofu, chicken breast, eggs, Greek yogurt, lentils, oats, chia seeds, and leafy greens.
            </p>
          </div>
          <div className="bg-[#0A0E17] border border-gray-800 p-3 rounded-xl">
            <span className="font-bold text-rose-400 block mb-1">Items to Minimize</span>
            <p className="text-gray-400 leading-relaxed">
              Ultra-processed seed oils, refined sugars, high-sodium packaged snacks, and sugary soft drinks.
            </p>
          </div>
        </div>

        {selectedConditions.length > 0 && (
          <div className="bg-amber-400/10 border border-amber-400/30 p-3 rounded-xl text-xs text-amber-300 space-y-1 mt-2">
            <span className="font-bold block mb-1">⚠️ Active Clinical Nutrition Overrides:</span>
            {selectedConditions.includes('diabetes') && (
              <p>• Prioritize low GI grains (oats/millets) and eat raw salad 10 minutes before carbs to stabilize blood sugar.</p>
            )}
            {selectedConditions.includes('hypertension') && (
              <p>• Limit processed sodium below 2,000 mg/day; supplement with potassium-rich tender coconut water & spinach.</p>
            )}
            {selectedConditions.includes('pcod') && (
              <p>• Avoid inflammatory dairy/refined gluten; include pumpkin seeds & flax seeds for healthy androgen balance.</p>
            )}
          </div>
        )}
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
    <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-4">
      <div>
        <h3 className="text-lg font-bold flex items-center gap-2">🧪 Biomarker & Lab Diagnostics</h3>
        <p className="text-xs text-gray-400">Log routine blood biomarkers to analyze recovery and energy capacity (Disha Health model).</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-[#0A0E17] border border-gray-800 p-4 rounded-xl">
          <label className="text-xs text-gray-400 block mb-1">Vitamin D3 (ng/mL)</label>
          <input 
            type="number"
            placeholder="Optimal: 30 - 100"
            value={biomarkers?.vitD || ''}
            onChange={(e) => handleChange('vitD', e.target.value)}
            className="w-full bg-[#121824] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00E5FF]"
          />
          {vitD && vitD < 30 && <p className="text-[11px] text-amber-400 mt-2">⚠️ Deficient: Lower bone density, slow joint recovery, and muscle fatigue.</p>}
          {vitD && vitD >= 30 && <p className="text-[11px] text-emerald-400 mt-2">✓ Optimal bone and muscle strength.</p>}
        </div>
        <div className="bg-[#0A0E17] border border-gray-800 p-4 rounded-xl">
          <label className="text-xs text-gray-400 block mb-1">Vitamin B12 (pg/mL)</label>
          <input 
            type="number"
            placeholder="Optimal: 200 - 900"
            value={biomarkers?.b12 || ''}
            onChange={(e) => handleChange('b12', e.target.value)}
            className="w-full bg-[#121824] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00E5FF]"
          />
          {vitB12 && vitB12 < 200 && <p className="text-[11px] text-amber-400 mt-2">⚠️ Low B12: Lethargy, poor nerve transmission, reduced workout stamina.</p>}
          {vitB12 && vitB12 >= 200 && <p className="text-[11px] text-emerald-400 mt-2">✓ Healthy energy metabolism.</p>}
        </div>
        <div className="bg-[#0A0E17] border border-gray-800 p-4 rounded-xl">
          <label className="text-xs text-gray-400 block mb-1">Fasting Glucose (mg/dL)</label>
          <input 
            type="number"
            placeholder="Normal: 70 - 99"
            value={biomarkers?.fastingSugar || ''}
            onChange={(e) => handleChange('fastingSugar', e.target.value)}
            className="w-full bg-[#121824] border border-gray-700 rounded-lg p-2 text-sm text-white outline-none focus:border-[#00E5FF]"
          />
          {sugar && sugar > 100 && <p className="text-[11px] text-rose-400 mt-2">⚠️ Pre-diabetic alert: Limit fast sugars; prioritize high-fiber complex carbs.</p>}
          {sugar && sugar <= 99 && <p className="text-[11px] text-emerald-400 mt-2">✓ Healthy fasting glucose level.</p>}
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
      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#00E5FF] font-bold">Preventive Vitality Index</span>
          <h3 className="text-2xl font-black mt-1">Lifestyle Readiness Score</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-md">Calculated dynamically using your BMI ({bmi.toFixed(1)}), active metabolic burn, and logged physical symptoms.</p>
        </div>
        <div className="text-center bg-[#0A0E17] border border-gray-800 px-8 py-4 rounded-2xl min-w-[180px]">
          <span className={`text-4xl font-black ${scoreColor}`}>{score} / 100</span>
          <span className="block text-[11px] text-gray-400 mt-1 font-semibold uppercase">
            {score >= 80 ? 'Optimal Condition' : score >= 65 ? 'Moderate Caution' : 'Clinical Attention'}
          </span>
        </div>
      </div>

      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl">
        <h3 className="text-lg font-bold mb-1">Select Existing Concerns / Injuries</h3>
        <p className="text-xs text-gray-400 mb-4">Click any condition to auto-adapt your workout exercises and apply safety cautions.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {HEALTH_CONDITIONS.map((cond) => {
            const active = selectedConditions.includes(cond.id);
            return (
              <div key={cond.id} onClick={() => toggleCondition(cond.id)} className={`p-4 rounded-xl border cursor-pointer transition ${active ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white' : 'bg-[#0A0E17] border-gray-800 text-gray-300 hover:border-gray-700'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-sm">{cond.label}</span>
                  <span className="text-[10px] uppercase font-semibold bg-gray-800 px-2 py-0.5 rounded text-gray-400">{cond.tag}</span>
                </div>
                <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cond.caution}</p>
                <div className="mt-3 text-right">
                  <span className={`text-xs font-bold ${active ? 'text-[#00E5FF]' : 'text-gray-600'}`}>{active ? '✓ Active Caution' : '+ Click to Select'}</span>
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
    name: '', age: '22', gender: 'male', height: '175', weight: '70', activity: '1.375', goal: 'fat_loss'
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121824] border border-[#1E293B] p-6 rounded-2xl shadow-2xl text-white space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black text-[#00E5FF]">GYM F.R.E.A.K Profile</h2>
          {profile && <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>}
        </div>
        <div>
          <label className="text-xs text-gray-400">Full Name</label>
          <input type="text" required value={data.name} onChange={e => setData({...data, name: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Age</label>
            <input type="number" value={data.age} onChange={e => setData({...data, age: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Gender</label>
            <select value={data.gender} onChange={e => setData({...data, gender: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]">
              <option value="male">Male</option><option value="female">Female</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400">Height (cm)</label>
            <input type="number" value={data.height} onChange={e => setData({...data, height: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Weight (kg)</label>
            <input type="number" value={data.weight} onChange={e => setData({...data, weight: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]" />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-400">Activity Level</label>
          <select value={data.activity} onChange={e => setData({...data, activity: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]">
            <option value="1.2">Sedentary (Little or no workout)</option>
            <option value="1.375">Lightly Active (1-3 days/week)</option>
            <option value="1.55">Moderately Active (3-5 days/week)</option>
            <option value="1.725">Very Active (6-7 days/week)</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400">Goal</label>
          <select value={data.goal} onChange={e => setData({...data, goal: e.target.value})} className="w-full bg-[#0A0E17] border border-gray-700 rounded-lg p-2.5 text-sm text-white outline-none focus:border-[#00E5FF]">
            <option value="fat_loss">Fat Loss (-400 kcal deficit)</option>
            <option value="maintenance">Maintenance</option>
            <option value="muscle_gain">Muscle Gain (+350 kcal surplus)</option>
          </select>
        </div>
        <button onClick={() => data.name && onSave(data)} className="w-full bg-[#00E5FF] hover:bg-[#00B4D8] text-black font-black py-3 rounded-xl transition text-sm shadow-lg shadow-[#00E5FF]/20">
          Save & Compute Analytics
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
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (data && !error) {
          if (data.profile && Object.keys(data.profile).length > 0) setProfile(data.profile);
          if (data.conditions) setSelectedConditions(data.conditions);
          if (data.biomarkers) setBiomarkers(data.biomarkers);
          if (data.completed_workouts) setCompletedWorkouts(data.completed_workouts);
          if (data.water_glasses !== undefined) setWaterGlasses(data.water_glasses);
        }
      } catch (err) {
        console.error('Initial Cloud Fetch error:', err);
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
  }, [profile, selectedConditions, biomarkers, completedWorkouts, waterGlasses, exerciseLogs, currentUser]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleExportTelemetry = () => {
    window.print();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0E17] text-[#00E5FF] font-black tracking-widest uppercase text-sm">
        Initializing GYM F.R.E.A.K...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthModal onAuthSuccess={setCurrentUser} />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: C.bg }}>
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
  const currentPlan = WORKOUT_DATABASE[selectedKey];

  const adaptExercise = (ex) => {
    let text = ex;
    if (selectedConditions.includes('knee_pain')) {
      if (text.toLowerCase().includes('barbell squat') || text.toLowerCase().includes('jump squat')) return text + ' ⚠️ [Rehab: Replace with Box Squats / Leg Extension]';
    }
    if (selectedConditions.includes('lower_back')) {
      if (text.toLowerCase().includes('deadlift') || text.toLowerCase().includes('bent-over')) return text + ' ⚠️ [Spine Safe: Replace with Chest-Supported Rows]';
    }
    if (selectedConditions.includes('hypertension')) {
      if (text.toLowerCase().includes('heavy') || text.toLowerCase().includes('failure')) return text + ' ⚠️ [Cadence: Keep controlled breathing, avoid maximum strain]';
    }
    return text;
  };

  const completedCount = Object.values(completedWorkouts).filter(Boolean).length;

  return (
    <div className="min-h-screen text-white pb-16 font-sans antialiased" style={{ backgroundColor: C.bg }}>
      <header className="border-b border-[#1E293B] bg-[#121824]/90 backdrop-blur sticky top-0 z-40 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-wider text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                  GYM F.R.E.A.K
                </span>
                <span className="text-[10px] flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full border bg-[#0A0E17] border-gray-800">
                  {syncStatus === 'synced' && <span className="text-emerald-400">● Synced</span>}
                  {syncStatus === 'syncing' && <span className="text-amber-400 animate-pulse">🔄 Syncing...</span>}
                  {syncStatus === 'error' && <span className="text-rose-400">⚠️ Local Only</span>}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button 
              onClick={handleExportTelemetry}
              className="text-xs bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] px-3 py-2 rounded-xl border border-[#00E5FF]/30 transition flex items-center gap-1.5 font-bold"
            >
              📄 Export PDF
            </button>
            <button onClick={() => setIsEditing(true)} className="text-xs bg-[#1E293B] hover:bg-gray-800 text-gray-200 px-3 py-2 rounded-xl border border-gray-700 transition flex items-center gap-1.5">
              ✏️ Profile
            </button>
            <button onClick={handleSignOut} className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-3 py-2 rounded-xl border border-rose-500/30 transition flex items-center gap-1.5">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-6 no-print">
        <div className="inline-flex bg-[#121824] p-1.5 rounded-2xl border border-[#1E293B] shadow-lg flex-wrap gap-1">
          <button onClick={() => setCurrentTab('dashboard')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentTab === 'dashboard' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'text-gray-400 hover:text-white'}`}>
            📊 Tracker
          </button>
          <button onClick={() => setCurrentTab('consult')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentTab === 'consult' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'text-gray-400 hover:text-white'}`}>
            🩺 Expert Consult <span className="bg-[#0A0E17] text-[#00E5FF] text-[10px] px-1.5 py-0.5 rounded border border-[#00E5FF]/30">Disha</span>
          </button>
          <button onClick={() => setCurrentTab('health')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${currentTab === 'health' ? 'bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20' : 'text-gray-400 hover:text-white'}`}>
            🛡️ Health Risk
            {selectedConditions.length > 0 && <span className="bg-amber-400 text-black px-1.5 py-0.2 rounded-full text-[10px] font-bold">{selectedConditions.length}</span>}
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-6">
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-black">Welcome Back, {profile.name} 👋</h1>
                <p className="text-xs text-gray-400 mt-1">
                  Current Target: <span className="text-[#00E5FF] font-bold uppercase">{profile.goal.replace('_', ' ')}</span> • Height: {profile.height}cm • Weight: {profile.weight}kg
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-[#0A0E17] border border-gray-800 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] uppercase text-gray-500 block font-bold">Body Mass Index</span>
                  <span className="text-lg font-black text-white">{bmi}</span>
                  <span className="text-[10px] text-[#00E5FF] ml-1.5 font-semibold">({bmi < 18.5 ? 'Underweight' : bmi < 24.9 ? 'Healthy' : 'Overweight'})</span>
                </div>
              </div>
            </div>

            <ConsistencyMatrix waterGlasses={waterGlasses} completedWorkoutsCount={completedCount} />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#121824] border border-[#1E293B] p-5 rounded-2xl">
                <span className="text-xs text-gray-400 block font-semibold">Target Calories</span>
                <span className="text-3xl font-black text-[#00E5FF] tracking-tight">{targetCalories}</span>
                <span className="text-[11px] text-gray-500 block mt-1">kcal / day</span>
              </div>
              <div className="bg-[#121824] border border-[#1E293B] p-5 rounded-2xl">
                <span className="text-xs text-gray-400 block font-semibold">Maintenance (TDEE)</span>
                <span className="text-3xl font-black text-white tracking-tight">{tdee}</span>
                <span className="text-[11px] text-gray-500 block mt-1">kcal daily burn</span>
              </div>
              <div className="bg-[#121824] border border-[#1E293B] p-5 rounded-2xl">
                <span className="text-xs text-gray-400 block font-semibold">Protein Target</span>
                <span className="text-3xl font-black text-emerald-400 tracking-tight">{targetProtein}g</span>
                <span className="text-[11px] text-gray-500 block mt-1">Optimal muscle retention</span>
              </div>
              <div className="bg-[#121824] border border-[#1E293B] p-5 rounded-2xl">
                <span className="text-xs text-gray-400 block font-semibold">Basal Metabolic Rate</span>
                <span className="text-3xl font-black text-amber-400 tracking-tight">{Math.round(bmr)}</span>
                <span className="text-[11px] text-gray-500 block mt-1">Resting energy</span>
              </div>
            </div>

            <ClinicalDietPanel profile={profile} selectedConditions={selectedConditions} targetCalories={targetCalories} targetProtein={targetProtein} />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-base flex items-center gap-2">💧 Daily Hydration</h3>
                    <p className="text-xs text-gray-400">Aim for at least 8 to 10 glasses daily</p>
                  </div>
                  <span className="text-sm font-black text-[#00E5FF]">{waterGlasses} / 10 Glasses</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setWaterGlasses(prev => Math.max(0, prev - 1))} className="w-10 h-10 rounded-xl bg-[#0A0E17] border border-gray-700 text-lg font-bold hover:bg-gray-800 transition">-</button>
                  <div className="flex-1 bg-[#0A0E17] h-3.5 rounded-full overflow-hidden border border-gray-800">
                    <div className="bg-[#00E5FF] h-full transition-all duration-300" style={{ width: `${Math.min(100, (waterGlasses / 10) * 100)}%` }} />
                  </div>
                  <button onClick={() => setWaterGlasses(prev => prev + 1)} className="w-10 h-10 rounded-xl bg-[#0A0E17] border border-gray-700 text-lg font-bold hover:bg-gray-800 transition">+</button>
                </div>
              </div>

              <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base flex items-center gap-2">🏋️ Training & Health Direction</h3>
                  <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                    Log weight and reps on each exercise to track progressive overload. Logged data is saved locally and synced to your cloud account.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                  <span>Selected Mode: <span className="text-[#00E5FF] font-bold uppercase">{workoutType}</span></span>
                  <span className="text-emerald-400 font-semibold">Active Plan</span>
                </div>
              </div>
            </div>

            <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800/80 pb-5">
                <div>
                  <h2 className="text-lg font-bold flex items-center gap-2">💪 Workout Schedule & Exercise Log</h2>
                  <p className="text-xs text-gray-400">Track sets, weights, and repetitions with integrated rest timer</p>
                </div>
                <div className="flex bg-[#0A0E17] p-1 rounded-xl border border-gray-800">
                  <button onClick={() => setWorkoutType('gym')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${workoutType === 'gym' ? 'bg-[#00E5FF] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>🏋️ Gym Workout</button>
                  <button onClick={() => setWorkoutType('home')} className={`px-4 py-2 rounded-lg text-xs font-bold transition ${workoutType === 'home' ? 'bg-[#00E5FF] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}>🏠 Home Workout</button>
                </div>
              </div>

              {workoutType === 'gym' && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 font-semibold mr-1">Select Gym Split:</span>
                  <button onClick={() => setGymSplitType('gym_ppl')} className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition ${gymSplitType === 'gym_ppl' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-gray-800 hover:text-white'}`}>Push Pull Legs (PPL)</button>
                  <button onClick={() => setGymSplitType('gym_two_muscle')} className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition ${gymSplitType === 'gym_two_muscle' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-gray-800 hover:text-white'}`}>Two Muscle / Day (Classic)</button>
                  <button onClick={() => setGymSplitType('gym_one_muscle')} className={`text-xs px-3.5 py-1.5 rounded-lg border font-bold transition ${gymSplitType === 'gym_one_muscle' ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]' : 'bg-[#0A0E17] text-gray-400 border-gray-800 hover:text-white'}`}>One Muscle / Day (Bro Split)</button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                {currentPlan.splits.map((split, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border transition ${completedWorkouts[`${selectedKey}_${idx}`] ? 'bg-[#00E5FF]/5 border-[#00E5FF]/40' : 'bg-[#121824] border-gray-800'}`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E5FF]">{split.day}</span>
                        <h4 className="font-bold text-sm text-white mt-0.5">{split.name}</h4>
                      </div>
                      <button onClick={() => toggleWorkout(`${selectedKey}_${idx}`)} className={`text-xs px-3 py-1.5 rounded-lg font-bold transition ${completedWorkouts[`${selectedKey}_${idx}`] ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                        {completedWorkouts[`${selectedKey}_${idx}`] ? '✓ Done' : 'Mark Complete'}
                      </button>
                    </div>
                    
                    <div className="space-y-2 mt-3">
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

      {activeRestSeconds !== null && (
        <FloatingRestTimer 
          initialSeconds={activeRestSeconds}
          onCancel={() => setActiveRestSeconds(null)}
        />
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