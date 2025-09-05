// PWA Utility Functions

export const isPWAInstalled = (): boolean => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone ||
    document.referrer.includes('android-app://')
  );
};

export const isIOSDevice = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroidDevice = (): boolean => {
  return /Android/.test(navigator.userAgent);
};

export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getDeviceType = (): 'ios' | 'android' | 'desktop' => {
  if (isIOSDevice()) return 'ios';
  if (isAndroidDevice()) return 'android';
  return 'desktop';
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    const defaultOptions: NotificationOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'agriconnect-notification',
      ...options
    };

    new Notification(title, defaultOptions);
  }
};

export const registerSW = async (): Promise<ServiceWorkerRegistration | undefined> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available
              showNotification('App Update Available', {
                body: 'A new version of AgriConnect is available. Refresh to update.',
                tag: 'app-update'
              });
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  return undefined;
};

export const updateSW = (): void => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) {
        registration.update();
      }
    });
  }
};

export const unregisterSW = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return await registration.unregister();
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }
  return false;
};

// Screen orientation utilities
export const lockOrientation = (orientation: string): Promise<void> => {
  if ('screen' in window && 'orientation' in window.screen && 'lock' in window.screen.orientation) {
    return (window.screen.orientation as any).lock(orientation);
  }
  return Promise.reject('Screen orientation lock not supported');
};

export const unlockOrientation = (): void => {
  if ('screen' in window && 'orientation' in window.screen && 'unlock' in window.screen.orientation) {
    window.screen.orientation.unlock();
  }
};

// App badge utilities (for supported browsers)
export const setAppBadge = (count?: number): Promise<void> => {
  if ('setAppBadge' in navigator) {
    return (navigator as any).setAppBadge(count);
  }
  return Promise.reject('App badge not supported');
};

export const clearAppBadge = (): Promise<void> => {
  if ('clearAppBadge' in navigator) {
    return (navigator as any).clearAppBadge();
  }
  return Promise.reject('App badge not supported');
};

// Vibration API
export const vibrate = (pattern: number | number[]): boolean => {
  if ('vibrate' in navigator) {
    return navigator.vibrate(pattern);
  }
  return false;
};

// Wake lock (to prevent screen from turning off)
export const requestWakeLock = async (): Promise<WakeLockSentinel | null> => {
  if ('wakeLock' in navigator) {
    try {
      return await navigator.wakeLock.request('screen');
    } catch (error) {
      console.error('Wake lock failed:', error);
    }
  }
  return null;
};

export const releaseWakeLock = (wakeLock: WakeLockSentinel): void => {
  if (wakeLock) {
    wakeLock.release();
  }
};