import React from 'react';
import { DollarSign, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

export const AccountsModule = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="card animate-fade-in" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Accounts & Financial Ledger</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track school operational income, vendor expenses, faculty payroll, and balance sheets</p>
        </div>
      </div>

      <div className="grid-responsive">
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Income (This Term)</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981' }}>$840,500</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses (This Term)</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ef4444' }}>$512,300</span>
        </div>
        <div className="col-span-4 card animate-fade-in">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Surplus Balance</div>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>$328,200</span>
        </div>
      </div>
    </div>
  );
};
