import React, { useEffect, useState } from 'react';
import { API_BASE_URL, apiRequest } from '../../services/api';

const empty = { title: '', subject: '', className: '', section: '', description: '', dueDate: '', points: 100, targetStudentId: '', fileAttachmentUrl: '' };
const base = '/mobile/teacher/assignments';
export function HomeworkModule() {
  const [editing, setEditing] = useState(null);
  const [rows, setRows] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selected, setSelected] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const load = async () => {
    setLoading(true);
    try {
      const [assignments, options] = await Promise.all([apiRequest(base), apiRequest('/mobile/teacher/classes')]);
      setRows(assignments); setClasses(options); setError('');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    let active = true;
    setStudents([]);
    if (form.className) apiRequest(`/mobile/classes/${encodeURIComponent(form.className)}/students?section=${encodeURIComponent(form.section)}`)
      .then(data => { if (active) setStudents(data); }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [form.className, form.section]);
  const save = async event => {
    event.preventDefault(); setSaving(true); setError(''); setMessage('');
    try {
      await apiRequest(editing ? `${base}/${editing}` : base, { method: editing ? 'PUT' : 'POST', body: { ...form, points: Number(form.points), targetStudentId: form.targetStudentId ? Number(form.targetStudentId) : null } });
      setForm(empty); setEditing(null); setMessage('Assignment saved for the selected students and their linked parents.'); await load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const viewSubmissions = async row => {
    setSelected(null); setError('');
    try { const data = await apiRequest(`${base}/${row.id}/submissions`); setSubmissions(data); setSelected(row); }
    catch (e) { setError(e.message); }
  };
  const review = async (event, submission) => {
    event.preventDefault(); setSaving(true); setError('');
    const data = new FormData(event.currentTarget);
    try {
      await apiRequest(`${base}/${selected.id}/submissions/${submission.submissionId}/review`, { method: 'POST', body: {
        status: data.get('status'), points: data.get('points') === '' ? null : Number(data.get('points')), feedback: data.get('feedback'),
      } });
      await viewSubmissions(selected); await load(); setMessage('Review saved. Student and parent can see the updated result.');
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const classNames = [...new Set(classes.map(c => c.className))];
  const sections = [...new Set(classes.filter(c => c.className === form.className).map(c => c.section || ''))];
  return <section>
    <h1>Assignments</h1><p>Publish homework, track submissions and send feedback to students and parents.</p>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <button type="button" disabled={loading} onClick={load}>Refresh</button>
    {!loading && classes.length === 0 && <p>No classes available. Ask your school administrator to assign classes.</p>}
    <form onSubmit={save} style={{ display: 'grid', gap: 12, maxWidth: 700, margin: '24px 0' }}>
      <label>Class<select required value={form.className} onChange={e => {
        const cls = classes.find(c => c.className === e.target.value);
        setForm({ ...form, className: e.target.value, section: cls?.section || '', subject: cls?.subject === 'All Subjects' ? '' : cls?.subject || '', targetStudentId: '' });
      }}><option value="">Select class</option>{classNames.map(name => <option key={name}>{name}</option>)}</select></label>
      <label>Section<select value={form.section} onChange={e => setForm({ ...form, section: e.target.value, targetStudentId: '' })}>
        {sections.map(section => <option key={section} value={section}>{section || 'All sections'}</option>)}
      </select></label>
      <label>Assign to<select value={form.targetStudentId} onChange={e => setForm({ ...form, targetStudentId: e.target.value })}>
        <option value="">Whole class / section</option>{students.map(student => <option key={student.id} value={student.id}>{student.name} ({student.admissionNo})</option>)}
      </select></label>
      {['title', 'subject', 'dueDate', 'points', 'fileAttachmentUrl'].map(key => <label key={key}>
        {{ title: 'Assignment title', subject: 'Subject', dueDate: 'Due date', points: 'Maximum points', fileAttachmentUrl: 'Resource / attachment URL (optional)' }[key]}
        <input style={{ display: 'block', padding: 10, width: '100%' }} type={key === 'dueDate' ? 'date' : key === 'points' ? 'number' : key === 'fileAttachmentUrl' ? 'url' : 'text'} min={key === 'points' ? 1 : undefined} required={key !== 'fileAttachmentUrl'} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
      </label>)}
      <label>Upload resource<input type="file" disabled={saving} onChange={async event => {
        const file = event.target.files?.[0]; if (!file) return;
        setSaving(true); setError('');
        try { const body = new FormData(); body.append('file', file); const uploaded = await apiRequest('/files/upload', { method: 'POST', body }); setForm(current => ({ ...current, fileAttachmentUrl: new URL(uploaded.fileUrl, API_BASE_URL).href })); }
        catch (e) { setError(e.message); } finally { setSaving(false); }
      }} /></label>
      <label>Instructions<textarea style={{ display: 'block', width: '100%', minHeight: 100 }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <button disabled={saving || classes.length === 0} type="submit">{saving ? 'Saving…' : editing ? 'Save assignment' : 'Publish assignment'}</button>
      {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel edit</button>}
    </form>
    {loading ? <p>Loading assignments…</p> : rows.length === 0 ? <p>No assignments published.</p> : <table style={{ width: '100%', textAlign: 'left' }}>
      <thead><tr><th>Assignment</th><th>Subject</th><th>Class / Section</th><th>Assigned to</th><th>Due</th><th>Submitted / Eligible</th><th>Review</th></tr></thead>
      <tbody>{rows.map(row => <tr key={row.id}><td>{row.title}</td><td>{row.subject}</td><td>{row.className} {row.section}</td><td>{row.targetStudentName || 'Whole class / section'}</td><td>{row.dueDate}</td><td>{row.submissionCount} / {row.totalStudents}</td><td><button type="button" onClick={() => viewSubmissions(row)}>View submissions</button><button type="button" onClick={() => { setEditing(row.id); setForm({ ...empty, ...Object.fromEntries(Object.keys(empty).map(key => [key, row[key] ?? empty[key]])), targetStudentId: row.targetStudentId || '' }); }}>Edit</button><button type="button" disabled={saving} onClick={async () => {
        if (!window.confirm('Delete this assignment and all its submissions?')) return;
        setSaving(true);
        try { await apiRequest(`${base}/${row.id}`, { method: 'DELETE' }); if (selected?.id === row.id) setSelected(null); await load(); }
        catch (e) { setError(e.message); } finally { setSaving(false); }
      }}>Delete</button></td></tr>)}</tbody>
    </table>}
    {selected && <section aria-label="Assignment submissions"><h2>{selected.title}: submissions</h2>
      <button type="button" onClick={() => setSelected(null)}>Close</button>
      {submissions.length === 0 && <p>No eligible students.</p>}
      {submissions.map(sub => <article key={sub.studentId} style={{ padding: 16, borderBottom: '1px solid #ddd' }}>
        <h3>{sub.studentName} ({sub.studentAdmissionNo}) — {sub.status}</h3>
        <p>{sub.submissionText}</p>{sub.fileUrl && /^https?:\/\//i.test(sub.fileUrl) && <a href={sub.fileUrl} target="_blank" rel="noreferrer">Open submitted attachment</a>}
        {sub.submissionId && <form onSubmit={event => review(event, sub)} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label>Decision<select name="status" defaultValue={['GRADED', 'ACCEPTED', 'REJECTED'].includes(sub.status) ? sub.status : 'GRADED'}><option>GRADED</option><option>ACCEPTED</option><option>REJECTED</option></select></label>
          <label>Points / {sub.maxPoints}<input name="points" type="number" min="0" max={sub.maxPoints} defaultValue={sub.points ?? ''} /></label>
          <label>Feedback<textarea name="feedback" defaultValue={sub.teacherFeedback || ''} /></label>
          <button disabled={saving}>Save review</button>
        </form>}
      </article>)}
    </section>}
  </section>;
}
