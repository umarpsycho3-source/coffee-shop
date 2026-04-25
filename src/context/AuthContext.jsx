import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('coffeeToken');
    const storedUser = localStorage.getItem('coffeeUser');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        return false;
      }
      
      setUser(data.user);
      localStorage.setItem('coffeeUser', JSON.stringify(data.user));
      localStorage.setItem('coffeeToken', data.token);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch('https://coffee-shop-production-1fb9.up.railway.app/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await response.json();
      
      if (!response.ok) {
        return false;
      }
      
      setUser(data.user);
      localStorage.setItem('coffeeUser', JSON.stringify(data.user));
      localStorage.setItem('coffeeToken', data.token);
      return true;
    } catch (err) {
      console.error('Register error:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('coffeeUser');
    localStorage.removeItem('coffeeToken');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
