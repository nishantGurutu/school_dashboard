export const activeOptions = rows => rows.filter(row => !row.status || row.status.trim().toLowerCase() === 'active');
export const classOptions = rows => [...new Set(activeOptions(rows).map(row => row.name).filter(Boolean))];
export const applicableDiscounts = (rows, feeType) => activeOptions(rows).filter(row =>
  !row.feesType || row.feesType.toLowerCase() === 'all' || row.feesType.split(',').some(name => name.trim().toLowerCase() === feeType.toLowerCase()));
export function collectionPayload(form, editingItem) {
  if (!form.className || !form.section || !form.feeTypeId || !form.paymentType || !form.rollNo.trim() || !form.date)
    throw new Error('Select class, section, fee type, payment type, date and enter a roll number.');
  if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) throw new Error('Enter an amount greater than zero.');
  return {
    name: editingItem?.name, admissionNo: editingItem?.admissionNo,
    className: form.className, section: form.section, rollNo: form.rollNo.trim(),
    feeTypeId: Number(form.feeTypeId), discountId: form.discountId ? Number(form.discountId) : null,
    paymentType: form.paymentType, amount: String(form.amount), date: form.date, note: form.note
  };
}

export function discountPayload(form) {
  const name = (form.name || '').trim();
  const discountType = form.discountType;
  const raw = String(form.discountValue ?? '').trim().replace(/%$/, '').trim();
  const value = Number(raw);
  if (!name) throw new Error('Enter a discount name.');
  if (!['Percentage', 'Fixed Amount'].includes(discountType)) throw new Error('Select a discount type.');
  if (!raw || !Number.isFinite(value) || value < 0 || (discountType === 'Percentage' && value > 100))
    throw new Error('Enter a valid discount value (percentage must be between 0 and 100).');
  return { name, feesType: form.feesType || 'All', discountType, discountValue: raw,
    status: form.status === 'Inactive' ? 'Inactive' : 'Active' };
}
export function discountValueLabel(row) {
  if (row.discountValue == null || row.discountValue === '') return '—';
  const value = String(row.discountValue).replace(/%$/, '').trim();
  return row.discountType === 'Percentage' ? `${value}%` : value;
}
