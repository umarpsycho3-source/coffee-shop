import { Link } from 'react-router-dom';
import { ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import './Home.css';

const Home = () => {
  return (
    <div className="home animate-fade-in">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <h1>Experience The Perfect Cup</h1>
          <p>Artisanal coffee brewed with passion. Indulge in our carefully selected beans from around the world, roasted to perfection.</p>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              Explore Menu <ArrowRight size={20} />
            </Link>
            <Link to="/booking" className="btn btn-outline">Book a Table</Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <div className="feature-card glass-panel">
          <Star className="feature-icon" size={32} />
          <h3>Premium Quality</h3>
          <p>We source only the finest 1% of beans globally.</p>
        </div>
        <div className="feature-card glass-panel">
          <Clock className="feature-icon" size={32} />
          <h3>Freshly Roasted</h3>
          <p>Roasted in-house daily for maximum flavor.</p>
        </div>
        <div className="feature-card glass-panel">
          <MapPin className="feature-icon" size={32} />
          <h3>Cozy Atmosphere</h3>
          <p>A welcoming space to work, relax, or catch up.</p>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section container">
        <div className="about-image">
          {/* We will use CSS background for placeholder or an img tag */}
          <div className="img-placeholder" style={{backgroundImage: "url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80')"}}></div>
        </div>
        <div className="about-content">
          <h2>Our Story</h2>
          <p>Founded in 2018, Lumina Coffee started with a simple mission: to bring exceptional coffee to our community. We believe every cup tells a story of its origin, the farmer's dedication, and the roaster's craft.</p>
          <p>Whether you're grabbing a quick espresso on your way to work or settling in for an afternoon of reading, we've created a space where coffee lovers can feel at home.</p>
          <Link to="/menu" className="btn btn-primary mt-4">Discover Our Coffee</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
