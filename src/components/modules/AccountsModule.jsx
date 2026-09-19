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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      {/* Top Header Card */}
      <div
        className="card animate-fade-in"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>{headerInfo.title}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{headerInfo.breadcrumb}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Sub-Nav Tabs for Accounts Module */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-app)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleSubTabChange('income-head')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'income-head' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'income-head' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'income-head' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Income Head
            </button>
            <button
              onClick={() => handleSubTabChange('income-list')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'income-list' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'income-list' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'income-list' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Income List
            </button>
            <button
              onClick={() => handleSubTabChange('expense-head')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'expense-head' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'expense-head' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'expense-head' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Expense Head
            </button>
            <button
              onClick={() => handleSubTabChange('expense-list')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'expense-list' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'expense-list' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'expense-list' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Expense List
            </button>
            <button
              onClick={() => handleSubTabChange('transaction')}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                backgroundColor: currentSubTab === 'transaction' ? '#0d9488' : 'transparent',
                color: currentSubTab === 'transaction' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: currentSubTab === 'transaction' ? 700 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Transaction
            </button>
          </div>

          {headerInfo.addBtnLabel && (
            <button
              className="btn btn-primary"
              onClick={headerInfo.onAdd}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={18} /> {headerInfo.addBtnLabel}
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards for Transaction Tab */}
      {currentSubTab === 'transaction' && (
        <div className="grid-responsive">
          <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Income</div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>$840,500</span>
            </div>
          </div>
          <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowDownRight size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Expenses</div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444' }}>$512,300</span>
            </div>
          </div>
          <div className="col-span-4 card animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Net Surplus Balance</div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb' }}>$328,200</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
        {/* Controls Toolbar Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} /> Export <ChevronDown size={14} />
            </button>

            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 14px 8px 36px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Data Table View */}
        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 16px', width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      currentSubTab === 'income-head' ? selectedRows.length === incomeHeadList.length :
                        currentSubTab === 'income-list' ? selectedRows.length === incomeList.length :
                          currentSubTab === 'expense-head' ? selectedRows.length === expenseHeadList.length :
                            selectedRows.length === expenseList.length
                    }
                    onChange={() =>
                      toggleSelectAll(
                        currentSubTab === 'income-head' ? incomeHeadList :
                          currentSubTab === 'income-list' ? incomeList :
                            currentSubTab === 'expense-head' ? expenseHeadList :
                              expenseList
                      )
                    }
                    style={{ cursor: 'pointer' }}
                  />
                </th>

                <th style={{ padding: '12px 16px', fontWeight: 600 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    S.L <span>▲</span>
                  </div>
                </th>

                {/* 1. Income Head Table Columns (Screenshot 1) */}
                {currentSubTab === 'income-head' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fees Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                {/* 2. Income List Table Columns (Screenshot 3) */}
                {currentSubTab === 'income-list' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Invoice</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Income Head</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                  </>
                )}

                {/* 3. Expense Head Table Columns (Screenshot 5) */}
                {currentSubTab === 'expense-head' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fees Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                  </>
                )}

                {/* 4. Expense List Table Columns */}
                {currentSubTab === 'expense-list' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Invoice</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Description</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Expense Head</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                  </>
                )}

                {/* 5. Transaction Table Columns */}
                {currentSubTab === 'transaction' && (
                  <>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Name</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Head</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Payment Type</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                    <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                  </>
                )}

                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* 1. Income Head Rows (Screenshot 1) */}
              {currentSubTab === 'income-head' &&
                incomeHeadList
                  .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.feesType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditIncomeHead(row)}
                          onDelete={() => handleDeleteIncomeHead(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 2. Income List Rows (Screenshot 3) */}
              {currentSubTab === 'income-list' &&
                incomeList
                  .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.head.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{row.invoice}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.description}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.head}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.paymentType}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{row.amount}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditIncome(row)}
                          onDelete={() => handleDeleteIncome(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 3. Expense Head Rows (Screenshot 5) */}
              {currentSubTab === 'expense-head' &&
                expenseHeadList
                  .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.feesType}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={row.status} />
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditExpenseHead(row)}
                          onDelete={() => handleDeleteExpenseHead(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 4. Expense List Rows */}
              {currentSubTab === 'expense-list' &&
                expenseList
                  .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.head.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((row) => (
                    <tr key={row.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleSelectRow(row.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.sl}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-secondary)' }}>{row.invoice}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{row.name}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.description}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{row.head}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.paymentType}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ef4444' }}>{row.amount}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{row.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center', position: 'relative' }}>
                        <ActionDropdownCell
                          isOpen={activeDropdownId === row.id}
                          onToggle={() => setActiveDropdownId(activeDropdownId === row.id ? null : row.id)}
                          onEdit={() => handleOpenEditExpense(row)}
                          onDelete={() => handleDeleteExpense(row.id)}
                        />
                      </td>
                    </tr>
                  ))}

              {/* 5. Transaction Combined Rows */}
              {currentSubTab === 'transaction' && (
                <>
                  {incomeList.map((inc) => (
                    <tr key={`inc-${inc.id}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{inc.sl}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#15803d' }}>Income</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{inc.name}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{inc.head}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{inc.paymentType}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>{inc.amount}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{inc.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button className="btn-icon" style={{ width: '32px', height: '32px' }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                  {expenseList.map((exp) => (
                    <tr key={`exp-${exp.id}`} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '14px 16px' }}>
                        <input type="checkbox" style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 500, color: 'var(--text-secondary)' }}>{exp.sl}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fee2e2', color: '#b91c1c' }}>Expense</span>
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{exp.name}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600 }}>{exp.head}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{exp.paymentType}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#ef4444' }}>{exp.amount}</td>
                      <td style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>{exp.date}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button className="btn-icon" style={{ width: '32px', height: '32px' }}><MoreVertical size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1. Add / Edit Income Head Drawer Modal (Screenshot 2) */}
      {isIncomeHeadModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justify: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsIncomeHeadModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingIncomeHead ? 'Edit Income Head' : 'Add Income Head'}
              </h3>
              <button
                onClick={() => setIsIncomeHeadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveIncomeHead} id="income-head-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Head Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Head Name"
                  value={incomeHeadForm.name}
                  onChange={(e) => setIncomeHeadForm({ ...incomeHeadForm, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  rows={4}
                  value={incomeHeadForm.description}
                  onChange={(e) => setIncomeHeadForm({ ...incomeHeadForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Status
                </label>
                <select
                  value={incomeHeadForm.status}
                  onChange={(e) => setIncomeHeadForm({ ...incomeHeadForm, status: e.target.value })}
                  style={inputStyle}
                >
                  <option value="Select Status">Select Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </form>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justify: 'center',
                gap: '16px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsIncomeHeadModalOpen(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 32px',
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="income-head-form"
                className="btn btn-primary"
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add / Edit Income Drawer Modal (Screenshot 4) */}
      {isIncomeModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justify: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsIncomeModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '520px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingIncome ? 'Edit Income' : 'Add Income'}
              </h3>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveIncome} id="income-list-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Income Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Income Name"
                  value={incomeForm.name}
                  onChange={(e) => setIncomeForm({ ...incomeForm, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Income Head
                  </label>
                  <select
                    value={incomeForm.head}
                    onChange={(e) => setIncomeForm({ ...incomeForm, head: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select a income head">Select a income head</option>
                    {incomeHeadList.map((head) => (
                      <option key={head.id} value={head.name}>{head.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Amount"
                    value={incomeForm.amount}
                    onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={incomeForm.date}
                    onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Payment Type
                  </label>
                  <select
                    value={incomeForm.paymentType}
                    onChange={(e) => setIncomeForm({ ...incomeForm, paymentType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Payment Type">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  rows={4}
                  value={incomeForm.description}
                  onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </form>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justify: 'center',
                gap: '16px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsIncomeModalOpen(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 32px',
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="income-list-form"
                className="btn btn-primary"
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Add / Edit Expense Head Drawer Modal (Includes Head Name, Description, Status, and Section field) */}
      {isExpenseHeadModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justify: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsExpenseHeadModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '500px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingExpenseHead ? 'Edit Expense Head' : 'Add Expense Head'}
              </h3>
              <button
                onClick={() => setIsExpenseHeadModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseHead} id="expense-head-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Head Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Head Name"
                  value={expenseHeadForm.name}
                  onChange={(e) => setExpenseHeadForm({ ...expenseHeadForm, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  rows={4}
                  value={expenseHeadForm.description}
                  onChange={(e) => setExpenseHeadForm({ ...expenseHeadForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={expenseHeadForm.status}
                    onChange={(e) => setExpenseHeadForm({ ...expenseHeadForm, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Status">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Section
                  </label>
                  <select
                    value={expenseHeadForm.section}
                    onChange={(e) => setExpenseHeadForm({ ...expenseHeadForm, section: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Section">Select Section</option>
                    <option value="General">General</option>
                    <option value="Administrative">Administrative</option>
                    <option value="Academic">Academic</option>
                    <option value="Events">Events</option>
                    <option value="Infrastructure">Infrastructure</option>
                  </select>
                </div>
              </div>
            </form>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justify: 'center',
                gap: '16px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsExpenseHeadModalOpen(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 32px',
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="expense-head-form"
                className="btn btn-primary"
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Add / Edit Expense Drawer Modal */}
      {isExpenseModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            justify: 'flex-end',
            animation: 'fadeIn 0.2s ease'
          }}
          onClick={() => setIsExpenseModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '520px',
              maxWidth: '90vw',
              height: '100vh',
              backgroundColor: 'var(--bg-card)',
              boxShadow: '-8px 0 24px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              zIndex: 1001,
              animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {editingExpense ? 'Edit Expense' : 'Add Expense'}
              </h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} id="expense-list-form" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, overflowY: 'auto' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Expense Name
                </label>
                <input
                  type="text"
                  placeholder="Enter Expense Name"
                  value={expenseForm.name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Expense Head
                  </label>
                  <select
                    value={expenseForm.head}
                    onChange={(e) => setExpenseForm({ ...expenseForm, head: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select a expense head">Select a expense head</option>
                    {expenseHeadList.map((head) => (
                      <option key={head.id} value={head.name}>{head.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Amount
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Amount"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Date
                  </label>
                  <input
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                    Payment Type
                  </label>
                  <select
                    value={expenseForm.paymentType}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentType: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="Select Payment Type">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter Description"
                  rows={4}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>
            </form>

            <div
              style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-light)',
                display: 'flex',
                justify: 'center',
                gap: '16px'
              }}
            >
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="btn btn-secondary"
                style={{
                  padding: '10px 32px',
                  color: '#ef4444',
                  borderColor: '#ef4444',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                form="expense-list-form"
                className="btn btn-primary"
                style={{
                  padding: '10px 36px',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Status Badge Component matching screenshots (Active: soft green, Inactive: soft pink/red)
const StatusBadge = ({ status }) => {
  const isActive = status === 'Active';
  return (
    <span
      style={{
        padding: '4px 12px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.75rem',
        fontWeight: 700,
        backgroundColor: isActive ? '#dcfce7' : '#fee2e2',
        color: isActive ? '#15803d' : '#dc2626',
        display: 'inline-block'
      }}
    >
      {status}
    </span>
  );
};

// Action Dropdown Cell Component
const ActionDropdownCell = ({ isOpen, onToggle, onEdit, onDelete }) => {
  return (
    <div style={{ display: 'inline-flex', position: 'relative' }}>
      <button className="btn-icon" onClick={onToggle} style={{ width: '32px', height: '32px' }}>
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: '36px',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--border-color)',
            zIndex: 100,
            minWidth: '130px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <button
            onClick={onEdit}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left'
            }}
          >
            <Edit size={14} color="#2563eb" /> Edit
          </button>
          <button
            onClick={onDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 600,
              textAlign: 'left',
              borderTop: '1px solid var(--border-light)'
            }}
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
