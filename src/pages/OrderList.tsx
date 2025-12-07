import React, { useEffect, useState } from 'react';
import { orderService, Guest, guestService, PosOrder } from '../services/api';
import Modal from '../components/Modal';

const OrderList: React.FC = () => {
  const [orders, setOrders] = useState<PosOrder[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Partial<PosOrder>>({ items: [] });
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [orderData, guestData] = await Promise.all([
        orderService.getAll(),
        guestService.getAll()
      ]);
      setOrders(orderData);
      setGuests(guestData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrder.orderId || !currentOrder.guestId) return;

    // Calculate total amount if not set (simple logic)
    const calculatedTotal = currentOrder.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
    const orderToSave = { ...currentOrder, totalAmount: calculatedTotal };

    try {
      if (currentOrder._id) {
        await orderService.update(currentOrder._id, orderToSave);
      } else {
        await orderService.create(orderToSave as PosOrder);
      }
      setIsModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error(error);
      alert('Error saving order');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
    try {
      await orderService.delete(id);
      fetchOrders();
    } catch (error) {
      console.error(error);
    }
  };

  const addItem = () => {
    const items = currentOrder.items || [];
    setCurrentOrder({
      ...currentOrder,
      items: [...items, { name: 'New Item', quantity: 1, price: 10 }]
    });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const items = [...(currentOrder.items || [])];
    items[index] = { ...items[index], [field]: value };
    setCurrentOrder({ ...currentOrder, items });
  };

  const removeItem = (index: number) => {
    const items = [...(currentOrder.items || [])];
    items.splice(index, 1);
    setCurrentOrder({ ...currentOrder, items });
  };

  const openNew = () => {
    // Generate random order Id
    setCurrentOrder({ 
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      items: [],
      status: 'pending',
      guestId: guests[0]?._id
    });
    setIsModalOpen(true);
  };
  
  const openEdit = (order: PosOrder) => {
    // Ensure guestId is the ID string for the select
    const guestId = typeof order.guestId === 'object' ? (order.guestId as Guest)._id : order.guestId;
    setCurrentOrder({ ...order, guestId });
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h2>Orders</h2>
        <button className="btn btn-primary" onClick={openNew}>
          + New Order
        </button>
      </div>

      <div className="card table-container">
        {loading ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Guest</th>
                <th>Total</th>
                <th>Status</th>
                <th>Items</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td style={{ fontWeight: 500, fontFamily: 'monospace' }}>{order.orderId}</td>
                  <td>
                    {typeof order.guestId === 'object' ? (order.guestId as Guest)?.name : 'Unknown Guest'}
                  </td>
                  <td style={{ fontWeight: 600 }}>${order.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      background: order.status === 'completed' ? 'rgba(34, 197, 94, 0.1)' : 
                                  order.status === 'cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: order.status === 'completed' ? 'var(--success)' : 
                             order.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)',
                      border: `1px solid ${order.status === 'completed' ? 'var(--success)' : 
                             order.status === 'cancelled' ? 'var(--danger)' : 'var(--warning)'}`
                    }}>
                      {order.status?.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {order.items?.length || 0} items
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                       <button className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => openEdit(order)}>
                        Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleDelete(order._id!)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                   <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--text-muted)' }}>
                    No orders found.
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
        title={currentOrder._id ? 'Edit Order' : 'New Order'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Order ID</label>
              <input 
                value={currentOrder.orderId || ''} 
                onChange={e => setCurrentOrder({...currentOrder, orderId: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select 
                value={currentOrder.status || 'pending'} 
                onChange={e => setCurrentOrder({...currentOrder, status: e.target.value as any})}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Guest</label>
            <select 
              value={currentOrder.guestId as string || ''} 
              onChange={e => setCurrentOrder({...currentOrder, guestId: e.target.value})}
              required
            >
              <option value="">Select a guest</option>
              {guests.map(g => (
                <option key={g._id} value={g._id}>{g.name} ({g.email})</option>
              ))}
            </select>
          </div>

          <div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Items</label>
              <button type="button" className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} onClick={addItem}>+ Add Item</button>
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentOrder.items?.map((item, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px' }}>
                  <input 
                    placeholder="Item Name" 
                    value={item.name} 
                    onChange={e => updateItem(idx, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    placeholder="Qty" 
                    value={item.quantity} 
                    onChange={e => updateItem(idx, 'quantity', Number(e.target.value))}
                  />
                  <input 
                    type="number" 
                    placeholder="Price" 
                    value={item.price} 
                    onChange={e => updateItem(idx, 'price', Number(e.target.value))}
                  />
                  <button type="button" onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>&times;</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-md)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderList;
