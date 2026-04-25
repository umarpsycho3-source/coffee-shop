import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    name: user ? user.name : '',
    whatsapp: '',
    notes: ''
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to book a table");
      navigate('/login');
      return;
    }
    // Save to real database
    try {
      await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userId: user.email })
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error("Failed to save booking:", err);
      alert("Failed to book table. Ensure backend is running on port 3001.");
    }
  };

  return (
    <div className="booking-page container animate-fade-in">
      <div className="booking-form-wrapper glass-panel">
        <div className="booking-header">
          <h1>Reserve a Table</h1>
          <p>Join us for an exceptional coffee experience.</p>
        </div>

        {success ? (
          <div className="success-message">
            <h3>Booking Confirmed!</h3>
            <p>We look forward to serving you, {formData.name}. Redirecting to home...</p>
          </div>
        ) : (
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Time</label>
                <input 
                  type="time" 
                  required 
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Number of Guests</label>
              <select 
                value={formData.guests}
                onChange={(e) => setFormData({...formData, guests: e.target.value})}
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} {n===1?'Guest':'Guests'}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Reservation Name</label>
              <input 
                type="text" 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe"
              />
            </div>

            <div className="form-group">
              <label className="form-label">WhatsApp Number (For Reminders)</label>
              <input 
                type="tel" 
                required 
                value={formData.whatsapp}
                onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                placeholder="+1 234 567 8900"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Special Requests (Optional)</label>
              <textarea 
                rows="3" 
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Window seat, accessibility needs, etc."
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary submit-btn">Confirm Reservation</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Booking;
