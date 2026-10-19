import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';

export function PortalModule() {
  const [tab, setTab] = useState('diary');
  const [context, setContext] = useState({ classes: [] });
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', classIndex: '', subject: '', durationMinutes: 30, opensAt: '', closesAt: '' });
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState({ prompt: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 });
  const load = async () => {
    setBusy(true); setError('');
    try {
      const [scope, records] = await Promise.all([apiRequest('/mobile/portal/context'), apiRequest(tab === 'diary' ? '/mobile/portal/diary' : tab === 'notifications' ? '/mobile/portal/notifications' : '/mobile/online-exams')]);
      setContext(scope); setRows(records);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  useEffect(() => { setRows([]); setResults(null); load(); }, [tab]);
  const change = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const save = async event => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const selected = context.classes[Number(form.classIndex)];
      if (form.classIndex === '' || !selected) throw new Error('Select an assigned class.');
      const audience = { className: selected.name, section: selected.section };
      if (tab === 'diary') await apiRequest('/mobile/portal/diary', { method: 'POST', body: { title: form.title, content: form.content, ...audience } });
      else {
        if (!questions.length) throw new Error('Add at least one question.');
        await apiRequest('/mobile/online-exams', { method: 'POST', body: { title: form.title, subject: form.subject, durationMinutes: Number(form.durationMinutes), opensAt: new Date(form.opensAt).toISOString(), closesAt: new Date(form.closesAt).toISOString(), published: true, questions, ...audience } });
      }
      setForm(f => ({ ...f, title: '', content: '' })); setQuestions([]); await load();
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };
  const addQuestion = () => {
    if (!question.prompt.trim() || question.options.some(o => !o.trim()) || Number(question.marks) < 1) { setError('Complete the question, all options and positive marks.'); return; }
    setQuestions(q => [...q, { ...question, marks: Number(question.marks), correctIndex: Number(question.correctIndex) }]);
    setQuestion({ prompt: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 }); setError('');
  };
  const action = async fn => { setBusy(true); setError(''); try { await fn(); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); } };
  const input = { padding: 10, margin: '4px 0', width: '100%', color: 'inherit', background: 'transparent', border: '1px solid #888', borderRadius: 6 };
  return <section style={{ padding: 24 }}>
    <h1>Student portal</h1>
    <div style={{ display: 'flex', gap: 12 }}>{[['diary', 'Diary'], ['onlineExams', 'Online exams'], ['notifications', 'Notifications']].map(([key, title]) => <button key={key} disabled={busy || tab === key} onClick={() => setTab(key)}>{title}</button>)}<button disabled={busy} onClick={load}>Refresh</button></div>
    {error && <p role="alert">{error}</p>}
    {tab !== 'notifications' && <form onSubmit={save} style={{ maxWidth: 720, margin: '20px 0' }}>
      <label>Class / section<select style={input} required value={form.classIndex} onChange={e => change('classIndex', e.target.value)}><option value="">Select class</option>{context.classes.map((c, i) => <option key={c.id} value={i}>{c.name} {c.section}</option>)}</select></label>
      <label>Title<input style={input} required value={form.title} onChange={e => change('title', e.target.value)} /></label>
      {tab === 'diary' ? <label>Diary entry<textarea style={input} required value={form.content} onChange={e => change('content', e.target.value)} /></label> : <>
        <label>Subject<input style={input} required value={form.subject} onChange={e => change('subject', e.target.value)} /></label>
        <label>Duration in minutes<input style={input} type="number" min="1" max="300" required value={form.durationMinutes} onChange={e => change('durationMinutes', e.target.value)} /></label>
        <label>Available from<input style={input} required type="datetime-local" value={form.opensAt} onChange={e => change('opensAt', e.target.value)} /></label>
        <label>Closes at<input style={input} required type="datetime-local" value={form.closesAt} onChange={e => change('closesAt', e.target.value)} /></label>
        <fieldset><legend>Question</legend><input aria-label="Question" style={input} value={question.prompt} onChange={e => setQuestion(q => ({ ...q, prompt: e.target.value }))} />
          {question.options.map((option, i) => <label key={i}>Option {i + 1}<input style={input} value={option} onChange={e => setQuestion(q => ({ ...q, options: q.options.map((o, index) => index === i ? e.target.value : o) }))} /></label>)}
          <label>Correct option<select style={input} value={question.correctIndex} onChange={e => setQuestion(q => ({ ...q, correctIndex: Number(e.target.value) }))}>{question.options.map((_, i) => <option key={i} value={i}>{i + 1}</option>)}</select></label>
          <label>Marks<input style={input} type="number" min="1" value={question.marks} onChange={e => setQuestion(q => ({ ...q, marks: e.target.value }))} /></label>
          <button type="button" onClick={addQuestion}>Add question</button>
        </fieldset>
        <ol>{questions.map((q, i) => <li key={i}>{q.prompt} ({q.marks} marks) <button type="button" onClick={() => setQuestions(items => items.filter((_, index) => i !== index))}>Remove</button></li>)}</ol>
      </>}
      <button disabled={busy} type="submit">{busy ? 'Saving…' : 'Publish'}</button>
    </form>}
    {busy && <p>Loading…</p>}
    {!busy && !rows.length && <p>No records yet.</p>}
    {rows.map(row => <article key={row.id} style={{ padding: 16, margin: '12px 0', border: '1px solid #888', borderRadius: 8 }}>
      <h3>{row.title}</h3><p style={{ whiteSpace: 'pre-wrap' }}>{row.content || row.body || `${row.subject} • ${row.durationMinutes} minutes`}</p>
      <p>{row.className} {row.section} {row.postedAt || row.createdAt || `${row.opensAt} — ${row.closesAt}`}</p>
      {tab === 'diary' && <button disabled={busy} onClick={() => { if (window.confirm('Delete this diary entry?')) action(() => apiRequest(`/mobile/portal/diary/${row.id}`, { method: 'DELETE' })); }}>Delete</button>}
      {tab === 'notifications' && !row.readAt && <button disabled={busy} onClick={() => action(() => apiRequest(`/mobile/portal/notifications/${row.id}/read`, { method: 'POST', body: {} }))}>Mark read</button>}
      {tab === 'onlineExams' && <button disabled={busy} onClick={async () => { try { setResults(await apiRequest(`/mobile/online-exams/${row.id}/results`)); } catch(e) { setError(e.message); } }}>View results</button>}
    </article>)}
    {results && <section><h2>Exam attempts</h2>{!results.length && <p>No attempts yet.</p>}<table><thead><tr><th>Student</th><th>Status</th><th>Score</th></tr></thead><tbody>{results.map(r => <tr key={r.id}><td>{r.studentName || r.studentId}</td><td>{r.submittedAt ? 'Submitted' : 'In progress'}</td><td>{r.submittedAt ? `${r.score} / ${r.maximum}` : '—'}</td></tr>)}</tbody></table></section>}
  </section>;
}
