import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import api from '../api/axios';
import RiskBadge from '../components/RiskBadge';
import RiskFactorBar from '../components/RiskFactorBar';
import { useAuth } from '../context/AuthContext';

export default function StudentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [history, setHistory] = useState([]);
  const [grades, setGrades] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'tutoring', title: '', notes: '' });

  const load = async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.get(`/students/${id}`),
      api.get(`/risk/${id}/latest`),
      api.get(`/risk/${id}/history`),
      api.get(`/grades/student/${id}`),
      api.get(`/interventions/student/${id}`),
    ]);
    if (results[0].status === 'fulfilled') setStudent(results[0].value.data);
    if (results[1].status === 'fulfilled') setAssessment(results[1].value.data);
    if (results[2].status === 'fulfilled') setHistory(results[2].value.data);
    if (results[3].status === 'fulfilled') setGrades(results[3].value.data);
    if (results[4].status === 'fulfilled') setInterventions(results[4].value.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const runAssessment = async () => {
    setRunning(true);
    try {
      await api.post(`/risk/assess/${id}`);
      await load();
    } finally {
      setRunning(false);
    }
  };

  const createIntervention = async (e) => {
    e.preventDefault();
    await api.post('/interventions', { ...form, student: id });
    setForm({ type: 'tutoring', title: '', notes: '' });
    setShowForm(false);
    load();
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Loading student profile...</div>;
  if (!student) return <div className="p-10 text-center text-slate-500">Student not found.</div>;

  const trendData = history.map((h) => ({
    date: new Date(h.generatedAt).toLocaleDateString(),
    score: h.riskScore,
  }));

  const gradeTrend = [...grades]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((g, i) => ({ name: `A${i + 1}`, percentage: Math.round((g.marksObtained / g.maxMarks) * 100) }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {student.rollNumber} · {student.department} · Semester {student.semester}
          </p>
        </div>
        {(user?.role === 'teacher' || user?.role === 'admin') && (
          <button
            onClick={runAssessment}
            disabled={running}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {running ? 'Running AI model...' : 'Run risk prediction'}
          </button>
        )}
      </div>

      {!assessment ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No risk assessment yet. Click "Run risk prediction" to generate one from attendance, grades, and engagement data.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-700">Current Risk Level</h2>
              <div className="mt-3">
                <RiskBadge level={assessment.riskLevel} score={assessment.riskScore} />
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Last assessed {new Date(assessment.generatedAt).toLocaleString()}
              </p>
              <div className="mt-5 space-y-4">
                {assessment.factors.map((f) => (
                  <RiskFactorBar key={f.name} factor={f} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-700">Risk Score History</h2>
              <div className="mt-2 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <h2 className="mt-6 text-sm font-semibold text-slate-700">Grade Trend</h2>
              <div className="mt-2 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={gradeTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="percentage" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700">AI-Suggested Interventions</h2>
            <ul className="mt-3 space-y-2">
              {assessment.recommendations.map((r, i) => (
                <li key={i} className="flex gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <span className="text-indigo-600">→</span> {r}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Intervention Log</h2>
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button
              onClick={() => setShowForm((s) => !s)}
              className="text-sm font-medium text-indigo-600"
            >
              {showForm ? 'Cancel' : '+ Log intervention'}
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={createIntervention} className="mt-4 grid grid-cols-1 gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="counseling">Counseling</option>
              <option value="tutoring">Tutoring</option>
              <option value="parent_meeting">Parent Meeting</option>
              <option value="study_plan">Study Plan</option>
              <option value="mentorship">Mentorship</option>
              <option value="other">Other</option>
            </select>
            <input
              required
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              placeholder="Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="sm:col-span-2 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              rows={2}
            />
            <button className="sm:col-span-2 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white">
              Save intervention
            </button>
          </form>
        )}

        <div className="mt-4 divide-y divide-slate-100">
          {interventions.length === 0 && <p className="py-4 text-sm text-slate-500">No interventions logged yet.</p>}
          {interventions.map((iv) => (
            <div key={iv._id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{iv.title}</p>
                <p className="text-xs text-slate-500 capitalize">{iv.type.replace('_', ' ')} · {iv.notes}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
                {iv.status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
