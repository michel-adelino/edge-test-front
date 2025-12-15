import React, { useState, useEffect } from 'react';
import { wsService } from '../services/websocket';

export interface SyncStatusMessage {
  type: 'pull' | 'push';
  action: string;
  collection: string;
  status: 'processing' | 'success' | 'error' | 'completed';
  message: string;
  documentId?: string;
  timestamp: string;
  syncedCount?: number;
  totalCount?: number;
  errors?: number;
  error?: string;
}

const SyncStatus: React.FC = () => {
  const [messages, setMessages] = useState<SyncStatusMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleSyncStatus = (status: SyncStatusMessage) => {
      setMessages(prev => {
        // Keep only last 50 messages
        const newMessages = [status, ...prev].slice(0, 50);
        return newMessages;
      });
    };

    wsService.on('sync:status', handleSyncStatus);

    return () => {
      wsService.off('sync:status', handleSyncStatus);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return 'var(--success)';
      case 'error':
        return 'var(--danger)';
      case 'processing':
        return 'var(--warning)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      case 'processing':
        return '⟳';
      default:
        return '•';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'pull' ? '⬇' : '⬆';
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (messages.length === 0 && !isExpanded) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 'var(--spacing-md)',
      right: 'var(--spacing-md)',
      width: isExpanded ? '400px' : 'auto',
      maxHeight: isExpanded ? '500px' : 'auto',
      zIndex: 1000,
    }}>
      <div style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--spacing-md)',
          borderBottom: '1px solid var(--glass-border)',
          cursor: 'pointer',
        }} onClick={() => setIsExpanded(!isExpanded)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <span style={{ fontSize: '1.2rem' }}>🔄</span>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Sync Status</span>
            {messages.length > 0 && (
              <span style={{
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '10px',
                padding: '0.1rem 0.5rem',
                fontSize: '0.7rem',
                fontWeight: 600,
              }}>
                {messages.length}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            {messages.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearMessages();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.8rem',
                }}
                title="Clear messages"
              >
                Clear
              </button>
            )}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {isExpanded ? '▼' : '▲'}
            </span>
          </div>
        </div>

        {/* Messages List */}
        {isExpanded && (
          <div style={{
            maxHeight: '450px',
            overflowY: 'auto',
            padding: 'var(--spacing-sm)',
          }}>
            {messages.length === 0 ? (
              <div style={{
                padding: 'var(--spacing-lg)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}>
                No sync activity yet
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    padding: 'var(--spacing-sm)',
                    marginBottom: 'var(--spacing-xs)',
                    borderRadius: 'var(--radius-sm)',
                    background: msg.status === 'error' 
                      ? 'rgba(239, 68, 68, 0.1)' 
                      : msg.status === 'success' || msg.status === 'completed'
                      ? 'rgba(34, 197, 94, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${getStatusColor(msg.status)}`,
                    fontSize: '0.75rem',
                    animation: msg.status === 'processing' ? 'pulse 2s infinite' : 'none',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 'var(--spacing-xs)',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      minWidth: '60px',
                    }}>
                      <span style={{ fontSize: '0.9rem' }}>{getTypeIcon(msg.type)}</span>
                      <span style={{
                        color: getStatusColor(msg.status),
                        fontWeight: 600,
                      }}>
                        {getStatusIcon(msg.status)}
                      </span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        color: 'var(--text-main)',
                        marginBottom: '0.25rem',
                      }}>
                        {msg.message}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 'var(--spacing-sm)',
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        flexWrap: 'wrap',
                      }}>
                        <span>{formatTime(msg.timestamp)}</span>
                        <span>•</span>
                        <span style={{ textTransform: 'capitalize' }}>{msg.collection}</span>
                        {msg.documentId && (
                          <>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.65rem' }}>
                              {msg.documentId.substring(0, 8)}...
                            </span>
                          </>
                        )}
                        {msg.syncedCount !== undefined && (
                          <>
                            <span>•</span>
                            <span>{msg.syncedCount}/{msg.totalCount} synced</span>
                          </>
                        )}
                      </div>
                      {msg.error && (
                        <div style={{
                          marginTop: '0.25rem',
                          padding: '0.25rem',
                          background: 'rgba(239, 68, 68, 0.2)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.7rem',
                          color: 'var(--danger)',
                        }}>
                          {msg.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;

