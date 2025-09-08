// Simple encryption utility for sessionStorage data protection
// Uses basic XOR cipher with key rotation for client-side protection

class SessionCrypto {
  private static readonly SECRET_KEY = "LucentAg2024SecureSession!@#$";
  
  private static rotateKey(key: string, position: number): string {
    const rotatedKey = key.slice(position) + key.slice(0, position);
    return rotatedKey;
  }

  private static xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const rotatedKey = this.rotateKey(key, i % key.length);
      const keyChar = rotatedKey.charCodeAt(i % rotatedKey.length);
      const textChar = text.charCodeAt(i);
      result += String.fromCharCode(textChar ^ keyChar);
    }
    return result;
  }

  private static xorDecrypt(encryptedText: string, key: string): string {
    // XOR decryption is the same as encryption
    return this.xorEncrypt(encryptedText, key);
  }

  private static stringToBase64(str: string): string {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
      console.error('Base64 encoding failed:', e);
      return str;
    }
  }

  private static base64ToString(base64: string): string {
    try {
      return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
      console.error('Base64 decoding failed:', e);
      return base64;
    }
  }

  // Encrypt sensitive data
  static encrypt(data: string): string {
    try {
      const encrypted = this.xorEncrypt(data, this.SECRET_KEY);
      return this.stringToBase64(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return data; // Return original data if encryption fails
    }
  }

  // Decrypt sensitive data
  static decrypt(encryptedData: string): string {
    try {
      const base64Decoded = this.base64ToString(encryptedData);
      return this.xorDecrypt(base64Decoded, this.SECRET_KEY);
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedData; // Return original data if decryption fails
    }
  }

  // Encrypt session data object
  static encryptSessionData(sessionData: any): any {
    const encryptedData = { ...sessionData };
    
    // Encrypt sensitive fields
    if (sessionData.userId) {
      encryptedData.userId = this.encrypt(sessionData.userId);
    }
    if (sessionData.token) {
      encryptedData.token = this.encrypt(sessionData.token);
    }
    if (sessionData.email) {
      encryptedData.email = this.encrypt(sessionData.email);
    }
    if (sessionData.phone) {
      encryptedData.phone = this.encrypt(sessionData.phone);
    }

    // Mark as encrypted for identification
    encryptedData._encrypted = true;
    
    return encryptedData;
  }

  // Decrypt session data object
  static decryptSessionData(encryptedSessionData: any): any {
    if (!encryptedSessionData || !encryptedSessionData._encrypted) {
      // Return as-is if not encrypted (backward compatibility)
      return encryptedSessionData;
    }

    const decryptedData = { ...encryptedSessionData };
    
    // Decrypt sensitive fields
    if (encryptedSessionData.userId) {
      decryptedData.userId = this.decrypt(encryptedSessionData.userId);
    }
    if (encryptedSessionData.token) {
      decryptedData.token = this.decrypt(encryptedSessionData.token);
    }
    if (encryptedSessionData.email) {
      decryptedData.email = this.decrypt(encryptedSessionData.email);
    }
    if (encryptedSessionData.phone) {
      decryptedData.phone = this.decrypt(encryptedSessionData.phone);
    }

    // Remove encryption marker
    delete decryptedData._encrypted;
    
    return decryptedData;
  }
}

export { SessionCrypto };