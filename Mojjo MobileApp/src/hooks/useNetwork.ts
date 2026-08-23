import { useState, useEffect, useCallback } from 'react';
import { NetworkService } from '../services/network/NetworkService';

export interface UseNetworkReturn {
  isOnline: boolean;
  isSlow: boolean;
  isChecking: boolean;
  checkConnection: () => Promise<boolean>;
}

export function useNetwork(): UseNetworkReturn {
  const [status, setStatus] = useState<{ isOnline: boolean; isSlow: boolean }>(() =>
    NetworkService.getStatus()
  );
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const unsubscribe = NetworkService.subscribe((isOnline, isSlow) => {
      setStatus({ isOnline, isSlow });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setIsChecking(true);
    try {
      const online = await NetworkService.probeConnection();
      return online;
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    isOnline: status.isOnline,
    isSlow: status.isSlow,
    isChecking,
    checkConnection,
  };
}
