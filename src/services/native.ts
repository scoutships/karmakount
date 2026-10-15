import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

// Platform detection helper
export const isCapacitorNative = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { Capacitor?: { isNativePlatform: () => boolean } }).Capacitor?.isNativePlatform());
};

export const isElectronDesktop = (): boolean => {
  return typeof window !== 'undefined' && Boolean((window as unknown as { electronAPI?: unknown }).electronAPI);
};

export const isChromeExtension = (): boolean => {
  const g = typeof window !== 'undefined' ? (window as unknown as { chrome?: { runtime?: { id?: string } } }) : undefined;
  return Boolean(g?.chrome?.runtime?.id);
};

export class NativePlatformBridge {
  // Trigger physical haptic feedback on mobile (iOS / Android)
  public static async triggerVirtueHaptics() {
    try {
      if (isCapacitorNative()) {
        await Haptics.notification({ type: NotificationType.Success });
      }
    } catch {
      // Haptics not supported on platform, fail silently
    }
  }

  public static async triggerViceHaptics() {
    try {
      if (isCapacitorNative()) {
        await Haptics.impact({ style: ImpactStyle.Heavy });
      }
    } catch {
      // Fail silently
    }
  }

  public static async triggerGavelHaptics() {
    try {
      if (isCapacitorNative()) {
        await Haptics.impact({ style: ImpactStyle.Medium });
      }
    } catch {
      // Fail silently
    }
  }

  // Send native desktop or push notification
  public static sendNativeNotification(title: string, body: string) {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/icons/icon-192.png'
      });
    } else if (typeof Notification !== 'undefined' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body });
        }
      });
    }
  }
}
