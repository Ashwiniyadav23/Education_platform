import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q) => {
    setLoading(true);
    const { data } = await api.get('/students', { params: q ? { search: q } : {} });
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    load('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(search);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="mt-1 text-sm text-slate-500">Browse student profiles and their risk history.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or roll number..."
            className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white">Search</button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Roll Number</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Semester</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">Loading...</td></tr>
            )}
            {!loading && students.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-6 text-center text-slate-400">No students found.</td></tr>
            )}
            {students.map((s) => (
              <tr key={s._id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-900">{s.name}</td>
                <td className="px-5 py-3 text-slate-600">{s.rollNumber}</td>
                <td className="px-5 py-3 text-slate-600">{s.department}</td>
                <td className="px-5 py-3 text-slate-600">{s.semester}</td>
                <td className="px-5 py-3 text-right">
                  <Link to={`/students/${s._id}`} className="font-medium text-indigo-600">View profile →</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
