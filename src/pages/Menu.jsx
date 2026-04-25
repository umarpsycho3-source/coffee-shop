import { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Plus } from 'lucide-react';
import './Menu.css';

const menuItems = [
  { id: 1, name: 'Espresso', category: 'Coffee', price: 3.50, desc: 'Rich and bold single shot.', img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80' },
  { id: 2, name: 'Cappuccino', category: 'Coffee', price: 4.50, desc: 'Espresso, steamed milk, and thick foam.', img: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80' },
  { id: 3, name: 'Latte', category: 'Coffee', price: 4.75, desc: 'Espresso with plenty of steamed milk.', img: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?auto=format&fit=crop&q=80' },
  { id: 4, name: 'Matcha Latte', category: 'Tea', price: 5.00, desc: 'Premium matcha green tea with steamed milk.', img: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80' },
  { id: 5, name: 'Croissant', category: 'Pastries', price: 3.75, desc: 'Buttery, flaky, and freshly baked.', img: 'https://images.unsplash.com/photo-1555507036-ab1f40ce88cb?auto=format&fit=crop&q=80' },
  { id: 6, name: 'Blueberry Muffin', category: 'Pastries', price: 3.50, desc: 'Loaded with wild blueberries.', img: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80' },
];

const Menu = () => {
  const { addToCart } = useContext(CartContext);
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Coffee', 'Tea', 'Pastries'];

  const filteredMenu = filter === 'All' ? menuItems : menuItems.filter(i => i.category === filter);

  return (
    <div className="menu-page container animate-fade-in">
      <div className="menu-header">
        <h1>Our Menu</h1>
        <p>Crafted with passion, served with a smile.</p>
      </div>

      <div className="menu-filters">
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`filter-btn ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="menu-grid">
        {filteredMenu.map(item => (
          <div key={item.id} className="menu-card glass-panel">
            <div className="menu-img-wrapper">
              <img src={item.img} alt={item.name} className="menu-img" />
            </div>
            <div className="menu-info">
              <div className="menu-title-row">
                <h3>{item.name}</h3>
                <span className="price">${item.price.toFixed(2)}</span>
              </div>
              <p className="menu-desc">{item.desc}</p>
              <button className="btn btn-outline add-btn" onClick={() => addToCart(item)}>
                <Plus size={18} /> Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Menu;
