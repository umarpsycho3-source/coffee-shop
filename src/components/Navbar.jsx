import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { Coffee, ShoppingCart, User, LogOut } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar glass-panel">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          <Coffee size={28} color="var(--primary-color)" />
          <span>Lumina Coffee</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/booking" className="nav-link">Book a Table</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="nav-link" style={{color: 'var(--primary-color)'}}>Dashboard</Link>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/checkout" className="cart-icon">
            <ShoppingCart size={22} />
            {cartItemCount > 0 && <span className="cart-badge">{cartItemCount}</span>}
          </Link>
          
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="user-name" style={{ cursor: 'pointer' }}>Hi, {user.name.split(' ')[0]}</Link>
              <button onClick={handleLogout} className="btn-icon" title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              <User size={18} /> Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
