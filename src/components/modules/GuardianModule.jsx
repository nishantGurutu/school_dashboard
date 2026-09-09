import React, { useState } from 'react';
import { UserCheck, Plus, Search, Phone, Mail, MapPin, Edit, Trash2 } from 'lucide-react';
import { GuardianForm } from './GuardianForm';

export const GuardianModule = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuardian, setEditingGuardian] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleEditClick = (guardian) => {
    setEditingGuardian(guardian);
  };

  const handleSaveGuardian = (formData) => {
    if (editingGuardian) {
      setGuardians((prev) =>
        prev.map((g) =>
          g.id === editingGuardian.id
            ? {
                ...g,
                name: formData.guardianName || g.name,
                relation: formData.guardianType || g.relation,
                occupation: formData.occupation || g.occupation,
                phone: formData.instagram || g.phone,
                email: formData.email || g.email,
                address: formData.guardianAddress || g.address
              }
            : g
        )
      );
      setEditingGuardian(null);
    } else {
      const newGuardianObj = {
        id: `GRD-90${guardians.length + 1}`,
        name: formData.guardianName || 'New Guardian',
        relation: formData.guardianType || 'Father',
        studentName: 'Unassigned Ward',
        occupation: formData.occupation || 'General Employment',
        phone: formData.instagram || '+1 555-0000',
        email: formData.email || 'guardian@auroraschool.edu',
        address: formData.guardianAddress || 'Springfield, USA',
        feeStatus: 'Clear'
      };

      setGuardians([newGuardianObj, ...guardians]);
      setShowAddForm(false);
    }
  };

  const handleDeleteGuardian = (id) => {
    setGuardians((prev) => prev.filter((g) => g.id !== id));
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
                        onClick={() => handleDeleteGuardian(g.id)}
                        style={{ width: '32px', height: '32px', color: '#ef4444' }}
                        title="Delete Guardian"
                      >
                        <Trash2 size={16} />
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
