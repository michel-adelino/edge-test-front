import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWebSocket } from '../hooks/useWebSocket';
import BackendStatus from './BackendStatus';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isConnected } = useWebSocket();

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
          Edge<span style={{ color: 'var(--primary)' }}>Master</span>
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        <BackendStatus />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.25rem 0.75rem',
          borderRadius: 'var(--radius-md)',
          background: isConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isConnected ? 'var(--success)' : 'var(--danger)'}`,
          fontSize: '0.75rem',
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: isConnected ? 'var(--success)' : 'var(--danger)',
            animation: isConnected ? 'pulse 2s infinite' : 'none',
          }}></div>
          <span style={{ color: isConnected ? 'var(--success)' : 'var(--danger)' }}>
            WS {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
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
