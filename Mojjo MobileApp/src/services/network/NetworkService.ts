import { onlineManager } from '@tanstack/react-query';
import { Platform } from 'react-native';

export type NetworkStatusListener = (isOnline: boolean, isSlow: boolean) => void;

class NetworkServiceManager {
  private static instance: NetworkServiceManager;
  private isOnline: boolean = true;
  private isSlow: boolean = false;
  private listeners: Set<NetworkStatusListener> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;
  private isProbing: boolean = false;

  private constructor() {
    this.init();
  }

  public static getInstance(): NetworkServiceManager {
    if (!NetworkServiceManager.instance) {
      NetworkServiceManager.instance = new NetworkServiceManager();
    }
    return NetworkServiceManager.instance;
  }

  private init() {
    // Setup web listeners if running on web
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.isOnline = navigator.onLine;
      window.addEventListener('online', () => this.setOnlineState(true));
      window.addEventListener('offline', () => this.setOnlineState(false));
    }

    // Connect with TanStack React Query onlineManager
    onlineManager.setEventListener((setOnline) => {
      return this.subscribe((online) => {
        setOnline(online);
      });
    });

    // Periodic heartbeat probe every 45s to detect flaky / dead gateway connections
    this.startHeartbeat();
  }

  private startHeartbeat() {
    if (this.checkInterval) clearInterval(this.checkInterval);
    this.checkInterval = setInterval(() => {
      this.probeConnection();
    }, 45000);
  }

  /**
   * Fast probe to verify internet reachability
   */
  public async probeConnection(): Promise<boolean> {
    if (this.isProbing) return this.isOnline;
    this.isProbing = true;

    try {
      const startTime = Date.now();
      // Probe a reliable fast 204 endpoint or DNS probe
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);
      const elapsed = Date.now() - startTime;

      const isOnline = response.type === 'opaque' || response.status === 204 || response.ok;
      const isSlow = elapsed > 2500;

      this.setOnlineState(isOnline, isSlow);
      return isOnline;
    } catch {
      this.setOnlineState(false, false);
      return false;
    } finally {
      this.isProbing = false;
    }
  }

  public setOnlineState(online: boolean, isSlow: boolean = false) {
    if (this.isOnline !== online || this.isSlow !== isSlow) {
      this.isOnline = online;
      this.isSlow = isSlow;
      this.notifyListeners();
    }
  }

  /**
   * Called by API client interceptors when a network failure occurs
   */
  public recordNetworkFailure() {
    this.setOnlineState(false, false);
  }

  /**
   * Called by API client interceptors when a request succeeds
   */
  public recordNetworkSuccess(elapsedMs?: number) {
    const isSlow = elapsedMs !== undefined && elapsedMs > 2500;
    this.setOnlineState(true, isSlow);
  }

  public getStatus(): { isOnline: boolean; isSlow: boolean } {
    return { isOnline: this.isOnline, isSlow: this.isSlow };
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline, this.isSlow);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isOnline, this.isSlow);
      } catch (e) {
        console.warn('[NetworkService] listener error', e);
      }
    });
  }
}

export const NetworkService = NetworkServiceManager.getInstance();
