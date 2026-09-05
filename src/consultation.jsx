import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

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

export default function Consultation({ currentUser, profile, selectedConditions, biomarkers }) {
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');

  // Fetch Existing Bookings
  const loadBookings = async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        setMyBookings(data);
      }
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
      {/* Banner */}
      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF]">Clinical Tele-Health</span>
          <h2 className="text-2xl font-black mt-1">Book 1-on-1 Specialist Consultation</h2>
          <p className="text-xs text-gray-400 mt-1 max-w-lg">
            Consult doctors & rehabilitation specialists certified under the Disha Health Clinical Model. Your biomarker lab logs and risk scores will automatically attach to your case file.
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

      {/* Specialist Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {EXPERTS.map((exp) => {
          const isChosen = selectedExpert?.id === exp.id;
          return (
            <div
              key={exp.id}
              className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                isChosen
                  ? 'bg-[#00E5FF]/10 border-[#00E5FF]'
                  : 'bg-[#121824] border-[#1E293B] hover:border-gray-700'
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
                    isChosen
                      ? 'bg-rose-500 text-white'
                      : 'bg-[#00E5FF] text-black hover:bg-[#00B4D8]'
                  }`}
                >
                  {isChosen ? 'Deselect' : 'Select Slot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Form Modal / Panel */}
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

          <div className="bg-[#0A0E17] p-3 rounded-xl border border-gray-800 text-xs text-gray-400">
            <span className="font-bold text-[#00E5FF] block mb-1">Attached Patient Telemetry:</span>
            Conditions: {selectedConditions?.length ? selectedConditions.join(', ') : 'None'} • Fasting Glucose: {biomarkers?.fastingSugar || 'Not reported'} • Vitamin D: {biomarkers?.vitD || 'Not reported'}
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

      {/* Booked Sessions History */}
      <div className="bg-[#121824] border border-[#1E293B] p-6 rounded-2xl space-y-4">
        <h3 className="font-bold text-lg flex items-center gap-2">📑 Your Consultation History & Upcoming Calls</h3>
        {myBookings.length === 0 ? (
          <p className="text-xs text-gray-500 py-4 text-center">No consultations booked yet. Select a specialist above to schedule.</p>
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