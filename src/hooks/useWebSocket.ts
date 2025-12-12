import { useEffect, useState } from 'react';
import { wsService } from '../services/websocket';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    wsService.connect();

    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    wsService.on('connected', handleConnected);
    wsService.on('disconnected', handleDisconnected);

    // Check initial connection status
    setIsConnected(wsService.isConnected());

    return () => {
      wsService.off('connected', handleConnected);
      wsService.off('disconnected', handleDisconnected);
    };
  }, []);

  return { isConnected };
};

