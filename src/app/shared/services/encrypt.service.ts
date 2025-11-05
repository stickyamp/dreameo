import { Injectable } from "@angular/core";
import * as CryptoJS from "crypto-js";

@Injectable({
  providedIn: "root",
})
export class EncryptService {
  constructor() {}

  private getEncryptionKey(userUID: string): CryptoJS.lib.WordArray {
    return CryptoJS.PBKDF2(userUID, userUID, {
      keySize: 256 / 32, // 32 bytes key
      iterations: 1000,
    });
  }

  public encrypt(text: string, userUID: string): string {
    if (!text || !userUID) return text;

    try {
      const key = this.getEncryptionKey(userUID);
      const iv = CryptoJS.lib.WordArray.random(16); // 16 bytes IV

      const encrypted = CryptoJS.AES.encrypt(text, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      // store iv + ciphertext as hex
      return iv.toString() + ":" + encrypted.toString();
    } catch (err) {
      console.error("Encryption error", err);
      return text; // fallback
    }
  }

  public decrypt(cipher: string, userUID: string): string {
    if (!cipher || !userUID) return cipher;

    try {
      const [ivHex, encrypted] = cipher.split(":");
      if (!ivHex || !encrypted) return cipher; // not encrypted old data

      const key = this.getEncryptionKey(userUID);
      const iv = CryptoJS.enc.Hex.parse(ivHex);

      const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8) || cipher;
    } catch (err) {
      return cipher; // gracefully fallback for old/plaintext data
    }
  }
}
