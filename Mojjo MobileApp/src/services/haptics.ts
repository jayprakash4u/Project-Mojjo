import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export class HapticsService {
  private static isAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

  static light(): void {
    if (this.isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch {}
    }
  }

  static medium(): void {
    if (this.isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}
    }
  }

  static heavy(): void {
    if (this.isAvailable) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}
    }
  }

  static selection(): void {
    if (this.isAvailable) {
      try {
        Haptics.selectionAsync();
      } catch {}
    }
  }

  static success(): void {
    if (this.isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
    }
  }

  static warning(): void {
    if (this.isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      } catch {}
    }
  }

  static error(): void {
    if (this.isAvailable) {
      try {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch {}
    }
  }
}
