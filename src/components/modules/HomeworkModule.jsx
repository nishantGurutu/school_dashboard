import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';

const empty = { title: '', subject: '', className: '', section: '', description: '', dueDate: '' };
export function HomeworkModule() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    setLoading(true);
    try { setRows(await apiRequest('/teacher/homework')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const save = async event => {
    event.preventDefault(); setSaving(true); setError('');
    try { await apiRequest('/teacher/homework', { method: 'POST', body: form }); setForm(empty); await load(); }
    catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  return <section>
    <h1>Assignments</h1><p>Publish homework for a class and section. Students see it in their mobile app.</p>
    {error && <p role="alert">{error}</p>}
    <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 700, margin: '24px 0' }}>
      {['title', 'subject', 'className', 'section', 'dueDate'].map(key => <label key={key}>
        {{ title: 'Assignment title', subject: 'Subject', className: 'Class (match the student class exactly)', section: 'Section (optional)', dueDate: 'Due date' }[key]}
        <input style={{ display: 'block', padding: 10, width: '100%' }} type={key === 'dueDate' ? 'date' : 'text'} required={key !== 'section'} value={form[key]} onChange={event => setForm({ ...form, [key]: event.target.value })} />
      </label>)}
      <label>Instructions<textarea style={{ display: 'block', width: '100%', minHeight: 100 }} value={form.description} onChange={event => setForm({ ...form, description: event.target.value })} /></label>
      <button disabled={saving} type="submit">{saving ? 'Publishing…' : 'Publish assignment'}</button>
    </form>
    {loading ? <p>Loading assignments…</p> : rows.length === 0 ? <p>No assignments published.</p> : <table style={{ width: '100%', textAlign: 'left' }}>
      <thead><tr><th>Assignment</th><th>Subject</th><th>Class / Section</th><th>Due date</th><th>Assigned by</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}><td>{row.title}</td><td>{row.subject}</td><td>{row.className} {row.section}</td><td>{row.dueDate}</td><td>{row.assignedBy}</td></tr>)}</tbody>
    </table>}
  </section>;
}
