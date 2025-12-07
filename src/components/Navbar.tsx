import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--spacing-lg) 0',
      marginBottom: 'var(--spacing-xl)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <div style={{
          width: '32px',
          height: '32px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          borderRadius: '8px',
        }}></div>
        <span style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Edge<span style={{ color: 'var(--primary)' }}>Dashboard</span>
        </span>
      </div>

      <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
        <Link 
          to="/" 
          className={`btn ${isActive('/') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ border: isActive('/') ? 'none' : undefined }}
        >
          Guests
        </Link>
        <Link 
          to="/orders" 
          className={`btn ${isActive('/orders') ? 'btn-primary' : 'btn-secondary'}`}
          style={{ border: isActive('/orders') ? 'none' : undefined }}
        >
          Orders
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
