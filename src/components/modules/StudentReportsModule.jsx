import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import NetworkService from '../../services/networkService';

const empty = { className: '', section: '', admissionNo: '', title: '', term: '', description: '', file: null };
export const StudentReportsModule = () => {
  const [reports, setReports] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const load = async () => {
    setLoading(true); setError('');
    try {
      const [items, context] = await Promise.all([NetworkService.get('/student-reports'), NetworkService.get('/mobile/portal/context')]);
      setReports(items); setClasses(context.classes || []);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => {
    let cancelled = false;
    setStudents([]); setStudentsError('');
    if (!open || !form.className || !form.section) { setStudentsLoading(false); return; }
    setStudentsLoading(true);
    NetworkService.get('/student-reports/students', { className: form.className, section: form.section })
      .then(items => { if (!cancelled) setStudents(items); })
      .catch(e => { if (!cancelled) setStudentsError(e.message); })
      .finally(() => { if (!cancelled) setStudentsLoading(false); });
    return () => { cancelled = true; };
  }, [open, form.className, form.section]);
  useEffect(() => {
    if (!open) return;
    const close = event => { if (event.key === 'Escape' && !savingRef.current) setOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  const save = async event => {
    event.preventDefault();
    if (savingRef.current) return;
    if (!students.some(s => s.admissionNo === form.admissionNo) || !form.file) { setError('Select a student and PDF report.'); return; }
    savingRef.current = true; setSaving(true); setError('');
    try {
      const payload = new FormData();
      ['admissionNo', 'title', 'term', 'description', 'file'].forEach(key => payload.append(key, form[key]));
      const report = await NetworkService.post('/student-reports', payload);
      setReports(previous => [report, ...previous]); setOpen(false);
    } catch (e) { setError(e.message); } finally { savingRef.current = false; setSaving(false); }
  };
  const download = async report => {
    try {
      const blob = await NetworkService.get(`/student-reports/${report.id}/pdf?attachment=true`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = report.fileName || 'Report.pdf'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (e) { setError(e.message); }
  };
  const remove = async report => {
    if (!window.confirm(`Delete report "${report.title}"?`)) return;
    try { await NetworkService.delete(`/student-reports/${report.id}`); setReports(items => items.filter(r => r.id !== report.id)); }
    catch (e) { setError(e.message); }
  };
  const classNames = [...new Set(classes.map(c => c.name))];
  const sections = [...new Set(classes.filter(c => c.name === form.className).map(c => c.section).filter(Boolean))];
  const field = { width: '100%', padding: 10, marginTop: 6, boxSizing: 'border-box', background: 'var(--bg-app)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 8 };
  return <div className="card" style={{ padding: 24 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
      <div><h2>Student Reports</h2><p>Upload a PDF report for a specific student.</p></div>
      <div><button className="btn" onClick={load}>Refresh</button> <button className="btn btn-primary" onClick={() => { setForm(empty); setError(''); setOpen(true); }}>+ Add Report</button></div>
    </div>
    {error && !open && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
    {loading ? <p>Loading reports...</p> : reports.length === 0 ? <p>No reports published yet.</p> : <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', marginTop: 20 }}>
      <thead><tr>{['Report', 'Student', 'Class / Section', 'Term', 'Published', 'Actions'].map(label => <th key={label} style={{ textAlign: 'left', padding: 12 }}>{label}</th>)}</tr></thead>
      <tbody>{reports.map(report => <tr key={report.id}>
        <td style={{ padding: 12 }}>{report.title}<br /><small>{report.fileName}</small></td>
        <td>{report.studentName}<br /><small>{report.admissionNo}</small></td><td>{report.className} / {report.section}</td>
        <td>{report.term || '—'}</td><td>{report.createdAt?.slice(0, 10)}</td>
        <td><button className="btn" onClick={() => download(report)}>Download PDF</button> <button className="btn" onClick={() => remove(report)}>Delete</button></td>
      </tr>)}</tbody>
    </table></div>}
    {open && createPortal(<div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: '#0009', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="card" role="dialog" aria-modal="true" aria-labelledby="student-report-title" style={{ width: '100%', maxWidth: 560, maxHeight: 'calc(100dvh - 32px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: 20, display: 'flex', justifyContent: 'space-between', flexShrink: 0 }}><h3 id="student-report-title">Add Student Report</h3><button className="btn" type="button" disabled={saving} onClick={() => setOpen(false)}>Close</button></div>
        <form onSubmit={save} style={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ overflowY: 'auto', padding: 20, display: 'grid', gap: 16 }}>
            {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
            <label>Class *<select required value={form.className} style={field} onChange={e => setForm({ ...form, className: e.target.value, section: '', admissionNo: '' })}><option value="">Select Class</option>{classNames.map(name => <option key={name}>{name}</option>)}</select></label>
            <label>Section *<select required disabled={!form.className} value={form.section} style={field} onChange={e => setForm({ ...form, section: e.target.value, admissionNo: '' })}><option value="">Select Section</option>{sections.map(name => <option key={name}>{name}</option>)}</select></label>
            <label>Student *<select required disabled={!form.section || studentsLoading || !!studentsError} value={form.admissionNo} style={field} onChange={e => setForm({ ...form, admissionNo: e.target.value })}><option value="">{studentsLoading ? 'Loading students...' : 'Select Student'}</option>{students.map(student => <option key={student.id} value={student.admissionNo}>{student.name} ({student.admissionNo})</option>)}</select></label>
            {studentsError && <p role="alert">{studentsError}. Select the class and section again to retry.</p>}
            {form.section && !studentsLoading && !studentsError && students.length === 0 && <p>No students in this section.</p>}
            <label>Report Title *<input required maxLength={255} style={field} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></label>
            <label>Term / Academic Year<input maxLength={128} style={field} value={form.term} onChange={e => setForm({ ...form, term: e.target.value })} /></label>
            <label>Description<textarea maxLength={2000} style={field} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
            <label>Report PDF * (up to 20 MB)<input required type="file" accept="application/pdf,.pdf" style={field} onChange={e => setForm({ ...form, file: e.target.files[0] || null })} /></label>
          </div>
          <div style={{ padding: 20, flexShrink: 0, display: 'flex', justifyContent: 'flex-end', gap: 12 }}><button type="button" className="btn" disabled={saving} onClick={() => setOpen(false)}>Cancel</button><button className="btn btn-primary" disabled={saving || studentsLoading} type="submit">{saving ? 'Publishing...' : 'Publish Report'}</button></div>
        </form>
      </div>
    </div>, document.body)}
  </div>;
};
