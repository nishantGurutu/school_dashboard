import React, { useState, useEffect } from 'react';
import { Plus, Trash2, X, RefreshCw, Edit2 } from 'lucide-react';
import { bannerService } from '../../services/bannerService';
import { saveImage, mediaUrl, MAX_MEDIA_BYTES } from '../../services/mediaService';

const photosOf = banner => banner.imageUrl ? [banner.imageUrl] : [];

export const BannersModule = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editor, setEditor] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState('');
  const [viewing, setViewing] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const data = await bannerService.list(); setAlbums(Array.isArray(data) ? data : data?.data || []); }
    catch (err) { setError(err.message || 'Failed to load banner'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => () => { photos.forEach(photo => { if (photo.file) URL.revokeObjectURL(photo.url); }); }, [photos]);

  const open = (album = {}) => {
    setError(''); setSuccess(''); setEditor(album);
    setPhotos(photosOf(album).map(url => ({ url })));
  };
  const select = event => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (files.some(file => !file.type.startsWith('image/') || file.type === 'image/svg+xml' || !file.size || file.size > MAX_MEDIA_BYTES)) {
      setError('Select valid images up to 8 MB each.'); return;
    }
    setError('');
    // Recreate previews so effect cleanup can safely release the previous selection.
    setPhotos(previous => [...(editor.id ? [] : previous).map(photo => photo.file ? { ...photo, url: URL.createObjectURL(photo.file) } : photo),
      ...files.map(file => ({ file, url: URL.createObjectURL(file) }))]);
  };
  const removePhoto = index => setPhotos(previous => previous.filter((_, i) => i !== index).map(photo => photo.file ? { ...photo, url: URL.createObjectURL(photo.file) } : photo));
  const save = async event => {
    event.preventDefault();
    if (!photos.length || saving) return;
    setSaving(true); setError('');
    try {
      const images = [];
      for (const photo of photos) {
        setProgress(`Saving photo ${images.length + 1} of ${photos.length}...`);
        const url = photo.file ? (await saveImage(photo.file)).fileUrl : photo.url;
        const parsed = new URL(url, window.location.origin);
        images.push(parsed.pathname.startsWith('/api/files/media/') ? parsed.pathname : url);
      }
      if (editor.id) {
        await bannerService.update(editor.id, { ...editor, imageUrl: images[0] });

      } else {
        await bannerService.createMany(images);
      }
      setEditor(null); setPhotos([]); setSuccess('Photos saved successfully.'); await load();
    } catch (err) { setError(err.message || 'Failed to save photos. Please retry.'); }
    finally { setSaving(false); setProgress(''); }
  };
  const remove = async album => {
    if (!window.confirm('Delete these banner photos?')) return;
    try { await bannerService.delete(album.id); setAlbums(previous => previous.filter(item => item.id !== album.id)); }
    catch (err) { setError(err.message || 'Failed to delete photos'); }
  };
  const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 };
  const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 };
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <div className="card" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
      <div><h2>Promotional Banners</h2><p>Select and save banner images for the dashboard and mobile app.</p></div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn-secondary" onClick={load} disabled={loading}><RefreshCw size={16} /> Refresh</button>
        <button className="btn btn-primary" onClick={() => open()}><Plus size={18} /> Add Banners</button>
      </div>
    </div>
    {success && <div role="status">{success}</div>}
    {error && !editor && <div role="alert" style={{ color: '#dc2626' }}>{error}</div>}
    {loading && <p>Loading banner...</p>}
    {!loading && !albums.length && <div className="card">No photos yet. Select Add Banners to upload images.</div>}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
    {albums.map(album => <section className="card" key={album.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span>Banner</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => open(album)}><Edit2 size={16} /> Edit Banner</button>
          <button className="btn btn-secondary" aria-label="Delete photos" onClick={() => remove(album)}><Trash2 size={16} /></button>
        </div>
      </div>
      <div style={grid}>{photosOf(album).map((url, index) => <button key={`${url}-${index}`} aria-label={`View photo ${index + 1}`} onClick={() => setViewing(url)} style={{ padding: 0, border: 0, cursor: 'pointer', background: 'transparent' }}>
        <img src={mediaUrl(url)} alt={`Banner photo ${index + 1}`} loading="lazy" style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 10 }} />
      </button>)}</div>
    </section>)}
    </div>
    {editor && <div style={overlay}><div className="card" role="dialog" aria-modal="true" aria-label="Save Banner Photos" style={{ width: '100%', maxWidth: 650, maxHeight: '90vh', overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}><h3>{editor.id ? 'Edit Banner Photos' : 'Add Promotional Banners'}</h3><button className="btn btn-secondary" disabled={saving} aria-label="Close" onClick={() => setEditor(null)}><X size={18} /></button></div>
      <form onSubmit={save}>
        <label htmlFor="banner-photos">{editor.id ? 'Select banner image' : 'Select multiple banner images'}</label>
        <input id="banner-photos" type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={!editor.id} disabled={saving} onChange={select} style={{ display: 'block', margin: '12px 0' }} />
        <p>{photos.length} photos selected · Up to 8 MB per image</p>
        {error && <p role="alert" style={{ color: '#dc2626' }}>{error}</p>}
        <div style={{ ...grid, marginTop: 16 }}>{photos.map((photo, index) => <div key={index} style={{ position: 'relative' }}>
          <img src={mediaUrl(photo.url)} alt={`Selected photo ${index + 1}`} style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 8 }} />
          <button type="button" className="btn btn-secondary" disabled={saving} aria-label={`Remove photo ${index + 1}`} onClick={() => removePhoto(index)} style={{ position: 'absolute', right: 4, top: 4, padding: 4 }}><X size={16} /></button>
        </div>)}</div>
        {saving && <p role="status">{progress}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
          <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setEditor(null)}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving || !photos.length}>{saving ? 'Saving...' : 'Save Banners'}</button>
        </div>
      </form>
    </div></div>}
    {viewing && <div style={overlay} onClick={() => setViewing(null)} role="dialog" aria-modal="true" aria-label="Banner photo">
      <button className="btn btn-secondary" aria-label="Close photo" style={{ position: 'absolute', top: 20, right: 20 }} onClick={() => setViewing(null)}><X /></button>
      <img src={mediaUrl(viewing)} alt="Banner photo" style={{ maxWidth: '95%', maxHeight: '90vh', objectFit: 'contain' }} />
    </div>}
  </div>;
};
export default BannersModule;
