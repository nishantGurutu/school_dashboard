import React, { useEffect, useRef, useState } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { saveImage, mediaUrl } from '../../services/mediaService';

export function MediaPreview({ value, kind = 'photo', label = 'Saved image', size = 64 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [value]);
  const url = mediaUrl(value);
  if (!url) return null;
  return <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${label}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, maxWidth: '100%' }}>
    {!failed ? <img src={url} alt={label} loading="lazy" onError={() => setFailed(true)} style={{ width: size, height: size, objectFit: 'cover', borderRadius: 8 }} />
      : kind === 'document' ? <FileText size={24} /> : null}
    {kind === 'document' && <span>Open document</span>}
  </a>;
}

export function MediaUpload({ placeholder = 'Choose an image (optional)', onFileSelect, preview, kind = 'photo', disabled = false }) {
  const input = useRef(null), sequence = useRef(0);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [local, setLocal] = useState(null), [pendingFile, setPendingFile] = useState(null);
  useEffect(() => () => { sequence.current++; }, []);
  useEffect(() => { if (local) return () => URL.revokeObjectURL(local); }, [local]);
  async function upload(file) {
    if (!file || busy || disabled) return;
    const request = ++sequence.current;
    setPendingFile(file); setBusy(true); setError('');
    setLocal(file.type.startsWith('image/') ? URL.createObjectURL(file) : null);
    try {
      const result = await saveImage(file, { kind });
      if (request !== sequence.current) return;
      onFileSelect?.(result.fileUrl, result);
      setPendingFile(null); setLocal(null);
    } catch (e) { if (request === sequence.current) setError(e.message || 'Upload failed. Please retry.'); }
    finally { if (request === sequence.current) setBusy(false); }
  }
  function clear() {
    sequence.current++; setBusy(false); setError(''); setLocal(null); setPendingFile(null);
    onFileSelect?.(null); if (input.current) input.current.value = '';
  }
  return <div tabIndex={-1} data-media-pending={busy} data-media-error={!!error}
    onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files?.[0]); }}
    style={{ border: '2px dashed var(--border-color)', borderRadius: 12, padding: 12, minWidth: 0 }}>
    <input ref={input} type="file" aria-label={placeholder} accept={kind === 'document' ? 'image/jpeg,image/png,image/webp,application/pdf,.doc,.docx' : 'image/jpeg,image/png,image/webp'}
      disabled={busy || disabled} onChange={e => { upload(e.target.files?.[0]); e.target.value = ''; }} style={{ display: 'none' }} />
    {(local || preview) && <div style={{ marginBottom: 8 }}><MediaPreview value={local || preview} kind={kind} label={placeholder} /></div>}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
      <button type="button" className="btn btn-secondary" disabled={busy || disabled} onClick={() => input.current?.click()}><Upload size={16} />{busy ? 'Compressing & saving…' : placeholder}</button>
      {(preview || local || error) && <button type="button" className="btn-icon" aria-label="Remove selected file" disabled={busy || disabled} onClick={clear}><X size={16} /></button>}
    </div>
    {error && <div role="alert" style={{ color: '#dc2626', marginTop: 8 }}>{error} {pendingFile && <button type="button" className="btn btn-secondary" onClick={() => upload(pendingFile)}>Retry upload</button>}</div>}
    <small style={{ display: 'block', marginTop: 8, color: 'var(--text-muted)' }}>Optional · up to 8 MB · images are compressed automatically{kind === 'document' ? '; PDF / Word files retain their original content' : ''}.</small>
  </div>;
}
