import React, { useEffect, useState } from 'react';
import { accountService } from '../../services/accountService';
import { useTheme } from '../../context/ThemeContext';

export const AccountantDashboard = () => {
  const { setActiveTab } = useTheme();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    accountService.getSummary().then(data => { if (active) setSummary(data); })
      .catch(err => { if (active) setError(err.message || 'Could not load account summary.'); });
    return () => { active = false; };
  }, []);
  return <section style={{ display: 'grid', gap: 24 }}>
    <div className="card"><h2>Accountant Dashboard</h2><p>Manage school fees and accounts.</p></div>
    {error && <p role="alert">{error}</p>}
    {!summary && !error && <p role="status">Loading account summary...</p>}
    {summary && <div className="grid-responsive">
      {[['Total Income', 'totalIncome'], ['Total Expenses', 'totalExpenses'], ['Net Balance', 'netBalance']].map(([label, key]) =>
        <div className="card col-span-4" key={key}><h3>{label}</h3><p>{Number(summary[key] || 0).toLocaleString('en-IN')}</p></div>)}
    </div>}
    <div style={{ display: 'flex', gap: 12 }}>
      <button className="btn btn-primary" onClick={() => setActiveTab('fees')}>Fees Collection</button>
      <button className="btn btn-secondary" onClick={() => setActiveTab('accounts')}>Accounts</button>
    </div>
  </section>;
};
