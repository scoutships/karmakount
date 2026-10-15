import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karmakount.app',
  appName: 'KarmaKount',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Haptics: {},
    Camera: {},
    Geolocation: {}
  }
};

export default config;
