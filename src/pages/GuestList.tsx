import React, { useEffect, useState } from 'react';
import { guestService, Guest } from '../services/api';
import Modal from '../components/Modal';

const GuestList: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Partial<Guest>>({});
  const [loading, setLoading] = useState(false);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await guestService.getAll();
      setGuests(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGuest.name || !currentGuest.email) return;

    try {
      if (currentGuest._id) {
        await guestService.update(currentGuest._id, currentGuest);
      } else {
        await guestService.create(currentGuest as Guest);
      }
      setIsModalOpen(false);
      fetchGuests();
    } catch (error) {
      console.error(error);
      alert('Error saving guest');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this guest?')) return;
    try {
      await guestService.delete(id);
      fetchGuests();
    } catch (error) {
      console.error(error);
    }
  };

  const openEdit = (guest: Guest) => {
    setCurrentGuest(guest);
    setIsModalOpen(true);
  };

  const openNew = () => {
    setCurrentGuest({});
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Guests</h2>
        <button className="btn btn-primary" onClick={openNew}>
          + Add Guest
        </button>
      </div>

      <div className="card table-container">
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map(guest => (
                <tr key={guest._id}>
                  <td style={{ fontWeight: 500 }}>{guest.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{guest.email}</td>
                  <td>{guest.phone || '-'}</td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {guest.createdAt ? new Date(guest.createdAt).toLocaleDateString() : '-'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openEdit(guest)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(guest._id!)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {guests.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                    No guests found. Add one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={currentGuest._id ? 'Edit Guest' : 'New Guest'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name</label>
            <input 
              value={currentGuest.name || ''} 
              onChange={e => setCurrentGuest({...currentGuest, name: e.target.value})} 
              placeholder="John Doe" 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email</label>
            <input 
              type="email"
              value={currentGuest.email || ''} 
              onChange={e => setCurrentGuest({...currentGuest, email: e.target.value})} 
              placeholder="john@example.com" 
              required 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone</label>
            <input 
              value={currentGuest.phone || ''} 
              onChange={e => setCurrentGuest({...currentGuest, phone: e.target.value})} 
              placeholder="+1 234 567 890" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Address</label>
            <textarea 
              value={currentGuest.address || ''} 
              onChange={e => setCurrentGuest({...currentGuest, address: e.target.value})} 
              placeholder="123 Main St"
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GuestList;
