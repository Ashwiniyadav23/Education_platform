import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-indigo-50 text-indigo-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-slate-100 text-slate-600',
};

export default function Interventions() {
  const [interventions, setInterventions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (status) => {
    setLoading(true);
    const { data } = await api.get('/interventions', { params: status ? { status } : {} });
    setInterventions(data);
    setLoading(false);
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    await api.put(`/interventions/${id}`, { status });
    load(filter);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Interventions</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage support actions for at-risk students.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>}
            {!loading && interventions.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No interventions found.</td></tr>
            )}
            {interventions.map((iv) => (
              <tr key={iv._id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link to={`/students/${iv.student?._id}`} className="font-medium text-indigo-600">
                    {iv.student?.name}
                  </Link>
                </td>
                <td className="px-5 py-3 capitalize text-slate-600">{iv.type.replace('_', ' ')}</td>
                <td className="px-5 py-3 text-slate-700">{iv.title}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[iv.status]}`}>
                    {iv.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  {iv.status !== 'completed' && (
                    <select
                      value={iv.status}
                      onChange={(e) => updateStatus(iv._id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
