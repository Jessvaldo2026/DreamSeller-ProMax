// Fingerprint authentication utility
export class FingerprintAuth {
  private static isSupported(): boolean {
    return 'PublicKeyCredential' in window && 
           typeof navigator.credentials?.create === 'function';
  }

  static async isAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      return available;
    } catch {
      return false;
    }
  }

  static async register(userId: string, userName: string): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: "DreamSeller Pro", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          }
        }
      });

      if (credential) {
        localStorage.setItem('fingerprint_registered', 'true');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Fingerprint registration failed:', error);
      return false;
    }
  }

  static async authenticate(): Promise<boolean> {
    if (!this.isSupported()) return false;

    try {
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [],
          userVerification: "required"
        }
      });

      return !!credential;
    } catch (error) {
      console.error('Fingerprint authentication failed:', error);
      return false;
    }
  }
}