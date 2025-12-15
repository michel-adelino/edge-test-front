import React, { useState, useEffect } from 'react';
import { statusService, type BackendStatus } from '../services/api';

const BackendStatusComponent: React.FC = () => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setError(null);
      const data = await statusService.getStatus();
      setStatus(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch status');
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 5 seconds
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--glass-bg)',
        border: '1px solid var(--glass-border)',
        fontSize: '0.75rem',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--warning)',
        }}></div>
        <span>Loading status...</span>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid var(--danger)',
        fontSize: '0.75rem',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: 'var(--danger)',
        }}></div>
        <span>Backend unreachable</span>
      </div>
    );
  }

  if (!status) return null;

  const dbConnected = status.database.connected;
  const atlasConnected = status.atlas.connected;
  const atlasConfigured = status.atlas.configured;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      padding: '0.75rem 1rem',
      borderRadius: 'var(--radius-md)',
      background: 'var(--glass-bg)',
      border: '1px solid var(--glass-border)',
      fontSize: '0.75rem',
      minWidth: '200px',
    }}>
      {/* Database Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: dbConnected ? 'var(--success)' : 'var(--danger)',
            animation: dbConnected ? 'pulse 2s infinite' : 'none',
          }}></div>
          <span style={{ fontWeight: 500 }}>MongoDB:</span>
        </div>
        <span style={{ 
          color: dbConnected ? 'var(--success)' : 'var(--danger)',
          textTransform: 'capitalize'
        }}>
          {status.database.status}
        </span>
      </div>

      {/* Atlas Status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: atlasConfigured 
              ? (atlasConnected ? 'var(--success)' : 'var(--danger)')
              : 'var(--text-muted)',
            animation: atlasConnected ? 'pulse 2s infinite' : 'none',
          }}></div>
          <span style={{ fontWeight: 500 }}>Atlas:</span>
        </div>
        <span style={{ 
          color: atlasConfigured
            ? (atlasConnected ? 'var(--success)' : 'var(--danger)')
            : 'var(--text-muted)',
          textTransform: 'capitalize'
        }}>
          {atlasConfigured 
            ? (atlasConnected ? 'Connected' : status.atlas.status.replace('_', ' '))
            : 'Not Configured'}
        </span>
      </div>

      {/* Error Messages */}
      {status.database.error && (
        <div style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          fontSize: '0.7rem',
          color: 'var(--danger)',
          marginTop: '0.25rem',
        }}>
          DB: {status.database.error}
        </div>
      )}

      {status.atlas.error && atlasConfigured && (
        <div style={{
          padding: '0.5rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid var(--danger)',
          fontSize: '0.7rem',
          color: 'var(--danger)',
          marginTop: '0.25rem',
        }}>
          Atlas: {status.atlas.error}
        </div>
      )}
    </div>
  );
};

export default BackendStatusComponent;

