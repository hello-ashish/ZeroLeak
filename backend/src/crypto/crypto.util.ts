import * as crypto from 'crypto';

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

export class CryptoUtil {
  // Encrypt plain text using AES-256-GCM
  static encrypt(text: string, hexKey: string): EncryptedData {
    const key = Buffer.from(hexKey, 'hex');
    const iv = crypto.randomBytes(12); // 96-bit IV is standard for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag
    };
  }

  // Decrypt cipher text using AES-256-GCM
  static decrypt(encrypted: string, hexKey: string, ivHex: string, tagHex: string): string {
    const key = Buffer.from(hexKey, 'hex');
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  // Generate SHA-256 Hash
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Generate a random AES-256 key
  static generateAESKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate a secure ECDSA-like key pair for digital signatures
  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }

  // Sign data using ECDSA private key
  static signData(data: string, privateKeyPem: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKeyPem, 'hex');
  }

  // Verify data using ECDSA public key
  static verifySignature(data: string, signatureHex: string, publicKeyPem: string): boolean {
    try {
      const verify = crypto.createVerify('SHA256');
      verify.update(data);
      return verify.verify(publicKeyPem, signatureHex, 'hex');
    } catch {
      return false;
    }
  }

  // Cryptographic Entropy Mixing: r = SHA256(T + H + S + E)
  static generateEntropyMix(T: string, H: string, S: string, E: string): string {
    const combined = `${T}-${H}-${S}-${E}`;
    return this.hash(combined);
  }

  // Seeded PRNG using SHA-256 iterations to ensure uniform, reproducible distribution
  // based purely on the seed.
  static seededRandom(seedHex: string): () => number {
    let currentSeed = seedHex;
    return () => {
      currentSeed = this.hash(currentSeed);
      // Take first 8 bytes and map to [0, 1)
      const value = parseInt(currentSeed.substring(0, 16), 16);
      return value / 0xffffffffffffffff;
    };
  }
}
