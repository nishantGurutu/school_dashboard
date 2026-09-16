import React, { useState, useEffect, useCallback } from 'react';
import { UserCheck, Plus, Search, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { GuardianForm } from './GuardianForm';
import { guardianService } from '../../services/guardianService';
import { useApiAction } from '../../hooks/useApiAction';
import { Spinner } from '../ui/Spinner';

export const GuardianModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { busyKey, runAction } = useApiAction();

  const [guardians, setGuardians] = useState([
    {
      id: 'GRD-901',
      name: 'Robert Wright',
      relation: 'Father',
      studentName: 'Alexander Wright (Grade 10-A)',
      occupation: 'Senior Software Engineer',
      phone: '+1 555-0192',
      email: 'r.wright@gmail.com',
      address: '742 Evergreen Terrace, Springfield',
      feeStatus: 'Clear'
    },
    {
      id: 'GRD-902',
      name: 'Maria Martinez',
      relation: 'Mother',
      studentName: 'Sophia Martinez (Grade 8-B)',
      occupation: 'Architect & Interior Designer',
      phone: '+1 555-0184',
      email: 'm.martinez@architects.com',
      address: '1048 Ocean Drive, Miami',
      feeStatus: 'Clear'
    },
    {
      id: 'GRD-903',
      name: 'John Watson',
      relation: 'Father',
      studentName: 'Emma Watson (Grade 6-A)',
      occupation: 'Medical Doctor',
      phone: '+1 555-0112',
      email: 'dr.watson@hospital.org',
      address: '221B Baker Street, London',
      feeStatus: 'Clear'
    }
  ]);

  const fetchGuardians = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      let result;
      if (searchTerm.trim()) {
        result = await guardianService.search(searchTerm.trim());
      } else {
        result = await guardianService.list('page=0&size=200');
      }
      const items = Array.isArray(result) ? result : result && result.content ? result.content : [];
      if (items.length) {
        setGuardians(items.map((g) => ({ ...g, relation: g.relation ? String(g.relation).toLowerCase() : '' })));
      }
    } catch (e) {
      setError(e.message || 'Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchGuardians();
  }, [fetchGuardians]);

  const handleEditClick = (guardian) => {
    setEditingGuardian(guardian);
  };

  const handleSaveGuardian = async (formData) => {
    if (editingGuardian) {
      try {
        const updated = await guardianService.update(editingGuardian.id, formData);
        setGuardians((prev) =>
          prev.map((g) => (g.id === editingGuardian.id ? { ...g, ...updated } : g))
        );
        setEditingGuardian(null);
      } catch (e) {
        setError(e.message || 'Failed to update guardian');
      }
    } else {
      try {
        const created = await guardianService.create(formData);
        setGuardians((prev) => [{ ...created }, ...prev]);
        setShowAddForm(false);
      } catch (e) {
        setError(e.message || 'Failed to create guardian');
      }
    }
  };

  const handleDeleteGuardian = async (id) => {
    try {
      await guardianService.remove(id);
      setGuardians((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      setError(e.message || 'Failed to delete guardian');
    }
  };

  if (showAddForm || editingGuardian) {
    return (
      <GuardianForm
        isEditMode={Boolean(editingGuardian)}
        initialData={editingGuardian}
        onBack={() => {
          setShowAddForm(false);
          setEditingGuardian(null);
        }}
        onSaveGuardian={handleSaveGuardian}
      />
    );
  }

  const filteredGuardians = guardians.filter(
    (g) =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.relation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Bar */}
      <div
        className="card animate-fade-in"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Parent & Guardian Records</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Manage guardian contact details, ward connections, and emergency contacts
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddForm(true)} style={{ padding: '10px 18px' }}>
          <Plus size={18} /> Add New Guardian
        </button>
      </div>

      {/* Search Bar */}
      <div className="card animate-fade-in" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by guardian name, relation, or student ward..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px 10px 40px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Guardians Table */}
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

      {isLoading && !guardians.length && (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          Loading guardians...
        </div>
      )}

      <div className="card animate-fade-in" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Guardian Name</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Relation & Student Ward</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Occupation</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Contact Info</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Address</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Fee Status</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuardians.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 700 }}>{g.name}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600 }}>{g.studentName}</div>
                    <span className="badge badge-info" style={{ marginTop: '4px' }}>{g.relation}</span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>{g.occupation}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> {g.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {g.email}</div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={14} /> {g.address}</div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="badge badge-success">{g.feeStatus}</span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button
                        className="btn-icon"
                        onClick={() => handleEditClick(g)}
                        style={{ width: '32px', height: '32px' }}
                        title="Edit Guardian"
                      >
                        <Edit size={16} color="var(--accent-primary)" />
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => runAction(`delete-${g.id}`, () => handleDeleteGuardian(g.id))}
                        disabled={busyKey === `delete-${g.id}`}
                        style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        title="Delete Guardian"
                      >
                        {busyKey === `delete-${g.id}` ? <Spinner size={16} color="#ef4444" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
