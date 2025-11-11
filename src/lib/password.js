/**
 * Simple password hashing utility
 * Uses UTF-8 encoding for better character support
 */

export function hashPassword(password) {
  // Convert password string to UTF-8 bytes
  const utf8Bytes = new TextEncoder().encode(password);
  // Convert bytes to binary string
  let binary = '';
  for (let i = 0; i < utf8Bytes.byteLength; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  // Base64 encode
  return btoa(binary);
}

export function verifyPassword(inputPassword, storedHash) {
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
}
