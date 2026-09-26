import 'react-native-get-random-values';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as aesjs from 'aes-js';
import * as SecureStore from 'expo-secure-store';

// Supabase sessions (tokens + user metadata) commonly exceed SecureStore's
// ~2KB per-item limit on Android, so the session itself lives in
// AsyncStorage encrypted with a random key, and only that small AES key —
// not the tokens — sits in the OS keychain/keystore via SecureStore.
// This is the storage adapter Supabase's own React Native guide recommends.

const IV_LENGTH = 16;

async function getOrCreateKey(keyName: string): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(keyName);
  if (existing) return aesjs.utils.hex.toBytes(existing);

  const key = crypto.getRandomValues(new Uint8Array(32));
  await SecureStore.setItemAsync(keyName, aesjs.utils.hex.fromBytes(key));
  return key;
}

export const LargeSecureStore = {
  async getItem(key: string): Promise<string | null> {
    const stored = await AsyncStorage.getItem(key);
    if (!stored) return null;

    const encryptionKey = await getOrCreateKey(`${key}-encryption-key`);
    const bytes = aesjs.utils.hex.toBytes(stored);
    const iv = bytes.slice(0, IV_LENGTH);
    const ciphertext = bytes.slice(IV_LENGTH);
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(iv));
    return aesjs.utils.utf8.fromBytes(cipher.decrypt(ciphertext));
  },

  async setItem(key: string, value: string): Promise<void> {
    const encryptionKey = await getOrCreateKey(`${key}-encryption-key`);
    // A fresh random IV every call — CTR mode's keystream depends only on
    // key+counter, so reusing the same starting counter across calls (as an
    // earlier version of this file did) would let two ciphertexts under the
    // same key be XORed together to cancel the keystream and leak
    // XOR-of-plaintexts, which is a real break given the session JSON's
    // predictable structure.
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const cipher = new aesjs.ModeOfOperation.ctr(encryptionKey, new aesjs.Counter(iv));
    const ciphertext = cipher.encrypt(aesjs.utils.utf8.toBytes(value));

    const combined = new Uint8Array(IV_LENGTH + ciphertext.length);
    combined.set(iv, 0);
    combined.set(ciphertext, IV_LENGTH);
    await AsyncStorage.setItem(key, aesjs.utils.hex.fromBytes(combined));
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
    await SecureStore.deleteItemAsync(`${key}-encryption-key`);
  },
};
