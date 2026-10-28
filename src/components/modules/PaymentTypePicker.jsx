import React, { useRef, useState } from 'react';
import { feeService } from '../../services/feeService';
import { authStorage } from '../../services/networkService';
import { roleFor } from '../../config/roleAccess';

export const PaymentTypePicker = ({ value, onChange, methods, onCreated, disabled, inputStyle }) => {
  const canAdd = ['ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(roleFor(authStorage.getUser()));
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const pending = useRef(false);
  const save = async () => {
    if (pending.current || disabled || !canAdd) return;
    const cleanName = name.trim().replace(/\s+/g, ' ');
    if (!cleanName || cleanName.length > 32) { setError('Enter a payment type name (1–32 characters).'); return; }
    if (methods.some(method => method.name.toLowerCase() === cleanName.toLowerCase())) {
      setError('This payment type already exists. Select it from the dropdown.'); return;
    }
    pending.current = true; setSaving(true); setError('');
    try {
      const created = await feeService.createPaymentType({ name: cleanName });
      if (!created?.id || !created.active || !created.name) throw new Error('Payment type could not be confirmed. Please reopen the form.');
      onCreated(created); onChange(created.name); setAdding(false); setName('');
    } catch (err) { setError(err.message || 'Could not add payment type.'); }
    finally { pending.current = false; setSaving(false); }
  };
  return <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
      <label htmlFor="collect-payment" style={{ fontSize: '0.85rem', fontWeight: 700 }}>Payment Type</label>
      {canAdd && !adding && <button type="button" className="btn btn-secondary" disabled={disabled} onClick={() => { setAdding(true); setError(''); }}>+ Add Payment Type</button>}
    </div>
    <select id="collect-payment" required disabled={disabled || saving} value={value} onChange={e => onChange(e.target.value)} style={inputStyle}>
      <option value="">Select a payment type</option>
      {methods.map(method => <option key={method.id} value={method.name}>{method.name}</option>)}
    </select>
    {adding && <div role="group" aria-label="Add payment type" style={{ display: 'grid', gap: 8, marginTop: 12 }}>
      <label htmlFor="new-payment-type">Payment Type Name</label>
      <input id="new-payment-type" autoFocus maxLength={32} placeholder="e.g. Demand Draft" value={name} disabled={saving}
        onChange={e => { setName(e.target.value); setError(''); }} style={inputStyle}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); save(); } }} />
      {error && <p role="alert" style={{ color: '#ef4444' }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn btn-primary" disabled={saving || disabled} onClick={save}>{saving ? 'Adding...' : 'Add Payment Type'}</button>
        <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => { setAdding(false); setName(''); setError(''); }}>Cancel</button>
      </div>
    </div>}
  </div>;
};
