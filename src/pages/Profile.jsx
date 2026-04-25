import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, ShoppingBag } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      const loadProfileData = async () => {
        try {
          const ordersRes = await fetch(`http://localhost:3001/api/orders/user/${user.email}`);
          if (ordersRes.ok) {
            setOrders(await ordersRes.json());
          }

          const bookingsRes = await fetch(`http://localhost:3001/api/bookings/user/${user.email}`);
          if (bookingsRes.ok) {
            setBookings(await bookingsRes.json());
          }
        } catch (err) {
          console.error("Failed to load profile data", err);
        }
      };
      
      loadProfileData();
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="profile-page container animate-fade-in">
      <div className="profile-header">
        <h1>My Account</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="profile-grid">
        <div className="profile-section">
          <h2><ShoppingBag size={24} /> My Orders</h2>
          <div className="profile-list">
            {orders.length === 0 ? <p className="empty-msg">You haven't placed any orders yet.</p> : null}
            {orders.map(order => (
              <div key={order.id} className="profile-card glass-panel">
                <div className="card-header">
                  <h3>Order #{order.id.toString().slice(-4)}</h3>
                  <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                </div>
                <div className="card-body">
                  <p className="date-text">{new Date(order.date).toLocaleString()}</p>
                  <ul className="item-list">
                    {order.items.map(item => (
                      <li key={item.id}>{item.quantity}x {item.name}</li>
                    ))}
                  </ul>
                  <p className="total-text">Total: ${order.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2><Calendar size={24} /> My Bookings</h2>
          <div className="profile-list">
            {bookings.length === 0 ? <p className="empty-msg">You have no upcoming bookings.</p> : null}
            {bookings.map(booking => (
              <div key={booking.id} className="profile-card glass-panel">
                <div className="card-header">
                  <h3>Table for {booking.guests}</h3>
                  <span className="status-badge upcoming">Upcoming</span>
                </div>
                <div className="card-body">
                  <p><strong>Date:</strong> {booking.date}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  {booking.whatsapp && <p><strong>WhatsApp:</strong> {booking.whatsapp}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
