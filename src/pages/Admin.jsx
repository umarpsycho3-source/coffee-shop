import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShoppingBag, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    try {
      const ordersRes = await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/orders');
      const bookingsRes = await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/bookings');
      
      if (ordersRes.ok) {
        const storedOrders = await ordersRes.json();
        setOrders(storedOrders);
      }
      
      if (bookingsRes.ok) {
        const storedBookings = await bookingsRes.json();
        setBookings(storedBookings);
      }
    } catch (err) {
      console.error("Failed to load admin data", err);
    }
  };

  const markOrderComplete = async (orderId) => {
    try {
      await fetch(`https://coffee-shop-production-1fb9.up.railway.app/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Completed' })
      });
      const updated = orders.map(o => o.id === orderId ? { ...o, status: 'Completed' } : o);
      setOrders(updated);
    } catch (err) {
      console.error("Failed to update order status", err);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-page container animate-fade-in">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage incoming orders and reservations.</p>
      </div>

      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag size={20} /> Orders
        </button>
        <button 
          className={`admin-tab ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={20} /> Bookings
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'orders' && (
          <div className="admin-list">
            <h2>Recent Orders</h2>
            {orders.length === 0 ? <p className="empty-msg">No orders found.</p> : null}
            {orders.map(order => (
              <div key={order.id} className="admin-card glass-panel">
                <div className="card-header">
                  <div>
                    <h3>Order #{order.id.toString().slice(-4)}</h3>
                    <span className="customer-name">{order.customerName} ({order.userId})</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="card-body">
                  <p className="order-date">Placed: {new Date(order.date).toLocaleString()}</p>
                  <div style={{margin: '10px 0', padding: '10px', background: 'var(--surface-color)', borderRadius: 'var(--radius-sm)'}}>
                    <p><strong>Type:</strong> {order.orderType}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod}</p>
                    {order.orderType === 'Delivery' && <p><strong>Address:</strong> {order.address}</p>}
                  </div>
                  <ul className="order-items">
                    {order.items.map(item => (
                      <li key={item.id}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                  <p className="order-total">Total: ${order.total.toFixed(2)}</p>
                </div>
                <div className="card-actions" style={{display: 'flex', gap: '10px', marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px', justifyContent: 'flex-end'}}>
                  {order.whatsapp && (
                    <a 
                      href={`https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)},%20your%20Lumina%20Coffee%20${order.orderType}%20order%20placed%20on%20${new Date(order.date).toLocaleDateString()}%20is%20${order.status === 'Completed' ? 'ready%20to%20collect/delivering!' : 'being%20prepared.'}`}
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{borderColor: '#25D366', color: '#25D366'}}
                    >
                      <MessageSquare size={16} /> Request Collect / Update
                    </a>
                  )}
                  {order.status !== 'Completed' && (
                    <button className="btn btn-outline btn-sm" onClick={() => markOrderComplete(order.id)}>
                      <CheckCircle size={16} /> Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="admin-list">
            <h2>Upcoming Reservations</h2>
            {bookings.length === 0 ? <p className="empty-msg">No bookings found.</p> : null}
            {bookings.map(booking => (
              <div key={booking.id} className="admin-card glass-panel">
                <div className="card-header">
                  <div>
                    <h3>{booking.name}</h3>
                    <span className="customer-name">User: {booking.userId}</span>
                  </div>
                  <div className="booking-time">
                    <Clock size={16} /> {booking.date} at {booking.time}
                  </div>
                </div>
                <div className="card-body">
                  <p><strong>Guests:</strong> {booking.guests}</p>
                  {booking.whatsapp && <p><strong>WhatsApp:</strong> {booking.whatsapp}</p>}
                  {booking.notes && <p><strong>Notes:</strong> {booking.notes}</p>}
                </div>
                {booking.whatsapp && (
                  <div className="card-actions" style={{marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end'}}>
                    <a 
                      href={`https://wa.me/${booking.whatsapp.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(booking.name)},%20this%20is%20a%20reminder%20for%20your%20Lumina%20Coffee%20booking%20on%20${booking.date}%20at%20${booking.time}.`}
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{borderColor: '#25D366', color: '#25D366'}}
                    >
                      <MessageSquare size={16} /> Send Reminder
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
