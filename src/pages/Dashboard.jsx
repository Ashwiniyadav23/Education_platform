import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';

const RISK_COLORS = { Low: '#16a34a', Medium: '#f59e0b', High: '#dc2626' };

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [atRisk, setAtRisk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessing, setAssessing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: summaryData }, { data: atRiskData }] = await Promise.all([
      api.get('/dashboard/summary'),
      api.get('/risk/at-risk'),
    ]);
    setSummary(summaryData);
    setAtRisk(atRiskData);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const runBatchAssessment = async () => {
    setAssessing(true);
    try {
      await api.post('/risk/assess-all');
      await load();
    } finally {
      setAssessing(false);
    }
  };

  if (loading) {
    return <div className="p-10 text-center text-slate-500">Loading dashboard...</div>;
  }

  const pieData = summary
    ? [
        { name: 'Low', value: summary.riskCounts.Low },
        { name: 'Medium', value: summary.riskCounts.Medium },
        { name: 'High', value: summary.riskCounts.High },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Academic Risk Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Predictive analytics across attendance, grades, and engagement signals.
          </p>
        </div>
        <button
          onClick={runBatchAssessment}
          disabled={assessing}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {assessing ? 'Running AI assessment...' : 'Run risk assessment for all students'}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students" value={summary.totalStudents} sublabel={`${summary.studentsAssessed} assessed`} accent="indigo" />
        <StatCard label="Average Risk Score" value={summary.avgRiskScore} sublabel="out of 100" accent="amber" />
        <StatCard label="High Risk Students" value={summary.riskCounts.High} sublabel="need attention" accent="red" />
        <StatCard label="Pending Interventions" value={summary.pendingInterventions} sublabel={`${summary.completedInterventions} completed`} accent="emerald" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-700">Risk Level Distribution</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-slate-600">
            {pieData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: RISK_COLORS[d.name] }} />
                {d.name}: {d.value}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-700">Average Risk Score Trend</h2>
          <div className="mt-2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#4f46e5" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="text-sm font-semibold text-slate-700">Students Needing Attention</h2>
          <Link to="/students" className="text-sm font-medium text-indigo-600">View all students →</Link>
        </div>
        <div className="divide-y divide-slate-100">
          {atRisk.length === 0 && (
            <p className="p-5 text-sm text-slate-500">
              No at-risk students found yet. Click "Run risk assessment" above to generate predictions.
            </p>
          )}
          {atRisk.map((a) => (
            <Link
              to={`/students/${a.student?._id}`}
              key={a._id}
              className="flex items-center justify-between p-5 hover:bg-slate-50"
            >
              <div>
                <p className="font-medium text-slate-900">{a.student?.name}</p>
                <p className="text-xs text-slate-500">
                  {a.student?.rollNumber} · {a.student?.department} · Sem {a.student?.semester}
                </p>
              </div>
              <RiskBadge level={a.riskLevel} score={a.riskScore} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
