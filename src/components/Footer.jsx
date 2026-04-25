import { Link } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <Coffee size={24} color="var(--primary-color)" />
            <span>Lumina Coffee</span>
          </Link>
          <p className="footer-desc">
            Elevating your daily ritual with artisanal roasts, exquisite flavors, and a welcoming atmosphere.
          </p>
          <div className="social-links">
            <a href="#">Insta</a>
            <a href="#">X</a>
            <a href="#">FB</a>
          </div>
        </div>
        
        <div className="footer-links-group">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/menu">Our Menu</Link>
          <Link to="/booking">Reservations</Link>
        </div>

        <div className="footer-links-group">
          <h4>Contact Us</h4>
          <p>123 Brew Avenue</p>
          <p>Coffee District, NY 10001</p>
          <a href="mailto:umarxgamer04@gmail.com">umarxgamer04@gmail.com</a>
          <a href="https://wa.me/94771813023" target="_blank" rel="noreferrer">WhatsApp: +94 77 181 3023</a>
        </div>
        
        <div className="footer-links-group">
          <h4>Hours</h4>
          <p>Mon-Fri: 7am - 8pm</p>
          <p>Sat: 8am - 9pm</p>
          <p>Sun: 8am - 6pm</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Lumina Coffee. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
