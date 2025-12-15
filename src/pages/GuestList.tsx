import React, { useEffect, useState } from 'react';
import { guestService, type Guest } from '../services/api';
import { wsService } from '../services/websocket';
import Modal from '../components/Modal';

const GuestList: React.FC = () => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentGuest, setCurrentGuest] = useState<Partial<Guest>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await guestService.getAll();
      console.log('Fetched guests:', data);
      setGuests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch guests';
      setError(errorMessage);
      console.error('Error fetching guests:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();

    // Set up WebSocket listeners for real-time updates
    const handleGuestCreated = (guest: Guest) => {
      setGuests(prev => {
        // Check if guest already exists (avoid duplicates)
        if (prev.find(g => g._id === guest._id)) {
          return prev;
        }
        return [...prev, guest];
      });
    };

    const handleGuestUpdated = (updatedGuest: Guest) => {
      setGuests(prev =>
        prev.map(g => g._id === updatedGuest._id ? updatedGuest : g)
      );
    };

    const handleGuestDeleted = (guestId: string) => {
      setGuests(prev => prev.filter(g => g._id !== guestId));
    };

    wsService.on('guest:created', handleGuestCreated);
    wsService.on('guest:updated', handleGuestUpdated);
    wsService.on('guest:deleted', handleGuestDeleted);

    return () => {
      wsService.off('guest:created', handleGuestCreated);
      wsService.off('guest:updated', handleGuestUpdated);
      wsService.off('guest:deleted', handleGuestDeleted);
    };
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
        ) : error ? (
          <div style={{ 
            padding: 'var(--spacing-xl)', 
            textAlign: 'center', 
            color: 'var(--danger)',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--danger)',
            margin: 'var(--spacing-md)'
          }}>
            <div style={{ marginBottom: 'var(--spacing-md)' }}>⚠️ {error}</div>
            <button className="btn btn-primary" onClick={fetchGuests}>
              Retry
            </button>
          </div>
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
              {guests.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <div>📭 No guests found in database.</div>
                      <div style={{ fontSize: '0.85rem' }}>Click "Add Guest" to create your first guest.</div>
                    </div>
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
