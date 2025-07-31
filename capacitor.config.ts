import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dreamsellerpro.app',
  appName: 'DreamSeller Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
    cleartext: true,
    allowNavigation: [
      'capacitor://localhost',
      'https://localhost',
      'http://localhost'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1e293b',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      iosSpinnerStyle: 'small',
      spinnerColor: '#999999'
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1e293b'
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true
    },
    App: {
      launchUrl: 'dreamsellerpro://'
    },
    CapacitorHttp: {
      enabled: true
    }
  },
  ios: {
    scheme: 'dreamsellerpro',
    contentInset: 'automatic',
    backgroundColor: '#1e293b'
  }
};

export default config;
