/**
 * Chronix Client-Side Encryption Module
 * Uses libsodium.js for XChaCha20-Poly1305 (AEAD)
 * Fast, secure, and resistant to timing attacks
 */

import sodium from 'libsodium.js';

// Initialize sodium (call once on app startup)
export async function initCrypto() {
  await sodium.ready;
  console.log('🔐 Crypto module initialized');
}

/**
 * Generate a new symmetric encryption key
 * @returns {string} Base64-encoded key
 */
export function generateKey() {
  const key = sodium.crypto_secretbox_keygen();
  return sodium.to_base64(key);
}

/**
 * Derive a key from a password using Argon2 (memory-hard)
 * @param {string} password - User password
 * @param {string} salt - Base64-encoded salt (optional, generates new if not provided)
 * @returns {object} { key: string, salt: string }
 */
export function deriveKey(password, salt = null) {
  const saltBytes = salt
    ? sodium.from_base64(salt)
    : sodium.randombytes_buf(sodium.crypto_pwhash_SALTBYTES);

  const key = sodium.crypto_pwhash(
    32, // Output length (256 bits)
    password,
    saltBytes,
    sodium.crypto_pwhash_OPSLIMIT_MODERATE,
    sodium.crypto_pwhash_MEMLIMIT_MODERATE,
    sodium.crypto_pwhash_ALG_DEFAULT
  );

  return {
    key: sodium.to_base64(key),
    salt: sodium.to_base64(saltBytes),
  };
}

/**
 * Encrypt a message using XChaCha20-Poly1305
 * Much faster than AES, with longer nonce (24 bytes vs 12)
 * @param {string} plaintext - Message to encrypt
 * @param {string} keyBase64 - Base64-encoded key
 * @returns {object} { ciphertext: string, nonce: string }
 */
export function encryptMessage(plaintext, keyBase64) {
  try {
    const key = sodium.from_base64(keyBase64);
    const nonce = sodium.randombytes_buf(24); // XChaCha20 nonce (24 bytes)

    const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      plaintext,
      null, // No additional authenticated data
      null, // No secret key prefix
      nonce,
      key
    );

    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
    };
  } catch (error) {
    console.error('❌ Encryption failed:', error);
    throw error;
  }
}

/**
 * Decrypt a message using XChaCha20-Poly1305
 * @param {string} ciphertextBase64 - Base64-encoded ciphertext
 * @param {string} nonceBase64 - Base64-encoded nonce
 * @param {string} keyBase64 - Base64-encoded key
 * @returns {string} Decrypted plaintext
 */
export function decryptMessage(ciphertextBase64, nonceBase64, keyBase64) {
  try {
    const key = sodium.from_base64(keyBase64);
    const nonce = sodium.from_base64(nonceBase64);
    const ciphertext = sodium.from_base64(ciphertextBase64);

    const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // No secret key prefix
      ciphertext,
      null, // No additional authenticated data
      nonce,
      key
    );

    return sodium.to_string(plaintext);
  } catch (error) {
    console.error('❌ Decryption failed:', error);
    throw error;
  }
}

/**
 * Generate a keypair for device-to-device asymmetric encryption
 * Uses Curve25519 for key exchange, XChaCha20-Poly1305 for actual encryption
 * @returns {object} { publicKey: string, secretKey: string }
 */
export function generateKeyPair() {
  const keyPair = sodium.crypto_box_keypair();
  return {
    publicKey: sodium.to_base64(keyPair.publicKey),
    secretKey: sodium.to_base64(keyPair.privateKey),
  };
}

/**
 * Compute shared secret for two devices
 * @param {string} publicKeyBase64 - Other device's public key
 * @param {string} secretKeyBase64 - This device's secret key
 * @returns {string} Base64-encoded shared secret (32 bytes)
 */
export function computeSharedSecret(publicKeyBase64, secretKeyBase64) {
  try {
    const publicKey = sodium.from_base64(publicKeyBase64);
    const secretKey = sodium.from_base64(secretKeyBase64);

    const sharedSecret = sodium.crypto_box_beforenm(publicKey, secretKey);
    return sodium.to_base64(sharedSecret);
  } catch (error) {
    console.error('❌ Shared secret computation failed:', error);
    throw error;
  }
}

/**
 * Encrypt using precomputed shared secret (faster than regular box)
 * @param {string} plaintext - Message
 * @param {string} sharedSecretBase64 - Precomputed shared secret
 * @returns {object} { ciphertext: string, nonce: string }
 */
export function encryptWithSharedSecret(plaintext, sharedSecretBase64) {
  try {
    const sharedSecret = sodium.from_base64(sharedSecretBase64);
    const nonce = sodium.randombytes_buf(24);

    const ciphertext = sodium.crypto_box_afternm(plaintext, nonce, sharedSecret);

    return {
      ciphertext: sodium.to_base64(ciphertext),
      nonce: sodium.to_base64(nonce),
    };
  } catch (error) {
    console.error('❌ Encryption with shared secret failed:', error);
    throw error;
  }
}

/**
 * Decrypt using precomputed shared secret
 * @param {string} ciphertextBase64 - Ciphertext
 * @param {string} nonceBase64 - Nonce
 * @param {string} sharedSecretBase64 - Precomputed shared secret
 * @returns {string} Decrypted plaintext
 */
export function decryptWithSharedSecret(ciphertextBase64, nonceBase64, sharedSecretBase64) {
  try {
    const sharedSecret = sodium.from_base64(sharedSecretBase64);
    const nonce = sodium.from_base64(nonceBase64);
    const ciphertext = sodium.from_base64(ciphertextBase64);

    const plaintext = sodium.crypto_box_open_afternm(ciphertext, nonce, sharedSecret);
    return sodium.to_string(plaintext);
  } catch (error) {
    console.error('❌ Decryption with shared secret failed:', error);
    throw error;
  }
}

/**
 * Generate a cryptographic hash of a message (for verification)
 * @param {string} message - Message to hash
 * @returns {string} Base64-encoded hash
 */
export function hashMessage(message) {
  const hash = sodium.crypto_generichash(32, message);
  return sodium.to_base64(hash);
}

/**
 * Sign a message with a secret key
 * @param {string} message - Message to sign
 * @param {string} secretKeyBase64 - Secret key
 * @returns {string} Base64-encoded signature
 */
export function signMessage(message, secretKeyBase64) {
  try {
    const secretKey = sodium.from_base64(secretKeyBase64);
    const signature = sodium.crypto_sign_detached(message, secretKey);
    return sodium.to_base64(signature);
  } catch (error) {
    console.error('❌ Signing failed:', error);
    throw error;
  }
}

/**
 * Verify a signed message
 * @param {string} message - Original message
 * @param {string} signatureBase64 - Signature
 * @param {string} publicKeyBase64 - Public key
 * @returns {boolean} True if valid
 */
export function verifySignature(message, signatureBase64, publicKeyBase64) {
  try {
    const signature = sodium.from_base64(signatureBase64);
    const publicKey = sodium.from_base64(publicKeyBase64);
    sodium.crypto_sign_open_detached(message, signature, publicKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Securely clear sensitive data from memory
 * @param {Uint8Array} buffer - Buffer to clear
 */
export function secureClear(buffer) {
  sodium.memzero(buffer);
}
