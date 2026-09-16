import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import { dashboardService } from '../../services/dashboardService';

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return `$${num.toLocaleString()}`;
};

export const AccountsModule = () => {
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpenses: 0, netBalance: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await dashboardService.accounts();
      setSummary({
        totalIncome: Number(data.totalIncome) || 0,
        totalExpenses: Number(data.totalExpenses) || 0,
        netBalance: Number(data.netBalance) || 0
      });
    } catch (e) {
      setError(e.message || 'Failed to load accounts summary');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Accounts & Financial Ledger</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track school operational income, vendor expenses, faculty payroll, and balance sheets</p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: '#ef4444',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          {error}
        </div>
      )}

      {isLoading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading accounts summary...
        </div>
      )}

      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Income (This Term)</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>{formatCurrency(summary.totalIncome)}</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses (This Term)</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>{formatCurrency(summary.totalExpenses)}</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Surplus Balance</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>{formatCurrency(summary.netBalance)}</span>
        </div>
      </div>
    </div>
  );
};
