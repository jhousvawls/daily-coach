// PWA Update Service
export interface UpdateInfo {
  updateAvailable: boolean;
  currentVersion: string;
  newVersion?: string;
}

export interface PWAUpdateService {
  checkForUpdates(): Promise<UpdateInfo>;
  applyUpdate(): Promise<void>;
  onUpdateAvailable(callback: (info: UpdateInfo) => void): void;
  getCurrentVersion(): Promise<string>;
}

class PWAUpdateServiceImpl implements PWAUpdateService {
  private updateCallbacks: ((info: UpdateInfo) => void)[] = [];
  private registration: ServiceWorkerRegistration | null = null;
  private newWorker: ServiceWorker | null = null;

  constructor() {
    this.initializeServiceWorker();
  }

  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        console.log('[PWA] Registering service worker...');
        
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('[PWA] Service worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          console.log('[PWA] New service worker found');
          this.newWorker = this.registration!.installing;
          
          if (this.newWorker) {
            this.newWorker.addEventListener('statechange', () => {
              if (this.newWorker!.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[PWA] New service worker installed, update available');
                this.notifyUpdateAvailable();
              }
            });
          }
        });

        // Listen for controller changes (when new SW takes control)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('[PWA] New service worker took control, reloading...');
          window.location.reload();
        });

        // Check for updates immediately
        this.checkForUpdates();

        // Set up periodic update checks (every 30 minutes)
        setInterval(() => {
          this.checkForUpdates();
        }, 30 * 60 * 1000);

      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    } else {
      console.warn('[PWA] Service workers not supported');
    }
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    if (!this.registration) {
      return { updateAvailable: false, currentVersion: 'unknown' };
    }

    try {
      console.log('[PWA] Checking for updates...');
      
      // Force check for updates
      await this.registration.update();
      
      const currentVersion = await this.getCurrentVersion();
      
      // Check if there's a waiting worker
      if (this.registration.waiting) {
        console.log('[PWA] Update available (waiting worker found)');
        return {
          updateAvailable: true,
          currentVersion,
          newVersion: 'newer'
        };
      }

      // Use MessageChannel to communicate with service worker
      return new Promise((resolve) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          const { type, newVersion, currentVersion: swCurrentVersion } = event.data;
          
          if (type === 'UPDATE_AVAILABLE') {
            resolve({
              updateAvailable: true,
              currentVersion: swCurrentVersion,
              newVersion
            });
          } else if (type === 'NO_UPDATE') {
            resolve({
              updateAvailable: false,
              currentVersion: swCurrentVersion
            });
          } else if (type === 'UPDATE_ERROR') {
            console.error('[PWA] Update check error:', event.data.error);
            resolve({
              updateAvailable: false,
              currentVersion: swCurrentVersion || currentVersion
            });
          }
        };

        // Send message to service worker
        if (this.registration?.active) {
          this.registration.active.postMessage(
            { type: 'CHECK_UPDATE' },
            [messageChannel.port2]
          );
        } else {
          resolve({ updateAvailable: false, currentVersion });
        }
      });

    } catch (error) {
      console.error('[PWA] Error checking for updates:', error);
      const currentVersion = await this.getCurrentVersion();
      return { updateAvailable: false, currentVersion };
    }
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      console.log('[PWA] Applying update...');

      if (this.registration.waiting) {
        // Tell the waiting service worker to skip waiting
        this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (this.newWorker) {
        // Tell the new worker to skip waiting
        this.newWorker.postMessage({ type: 'SKIP_WAITING' });
      } else {
        // Force update and reload
        await this.registration.update();
        window.location.reload();
      }
    } catch (error) {
      console.error('[PWA] Error applying update:', error);
      throw error;
    }
  }

  onUpdateAvailable(callback: (info: UpdateInfo) => void): void {
    this.updateCallbacks.push(callback);
  }

  async getCurrentVersion(): Promise<string> {
    if (!this.registration || !this.registration.active) {
      return 'unknown';
    }

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.type === 'VERSION') {
          resolve(event.data.version);
        } else {
          resolve('unknown');
        }
      };

      if (this.registration?.active) {
        this.registration.active.postMessage(
          { type: 'GET_VERSION' },
          [messageChannel.port2]
        );
      } else {
        resolve('unknown');
      }

      // Timeout after 5 seconds
      setTimeout(() => resolve('unknown'), 5000);
    });
  }

  private async notifyUpdateAvailable(): Promise<void> {
    const updateInfo = await this.checkForUpdates();
    if (updateInfo.updateAvailable) {
      this.updateCallbacks.forEach(callback => callback(updateInfo));
    }
  }
}

// Export singleton instance
export const pwaUpdateService = new PWAUpdateServiceImpl();

// Utility functions for manual cache management
export const cacheUtils = {
  // Clear all caches (useful for debugging)
  async clearAllCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('[PWA] All caches cleared');
    }
  },

  // Get cache info
  async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    if (!('caches' in window)) return [];

    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return { name, size: keys.length };
      })
    );

    return cacheInfo;
  },

  // Force refresh from network (bypass cache)
  forceRefresh(): void {
    window.location.reload();
  }
};
