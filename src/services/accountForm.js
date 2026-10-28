export function accountTab(key) {
  const tab=String(key || '').replace(/^accounts-/, '');
  return ['income-head','income-list','expense-head','expense-list','transaction'].includes(tab)?tab:'transaction';
}
export function accountRows(rows) {
  return rows.map(row=>({...row,name:row.name || row.description || row.category || 'Transaction',
    head:row.category || '',rawAmount:row.amount,amount:`$${Number(row.amount || 0).toLocaleString()}`,
    date:row.transactionDate || '',invoice:`ACC-${row.id}`,paymentType:row.paymentType || '—',description:row.description || ''}));
}
export function accountPayload(form,type) {
  const amount=Number(form.amount);
  if(!form.name?.trim() || !form.head || form.head.startsWith('Select') || !form.paymentType || form.paymentType.startsWith('Select') || !form.date)
    throw new Error('Enter a name, select a head, payment type and date.');
  if(!Number.isFinite(amount) || amount<=0)throw new Error('Amount must be greater than zero.');
  return {transactionType:type,name:form.name.trim(),category:form.head,paymentType:form.paymentType,amount,description:form.description,transactionDate:form.date};
}
